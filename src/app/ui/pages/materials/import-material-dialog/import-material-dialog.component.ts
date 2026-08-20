import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import * as XLSX from "xlsx";

type ValidationStatus =
    | "idle"            // Chưa chọn file
    | "validating"      // Đang kiểm tra header
    | "error-format"    // Sai định dạng / quá 20MB
    | "error-columns"   // Thiếu / sai cột
    | "ready";          // Hợp lệ, cho phép import

/** Danh sách cột bắt buộc — khớp chính xác với file mẫu */
const REQUIRED_COLUMNS: readonly string[] = [
    "STT",
    "Tên kho",
    "Mã vật tư",
    "Tên vật tư",
    "Đơn vị tính",
    "Đặc tính",
];

const MAX_SIZE_MB = 20;
const ALLOWED_EXTENSIONS = /\.(xlsx|xls)$/i;

interface ImportProgressPayload {
    processed: number;
    total: number;
    percent: number;
}

interface MaterialImportRow {
    code: string;
    barcode: string;
    name: string;
    parentCode: string;
    parentName: string;
    unit: string;
    currency: string;
    warehouse: string;
    valuationMethod: string;
    features: string;
    taxable: string;
    mrpMps: number;
    calculateInventory: number;
    startDate: string;
    endDate: string;
    imageData: string;
}

@Component({
    standalone: true,
    selector: "app-import-material-dialog",
    imports: [CommonModule],
    templateUrl: "./import-material-dialog.component.html",
    styleUrls: ["./import-material-dialog.component.css"],
})
export class ImportMaterialDialogComponent implements OnInit, OnDestroy {
    @Output() closed = new EventEmitter<void>();
    @Output() importSuccess = new EventEmitter<string>();

    selectedFile: File | null = null;
    fileError = "";
    isDragOver = false;
    isImporting = false;
    importProgress = 0;
    validationStatus: ValidationStatus = "idle";

    private progressUnlisten?: UnlistenFn;

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    async ngOnInit(): Promise<void> {
        // Lắng nghe progress event từ Rust backend
        this.progressUnlisten = await listen<ImportProgressPayload>(
            "import_materials_progress",
            (event) => {
                this.importProgress = event.payload.percent;
            }
        );
    }

    ngOnDestroy(): void {
        this.progressUnlisten?.();
    }

    // ─── Drag & Drop ──────────────────────────────────────────────────────────

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.processFile(input.files[0]);
        }
        // Reset input để cho phép chọn lại cùng file
        input.value = "";
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = true;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = false;
        const file = event.dataTransfer?.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    // ─── Bước 1 + 2: Validate tuần tự ────────────────────────────────────────

    private async processFile(file: File): Promise<void> {
        this.selectedFile = file;
        this.fileError = "";
        this.validationStatus = "validating";

        // Bước 1 — Validate định dạng & kích thước
        if (!ALLOWED_EXTENSIONS.test(file.name)) {
            this.fileError = "Chỉ chấp nhận file .xlsx hoặc .xls";
            this.validationStatus = "error-format";
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            this.fileError = `File vượt quá ${MAX_SIZE_MB}MB`;
            this.validationStatus = "error-format";
            return;
        }

        // Bước 2 — Validate cột (chỉ đọc header row)
        try {
            const missingColumns = await this.validateColumns(file);
            if (missingColumns.length > 0) {
                this.fileError = `File thiếu các cột: ${missingColumns.join(", ")}`;
                this.validationStatus = "error-columns";
                return;
            }
            // Tất cả hợp lệ → mở khoá nút Xác nhận
            this.validationStatus = "ready";
        } catch {
            this.fileError =
                "Không thể đọc file Excel. Vui lòng kiểm tra định dạng.";
            this.validationStatus = "error-format";
        }
    }

    /**
     * Đọc header row của sheet đầu tiên và trả về danh sách cột còn thiếu.
     * Trả về mảng rỗng nếu tất cả cột bắt buộc đều có mặt.
     */
    private validateColumns(file: File): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                try {
                    const data = new Uint8Array(
                        e.target!.result as ArrayBuffer
                    );
                    const workbook = XLSX.read(data, { type: "array" });
                    const ws = workbook.Sheets[workbook.SheetNames[0]];
                    // Lấy header row (hàng đầu tiên) dưới dạng mảng
                    const allRows = XLSX.utils.sheet_to_json<string[]>(ws, {
                        header: 1,
                    });
                    const headers: string[] =
                        (allRows[0] as string[]) ?? [];
                    const missing = REQUIRED_COLUMNS.filter(
                        (col) => !headers.includes(col)
                    );
                    resolve(missing);
                } catch {
                    reject(new Error("parse_error"));
                }
            };
            reader.onerror = () => reject(new Error("read_error"));
            reader.readAsArrayBuffer(file);
        });
    }

    // ─── Xác nhận: Parse đầy đủ + Gọi Rust backend ──────────────────────────

    async onConfirm(): Promise<void> {
        if (this.validationStatus !== "ready" || !this.selectedFile) return;

        this.isImporting = true;
        this.importProgress = 0;

        try {
            const items = await this.parseExcelToPayload(this.selectedFile);
            const result = await invoke<string>("import_materials_batch", {
                items,
            });
            this.importSuccess.emit(result);
            this.resetAndClose();
        } catch (error: unknown) {
            // Lỗi từ Rust (vd: "Dòng 5: Mã kho 'KHO99' không tồn tại")
            this.fileError =
                typeof error === "string"
                    ? error
                    : "Có lỗi xảy ra khi import.";
            this.validationStatus = "error-columns";
        } finally {
            this.isImporting = false;
            this.importProgress = 0;
        }
    }

    /**
     * Parse toàn bộ dữ liệu Excel → array payload gửi Rust.
     * Các cột không có trong file mẫu luôn gán giá trị mặc định cứng.
     */
    private parseExcelToPayload(
        file: File
    ): Promise<MaterialImportRow[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                try {
                    const data = new Uint8Array(
                        e.target!.result as ArrayBuffer
                    );
                    const workbook = XLSX.read(data, { type: "array" });
                    const ws = workbook.Sheets[workbook.SheetNames[0]];
                    const rows: Record<string, unknown>[] =
                        XLSX.utils.sheet_to_json(ws);
                    const today = new Date().toISOString().slice(0, 10);

                    const items: MaterialImportRow[] = rows.map((row) => ({
                        // ── Cột lấy từ Excel ──────────────────────────────
                        code: String(row["Mã vật tư"] ?? "").trim(),
                        name: String(row["Tên vật tư"] ?? "").trim(),
                        unit: String(row["Đơn vị tính"] ?? "").trim(),
                        warehouse: String(row["Tên kho"] ?? "").trim(),
                        features: String(row["Đặc tính"] ?? "").trim(),
                        // ── Mặc định cứng — không lấy từ Excel ───────────
                        barcode: "",
                        parentCode: "",
                        parentName: "",
                        currency: "VND",
                        valuationMethod: "FIFO",
                        taxable: "true",
                        mrpMps: 0,
                        calculateInventory: 1,
                        startDate: today,
                        endDate: "",
                        imageData: "",
                    }));
                    resolve(items);
                } catch {
                    reject("Không thể đọc nội dung file Excel.");
                }
            };
            reader.onerror = () => reject("Lỗi khi đọc file.");
            reader.readAsArrayBuffer(file);
        });
    }

    // ─── Huỷ ──────────────────────────────────────────────────────────────────

    onCancel(): void {
        if (this.isImporting) return;
        this.resetAndClose();
    }

    private resetAndClose(): void {
        this.selectedFile = null;
        this.fileError = "";
        this.validationStatus = "idle";
        this.importProgress = 0;
        this.closed.emit();
    }

    // ─── Tải file mẫu Excel ───────────────────────────────────────────────────

    downloadTemplate(): void {
        const templateData = [
            {
                STT: 1,
                "Tên kho": "KHO01",
                "Mã vật tư": "VT001",
                "Tên vật tư": "Thép tấm A36",
                "Đơn vị tính": "Tấn",
                "Đặc tính": "",
            },
            {
                STT: 2,
                "Tên kho": "KHO01",
                "Mã vật tư": "VT002",
                "Tên vật tư": "Bu lông M12",
                "Đơn vị tính": "Cái",
                "Đặc tính": "",
            },
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vật Tư");
        XLSX.writeFile(wb, "vat-tu-mau.xlsx");
    }
}
