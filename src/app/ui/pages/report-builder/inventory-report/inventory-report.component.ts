import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import { UnitSettingsService } from "../../../../utils/unit-settings.service";

export interface InventoryRow {
    index?: number;
    materialCode: string;
    materialName: string;
    unit: string;
    price: number;       // Đơn giá = Thành tiền / Số lượng (hoặc đơn giá nhập cuối cùng nếu tồn = 0)
    quantity: number;    // Số lượng tồn cuối kỳ
    amount: number;      // Thành tiền tồn cuối kỳ
    note: string;
    parentName: string;  // Nhóm vật tư
}

export interface GroupedInventory {
    groupName: string;
    romanIndex: string;
    rows: InventoryRow[];
}

@Component({
    standalone: true,
    selector: "app-inventory-report",
    imports: [CommonModule, FormsModule],
    templateUrl: "./inventory-report.component.html",
    styleUrls: ["./inventory-report.component.css"],
})
export class InventoryReportComponent implements OnInit {
    settingsService = inject(UnitSettingsService);

    // Form filter properties
    selectedMonth: number = 1;
    selectedYear: number = 2026;
    startDate: string = "2026-01-01";
    endDate: string = "2026-01-31";
    startDateDisplay: string = "01/01/2026";
    endDateDisplay: string = "31/01/2026";

    // Data grid properties
    reportRows: InventoryRow[] = [];
    groupedSections: GroupedInventory[] = [];
    showReportTable: boolean = false;
    showPrintModal: boolean = false;

    // Grand Totals
    totalQty: number = 0;
    totalAmt: number = 0;

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

    private rawReceipts: any[] = [];
    private rawIssues: any[] = [];

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
            this.rawReceipts = await invoke<any[]>("list_warehouse_receipts");
            this.rawIssues = await invoke<any[]>("list_warehouse_issues");

            // Build map of last receipt price for each material (fallback unit price when qty is 0)
            const lastReceiptPriceMap = new Map<string, number>();
            const sortedReceipts = [...this.rawReceipts].sort((a, b) => {
                const da = a.postingDate || (a as any).posting_date || "";
                const db = b.postingDate || (b as any).posting_date || "";
                return da.localeCompare(db);
            });
            for (const r of sortedReceipts) {
                let itemsList: any[] = [];
                try {
                    itemsList = r.items ? JSON.parse(r.items) : [];
                } catch (e) {}
                for (const item of itemsList) {
                    const price = Number(item.price || 0);
                    if (price > 0) {
                        lastReceiptPriceMap.set(item.materialCode, price);
                    }
                }
            }

            // Compute stocks for each material (Closing Qty & Amt as of endDate)
            const qtyMap = new Map<string, number>();
            const amtMap = new Map<string, number>();

            for (const mat of materials) {
                qtyMap.set(mat.code, 0);
                amtMap.set(mat.code, 0);
            }

            // Receipts (Imports) up to endDate
            for (const r of this.rawReceipts) {
                const postingDate = r.postingDate || (r as any).posting_date;
                if (postingDate <= this.endDate) {
                    let itemsList: any[] = [];
                    try {
                        itemsList = r.items ? JSON.parse(r.items) : [];
                    } catch (e) {}
                    for (const item of itemsList) {
                        const code = item.materialCode;
                        const qty = Number(item.quantityReal || 0);
                        const amt = Number(item.amount || 0);

                        qtyMap.set(code, (qtyMap.get(code) || 0) + qty);
                        amtMap.set(code, (amtMap.get(code) || 0) + amt);
                    }
                }
            }

            // Issues (Exports) up to endDate
            for (const iss of this.rawIssues) {
                const postingDate = iss.postingDate || (iss as any).posting_date;
                if (postingDate <= this.endDate) {
                    let itemsList: any[] = [];
                    try {
                        itemsList = iss.items ? JSON.parse(iss.items) : [];
                    } catch (e) {}
                    for (const item of itemsList) {
                        const code = item.materialCode;
                        const qty = Number(item.quantityReal || 0);
                        const amt = Number(item.amount || 0);

                        qtyMap.set(code, (qtyMap.get(code) || 0) - qty);
                        amtMap.set(code, (amtMap.get(code) || 0) - amt);
                    }
                }
            }

            // Generate report rows
            const rows: InventoryRow[] = [];
            for (const mat of materials) {
                const q = qtyMap.get(mat.code) || 0;
                const a = amtMap.get(mat.code) || 0;
                
                // Calculate unit price
                let p = 0;
                if (q > 0) {
                    p = Math.round(a / q);
                } else {
                    p = lastReceiptPriceMap.get(mat.code) || 0;
                }

                rows.push({
                    materialCode: mat.code,
                    materialName: mat.name,
                    unit: mat.unit || "",
                    price: p,
                    quantity: q,
                    amount: a,
                    note: "",
                    parentName: (mat.parentName || (mat as any).parent_name || "Vật tư khác").trim()
                });
            }

            // Sort report rows by parentName then by materialCode
            rows.sort((a, b) => {
                const groupComp = a.parentName.localeCompare(b.parentName);
                if (groupComp !== 0) return groupComp;
                return a.materialCode.localeCompare(b.materialCode);
            });

            // Assign indices (TT) sequentially across all items
            rows.forEach((r, idx) => {
                r.index = idx + 1;
            });

            this.reportRows = rows;

            // Group rows for display sections
            this.buildGroupedSections();

            // Calculate totals
            this.totalQty = rows.reduce((sum, r) => sum + r.quantity, 0);
            this.totalAmt = rows.reduce((sum, r) => sum + r.amount, 0);

            this.showReportTable = true;
            this.showFeedback(`Đã tải thành công số liệu báo cáo tồn kho.`);
        } catch (error) {
            this.showFeedback("Lỗi khi tải dữ liệu báo cáo.", "error");
            console.error(error);
        }
    }

    private buildGroupedSections(): void {
        const groupsMap = new Map<string, InventoryRow[]>();
        for (const row of this.reportRows) {
            const grp = row.parentName;
            if (!groupsMap.has(grp)) {
                groupsMap.set(grp, []);
            }
            groupsMap.get(grp)!.push(row);
        }

        const sections: GroupedInventory[] = [];
        const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
        let idx = 0;
        for (const [groupName, rows] of groupsMap.entries()) {
            sections.push({
                groupName,
                romanIndex: romanNumerals[idx % romanNumerals.length],
                rows
            });
            idx++;
        }
        this.groupedSections = sections;
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

    // Padded rows for print view (at least 30 rows total, including headers)
    getPrintItems(): any[] {
        const minRows = 30;
        const flatItems: any[] = [];
        let sequentialIndex = this.reportRows.length;
        
        // Add actual groups and rows
        for (const sec of this.groupedSections) {
            flatItems.push({
                isHeader: true,
                romanIndex: sec.romanIndex,
                groupName: sec.groupName
            });
            for (const r of sec.rows) {
                flatItems.push({
                    isHeader: false,
                    ...r
                });
            }
        }

        // Padding rows check: we want the total number of ITEM rows to be at least 30.
        const paddingCount = minRows - this.reportRows.length;
        if (paddingCount > 0) {
            for (let i = 0; i < paddingCount; i++) {
                sequentialIndex++;
                flatItems.push({
                    isHeader: false,
                    isPadding: true,
                    index: sequentialIndex,
                    materialCode: "",
                    materialName: "",
                    unit: "0",          // Matches "0" in the Excel screenshot padding rows
                    price: 0,           // Matches "0" in the Excel screenshot padding rows
                    quantity: null,     // Matches "-" in the Excel screenshot
                    amount: null,       // Matches "-" in the Excel screenshot
                    note: ""
                });
            }
        }

        return flatItems;
    }
}
