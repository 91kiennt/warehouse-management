import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { UnitSettingsService } from "../../../../utils/unit-settings.service";

export interface ReportRow {
    isHeader: boolean;  // Dòng tổng hợp thông tin chung phiếu (nền xanh)
    isTotal: boolean;   // Dòng tổng cộng chung báo cáo (nền xám)
    index?: number;
    id?: number;        // ID của phiếu nhập kho
    
    // Thông tin chứng từ
    receiptNumber: string;
    postingDate: string;
    description: string;
    
    // Thông tin vật tư chi tiết
    materialCode?: string;
    materialName?: string;
    unit?: string;
    quantity?: number;
    price?: number;
    amount?: number;
    totalAmount?: number;
}

@Component({
    standalone: true,
    selector: "app-inventory-receipt-report",
    imports: [CommonModule, FormsModule],
    templateUrl: "./inventory-receipt-report.component.html",
    styleUrls: ["./inventory-receipt-report.component.css"],
})
export class InventoryReceiptReportComponent implements OnInit, OnDestroy {
    settingsService = inject(UnitSettingsService);
    router = inject(Router);

    // Form filter properties
    selectedMonth: number = 1;
    selectedYear: number = 2026;
    startDate: string = "2026-01-01";
    endDate: string = "2026-01-31";
    startDateDisplay: string = "01/01/2026";
    endDateDisplay: string = "31/01/2026";


    // Data grid properties
    reportRows: ReportRow[] = [];
    showReportTable: boolean = false;
    showPrintModal: boolean = false;
    
    totalQuantity: number = 0;
    totalAmount: number = 0;
    
    // Alert / message
    message: string = "";
    messageType: "success" | "error" = "success";

    months = [
        { value: 1, label: "1. Tháng 1" },
        { value: 2, label: "2. Tháng 2" },
        { value: 3, label: "3. Tháng 3" },
        { value: 4, label: "4. Tháng 4" },
        { value: 5, label: "5. Tháng 5" },
        { value: 6, label: "6. Tháng 6" },
        { value: 7, label: "7. Tháng 7" },
        { value: 8, label: "8. Tháng 8" },
        { value: 9, label: "9. Tháng 9" },
        { value: 10, label: "10. Tháng 10" },
        { value: 11, label: "11. Tháng 11" },
        { value: 12, label: "12. Tháng 12" },
    ];

    ngOnInit(): void {
        this.updateDateRange();
    }

    updateDateRange(): void {
        this.selectedMonth = Number(this.selectedMonth);
        if (this.selectedMonth === 13) return;
        const year = this.selectedYear || 2026;
        const month = this.selectedMonth || 1;
        
        // Start date: 1st of the month
        const start = new Date(year, month - 1, 1);
        // End date: last day of the month
        const end = new Date(year, month, 0);
        
        this.startDate = this.formatDate(start);
        this.endDate = this.formatDate(end);
        
        this.startDateDisplay = this.formatDateDMY(this.startDate);
        this.endDateDisplay = this.formatDateDMY(this.endDate);
    }

    formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    formatDateDMY(dateStr: string): string {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    onMonthChange(): void {
        this.selectedMonth = Number(this.selectedMonth);
        this.updateDateRange();
    }

    onDateBlur(type: 'start' | 'end'): void {
        this.selectedMonth = Number(this.selectedMonth);
        const val = type === 'start' ? this.startDateDisplay : this.endDateDisplay;
        if (this.selectedMonth === 13) {
            const parsed = this.parseDateDMY(val);
            if (parsed) {
                if (type === 'start') {
                    this.startDate = parsed;
                } else {
                    this.endDate = parsed;
                }
            } else {
                // Tự động khôi phục về ngày trước đó nếu nhập sai
                if (type === 'start') {
                    this.startDateDisplay = this.formatDateDMY(this.startDate);
                } else {
                    this.endDateDisplay = this.formatDateDMY(this.endDate);
                }
            }
        } else {
            const parsedYear = this.parseYear(val);
            if (parsedYear !== null) {
                this.selectedYear = parsedYear;
            }
            this.updateDateRange();
        }
    }

    parseDateDMY(displayVal: string): string | null {
        if (!displayVal) return null;
        const parts = displayVal.trim().split('/');
        if (parts.length === 3) {
            const d = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const y = parts[2];
            if (d.length === 2 && m.length === 2 && y.length === 4) {
                const day = parseInt(d, 10);
                const month = parseInt(m, 10);
                const year = parseInt(y, 10);
                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1000 && year <= 9999) {
                    const testDate = new Date(year, month - 1, day);
                    if (testDate.getFullYear() === year && testDate.getMonth() === month - 1 && testDate.getDate() === day) {
                        return `${y}-${m}-${d}`;
                    }
                }
            }
        }
        return null;
    }

    parseYear(val: string): number | null {
        if (!val) return null;
        const match = val.match(/\d{4}/);
        if (match) {
            const y = parseInt(match[0], 10);
            if (y >= 2000 && y <= 2100) {
                return y;
            }
        }
        return null;
    }

    syncYearFromInputs(): void {
        this.selectedMonth = Number(this.selectedMonth);
        if (this.selectedMonth === 13) return;
        const startYear = this.parseYear(this.startDateDisplay);
        if (startYear !== null) {
            this.selectedYear = startYear;
        } else {
            const endYear = this.parseYear(this.endDateDisplay);
            if (endYear !== null) {
                this.selectedYear = endYear;
            }
        }
        this.updateDateRange();
    }

    showFeedback(msg: string, type: "success" | "error" = "success"): void {
        this.message = msg;
        this.messageType = type;
        setTimeout(() => {
            this.message = "";
        }, 3000);
    }

    async onGetData(): Promise<void> {
        try {
            this.syncYearFromInputs();
            const receipts = await invoke<any[]>("list_warehouse_receipts");
            
            // Filter by date range
            const filtered = receipts.filter(r => {
                const pDate = r.postingDate || (r as any).posting_date;
                return pDate >= this.startDate && pDate <= this.endDate;
            });

            // Sort by posting date then receipt number
            filtered.sort((a, b) => {
                const dateA = a.postingDate || (a as any).posting_date;
                const dateB = b.postingDate || (b as any).posting_date;
                if (dateA !== dateB) return dateA.localeCompare(dateB);
                
                const numA = a.receiptNumber || (a as any).receipt_number;
                const numB = b.receiptNumber || (b as any).receipt_number;
                return numA.localeCompare(numB);
            });

            const rows: ReportRow[] = [];
            let globalQty = 0;
            let globalAmount = 0;

            for (const r of filtered) {
                const receiptNum = r.receiptNumber || (r as any).receipt_number || "";
                const postDate = r.postingDate || (r as any).posting_date || "";
                const desc = r.description || "";
                
                // Parse items
                let itemsList: any[] = [];
                try {
                    itemsList = r.items ? JSON.parse(r.items) : [];
                } catch (e) {
                    console.error("Lỗi parse items cho phiếu:", receiptNum, e);
                }

                if (itemsList.length === 0) continue;

                // Calculate totals for this receipt
                let docQty = 0;
                let docAmount = 0;
                
                for (const item of itemsList) {
                    docQty += Number(item.quantityReal || 0);
                    docAmount += Number(item.amount || 0);
                }

                // Push group header row (blue background)
                rows.push({
                    isHeader: true,
                    isTotal: false,
                    id: r.id,
                    receiptNumber: receiptNum,
                    postingDate: postDate,
                    description: desc,
                    price: docAmount,
                    amount: docAmount,
                    totalAmount: docAmount
                });

                // Push item details
                for (const item of itemsList) {
                    const qty = Number(item.quantityReal || 0);
                    const prc = Number(item.price || 0);
                    const amt = Number(item.amount || 0);

                    rows.push({
                        isHeader: false,
                        isTotal: false,
                        id: r.id,
                        receiptNumber: receiptNum,
                        postingDate: postDate,
                        description: desc,
                        materialCode: item.materialCode || "",
                        materialName: item.materialName || "",
                        unit: item.unit || "",
                        quantity: qty,
                        price: prc,
                        amount: amt,
                        totalAmount: amt
                    });

                    globalQty += qty;
                    globalAmount += amt;
                }
            }

            // Assign indices only for header rows
            let headerCounter = 0;
            rows.forEach((row) => {
                if (row.isHeader) {
                    headerCounter++;
                    row.index = headerCounter;
                } else {
                    row.index = undefined;
                }
            });

            // Push grand total row
            if (rows.length > 0) {
                rows.push({
                    isHeader: false,
                    isTotal: true,
                    receiptNumber: "",
                    postingDate: "",
                    description: "Tổng cộng",
                    quantity: globalQty,
                    price: globalAmount,
                    amount: globalAmount,
                    totalAmount: globalAmount
                });
            }

            this.reportRows = rows;
            this.totalQuantity = globalQty;
            this.totalAmount = globalAmount;
            this.showReportTable = true;

            if (filtered.length === 0) {
                this.showFeedback("Không tìm thấy dữ liệu phiếu nhập trong khoảng thời gian đã chọn.", "error");
            } else {
                this.showFeedback(`Đã tải thành công ${filtered.length} phiếu nhập.`);
            }

        } catch (error) {
            this.showFeedback("Lỗi khi tải dữ liệu báo cáo.", "error");
            console.error(error);
        }
    }

    onEditReceipt(id: number | undefined): void {
        if (id) {
            this.router.navigate(["/warehouse-receipts"], { queryParams: { id } });
        }
    }

    onPrintReport(): void {
        if (this.reportRows.length === 0) {
            this.showFeedback("Vui lòng lấy dữ liệu báo cáo trước khi in.", "error");
            return;
        }
        this.showPrintModal = true;
        this.injectPrintStyle();
    }

    closePrintModal(): void {
        this.showPrintModal = false;
        this.removePrintStyle();
    }

    triggerSystemPrint(): void {
        window.print();
    }

    ngOnDestroy(): void {
        this.removePrintStyle();
    }

    private injectPrintStyle(): void {
        this.removePrintStyle();
        const style = document.createElement("style");
        style.id = "print-landscape-style-override";
        style.textContent = `
            @page {
                size: A4 landscape !important;
                margin: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }

    private removePrintStyle(): void {
        const style = document.getElementById("print-landscape-style-override");
        if (style) {
            style.remove();
        }
    }
}
