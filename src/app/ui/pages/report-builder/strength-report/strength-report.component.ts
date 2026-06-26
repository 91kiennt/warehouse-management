import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import { UnitSettingsService } from "../../../../utils/unit-settings.service";

export interface StrengthRow {
    index?: number;
    materialCode: string;
    materialName: string;
    unit: string;
    
    // Tồn kỳ trước
    openingQty: number;
    openingPrice: number;
    openingAmt: number;
    
    // Tăng
    importQty: number;
    importPrice: number;
    importAmt: number;
    
    // Giảm
    exportQty: number;
    exportPrice: number;
    exportAmt: number;
    
    // Thực lực (Tồn cuối)
    closingQty: number;
    closingPrice: number;
    closingAmt: number;
}

@Component({
    standalone: true,
    selector: "app-strength-report",
    imports: [CommonModule, FormsModule],
    templateUrl: "./strength-report.component.html",
    styleUrls: ["./strength-report.component.css"],
})
export class StrengthReportComponent implements OnInit {
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
    reportRows: StrengthRow[] = [];
    showReportTable: boolean = false;
    showPrintModal: boolean = false;

    // Grand Totals
    totalOpeningQty: number = 0;
    totalOpeningAmt: number = 0;
    totalImportQty: number = 0;
    totalImportAmt: number = 0;
    totalExportQty: number = 0;
    totalExportAmt: number = 0;
    totalClosingQty: number = 0;
    totalClosingAmt: number = 0;
    
    totalClosingAmtWords: string = "";

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

    getPreviousDateDisplay(): string {
        if (!this.startDate) return "";
        const parts = this.startDate.split("-");
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            const date = new Date(y, m - 1, d);
            date.setDate(date.getDate() - 1);
            
            const prevY = date.getFullYear();
            const prevM = String(date.getMonth() + 1).padStart(2, "0");
            const prevD = String(date.getDate()).padStart(2, "0");
            return `${prevD}/${prevM}/${prevY}`;
        }
        return "";
    }

    async onGetData(): Promise<void> {
        try {
            this.syncYearFromInputs();

            // Load all materials, receipts, and issues
            const materials = await invoke<any[]>("list_materials");
            const receipts = await invoke<any[]>("list_warehouse_receipts");
            const issues = await invoke<any[]>("list_warehouse_issues");

            // Initialize results map
            const map = new Map<string, StrengthRow>();
            for (const mat of materials) {
                map.set(mat.code, {
                    materialCode: mat.code,
                    materialName: mat.name,
                    unit: mat.unit || "",
                    openingQty: 0,
                    openingPrice: 0,
                    openingAmt: 0,
                    importQty: 0,
                    importPrice: 0,
                    importAmt: 0,
                    exportQty: 0,
                    exportPrice: 0,
                    exportAmt: 0,
                    closingQty: 0,
                    closingPrice: 0,
                    closingAmt: 0
                });
            }

            // Process receipts (Imports)
            for (const receipt of receipts) {
                const postingDate = receipt.postingDate || (receipt as any).posting_date;
                let itemsList: any[] = [];
                try {
                    itemsList = receipt.items ? JSON.parse(receipt.items) : [];
                } catch (e) {
                    console.error("Error parsing receipt items:", e);
                }

                for (const item of itemsList) {
                    const code = item.materialCode;
                    let entry = map.get(code);
                    if (!entry) {
                        entry = {
                            materialCode: code,
                            materialName: item.materialName || "",
                            unit: item.unit || "",
                            openingQty: 0,
                            openingPrice: 0,
                            openingAmt: 0,
                            importQty: 0,
                            importPrice: 0,
                            importAmt: 0,
                            exportQty: 0,
                            exportPrice: 0,
                            exportAmt: 0,
                            closingQty: 0,
                            closingPrice: 0,
                            closingAmt: 0
                        };
                        map.set(code, entry);
                    }

                    const qty = Number(item.quantityReal || 0);
                    const amt = Number(item.amount || 0);

                    if (postingDate < this.startDate) {
                        entry.openingQty += qty;
                        entry.openingAmt += amt;
                    } else if (postingDate >= this.startDate && postingDate <= this.endDate) {
                        entry.importQty += qty;
                        entry.importAmt += amt;
                    }
                }
            }

            // Process issues (Exports)
            for (const issue of issues) {
                const postingDate = issue.postingDate || (issue as any).posting_date;
                let itemsList: any[] = [];
                try {
                    itemsList = issue.items ? JSON.parse(issue.items) : [];
                } catch (e) {
                    console.error("Error parsing issue items:", e);
                }

                for (const item of itemsList) {
                    const code = item.materialCode;
                    let entry = map.get(code);
                    if (!entry) {
                        entry = {
                            materialCode: code,
                            materialName: item.materialName || "",
                            unit: item.unit || "",
                            openingQty: 0,
                            openingPrice: 0,
                            openingAmt: 0,
                            importQty: 0,
                            importPrice: 0,
                            importAmt: 0,
                            exportQty: 0,
                            exportPrice: 0,
                            exportAmt: 0,
                            closingQty: 0,
                            closingPrice: 0,
                            closingAmt: 0
                        };
                        map.set(code, entry);
                    }

                    const qty = Number(item.quantityReal || 0);
                    const amt = Number(item.amount || 0);

                    if (postingDate < this.startDate) {
                        entry.openingQty -= qty;
                        entry.openingAmt -= amt;
                    } else if (postingDate >= this.startDate && postingDate <= this.endDate) {
                        entry.exportQty += qty;
                        entry.exportAmt += amt;
                    }
                }
            }

            // Calculate closing balances and prices
            const rows: StrengthRow[] = [];
            for (const entry of map.values()) {
                entry.closingQty = entry.openingQty + entry.importQty - entry.exportQty;
                entry.closingAmt = entry.openingAmt + entry.importAmt - entry.exportAmt;

                entry.openingPrice = entry.openingQty > 0 ? Math.round(entry.openingAmt / entry.openingQty) : 0;
                entry.importPrice = entry.importQty > 0 ? Math.round(entry.importAmt / entry.importQty) : 0;
                entry.exportPrice = entry.exportQty > 0 ? Math.round(entry.exportAmt / entry.exportQty) : 0;
                entry.closingPrice = entry.closingQty > 0 ? Math.round(entry.closingAmt / entry.closingQty) : 0;
                
                rows.push(entry);
            }

            // Sort by material code
            rows.sort((a, b) => a.materialCode.localeCompare(b.materialCode));

            // Calculate grand totals
            let oQty = 0, oAmt = 0, iQty = 0, iAmt = 0, eQty = 0, eAmt = 0, cQty = 0, cAmt = 0;
            for (const row of rows) {
                oQty += row.openingQty;
                oAmt += row.openingAmt;
                iQty += row.importQty;
                iAmt += row.importAmt;
                eQty += row.exportQty;
                eAmt += row.exportAmt;
                cQty += row.closingQty;
                cAmt += row.closingAmt;
            }

            this.reportRows = rows;
            this.totalOpeningQty = oQty;
            this.totalOpeningAmt = oAmt;
            this.totalImportQty = iQty;
            this.totalImportAmt = iAmt;
            this.totalExportQty = eQty;
            this.totalExportAmt = eAmt;
            this.totalClosingQty = cQty;
            this.totalClosingAmt = cAmt;

            this.totalClosingAmtWords = this.convertNumberToWords(cAmt);
            this.showReportTable = true;
            this.showFeedback(`Đã tải thành công số liệu báo cáo thực lực.`);

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

    // Vietnamese Number-to-Words Parser
    convertNumberToWords(num: number): string {
        if (num === 0) return "Không đồng";
        
        const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
        
        let words = "";
        let temp = Math.abs(num);
        let unitIndex = 0;
        
        while (temp > 0) {
            const block = temp % 1000;
            temp = Math.floor(temp / 1000);
            
            if (block > 0) {
                const blockWords = this.readThreeDigits(block, temp > 0);
                words = blockWords + " " + units[unitIndex] + " " + words;
            } else if (unitIndex === 3) {
                words = "tỷ " + words;
            }
            unitIndex++;
        }
        
        words = words.trim().replace(/\s+/g, " ");
        if (words.length > 0) {
            words = words.charAt(0).toUpperCase() + words.slice(1) + " đồng";
        }
        return words;
    }

    private readThreeDigits(num: number, hasNext: boolean): string {
        const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const hundreds = Math.floor(num / 100);
        const tens = Math.floor((num % 100) / 10);
        const ones = num % 10;
        
        let str = "";
        
        if (hundreds > 0 || hasNext) {
            str += digits[hundreds] + " trăm ";
        }
        
        if (tens > 0) {
            if (tens === 1) {
                str += "mười ";
            } else {
                str += digits[tens] + " mươi ";
            }
        } else if (hundreds > 0 && ones > 0) {
            str += "lẻ ";
        }
        
        if (ones > 0) {
            if (ones === 1 && tens > 1) {
                str += "mốt";
            } else if (ones === 5 && tens > 0) {
                str += "lăm";
            } else {
                str += digits[ones];
            }
        }
        
        return str.trim();
    }
}
