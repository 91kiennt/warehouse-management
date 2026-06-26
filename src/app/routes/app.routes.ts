import { Routes } from "@angular/router";
import { CustomersComponent } from "../ui/pages/customers/customers.component";
import { SuppliesComponent } from "../ui/pages/supplies/supplies.component";
import { MaterialsComponent } from "../ui/pages/materials/materials.component";
import { WarehouseReceiptsComponent } from "../ui/pages/warehouse-receipts/warehouse-receipts.component";
import { WarehouseIssuesComponent } from "../ui/pages/warehouse-issues/warehouse-issues.component";
import { InventoryReportComponent } from "../ui/pages/report-builder/inventory-report/inventory-report.component";
import { InventorySummaryReportComponent } from "../ui/pages/report-builder/inventory-summary-report/inventory-summary-report.component";
import { ReviewReportComponent } from "../ui/pages/report-builder/review-report/review-report.component";
import { StrengthReportComponent } from "../ui/pages/report-builder/strength-report/strength-report.component";
import { InventoryIssueReportComponent } from "../ui/pages/report-builder/inventory-issue-report/inventory-issue-report.component";
import { InventoryReceiptReportComponent } from "../ui/pages/report-builder/inventory-receipt-report/inventory-receipt-report.component";
import { SettlementReportComponent } from "../ui/pages/report-builder/settlement-report/settlement-report.component";

export const routes: Routes = [
    { path: "", redirectTo: "customers", pathMatch: "full" },
    {
        path: "customers",
        component: CustomersComponent,
    },
    {
        path: "supplies",
        component: SuppliesComponent,
    },
    {
        path: "materials",
        component: MaterialsComponent,
    },
    {
        path: "warehouse-receipts",
        component: WarehouseReceiptsComponent,
    },
    {
        path: "warehouse-issues",
        component: WarehouseIssuesComponent,
    },
    {
        path: "inventory-report",
        component: InventoryReportComponent,
    },
    {
        path: "inventory-summary-report",
        component: InventorySummaryReportComponent,
    },
    {
        path: "review-report",
        component: ReviewReportComponent,
    },
    {
        path: "strength-report",
        component: StrengthReportComponent,
    },
    {
        path: "inventory-receipt-report",
        component: InventoryReceiptReportComponent,
    },
    {
        path: "inventory-issue-report",
        component: InventoryIssueReportComponent,
    },
    {
        path: "settlement-report",
        component: SettlementReportComponent,
    },
    { path: "**", redirectTo: "customers" },
];
