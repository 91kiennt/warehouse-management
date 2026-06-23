import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";

export interface SummaryRow {
    materialCode: string;
    materialName: string;
    unit: string;
    
    // Tồn đầu kỳ
    openingQty: number;
    openingAmt: number;
    openingPrice: number;
    
    // Nhập trong kỳ
    importQty: number;
    importAmt: number;
    importPrice: number;
    
    // Xuất trong kỳ
    exportQty: number;
    exportAmt: number;
    exportPrice: number;
    
    // Tồn cuối kỳ
    closingQty: number;
    closingAmt: number;
    closingPrice: number;
}

export interface TransactionDetail {
    index?: number;
    date: string;
    docNo: string;
    type: "Nhập kho" | "Xuất kho";
    description: string;
    quantity: number;
    price: number;
    amount: number;
}

@Component({
    standalone: true,
    selector: "app-inventory-summary-report",
    imports: [CommonModule, FormsModule],
    templateUrl: "./inventory-summary-report.component.html",
    styleUrls: ["./inventory-summary-report.component.css"],
})
export class InventorySummaryReportComponent implements OnInit {
    // Form filter properties
    selectedMonth: number = 1;
    selectedYear: number = 2026;
    startDate: string = "2026-01-01";
    endDate: string = "2026-01-31";
    startDateDisplay: string = "01/01/2026";
    endDateDisplay: string = "31/01/2026";

    // Data grid properties
    reportRows: SummaryRow[] = [];
    showReportTable: boolean = false;
    showPrintModal: boolean = false;

    // Interactive details properties
    selectedRow: SummaryRow | null = null;
    detailTransactions: TransactionDetail[] = [];
    
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

    // Raw database caches for row click filtering
    private rawReceipts: any[] = [];
    private rawIssues: any[] = [];

    ngOnInit(): void {
        this.updateDateRange();
    }

    updateDateRange(): void {
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
        this.updateDateRange();
    }

    onDateBlur(type: 'start' | 'end'): void {
        const val = type === 'start' ? this.startDateDisplay : this.endDateDisplay;
        const parsedYear = this.parseYear(val);
        if (parsedYear !== null) {
            this.selectedYear = parsedYear;
        }
        this.updateDateRange();
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
            
            // Clear selections
            this.selectedRow = null;
            this.detailTransactions = [];

            // Load all materials, receipts, and issues
            const materials = await invoke<any[]>("list_materials");
            this.rawReceipts = await invoke<any[]>("list_warehouse_receipts");
            this.rawIssues = await invoke<any[]>("list_warehouse_issues");

            // Initialize results map
            const map = new Map<string, SummaryRow>();
            for (const mat of materials) {
                map.set(mat.code, {
                    materialCode: mat.code,
                    materialName: mat.name,
                    unit: mat.unit || "",
                    openingQty: 0,
                    openingAmt: 0,
                    openingPrice: 0,
                    importQty: 0,
                    importAmt: 0,
                    importPrice: 0,
                    exportQty: 0,
                    exportAmt: 0,
                    exportPrice: 0,
                    closingQty: 0,
                    closingAmt: 0,
                    closingPrice: 0
                });
            }

            // Process all receipts (Imports)
            for (const receipt of this.rawReceipts) {
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
                            openingAmt: 0,
                            openingPrice: 0,
                            importQty: 0,
                            importAmt: 0,
                            importPrice: 0,
                            exportQty: 0,
                            exportAmt: 0,
                            exportPrice: 0,
                            closingQty: 0,
                            closingAmt: 0,
                            closingPrice: 0
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

            // Process all issues (Exports)
            for (const issue of this.rawIssues) {
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
                            openingAmt: 0,
                            openingPrice: 0,
                            importQty: 0,
                            importAmt: 0,
                            importPrice: 0,
                            exportQty: 0,
                            exportAmt: 0,
                            exportPrice: 0,
                            closingQty: 0,
                            closingAmt: 0,
                            closingPrice: 0
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

            // Calculate closing balances and average prices
            const rows: SummaryRow[] = [];
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
            this.showFeedback(`Đã tải thành công số liệu tổng hợp Nhập Xuất Tồn.`);

        } catch (error) {
            this.showFeedback("Lỗi khi tải dữ liệu báo cáo.", "error");
            console.error(error);
        }
    }

    onRowClick(row: SummaryRow): void {
        this.selectedRow = row;
        const details: TransactionDetail[] = [];

        // Filter receipts in the period
        for (const receipt of this.rawReceipts) {
            const date = receipt.postingDate || (receipt as any).posting_date;
            if (date >= this.startDate && date <= this.endDate) {
                let itemsList: any[] = [];
                try {
                    itemsList = receipt.items ? JSON.parse(receipt.items) : [];
                } catch (e) {}

                for (const item of itemsList) {
                    if (item.materialCode === row.materialCode) {
                        details.push({
                            date,
                            docNo: receipt.receiptNumber || (receipt as any).receipt_number,
                            type: "Nhập kho",
                            description: receipt.description || "",
                            quantity: Number(item.quantityReal || 0),
                            price: Number(item.price || 0),
                            amount: Number(item.amount || 0)
                        });
                    }
                }
            }
        }

        // Filter issues in the period
        for (const issue of this.rawIssues) {
            const date = issue.postingDate || (issue as any).posting_date;
            if (date >= this.startDate && date <= this.endDate) {
                let itemsList: any[] = [];
                try {
                    itemsList = issue.items ? JSON.parse(issue.items) : [];
                } catch (e) {}

                for (const item of itemsList) {
                    if (item.materialCode === row.materialCode) {
                        details.push({
                            date,
                            docNo: issue.issueNumber || (issue as any).issue_number,
                            type: "Xuất kho",
                            description: issue.description || "",
                            quantity: Number(item.quantityReal || 0),
                            price: Number(item.price || 0),
                            amount: Number(item.amount || 0)
                        });
                    }
                }
            }
        }

        // Sort details by date then by document number
        details.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.docNo.localeCompare(b.docNo);
        });

        // Add indices
        details.forEach((det, i) => {
            det.index = i + 1;
        });

        this.detailTransactions = details;
    }

    closeDetailsModal(): void {
        this.selectedRow = null;
        this.detailTransactions = [];
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
