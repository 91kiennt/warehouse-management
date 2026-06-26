import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import * as ExcelJS from "exceljs";
import { FlatpickrDirective } from "../../../utils/flatpickr.directive";
import { UnitSettingsService } from "../../../utils/unit-settings.service";

interface IssueItem {
    warehouse: string;
    materialCode: string;
    materialName: string;
    unit: string;
    stockQty: number;
    quantityReq: number; // SL Yêu cầu
    quantityReal: number; // SL Thực xuất
    price: number;
    amount: number;
    finishedProduct: string; // Thành phẩm
    notes: string; // Diễn giải
    materialBarcode?: string; // Mã vạch vật tư
    isPad?: boolean; // Cờ dòng đệm in ấn
}

interface SavedMaterial {
    id: number;
    code: string;
    barcode: string; // Thêm mã vạch
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

interface SavedIssue {
    id: number;
    issueNumber: string;
    postingDate: string;
    invoiceNumber: string;
    invoiceDate: string;
    description: string;
    accompaniedDoc: string;
    receiverName: string;
    department: string;
    reason: string;
    warehouseLocation: string;
    items: string; // JSON String
    createdAt: string;
}

import { EnterFocusNextDirective } from "../../../utils/enter-focus-next.directive";

@Component({
    standalone: true,
    selector: "app-warehouse-issues",
    imports: [CommonModule, FormsModule, FlatpickrDirective, EnterFocusNextDirective],
    templateUrl: "./warehouse-issues.component.html",
    styleUrls: ["./warehouse-issues.component.css"],
})
export class WarehouseIssuesComponent implements OnInit {
    settingsService = inject(UnitSettingsService);

    // Form fields
    issueNumber = "";
    postingDate = "";
    invoiceNumber = "";
    invoiceDate = "";
    description = "";
    accompaniedDoc = "";
    receiverName = "";
    department = "";
    reason = "";
    warehouseLocation = "";

    // Grid items
    items: IssueItem[] = [];

    // Master lists
    materials: SavedMaterial[] = [];
    issues: SavedIssue[] = [];

    // Selected issue for update/delete
    selectedIssueId: number | null = null;

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

    // Warehouse Popup Modal States
    showWarehouseModal = false;
    searchWarehouseTerm = "";
    filteredSupplies: SavedSupply[] = [];
    selectedPopupSupply: SavedSupply | null = null;
    activeWarehouseRowIndex: number | null = null;

    // Material Form Options & States
    units = ["Kg", "Cái", "Hộp", "Thùng", "Lít", "Mét"];
    currencies = ["đồng", "USD", "EUR"];
    valuationMethods = ["Bình quân cuối kỳ", "FIFO", "LIFO", "Đích danh"];
    supplies: SavedSupply[] = [];

    showAddMaterialModal = false;
    materialForm = this.emptyMaterialForm();

    // Employee/Customer Popup Modal States
    showEmployeeModal = false;
    customers: any[] = [];
    selectedPopupCustomer: any | null = null;

    ngOnInit(): void {
        this.resetForm();
        this.loadMaterials();
        this.loadIssues();
        this.loadSupplies();
        this.loadCustomers();
    }

    // Load master materials to auto-lookup
    async loadMaterials(): Promise<void> {
        try {
            const list = await invoke<any[]>("list_materials");
            this.materials = list.map(m => ({
                id: m.id,
                code: m.code,
                barcode: m.barcode || "",
                name: m.name,
                unit: m.unit,
                warehouse: m.warehouse,
                taxable: m.taxable
            }));
        } catch (error) {
            console.error("Lỗi khi tải danh sách vật tư:", error);
        }
    }

    // Load master customers (employees)
    async loadCustomers(): Promise<void> {
        try {
            this.customers = await invoke<any[]>("list_customers");
            this.customers.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
        }
    }

    // Load saved issues list
    async loadIssues(): Promise<void> {
        try {
            const list = await invoke<any[]>("list_warehouse_issues");
            this.issues = list.map(i => ({
                id: i.id,
                issueNumber: i.issueNumber ?? (i as any).issue_number,
                postingDate: i.postingDate ?? (i as any).posting_date,
                invoiceNumber: i.invoiceNumber ?? (i as any).invoice_number,
                invoiceDate: i.invoiceDate ?? (i as any).invoice_date,
                description: i.description,
                accompaniedDoc: i.accompaniedDoc ?? (i as any).accompanied_doc,
                receiverName: i.receiverName ?? (i as any).receiver_name,
                department: i.department,
                reason: i.reason,
                warehouseLocation: i.warehouseLocation ?? (i as any).warehouse_location,
                items: i.items,
                createdAt: i.createdAt ?? (i as any).created_at
            }));
        } catch (error) {
            console.error("Lỗi khi tải danh sách phiếu xuất kho:", error);
        }
    }

    // Reset Form & Items Grid
    resetForm(): void {
        this.selectedIssueId = null;
        this.issueNumber = "";
        this.postingDate = "";
        this.invoiceNumber = "";
        this.invoiceDate = "";
        this.description = "";
        this.accompaniedDoc = "";
        this.receiverName = "";
        this.department = "";
        this.reason = "";
        this.warehouseLocation = "";

        // Initialize with one blank row
        this.items = [this.createBlankItem()];
    }

    createBlankItem(): IssueItem {
        return {
            warehouse: "",
            materialCode: "",
            materialName: "",
            unit: "",
            stockQty: 0,
            quantityReq: 0,
            quantityReal: 0,
            price: 0,
            amount: 0,
            finishedProduct: "",
            notes: "",
            materialBarcode: "",
        };
    }

    getTodayDate(): string {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        return `${yyyy}-${mm < 10 ? '0' + mm : mm}-${dd < 10 ? '0' + dd : dd}`;
    }

    generateIssueNumber(): string {
        // Collect all existing suffixes that match XK/\d{5}
        const existingNumbers = this.issues
            .map(i => {
                const match = i.issueNumber.match(/^XK\/(\d{5})$/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0);

        // Find the maximum number
        let nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

        // Double check against any conflict, increment if conflict exists
        while (this.issues.some(i => i.issueNumber === `XK/${nextNum.toString().padStart(5, "0")}`)) {
            nextNum++;
        }

        return `XK/${nextNum.toString().padStart(5, "0")}`;
    }

    onIssueInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let val = input.value;

        if (!val || val.trim() === "" || val === "XK/") {
            this.issueNumber = "";
            input.value = "";
            return;
        }

        let suffix = val;
        if (suffix.startsWith("XK/")) {
            suffix = suffix.substring(3);
        } else if (suffix.startsWith("XK")) {
            suffix = suffix.substring(2);
        } else if (suffix.startsWith("X")) {
            suffix = suffix.substring(1);
        }
        
        let digits = suffix.replace(/\D/g, "");
        if (digits === "") {
            this.issueNumber = "XK/";
            input.value = "XK/";
            return;
        }

        // Limit to maximum of 5 digits while typing (do not pad instantly)
        if (digits.length > 5) {
            digits = digits.substring(0, 5);
        }
        
        const formatted = "XK/" + digits;
        this.issueNumber = formatted;
        input.value = formatted;
    }

    formatIssueNumber(): void {
        if (!this.issueNumber || this.issueNumber.trim() === "" || this.issueNumber === "XK/") {
            this.issueNumber = "";
            return;
        }
        let suffix = this.issueNumber;
        if (suffix.startsWith("XK/")) {
            suffix = suffix.substring(3);
        }
        let digits = suffix.replace(/\D/g, "");
        if (digits === "") {
            this.issueNumber = "";
        } else {
            this.issueNumber = "XK/" + digits.padStart(5, "0");
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
        this.checkAndAppendRow(index);
    }

    // Compute totals of grid items
    getTotalQuantityReq(): number {
        return this.items
            .filter(item => item.materialCode.trim() !== "")
            .reduce((sum, item) => sum + (item.quantityReq || 0), 0);
    }

    getTotalQuantityReal(): number {
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
        this.issueNumber = this.generateIssueNumber();
        this.showFeedback("Mẫu nhập phiếu mới đã được thiết lập.");
    }

    async onSave(): Promise<void> {
        // Generate issue number if left empty
        if (!this.issueNumber || this.issueNumber.trim() === "" || this.issueNumber === "XK/") {
            this.issueNumber = this.generateIssueNumber();
        }
        // Ensure the issue number is formatted before validation and save
        this.formatIssueNumber();
        const code = this.issueNumber.trim();
        if (!code) {
            this.showFeedback("Vui lòng nhập Số chứng từ.", "error");
            return;
        }

        // Check for duplicate issue number in the database
        const isDuplicate = this.issues.some(i => 
            i.issueNumber.trim().toUpperCase() === code.toUpperCase() && 
            (this.selectedIssueId === null || i.id !== this.selectedIssueId)
        );
        if (isDuplicate) {
            this.showFeedback("Số chứng từ đã tồn tại trong hệ thống. Vui lòng nhập số khác.", "error");
            return;
        }

        // Filter out completely blank rows
        const validItems = this.items.filter(item => item.materialCode.trim() !== "");
        if (validItems.length === 0) {
            this.showFeedback("Vui lòng nhập ít nhất một dòng vật tư hợp lệ.", "error");
            return;
        }

        const payload = {
            issueNumber: code,
            postingDate: this.postingDate,
            invoiceNumber: this.invoiceNumber.trim(),
            invoiceDate: this.invoiceDate,
            description: this.description.trim(),
            accompaniedDoc: this.accompaniedDoc.trim(),
            receiverName: this.receiverName.trim(),
            department: this.department.trim(),
            reason: this.reason.trim(),
            warehouseLocation: this.warehouseLocation.trim(),
            items: JSON.stringify(validItems),
        };

        try {
            if (this.selectedIssueId !== null) {
                await invoke("update_warehouse_issue", {
                    id: this.selectedIssueId,
                    issue: payload
                });
                this.showFeedback("Cập nhật phiếu xuất kho thành công.");
            } else {
                await invoke("save_warehouse_issue", {
                    issue: payload
                });
                this.showFeedback("Lưu phiếu xuất kho mới thành công.");
            }
            await this.loadIssues();
            this.selectedIssueId = this.issues.find(i => i.issueNumber === code)?.id || null;
        } catch (error) {
            this.showFeedback("Lỗi khi lưu dữ liệu phiếu xuất kho.", "error");
            console.error(error);
        }
    }

    onDeleteClick(): void {
        if (this.selectedIssueId === null) {
            this.showFeedback("Vui lòng chọn hoặc lưu một phiếu xuất kho để xoá.", "error");
            return;
        }
        this.showDeleteConfirm = true;
    }

    async confirmDelete(): Promise<void> {
        if (this.selectedIssueId === null) return;
        try {
            await invoke("delete_warehouse_issue", { id: this.selectedIssueId });
            this.showFeedback("Đã xoá phiếu xuất kho thành công.");
            this.showDeleteConfirm = false;
            this.resetForm();
            await this.loadIssues();
        } catch (error) {
            this.showFeedback("Lỗi khi xoá phiếu xuất kho.", "error");
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

    selectIssue(issue: SavedIssue): void {
        this.selectedIssueId = issue.id;
        this.issueNumber = issue.issueNumber;
        this.postingDate = issue.postingDate;
        this.invoiceNumber = issue.invoiceNumber;
        this.invoiceDate = issue.invoiceDate;
        this.description = issue.description;
        this.accompaniedDoc = issue.accompaniedDoc;
        this.receiverName = issue.receiverName;
        this.department = issue.department;
        this.reason = issue.reason;
        this.warehouseLocation = issue.warehouseLocation;

        try {
            const parsedItems = JSON.parse(issue.items) as IssueItem[];
            this.items = parsedItems.map(item => {
                const masterMat = this.materials.find(m => m.code === item.materialCode);
                return {
                    ...item,
                    materialBarcode: item.materialBarcode || (masterMat ? masterMat.barcode : "")
                };
            });
            // Ensure there is always a blank row at the bottom for appending
            this.items.push(this.createBlankItem());
        } catch (error) {
            console.error("Lỗi khi phân tích danh sách vật tư:", error);
            this.items = [this.createBlankItem()];
        }

        this.showSearchModal = false;
        this.showFeedback(`Đã tải phiếu xuất kho "${issue.issueNumber}".`);
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

    getPrintItems(): any[] {
        const validItems = this.items.filter(item => item.materialCode.trim() !== "");
        const printItems = [...validItems];
        
        while (printItems.length < 6) {
            printItems.push({
                warehouse: "",
                materialCode: "",
                materialName: "",
                materialBarcode: "",
                unit: "",
                stockQty: 0,
                quantityReq: 0,
                quantityReal: 0,
                price: 0,
                amount: 0,
                finishedProduct: "",
                notes: "",
                isPad: true
            });
        }
        return printItems;
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
        let temp = Math.abs(num);
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

        const sheet = workbook.addWorksheet("PhieuXuatKho");

        // Style parameters
        sheet.views = [{ showGridLines: true }];

        // Header Section
        sheet.addRow(["BAN CHÍNH TRỊ HẬU CẦN", "", "", "", "", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"]);
        sheet.addRow(["BỘ PHẬN Y TẾ", "", "", "", "", "Độc lập - Tự do - Hạnh phúc"]);
        sheet.addRow([]);

        const titleRow = sheet.addRow(["", "", "PHIẾU XUẤT KHO", "", "", ""]);
        titleRow.getCell(3).font = { size: 16, bold: true };

        const dateObj = new Date(this.postingDate || this.getTodayDate());
        sheet.addRow(["", "", `Ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`, "", "", ""]);
        sheet.addRow(["", "", `Số: ${this.issueNumber}`, "", "", ""]);
        sheet.addRow([]);

        // General Info
        sheet.addRow([`Số chứng từ kèm theo: ${this.accompaniedDoc}`]);
        sheet.addRow([`Họ và tên người nhận hàng: ${this.receiverName}`]);
        sheet.addRow([`Địa chỉ (bộ phận): ${this.department}`]);
        sheet.addRow([`Lý do xuất kho: ${this.reason}`]);
        sheet.addRow([`Xuất tại kho (ngăn lô): ${this.warehouseLocation}`]);
        sheet.addRow([]);

        // Table headers
        const headerRow = sheet.addRow([
            "Stt",
            "Mã số",
            "Tên, nhãn hiệu, quy cách, phẩm chất vật tư",
            "ĐVT",
            "S.Lượng Yêu cầu",
            "S.Lượng Thực xuất",
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
                item.quantityReq,
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
        const totalQtyReq = this.getTotalQuantityReq();
        const totalQtyReal = this.getTotalQuantityReal();
        const totalAmount = this.getTotalAmount();
        const totalsRow = sheet.addRow([
            "Cộng",
            "",
            "",
            "",
            totalQtyReq,
            totalQtyReal,
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
        const wordsRow = sheet.addRow([`Tổng số tiền (viết bằng chữ): ${this.getAmountInWords()}`]);
        wordsRow.font = { italic: true };
        sheet.mergeCells(`A${wordsRow.number}:H${wordsRow.number}`);

        // Signatures
        sheet.addRow([]);
        sheet.addRow(["", "", "", "", "", "", "", `Hà Nội, ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`]);
        sheet.addRow([]);
        sheet.addRow([
            "Người lập phiếu",
            "",
            "Người nhận hàng",
            "",
            "Thủ kho",
            "",
            "Kế toán trưởng",
            "Giám đốc / Thủ trưởng"
        ]);
        sheet.addRow(["(Ký, họ tên)", "", "(Ký, họ tên)", "", "(Ký, họ tên)", "", "(Ký, họ tên)", "(Ký, họ tên)"]);

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
                filename: `PhieuXuatKho_${this.issueNumber.replace(/\//g, "-")}.xlsx`,
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
        row.materialBarcode = match.barcode || "";

        this.updateRowStockQty(this.activeRowIndex);
        
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
            const tableBody = document.querySelector('.issue-grid-table tbody');
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

    openEmployeePopup(): void {
        this.selectedPopupCustomer = null;
        this.showEmployeeModal = true;
        this.loadCustomers();
    }

    closeEmployeePopup(): void {
        this.showEmployeeModal = false;
    }

    selectPopupCustomerRow(customer: any): void {
        this.selectedPopupCustomer = customer;
    }

    confirmSelectCustomer(): void {
        if (!this.selectedPopupCustomer) return;
        this.receiverName = this.selectedPopupCustomer.name;
        this.showEmployeeModal = false;
    }

    openWarehousePopup(index: number): void {
        this.activeWarehouseRowIndex = index;
        this.searchWarehouseTerm = "";
        this.selectedPopupSupply = null;
        this.filteredSupplies = [...this.supplies];
        this.showWarehouseModal = true;
    }

    closeWarehousePopup(): void {
        this.showWarehouseModal = false;
        this.focusNextInputAfterWarehouseSelect();
    }

    selectPopupSupplyRow(supply: SavedSupply): void {
        this.selectedPopupSupply = supply;
    }

    async onGetWarehouseData(): Promise<void> {
        await this.loadSupplies();
        const search = this.searchWarehouseTerm.trim().toUpperCase();
        if (search === "") {
            this.filteredSupplies = [...this.supplies];
        } else {
            this.filteredSupplies = this.supplies.filter(s =>
                s.code.toUpperCase().includes(search) ||
                s.name.toUpperCase().includes(search)
            );
        }
    }

    confirmSelectWarehouse(): void {
        if (!this.selectedPopupSupply || this.activeWarehouseRowIndex === null) return;
        const row = this.items[this.activeWarehouseRowIndex];
        row.warehouse = this.selectedPopupSupply.code;

        this.updateRowStockQty(this.activeWarehouseRowIndex);

        this.showWarehouseModal = false;
        this.focusNextInputAfterWarehouseSelect();
    }

    focusNextInputAfterWarehouseSelect(): void {
        if (this.activeWarehouseRowIndex === null) return;
        const idx = this.activeWarehouseRowIndex;
        setTimeout(() => {
            const tableBody = document.querySelector('.issue-grid-table tbody');
            if (!tableBody) return;
            const rows = tableBody.querySelectorAll('tr');
            if (idx < rows.length) {
                const row = rows[idx];
                const rowInputs = Array.from(row.querySelectorAll('input')) as HTMLInputElement[];
                const nameInputIndex = rowInputs.findIndex(inp => inp.placeholder === 'Tên vật tư');
                if (nameInputIndex !== -1) {
                    nameInputIndex !== -1 && rowInputs[nameInputIndex].focus();
                }
            }
        }, 50);
    }

    async updateRowStockQty(index: number): Promise<void> {
        const row = this.items[index];
        if (!row.materialCode || !row.warehouse) {
            row.stockQty = 0;
            return;
        }
        try {
            const stock = await invoke<number>("get_material_stock", {
                materialCode: row.materialCode,
                warehouseCode: row.warehouse
            });
            row.stockQty = stock;
        } catch (error) {
            console.error("Lỗi khi lấy lượng tồn:", error);
            row.stockQty = 0;
        }
    }
}
