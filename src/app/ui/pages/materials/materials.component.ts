import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import { ImportMaterialDialogComponent } from "./import-material-dialog/import-material-dialog.component";

interface MaterialForm {
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
    mrpMps: boolean;
    calculateInventory: boolean;
    startDate: string;
    endDate: string;
    imageData: string; // Base64 string of image
}

interface SavedMaterial {
    id: number;
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
    createdAt: string;
}

interface SavedSupply {
    id: number;
    code: string;
    name: string;
}

import { FlatpickrDirective } from "../../../utils/flatpickr.directive";
import { EnterFocusNextDirective } from "../../../utils/enter-focus-next.directive";

@Component({
    standalone: true,
    selector: "app-materials",
    imports: [CommonModule, FormsModule, FlatpickrDirective, EnterFocusNextDirective, ImportMaterialDialogComponent],
    templateUrl: "./materials.component.html",
    styleUrls: ["./materials.component.css"],
})
export class MaterialsComponent implements OnInit {
    materials: SavedMaterial[] = [];
    supplies: SavedSupply[] = [];
    selectedMaterialId: number | null = null;
    showDeleteConfirm = false;
    showImportDialog = false;
    deletingMaterial: SavedMaterial | null = null;
    message = "";
    messageType: "success" | "error" = "success";

    // Pagination properties
    pageSize = 10;
    pageIndex = 1;
    totalItems = 0;
    pageSizeOptions = [10, 25, 50, 100];

    // Preset options
    units = ["Kg", "Cái", "Hộp", "Thùng", "Lít", "Mét"];
    currencies = ["đồng", "USD", "EUR"];
    valuationMethods = ["Bình quân cuối kỳ", "FIFO", "LIFO", "Đích danh"];

    materialForm: MaterialForm = this.emptyForm();

    ngOnInit(): void {
        this.loadMaterials();
        this.loadSupplies();
    }

    emptyForm(): MaterialForm {
        return {
            code: "",
            barcode: "",
            name: "",
            parentCode: "",
            parentName: "",
            unit: "Kg",
            currency: "đồng",
            warehouse: "",
            valuationMethod: "Bình quân cuối kỳ",
            features: "",
            taxable: "",
            mrpMps: false,
            calculateInventory: true, // Always true
            startDate: "",
            endDate: "",
            imageData: "",
        };
    }

    async loadMaterials(): Promise<void> {
        try {
            const limit = this.pageSize;
            const offset = (this.pageIndex - 1) * this.pageSize;
            const res = await invoke<{ items: SavedMaterial[], total: number }>("list_materials_paginated", {
                limit,
                offset
            });
            this.materials = res.items.map(m => ({
                ...m,
                parentCode: m.parentCode ?? (m as any).parent_code,
                parentName: m.parentName ?? (m as any).parent_name,
                valuationMethod: m.valuationMethod ?? (m as any).valuation_method,
                calculateInventory: m.calculateInventory ?? (m as any).calculate_inventory,
                startDate: m.startDate ?? (m as any).start_date,
                endDate: m.endDate ?? (m as any).end_date,
                imageData: m.imageData ?? (m as any).image_data,
                mrpMps: m.mrpMps ?? (m as any).mrp_mps,
            }));
            this.totalItems = res.total;
            this.materials.sort((a, b) => a.id - b.id);
        } catch (error) {
            this.showFeedback("Không thể tải danh sách vật tư.", "error");
            console.error(error);
        }
    }

    onPageChange(newPageIndex: number): void {
        const maxPage = this.totalPages;
        if (newPageIndex < 1 || newPageIndex > maxPage) {
            return;
        }
        this.pageIndex = newPageIndex;
        this.loadMaterials();
    }

    onPageSizeChange(newPageSize: any): void {
        this.pageSize = Number(newPageSize);
        this.pageIndex = 1;
        this.loadMaterials();
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }

    get showingStart(): number {
        if (this.totalItems === 0) return 0;
        return (this.pageIndex - 1) * this.pageSize + 1;
    }

    get showingEnd(): number {
        return Math.min(this.pageIndex * this.pageSize, this.totalItems);
    }

    async loadSupplies(): Promise<void> {
        try {
            const result = await invoke<any[]>("list_supplies");
            this.supplies = result.map(s => ({
                id: s.id,
                code: s.code,
                name: s.name
            }));
            if (this.supplies.length > 0 && !this.materialForm.warehouse) {
                this.materialForm.warehouse = this.supplies[0].code;
            }
        } catch (error) {
            console.error("Không thể tải danh mục kho:", error);
        }
    }

    showFeedback(msg: string, type: "success" | "error" = "success") {
        this.message = msg;
        this.messageType = type;
        setTimeout(() => {
            this.message = "";
        }, 3000);
    }

    onCodeChange(val: string): void {
        this.materialForm.barcode = val;
    }

    /** Tải xuống file Excel mẫu với các cột chuẩn */
    downloadExcelTemplate(): void {
        import("xlsx")
            .then((XLSX) => {
                const templateData = [
                    {
                        STT: 1,
                        "Tên kho": "Kho Tân Bình",
                        "Mã kho": "KHO01",
                        "Mã vật tư": "VT001",
                        "Tên vật tư": "Thép tấm A36",
                        "Đơn vị tính": "Tấn",
                        "Đặc tính": "Dày 10mm",
                        "Số lượng tồn": 50,
                    },
                    {
                        STT: 2,
                        "Tên kho": "Kho Tân Bình",
                        "Mã kho": "KHO01",
                        "Mã vật tư": "VT002",
                        "Tên vật tư": "Bu lông M12",
                        "Đơn vị tính": "Cái",
                        "Đặc tính": "",
                        "Số lượng tồn": 0,
                    },
                ];
                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Vật Tư");
                XLSX.writeFile(wb, "vat-tu-mau.xlsx");
                this.showFeedback("Tải xuống file Excel mẫu thành công!", "success");
            })
            .catch((error) => {
                console.error("Lỗi tải file mẫu:", error);
                this.showFeedback("Không thể tải file mẫu Excel.", "error");
            });
    }

    /** Mở popup import dữ liệu */
    openImportDialog(): void {
        this.showImportDialog = true;
    }

    /** Callback khi import thành công */
    onImportSuccess(message: string): void {
        this.showImportDialog = false;
        this.showFeedback(message || "Import dữ liệu vào database thành công!", "success");
        this.loadMaterials();
    }

    /** Callback khi đóng popup import */
    onImportDialogClosed(): void {
        this.showImportDialog = false;
    }

    onAddNew(): void {
        this.selectedMaterialId = null;
        this.materialForm = this.emptyForm();
        if (this.supplies.length > 0) {
            this.materialForm.warehouse = this.supplies[0].code;
        }
        this.showFeedback("Biểu mẫu đã được làm mới để thêm vật tư.");
    }

    onSelectMaterial(material: SavedMaterial): void {
        this.selectedMaterialId = material.id;
        this.materialForm = {
            code: material.code,
            barcode: material.barcode,
            name: material.name,
            parentCode: material.parentCode,
            parentName: material.parentName,
            unit: material.unit,
            currency: material.currency,
            warehouse: material.warehouse,
            valuationMethod: material.valuationMethod,
            features: material.features,
            taxable: material.taxable,
            mrpMps: !!material.mrpMps,
            calculateInventory: true, // Always true
            startDate: material.startDate,
            endDate: material.endDate,
            imageData: material.imageData,
        };
    }

    async onSave(): Promise<void> {
        const code = this.materialForm.code.trim();
        const name = this.materialForm.name.trim();
        if (!code || !name) {
            this.showFeedback("Mã và Tên vật tư bắt buộc phải nhập.", "error");
            return;
        }

        const payload = {
            code,
            barcode: this.materialForm.barcode.trim() || code, // fallback to code if empty
            name,
            parentCode: this.materialForm.parentCode.trim(),
            parentName: this.materialForm.parentName.trim(),
            unit: this.materialForm.unit,
            currency: this.materialForm.currency,
            warehouse: this.materialForm.warehouse,
            valuationMethod: this.materialForm.valuationMethod,
            features: this.materialForm.features.trim(),
            taxable: this.materialForm.taxable.trim(),
            mrpMps: this.materialForm.mrpMps ? 1 : 0,
            calculateInventory: 1, // always true
            startDate: this.materialForm.startDate,
            endDate: this.materialForm.endDate,
            imageData: this.materialForm.imageData,
        };

        try {
            if (this.selectedMaterialId != null) {
                await invoke("update_material", {
                    id: this.selectedMaterialId,
                    material: payload,
                });
                this.showFeedback("Vật tư đã được cập nhật thành công.");
            } else {
                await invoke("save_material", {
                    material: payload,
                });
                this.showFeedback("Thêm vật tư mới thành công.");
            }
            await this.loadMaterials();
            this.onAddNew();
        } catch (error) {
            this.showFeedback("Lỗi khi lưu dữ liệu vật tư.", "error");
            console.error(error);
        }
    }

    onDeleteSelected(): void {
        const selected = this.materials.find(m => m.id === this.selectedMaterialId);
        if (selected) {
            this.onDelete(selected);
        }
    }

    onDelete(material: SavedMaterial): void {
        this.deletingMaterial = material;
        this.showDeleteConfirm = true;
    }

    async confirmDelete(): Promise<void> {
        if (!this.deletingMaterial) return;

        try {
            await invoke("delete_material", { id: this.deletingMaterial.id });
            this.showFeedback(`Đã xóa vật tư "${this.deletingMaterial.name}".`);
            this.showDeleteConfirm = false;
            this.deletingMaterial = null;

            // Handle boundary check: if we deleted the last item of the last page, go to the previous page
            const totalAfterDelete = this.totalItems - 1;
            const maxPageAfterDelete = Math.max(1, Math.ceil(totalAfterDelete / this.pageSize));
            if (this.pageIndex > maxPageAfterDelete) {
                this.pageIndex = maxPageAfterDelete;
            }

            await this.loadMaterials();
            this.onAddNew();
        } catch (error) {
            this.showFeedback("Lỗi khi xóa vật tư.", "error");
            console.error(error);
        }
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingMaterial = null;
    }

    onTriggerImageUpload(fileInput: HTMLInputElement): void {
        fileInput.click();
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.materialForm.imageData = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onRemoveImage(): void {
        this.materialForm.imageData = "";
    }

    async onPrint(): Promise<void> {
        console.log("In danh sách vật tư...");
        this.showFeedback("Đang khởi tạo lệnh in...");

        try {
            // Stub function for printer connection library integration
            this.printerIntegrationStub();

            // Backup/Default option: native browser printing
            window.print();
        } catch (err) {
            console.error("Lỗi khi in:", err);
            this.showFeedback("Lỗi khi kết nối máy in.", "error");
        }
    }

    private printerIntegrationStub(): void {
        // Tương lai sẽ tích hợp thư viện tauri-plugin-printer-v2
        // Ví dụ:
        // import { printPdf, getPrinters } from 'tauri-plugin-printer-v2';
        // const printers = await getPrinters();
        // if (printers.length > 0) {
        //   await printPdf({ path: '...', printer: printers[0].name });
        // }
        console.log("[PRINTER STUB] Kết nối máy in tauri-plugin-printer-v2 hoạt động.");
    }
}
