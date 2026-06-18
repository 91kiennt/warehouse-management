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
}

interface SavedReceipt {
    id: number;
    receiptNumber: string;
    postingDate: string;
    invoiceNumber: string;
    invoiceDate: string;
    description: string;
    status: string;
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
    status = "";
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

    ngOnInit(): void {
        this.resetForm();
        this.loadMaterials();
        this.loadReceipts();
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
                warehouse: m.warehouse
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
                status: r.status,
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
        this.status = "";
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
        const index = this.receipts.length + 1;
        const indexStr = index < 10 ? `00${index}` : index < 100 ? `0${index}` : `${index}`;
        const year = new Date().getFullYear();
        return `${indexStr}/NK-QY/${year}`;
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
        this.showFeedback("Mẫu nhập phiếu mới đã được thiết lập.");
    }

    async onSave(): Promise<void> {
        const code = this.receiptNumber.trim();
        if (!code) {
            this.showFeedback("Vui lòng nhập Số chứng từ.", "error");
            return;
        }

        // Filter out completely blank rows
        const validItems = this.items.filter(item => item.materialCode.trim() !== "");
        if (validItems.length === 0) {
            this.showFeedback("Vui lòng nhập ít nhất một dòng vật tư hợp lệ.", "error");
            return;
        }

        const payload = {
            receiptNumber: code,
            postingDate: this.postingDate,
            invoiceNumber: this.invoiceNumber.trim(),
            invoiceDate: this.invoiceDate,
            description: this.description.trim(),
            status: this.status,
            department: this.department.trim(),
            reason: this.reason.trim(),
            warehouseLocation: this.warehouseLocation.trim(),
            items: JSON.stringify(validItems),
        };

        try {
            if (this.selectedReceiptId !== null) {
                await invoke("update_warehouse_receipt", {
                    id: this.selectedReceiptId,
                    receipt: payload
                });
                this.showFeedback("Cập nhật phiếu nhập kho thành công.");
            } else {
                await invoke("save_warehouse_receipt", {
                    receipt: payload
                });
                this.showFeedback("Lưu phiếu nhập kho mới thành công.");
            }
            await this.loadReceipts();
            this.selectedReceiptId = this.receipts.find(r => r.receiptNumber === code)?.id || null;
        } catch (error) {
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
        this.status = receipt.status;
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
        sheet.addRow(["BAN CHỈ HUY HẬU CẦN", "", "", "", "", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"]);
        sheet.addRow(["BỘ PHẬN Y TẾ", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"]);
        sheet.addRow([]);

        const titleRow = sheet.addRow(["", "", "PHIẾU NHẬP KHO", "", "", ""]);
        titleRow.getCell(3).font = { size: 16, bold: true };

        const dateObj = new Date(this.postingDate || this.getTodayDate());
        sheet.addRow(["", "", `Ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`, "", "", ""]);
        sheet.addRow(["", "", `Số: ${this.receiptNumber}`, "", "", ""]);
        sheet.addRow([]);

        // General Info
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
}
