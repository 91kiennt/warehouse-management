import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import { UnitSettingsService } from "../../../../utils/unit-settings.service";

export interface ReviewRow {
    index?: number;
    materialCode: string;
    materialName: string;
    unit: string;
    bookQty: number | null; // Sổ sách (cho phép null để in dòng trống)
    actualQtyStr: string;   // Thực tế (để trống)
    diffQtyStr: string;     // Chênh lệch (để trống)
    notes: string;
}

@Component({
    standalone: true,
    selector: "app-review-report",
    imports: [CommonModule, FormsModule],
    templateUrl: "./review-report.component.html",
    styleUrls: ["./review-report.component.css"],
})
export class ReviewReportComponent implements OnInit {
    settingsService = inject(UnitSettingsService);

    // Form filter properties
    selectedMonth: number = 1;
    selectedYear: number = 2026;
    startDate: string = "2026-01-01";
    endDate: string = "2026-01-31";
    startDateDisplay: string = "01/01/2026";
    endDateDisplay: string = "31/01/2026";

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

    // Data grid properties
    reportRows: ReviewRow[] = [];
    showReportTable: boolean = false;
    showPrintModal: boolean = false;

    // Alert / message
    message: string = "";
    messageType: "success" | "error" = "success";

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

            // Load materials, receipts, and issues
            const materials = await invoke<any[]>("list_materials");
            const receipts = await invoke<any[]>("list_warehouse_receipts");
            const issues = await invoke<any[]>("list_warehouse_issues");

            // Compute stocks for each material (Closing Qty as of endDate)
            const map = new Map<string, number>();
            const activeCodes = new Set<string>();

            // Initial map of all materials
            for (const mat of materials) {
                map.set(mat.code, 0);
            }

            // Receipts (Imports) up to endDate
            for (const r of receipts) {
                const postingDate = r.postingDate || (r as any).posting_date;
                if (postingDate <= this.endDate) {
                    let itemsList: any[] = [];
                    try {
                        itemsList = r.items ? JSON.parse(r.items) : [];
                    } catch (e) { }
                    for (const item of itemsList) {
                        const code = item.materialCode;
                        activeCodes.add(code);
                        const qty = Number(item.quantityReal || 0);
                        const curr = map.get(code) || 0;
                        map.set(code, curr + qty);
                    }
                }
            }

            // Issues (Exports) up to endDate
            for (const iss of issues) {
                const postingDate = iss.postingDate || (iss as any).posting_date;
                if (postingDate <= this.endDate) {
                    let itemsList: any[] = [];
                    try {
                        itemsList = iss.items ? JSON.parse(iss.items) : [];
                    } catch (e) { }
                    for (const item of itemsList) {
                        const code = item.materialCode;
                        const qty = Number(item.quantityReal || 0);
                        const curr = map.get(code) || 0;
                        map.set(code, curr - qty);
                    }
                }
            }

            // Generate report rows
            const rows: ReviewRow[] = [];
            let i = 1;
            for (const mat of materials) {
                if (!activeCodes.has(mat.code)) {
                    continue;
                }
                const closingQty = map.get(mat.code) || 0;
                rows.push({
                    index: i++,
                    materialCode: mat.code,
                    materialName: mat.name,
                    unit: mat.unit || "",
                    bookQty: closingQty,
                    actualQtyStr: "",
                    diffQtyStr: "",
                    notes: ""
                });
            }

            // Sort report rows by material code
            rows.sort((a, b) => a.materialCode.localeCompare(b.materialCode));

            // Re-index after sorting
            rows.forEach((r, idx) => {
                r.index = idx + 1;
            });

            this.reportRows = rows;
            this.showReportTable = true;
            this.showFeedback(`Đã tải thành công số liệu kiểm kê kho.`);
        } catch (error) {
            this.showFeedback("Lỗi khi tải dữ liệu báo cáo.", "error");
            console.error(error);
        }
    }

    onPrintReport(): void {
        if (this.reportRows.length === 0) {
            this.showFeedback("Vui lòng lấy dữ liệu báo cáo trước khi in.", "error");
            return;
        }
        this.showPrintModal = true;
    }

    closePrintModal(): void {
        this.showPrintModal = false;
    }

    triggerSystemPrint(): void {
        window.print();
    }

    getPrintItems(): any[] {
        return this.reportRows;
    }
}
