import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";
import { EmployeeManagerModalComponent } from "../../components/employee-manager-modal/employee-manager-modal.component";

interface SupplyForm {
    code: string;
    name: string;
    parentWarehouse: string;
    startDate: string;
    endDate: string;
    manager: string;
    location: string;
}

interface SavedSupply {
    id: number;
    code: string;
    name: string;
    parentWarehouse: string;
    startDate: string;
    endDate: string;
    manager: string;
    location: string;
    createdAt: string;
}

import { FlatpickrDirective } from "../../../utils/flatpickr.directive";

@Component({
    standalone: true,
    selector: "app-supplies",
    imports: [CommonModule, FormsModule, EmployeeManagerModalComponent, FlatpickrDirective],
    templateUrl: "./supplies.component.html",
    styleUrls: ["./supplies.component.css"],
})
export class SuppliesComponent implements OnInit {
    supplies: SavedSupply[] = [];
    selectedSupplyId: number | null = null;
    showDeleteConfirm = false;
    deletingSupply: SavedSupply | null = null;
    message = "";
    supplyForm: SupplyForm = this.emptyForm();
    showEmployeeModal = false;

    // Pagination properties
    pageSize = 10;
    pageIndex = 1;
    totalItems = 0;
    pageSizeOptions = [10, 25, 50, 100];

    ngOnInit(): void {
        this.loadSupplies();
    }

    emptyForm(): SupplyForm {
        return {
            code: "",
            name: "",
            parentWarehouse: "",
            startDate: "",
            endDate: "",
            manager: "",
            location: "",
        };
    }

    async loadSupplies(): Promise<void> {
        try {
            const limit = this.pageSize;
            const offset = (this.pageIndex - 1) * this.pageSize;
            const res = await invoke<{ items: SavedSupply[], total: number }>("list_supplies_paginated", {
                limit,
                offset
            });
            this.supplies = res.items.map((item) => ({
                ...item,
                parentWarehouse: item.parentWarehouse ?? (item as any).parent_warehouse,
                startDate: item.startDate ?? (item as any).start_date,
                endDate: item.endDate ?? (item as any).end_date,
                createdAt: item.createdAt ?? (item as any).created_at,
            }));
            this.totalItems = res.total;
            this.supplies.sort((a, b) => a.id - b.id);
            this.message = "";
        } catch (error) {
            console.error(error);
            this.message = "Không thể tải danh sách kho.";
        }
    }

    onPageChange(newPageIndex: number): void {
        const maxPage = this.totalPages;
        if (newPageIndex < 1 || newPageIndex > maxPage) {
            return;
        }
        this.pageIndex = newPageIndex;
        this.loadSupplies();
    }

    onPageSizeChange(newPageSize: number): void {
        this.pageSize = newPageSize;
        this.pageIndex = 1;
        this.loadSupplies();
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }

    get showingStart(): number {
        if (this.totalItems === 0) return 0;
        return (this.pageIndex - 1) * this.pageSize + 1;
    }

    get showingEnd(): number {
        return Math.min(this.pageIndex * this.pageSize, this.totalItems);
    }

    onAddNew(): void {
        this.selectedSupplyId = null;
        this.supplyForm = this.emptyForm();
        this.message = "Form đã được reset để nhập kho mới.";
    }

    onSelectSupply(supply: SavedSupply): void {
        this.selectedSupplyId = supply.id;
        this.supplyForm = {
            code: supply.code,
            name: supply.name,
            parentWarehouse: supply.parentWarehouse,
            startDate: supply.startDate,
            endDate: supply.endDate,
            manager: supply.manager,
            location: supply.location,
        };
        this.message = `Đang sửa kho "${supply.name}"`;
    }

    async onSave(): Promise<void> {
        // validate required fields: code and name
        const code = this.supplyForm.code.trim();
        const name = this.supplyForm.name.trim();
        if (!code || !name) {
            this.message = "Vui lòng nhập Mã và Tên kho trước khi lưu.";
            return;
        }

        const payload = {
            code,
            name,
            parentWarehouse: this.supplyForm.parentWarehouse.trim(),
            startDate: this.supplyForm.startDate,
            endDate: this.supplyForm.endDate,
            manager: this.supplyForm.manager.trim(),
            location: this.supplyForm.location.trim(),
        };

        try {
            if (this.selectedSupplyId != null) {
                await invoke<SavedSupply>("update_supply", {
                    id: this.selectedSupplyId,
                    supply: {
                        code: payload.code,
                        name: payload.name,
                        parentWarehouse: payload.parentWarehouse,
                        startDate: payload.startDate,
                        endDate: payload.endDate,
                        manager: payload.manager,
                        location: payload.location,
                    },
                });
                this.message = "Kho đã được cập nhật.";
            } else {
                await invoke<SavedSupply>("save_supply", {
                    supply: {
                        code: payload.code,
                        name: payload.name,
                        parentWarehouse: payload.parentWarehouse,
                        startDate: payload.startDate,
                        endDate: payload.endDate,
                        manager: payload.manager,
                        location: payload.location,
                    },
                });
                this.message = "Kho mới đã được thêm.";
            }
            await this.loadSupplies();
            this.onAddNew();
        } catch (error) {
            console.error(error);
            this.message = "Lỗi khi lưu dữ liệu kho.";
        }
    }

    onDelete(supply: SavedSupply): void {
        this.deletingSupply = supply;
        this.showDeleteConfirm = true;
    }

    async confirmDelete(): Promise<void> {
        if (!this.deletingSupply) {
            return;
        }

        try {
            await invoke("delete_supply", { id: this.deletingSupply.id });
            this.message = `Đã xóa kho "${this.deletingSupply.name}".`;
            this.showDeleteConfirm = false;
            this.deletingSupply = null;

            // Handle boundary check: if we deleted the last item of the last page, go to the previous page
            const totalAfterDelete = this.totalItems - 1;
            const maxPageAfterDelete = Math.max(1, Math.ceil(totalAfterDelete / this.pageSize));
            if (this.pageIndex > maxPageAfterDelete) {
                this.pageIndex = maxPageAfterDelete;
            }

            await this.loadSupplies();
            this.onAddNew();
        } catch (error) {
            console.error(error);
            this.message = "Lỗi khi xóa kho.";
        }
    }

    cancelDelete(): void {
        this.deletingSupply = null;
        this.showDeleteConfirm = false;
    }

    openEmployeeModal(): void {
        this.showEmployeeModal = true;
    }

    onEmployeeSelected(employee: { id: number; name: string }): void {
        this.supplyForm.manager = employee.name;
        this.showEmployeeModal = false;
    }

    get title(): string {
        return this.selectedSupplyId != null ? "Sửa danh mục kho" : "Thêm danh mục kho";
    }
}
