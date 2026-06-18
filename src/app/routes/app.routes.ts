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
    { path: "**", redirectTo: "customers" },
];
