import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import * as ExcelJS from "exceljs";

interface ReceiptItem {
    warehouse: string;
    materialCode: string;
    materialName: string;
    unit: string;
    stockQty: number;
    quantityDoc: number;
    quantityReal: number;
    price: number;
    amount: number;
    amountAfterTax: number;
    composition: string;
}

interface SavedMaterial {
    id: number;
    code: string;
    name: string;
    unit: string;
    warehouse: string;
    taxable?: string;
}

interface SavedSupply {
    id: number;
    code: string;
    name: string;
}

interface SavedReceipt {
    id: number;
    receiptNumber: string;
    postingDate: string;
    invoiceNumber: string;
    invoiceDate: string;
    description: string;
    deliveryPerson: string;
    accompaniedDoc: string;
    department: string;
    reason: string;
    warehouseLocation: string;
    items: string; // JSON String
    createdAt: string;
}

import { FlatpickrDirective } from "../../../utils/flatpickr.directive";

@Component({
    standalone: true,
    selector: "app-warehouse-receipts",
    imports: [CommonModule, FormsModule, FlatpickrDirective],
    templateUrl: "./warehouse-receipts.component.html",
    styleUrls: ["./warehouse-receipts.component.css"],
})
export class WarehouseReceiptsComponent implements OnInit {
    // Form fields
    receiptNumber = "";
    postingDate = "";
    invoiceNumber = "";
    invoiceDate = "";
    description = "";
    deliveryPerson = "";
    accompaniedDoc = "";
    department = "";
    reason = "";
    warehouseLocation = "";

    // Grid items
    items: ReceiptItem[] = [];

    // Master lists
    materials: SavedMaterial[] = [];
    receipts: SavedReceipt[] = [];

    // Selected receipt for update/delete
    selectedReceiptId: number | null = null;

    // UI States
    showDeleteConfirm = false;
    showSearchModal = false;
    showPrintPreview = false;
    message = "";
    messageType: "success" | "error" = "success";

    // Material Popup Modal States
    showMaterialModal = false;
    searchMaterialCode = "";
    filteredMaterials: SavedMaterial[] = [];
    selectedPopupMaterial: SavedMaterial | null = null;
    activeRowIndex: number | null = null;

    // Material Form Options & States
    units = ["Kg", "Cái", "Hộp", "Thùng", "Lít", "Mét"];
    currencies = ["đồng", "USD", "EUR"];
    valuationMethods = ["Bình quân cuối kỳ", "FIFO", "LIFO", "Đích danh"];
    supplies: SavedSupply[] = [];

    showAddMaterialModal = false;
    materialForm = this.emptyMaterialForm();

    ngOnInit(): void {
        this.resetForm();
        this.loadMaterials();
        this.loadReceipts();
        this.loadSupplies();
    }

    // Load master materials to auto-lookup
    async loadMaterials(): Promise<void> {
        try {
            const list = await invoke<any[]>("list_materials");
            this.materials = list.map(m => ({
                id: m.id,
                code: m.code,
                name: m.name,
                unit: m.unit,
                warehouse: m.warehouse,
                taxable: m.taxable
            }));
        } catch (error) {
            console.error("Lỗi khi tải danh sách vật tư:", error);
        }
    }

    // Load saved receipts list
    async loadReceipts(): Promise<void> {
        try {
            const list = await invoke<any[]>("list_warehouse_receipts");
            this.receipts = list.map(r => ({
                id: r.id,
                receiptNumber: r.receiptNumber ?? (r as any).receipt_number,
                postingDate: r.postingDate ?? (r as any).posting_date,
                invoiceNumber: r.invoiceNumber ?? (r as any).invoice_number,
                invoiceDate: r.invoiceDate ?? (r as any).invoice_date,
                description: r.description,
                deliveryPerson: r.deliveryPerson ?? (r as any).delivery_person,
                accompaniedDoc: r.accompaniedDoc ?? (r as any).accompanied_doc,
                department: r.department,
                reason: r.reason,
                warehouseLocation: r.warehouseLocation ?? (r as any).warehouse_location,
                items: r.items,
                createdAt: r.createdAt ?? (r as any).created_at
            }));
        } catch (error) {
            console.error("Lỗi khi tải danh sách phiếu nhập kho:", error);
        }
    }

    // Reset Form & Items Grid
    resetForm(): void {
        this.selectedReceiptId = null;
        this.receiptNumber = "";
        this.postingDate = "";
        this.invoiceNumber = "";
        this.invoiceDate = "";
        this.description = "";
        this.deliveryPerson = "";
        this.accompaniedDoc = "";
        this.department = "";
        this.reason = "";
        this.warehouseLocation = "";

        // Initialize with one blank row
        this.items = [this.createBlankItem()];
    }

    createBlankItem(): ReceiptItem {
        return {
            warehouse: "",
            materialCode: "",
            materialName: "",
            unit: "",
            stockQty: 0,
            quantityDoc: 0,
            quantityReal: 0,
            price: 0,
            amount: 0,
            amountAfterTax: 0,
            composition: "",
        };
    }

    getTodayDate(): string {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        return `${yyyy}-${mm < 10 ? '0' + mm : mm}-${dd < 10 ? '0' + dd : dd}`;
    }

    generateReceiptNumber(): string {
        // Collect all existing suffixes that match NK/\d{5}
        const existingNumbers = this.receipts
            .map(r => {
                const match = r.receiptNumber.match(/^NK\/(\d{5})$/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0);

        // Find the maximum number
        let nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

        // Double check against any conflict, increment if conflict exists
        while (this.receipts.some(r => r.receiptNumber === `NK/${nextNum.toString().padStart(5, "0")}`)) {
            nextNum++;
        }

        return `NK/${nextNum.toString().padStart(5, "0")}`;
    }

    onReceiptInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let val = input.value;

        if (!val || val.trim() === "" || val === "NK/") {
            this.receiptNumber = "";
            input.value = "";
            return;
        }

        let suffix = val;
        if (suffix.startsWith("NK/")) {
            suffix = suffix.substring(3);
        } else if (suffix.startsWith("NK")) {
            suffix = suffix.substring(2);
        } else if (suffix.startsWith("N")) {
            suffix = suffix.substring(1);
        }

        let digits = suffix.replace(/\D/g, "");
        if (digits === "") {
            this.receiptNumber = "NK/";
            input.value = "NK/";
            return;
        }

        // Limit to maximum of 5 digits while typing
        if (digits.length > 5) {
            digits = digits.substring(0, 5);
        }

        const formatted = "NK/" + digits;
        this.receiptNumber = formatted;
        input.value = formatted;
    }

    formatReceiptNumber(): void {
        if (!this.receiptNumber || this.receiptNumber.trim() === "" || this.receiptNumber === "NK/") {
            this.receiptNumber = "";
            return;
        }
        let suffix = this.receiptNumber;
        if (suffix.startsWith("NK/")) {
            suffix = suffix.substring(3);
        }
        let digits = suffix.replace(/\D/g, "");
        if (digits === "") {
            this.receiptNumber = "";
        } else {
            this.receiptNumber = "NK/" + digits.padStart(5, "0");
        }
    }

    // Auto lookup when user changes material code
    onMaterialCodeChange(index: number): void {
        const row = this.items[index];
        const code = row.materialCode.trim().toUpperCase();

        if (code === "") {
            row.materialName = "";
            row.unit = "";
            return;
        }

        const match = this.materials.find(m => m.code.toUpperCase() === code);
        if (match) {
            row.materialCode = match.code; // normalize case
            row.materialName = match.name;
            row.unit = match.unit;
            row.warehouse = match.warehouse;
        }

        this.checkAndAppendRow(index);
    }

    // Automatically check and append a pending empty row at the bottom
    checkAndAppendRow(index: number): void {
        const isLastRow = index === this.items.length - 1;
        const hasData = this.items[index].materialCode.trim() !== "";
        if (isLastRow && hasData) {
            this.items.push(this.createBlankItem());
        }
    }

    // Delete a row from the items list
    removeGridItem(index: number): void {
        if (this.items.length > 1) {
            this.items.splice(index, 1);
        } else {
            this.items[0] = this.createBlankItem();
        }
    }

    // Handle input cell values calculation
    calculateAmounts(index: number): void {
        const row = this.items[index];
        row.amount = (row.quantityReal || 0) * (row.price || 0);
        row.amountAfterTax = row.amount; // Simplify: default no extra tax calculations
        this.checkAndAppendRow(index);
    }

    // Compute totals of grid items
    getTotalQuantity(): number {
        return this.items
            .filter(item => item.materialCode.trim() !== "")
            .reduce((sum, item) => sum + (item.quantityReal || 0), 0);
    }

    getTotalAmount(): number {
        return this.items
            .filter(item => item.materialCode.trim() !== "")
            .reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    // Show feedback popup
    showFeedback(msg: string, type: "success" | "error" = "success") {
        this.message = msg;
        this.messageType = type;
        setTimeout(() => {
            this.message = "";
        }, 3000);
    }

    // Actions
    onAddNew(): void {
        this.resetForm();
        this.receiptNumber = this.generateReceiptNumber();
        this.showFeedback("Mẫu nhập phiếu mới đã được thiết lập.");
    }

    async onSave(): Promise<void> {
        console.log("[FE onSave] Trạng thái lưu phiếu nhập kho. selectedReceiptId:", this.selectedReceiptId);
        console.log("[FE onSave] Các trường hiện tại:", {
            receiptNumber: this.receiptNumber,
            postingDate: this.postingDate,
            invoiceNumber: this.invoiceNumber,
            invoiceDate: this.invoiceDate,
            description: this.description,
            deliveryPerson: this.deliveryPerson,
            accompaniedDoc: this.accompaniedDoc,
            department: this.department,
            reason: this.reason,
            warehouseLocation: this.warehouseLocation,
            items: this.items
        });

        // Generate receipt number if left empty
        if (!this.receiptNumber || this.receiptNumber.trim() === "" || this.receiptNumber === "NK/") {
            this.receiptNumber = this.generateReceiptNumber();
            console.log("[FE onSave] Tự động sinh Số chứng từ mới:", this.receiptNumber);
        }
        // Ensure the receipt number is formatted before validation and save
        this.formatReceiptNumber();
        const code = this.receiptNumber.trim();
        console.log("[FE onSave] Số chứng từ sau định dạng:", code);
        if (!code) {
            console.warn("[FE onSave] Không tìm thấy Số chứng từ hợp lệ.");
            this.showFeedback("Vui lòng nhập Số chứng từ.", "error");
            return;
        }

        // Check for duplicate receipt number in the database
        const isDuplicate = this.receipts.some(r =>
            r.receiptNumber.trim().toUpperCase() === code.toUpperCase() &&
            (this.selectedReceiptId === null || r.id !== this.selectedReceiptId)
        );
        if (isDuplicate) {
            console.warn("[FE onSave] Số chứng từ đã tồn tại trùng lặp:", code);
            this.showFeedback("Số chứng từ đã tồn tại trong hệ thống. Vui lòng nhập số khác.", "error");
            return;
        }

        // Filter out completely blank rows
        const validItems = this.items.filter(item => item.materialCode.trim() !== "");
        console.log("[FE onSave] Danh sách vật tư hợp lệ:", validItems);
        if (validItems.length === 0) {
            console.warn("[FE onSave] Danh sách vật tư trống.");
            this.showFeedback("Vui lòng nhập ít nhất một dòng vật tư hợp lệ.", "error");
            return;
        }

        const payload = {
            receiptNumber: code,
            postingDate: this.postingDate,
            invoiceNumber: this.invoiceNumber.trim(),
            invoiceDate: this.invoiceDate,
            description: this.description.trim(),
            deliveryPerson: this.deliveryPerson.trim(),
            accompaniedDoc: this.accompaniedDoc.trim(),
            department: this.department.trim(),
            reason: this.reason.trim(),
            warehouseLocation: this.warehouseLocation.trim(),
            items: JSON.stringify(validItems),
        };
        console.log("[FE onSave] Payload gửi xuống BE:", payload);

        try {
            if (this.selectedReceiptId !== null) {
                console.log("[FE onSave] Đang gọi update_warehouse_receipt...");
                const result = await invoke("update_warehouse_receipt", {
                    id: this.selectedReceiptId,
                    receipt: payload
                });
                console.log("[FE onSave] Kết quả update thành công:", result);
                this.showFeedback("Cập nhật phiếu nhập kho thành công.");
            } else {
                console.log("[FE onSave] Đang gọi save_warehouse_receipt...");
                const result = await invoke("save_warehouse_receipt", {
                    receipt: payload
                });
                console.log("[FE onSave] Kết quả save thành công:", result);
                this.showFeedback("Lưu phiếu nhập kho mới thành công.");
            }
            await this.loadReceipts();
            this.selectedReceiptId = this.receipts.find(r => r.receiptNumber === code)?.id || null;
            console.log("[FE onSave] Hoàn tất nạp lại danh sách phiếu. selectedReceiptId mới:", this.selectedReceiptId);
        } catch (error) {
            console.error("[FE onSave] Lỗi nghiêm trọng khi lưu phiếu:", error);
            this.showFeedback("Lỗi khi lưu dữ liệu phiếu nhập kho.", "error");
            console.error(error);
        }
    }

    onDeleteClick(): void {
        if (this.selectedReceiptId === null) {
            this.showFeedback("Vui lòng chọn hoặc lưu một phiếu nhập kho để xoá.", "error");
            return;
        }
        this.showDeleteConfirm = true;
    }

    async confirmDelete(): Promise<void> {
        if (this.selectedReceiptId === null) return;
        try {
            await invoke("delete_warehouse_receipt", { id: this.selectedReceiptId });
            this.showFeedback("Đã xoá phiếu nhập kho thành công.");
            this.showDeleteConfirm = false;
            this.resetForm();
            await this.loadReceipts();
        } catch (error) {
            this.showFeedback("Lỗi khi xoá phiếu nhập kho.", "error");
            console.error(error);
        }
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
    }

    // Search dialog actions
    onSearchClick(): void {
        this.showSearchModal = true;
    }

    closeSearchModal(): void {
        this.showSearchModal = false;
    }

    selectReceipt(receipt: SavedReceipt): void {
        this.selectedReceiptId = receipt.id;
        this.receiptNumber = receipt.receiptNumber;
        this.postingDate = receipt.postingDate;
        this.invoiceNumber = receipt.invoiceNumber;
        this.invoiceDate = receipt.invoiceDate;
        this.description = receipt.description;
        this.deliveryPerson = receipt.deliveryPerson;
        this.accompaniedDoc = receipt.accompaniedDoc;
        this.department = receipt.department;
        this.reason = receipt.reason;
        this.warehouseLocation = receipt.warehouseLocation;

        try {
            const parsedItems = JSON.parse(receipt.items) as ReceiptItem[];
            this.items = [...parsedItems];
            // Ensure there is always a blank row at the bottom for appending
            this.items.push(this.createBlankItem());
        } catch (error) {
            console.error("Lỗi khi phân tích danh sách vật tư:", error);
            this.items = [this.createBlankItem()];
        }

        this.showSearchModal = false;
        this.showFeedback(`Đã tải phiếu nhập kho "${receipt.receiptNumber}".`);
    }

    // Print & Preview Actions
    onPrintClick(): void {
        const validItems = this.items.filter(item => item.materialCode.trim() !== "");
        if (validItems.length === 0) {
            this.showFeedback("Vui lòng nhập vật tư trước khi mở preview in.", "error");
            return;
        }
        this.showPrintPreview = true;
    }

    closePrintPreview(): void {
        this.showPrintPreview = false;
    }

    triggerPrint(): void {
        window.print();
    }

    // Vietnamese Number-to-Words Converter
    getAmountInWords(): string {
        const amount = this.getTotalAmount();
        return this.numberToVietnameseWords(amount);
    }

    numberToVietnameseWords(num: number): string {
        if (num === 0) return "Không đồng";
        const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

        const readThreeDigits = (n: number, full: boolean): string => {
            let res = "";
            const hundred = Math.floor(n / 100);
            const ten = Math.floor((n % 100) / 10);
            const unit = n % 10;

            if (hundred > 0 || full) {
                res += units[hundred] + " trăm ";
                if (ten === 0 && unit > 0) res += "lẻ ";
            }
            if (ten > 0 && ten !== 1) {
                res += units[ten] + " mươi ";
            }
            if (ten === 1) res += "mười ";

            switch (unit) {
                case 1:
                    if (ten > 1) res += "mốt ";
                    else res += "một ";
                    break;
                case 5:
                    if (ten > 0) res += "lăm ";
                    else res += "năm ";
                    break;
                default:
                    if (unit > 0 || (unit === 0 && n === 0)) res += units[unit] + " ";
                    break;
            }
            return res;
        };

        let res = "";
        let count = 0;
        let temp = Math.abs(num);
        const blocks: number[] = [];

        while (temp > 0) {
            blocks.push(temp % 1000);
            temp = Math.floor(temp / 100);
            // Wait, dividing by 100? No, block is 1000, so divide by 1000!
            // Correct logic is below:
        }

        // Re-do splitting by 1000 properly:
        temp = Math.abs(num);
        const actualBlocks: number[] = [];
        while (temp > 0) {
            actualBlocks.push(temp % 1000);
            temp = Math.floor(temp / 1000);
        }

        const scale = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
        for (let i = actualBlocks.length - 1; i >= 0; i--) {
            const blockStr = readThreeDigits(actualBlocks[i], i < actualBlocks.length - 1);
            if (blockStr.trim() !== "") {
                res += blockStr + scale[i] + " ";
            }
        }

        res = res.trim();
        if (res.length > 0) {
            res = res.charAt(0).toUpperCase() + res.slice(1);
        }
        return res + " đồng chẵn";
    }

    // Export Excel using exceljs
    async onExportExcel(): Promise<void> {
        const validItems = this.items.filter(item => item.materialCode.trim() !== "");
        if (validItems.length === 0) {
            this.showFeedback("Vui lòng nhập vật tư trước khi xuất Excel.", "error");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Tauri Warehouse Management";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("PhieuNhapKho");

        // Style parameters
        sheet.views = [{ showGridLines: true }];

        // Header Section
        sheet.addRow(["BAN CHÍNH TRỊ HẬU CẦN", "", "", "", "", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"]);
        sheet.addRow(["BỘ PHẬN Y TẾ", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"]);
        sheet.addRow([]);

        const titleRow = sheet.addRow(["", "", "PHIẾU NHẬP KHO", "", "", ""]);
        titleRow.getCell(3).font = { size: 16, bold: true };

        const dateObj = new Date(this.postingDate || this.getTodayDate());
        sheet.addRow(["", "", `Ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`, "", "", ""]);
        sheet.addRow(["", "", `Số: ${this.receiptNumber}`, "", "", ""]);
        sheet.addRow([]);

        // General Info
        sheet.addRow([`Người giao hàng: ${this.deliveryPerson}`]);
        sheet.addRow([`Số chứng từ kèm theo: ${this.accompaniedDoc}`]);
        sheet.addRow([`Địa chỉ (bộ phận): ${this.department}`]);
        sheet.addRow([`Lý do nhập kho: ${this.reason}`]);
        sheet.addRow([`Nhập kho tại: ${this.warehouseLocation}`]);
        sheet.addRow([]);

        // Table headers
        const headerRow = sheet.addRow([
            "Stt",
            "Mã HH",
            "Tên thuốc - vật tư",
            "ĐVT",
            "S.Lượng Theo chứng từ",
            "S.Lượng Thực nhập",
            "Đơn giá",
            "Thành tiền"
        ]);

        headerRow.font = { bold: true };
        headerRow.eachCell(c => {
            c.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
            c.alignment = { vertical: "middle", horizontal: "center" };
        });

        // Add Items
        validItems.forEach((item, index) => {
            const row = sheet.addRow([
                index + 1,
                item.materialCode,
                item.materialName,
                item.unit,
                item.quantityDoc,
                item.quantityReal,
                item.price,
                item.amount
            ]);
            row.eachCell(c => {
                c.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });
            row.getCell(1).alignment = { horizontal: "center" };
            row.getCell(4).alignment = { horizontal: "center" };
            row.getCell(5).alignment = { horizontal: "right" };
            row.getCell(6).alignment = { horizontal: "right" };
            row.getCell(7).alignment = { horizontal: "right" };
            row.getCell(8).alignment = { horizontal: "right" };
        });

        // Totals Row
        const totalQty = this.getTotalQuantity();
        const totalAmount = this.getTotalAmount();
        const totalsRow = sheet.addRow([
            "Cộng",
            "",
            "",
            "",
            "",
            totalQty,
            "",
            totalAmount
        ]);
        totalsRow.font = { bold: true };
        sheet.mergeCells(`A${totalsRow.number}:D${totalsRow.number}`);
        totalsRow.getCell(1).alignment = { horizontal: "center" };

        totalsRow.eachCell(c => {
            c.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // Textual Sum
        sheet.addRow([]);
        const wordsRow = sheet.addRow([`Bằng chữ: ${this.getAmountInWords()}`]);
        wordsRow.font = { italic: true };
        sheet.mergeCells(`A${wordsRow.number}:H${wordsRow.number}`);

        // Signatures
        sheet.addRow([]);
        sheet.addRow(["", "", "", "", "", "", "", `Hà Nội, ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`]);
        sheet.addRow([]);
        sheet.addRow([
            "CHỈ HUY BAN CTHC",
            "",
            "PHỤ TRÁCH BỘ PHẬN Y TẾ",
            "",
            "KẾ TOÁN",
            "",
            "QUẢN LÝ KHO DƯỢC",
            ""
        ]);
        sheet.addRow(["(Ký, họ tên)", "", "(Ký, họ tên)", "", "(Ký, họ tên)", "", "(Ký, họ tên)", ""]);

        // Adjust widths
        sheet.columns?.forEach((column) => {
            if (column.values) {
                const maxWidth = (column.values as Array<string | number | undefined>)
                    .filter((value) => value !== undefined)
                    .map((value) => `${value}`.length)
                    .reduce((current, next) => Math.max(current, next), 10);
                column.width = Math.min(Math.max(maxWidth + 2, 10), 32);
            }
        });

        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            const savedPath = await invoke<string>("save_excel_buffer", {
                filename: `PhieuNhapKho_${this.receiptNumber.replace(/\//g, "-")}.xlsx`,
                content: base64,
            });
            this.showFeedback(`Xuất Excel thành công! Lưu tại: ${savedPath}`);
        } catch (error) {
            this.showFeedback("Lỗi khi xuất tệp Excel.", "error");
            console.error(error);
        }
    }

    onEnterPress(event: Event): void {
        const currentInput = event.target as HTMLElement;
        if (currentInput.tagName !== 'INPUT') return;

        event.preventDefault();
        const row = currentInput.closest('tr');
        if (!row) return;

        const rowInputs = Array.from(row.querySelectorAll('input:not([disabled])')) as HTMLInputElement[];
        const currentIndex = rowInputs.indexOf(currentInput as HTMLInputElement);

        if (currentIndex !== -1 && currentIndex < rowInputs.length - 1) {
            rowInputs[currentIndex + 1].focus();
        } else {
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                const nextRowInputs = Array.from(nextRow.querySelectorAll('input:not([disabled])')) as HTMLInputElement[];
                if (nextRowInputs.length > 0) {
                    nextRowInputs[0].focus();
                }
            }
        }
    }

    openMaterialPopup(index: number): void {
        this.activeRowIndex = index;
        this.searchMaterialCode = "";
        this.selectedPopupMaterial = null;
        this.filteredMaterials = [...this.materials];
        this.showMaterialModal = true;
    }

    closeMaterialPopup(): void {
        this.showMaterialModal = false;
        this.focusNextInputAfterSelect();
    }

    selectPopupMaterialRow(material: SavedMaterial): void {
        this.selectedPopupMaterial = material;
    }

    confirmSelectMaterial(): void {
        if (!this.selectedPopupMaterial || this.activeRowIndex === null) return;
        const row = this.items[this.activeRowIndex];
        const match = this.selectedPopupMaterial;

        row.materialCode = match.code;
        row.materialName = match.name;
        row.unit = match.unit;
        row.warehouse = match.warehouse;

        this.checkAndAppendRow(this.activeRowIndex);

        this.showMaterialModal = false;
        this.focusNextInputAfterSelect();
    }

    async onGetMaterialData(): Promise<void> {
        await this.loadMaterials();
        const search = this.searchMaterialCode.trim().toUpperCase();
        if (search === "") {
            this.filteredMaterials = [...this.materials];
        } else {
            this.filteredMaterials = this.materials.filter(m =>
                m.code.toUpperCase().includes(search)
            );
        }
    }

    emptyMaterialForm() {
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
            calculateInventory: true,
            startDate: "",
            endDate: "",
            imageData: "",
        };
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

    onAddNewMaterial(): void {
        this.materialForm = this.emptyMaterialForm();
        if (this.supplies.length > 0) {
            this.materialForm.warehouse = this.supplies[0].code;
        }
        this.showAddMaterialModal = true;
    }

    closeAddMaterialModal(): void {
        this.showAddMaterialModal = false;
    }

    onMaterialFormCodeChange(val: string): void {
        this.materialForm.barcode = val;
    }

    async onSaveNewMaterial(): Promise<void> {
        const code = this.materialForm.code.trim();
        const name = this.materialForm.name.trim();
        if (!code || !name) {
            this.showFeedback("Mã và Tên vật tư bắt buộc phải nhập.", "error");
            return;
        }

        const payload = {
            code,
            barcode: this.materialForm.barcode.trim() || code,
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
            await invoke("save_material", {
                material: payload,
            });
            this.showFeedback("Thêm vật tư mới thành công.");

            // Reload materials list from SQLite
            await this.loadMaterials();

            // Re-apply filter
            const search = this.searchMaterialCode.trim().toUpperCase();
            if (search === "") {
                this.filteredMaterials = [...this.materials];
            } else {
                this.filteredMaterials = this.materials.filter(m =>
                    m.code.toUpperCase().includes(search)
                );
            }

            // Close the Add Material Popup, leaving the Mã Vật Tư Popup open
            this.showAddMaterialModal = false;
        } catch (error) {
            this.showFeedback("Lỗi khi lưu dữ liệu vật tư.", "error");
            console.error(error);
        }
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

    focusNextInputAfterSelect(): void {
        if (this.activeRowIndex === null) return;
        const idx = this.activeRowIndex;
        setTimeout(() => {
            const tableBody = document.querySelector('.receipt-grid-table tbody');
            if (!tableBody) return;
            const rows = tableBody.querySelectorAll('tr');
            if (idx < rows.length) {
                const row = rows[idx];
                const rowInputs = Array.from(row.querySelectorAll('input')) as HTMLInputElement[];
                const codeInputIndex = rowInputs.findIndex(inp => inp.placeholder === 'Mã VT');
                if (codeInputIndex !== -1 && codeInputIndex + 1 < rowInputs.length) {
                    rowInputs[codeInputIndex + 1].focus();
                }
            }
        }, 50);
    }
}
