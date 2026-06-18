import { invoke } from "@tauri-apps/api/core";
import * as ExcelJS from "exceljs";

export interface ReportItem {
    product: string;
    quantity: number;
    price: number;
    total: number;
}

export interface ReportData {
    warehouse: string;
    manager: string;
    date: string;
    notes: string;
    items: ReportItem[];
}

export interface ReportInput {
    template: string;
    title: string;
    data: ReportData;
}

export interface SavedReport {
    id: number;
    template: string;
    title: string;
    data: ReportData;
    created_at: string;
}

export function saveReport(report: ReportInput): Promise<SavedReport> {
    return invoke<SavedReport>("save_report", { report });
}

export function listReports(): Promise<SavedReport[]> {
    return invoke<SavedReport[]>("list_reports");
}

export async function exportReportToExcel(report: SavedReport): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Tauri Warehouse Management";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Report");
    sheet.addRow([report.title]);
    sheet.addRow([`Template: ${report.template}`]);
    sheet.addRow([`Created At: ${report.created_at}`]);
    sheet.addRow([]);
    sheet.addRow(["Warehouse", report.data.warehouse]);
    sheet.addRow(["Manager", report.data.manager]);
    sheet.addRow(["Date", report.data.date]);
    sheet.addRow(["Notes", report.data.notes]);
    sheet.addRow([]);

    const header = ["Product", "Quantity", "Price", "Total"];
    sheet.addRow(header);
    report.data.items.forEach((item) => {
        sheet.addRow([item.product, item.quantity, item.price, item.total]);
    });

    sheet.columns?.forEach((column) => {
        if (column.values) {
            const maxWidth = (column.values as Array<string | number | undefined>)
                .filter((value) => value !== undefined)
                .map((value) => `${value}`.length)
                .reduce((current, next) => Math.max(current, next), 10);
            column.width = Math.min(Math.max(maxWidth + 2, 10), 32);
        }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    await invoke("save_excel_buffer", {
        filename: `${report.title || "report"}.xlsx`,
        content: base64,
    });
}
