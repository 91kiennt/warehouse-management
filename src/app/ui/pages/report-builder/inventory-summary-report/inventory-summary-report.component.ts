import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
    exportReportToExcel,
    listReports,
    ReportData,
    ReportInput,
    ReportItem,
    SavedReport,
    saveReport,
} from "../../../../utils/report.service";

const initialItem = (): ReportItem => ({
    product: "",
    quantity: 0,
    price: 0,
    total: 0,
});

import { FlatpickrDirective } from "../../../../utils/flatpickr.directive";

@Component({
    standalone: true,
    selector: "app-inventory-summary-report",
    imports: [CommonModule, FormsModule, FlatpickrDirective],
    templateUrl: "./inventory-summary-report.component.html",
    styleUrls: ["./inventory-summary-report.component.css"],
})
export class InventorySummaryReportComponent {
    report: ReportInput = {
        template: "Warehouse Report",
        title: "Báo cáo kho",
        data: {
            warehouse: "KHO CHÍNH",
            manager: "Nguyễn Văn A",
            date: new Date().toISOString().slice(0, 10),
            notes: "Báo cáo hàng tồn và đơn hàng.",
            items: [initialItem(), initialItem(), initialItem()],
        },
    };

    savedReports: SavedReport[] = [];
    selectedReport?: SavedReport;
    saving = false;
    message = "";

    constructor() {
        this.refreshReports();
    }

    get totalAmount(): number {
        return this.report.data.items.reduce((sum, item) => sum + item.total, 0);
    }

    get selectedReportTotal(): number {
        return this.selectedReport?.data.items.reduce((sum, item) => sum + item.total, 0) ?? 0;
    }

    updateItemTotal(item: ReportItem): void {
        item.total = item.quantity * item.price;
    }

    addRow(): void {
        this.report.data.items.push(initialItem());
    }

    removeRow(index: number): void {
        if (this.report.data.items.length > 1) {
            this.report.data.items.splice(index, 1);
        }
    }

    async refreshReports(): Promise<void> {
        try {
            this.savedReports = await listReports();
        } catch (error) {
            console.error(error);
        }
    }

    async onSave(): Promise<void> {
        this.saving = true;
        this.message = "";
        try {
            const saved = await saveReport(this.report);
            this.message = `Lưu thành công: #${saved.id}`;
            this.selectedReport = saved;
            await this.refreshReports();
        } catch (error) {
            console.error(error);
            this.message = "Lưu không thành công.";
        } finally {
            this.saving = false;
        }
    }

    async onExport(report: SavedReport): Promise<void> {
        try {
            await exportReportToExcel(report);
        } catch (error) {
            console.error(error);
        }
    }

    setPreview(report: SavedReport): void {
        this.selectedReport = report;
    }
}
