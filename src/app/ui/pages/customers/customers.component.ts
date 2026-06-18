import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { invoke } from "@tauri-apps/api/core";

interface CustomerForm {
    code: string;
    name: string;
    address: string;
    taxId: string;
    bankAccount: string;
    bankName: string;
    phone: string;
    fax: string;
    email: string;
    creditLimit: string;
    supervisor: string;
    startDate: string;
    endDate: string;
    permanentResidence: string;
}

interface SavedCustomer {
    id: number;
    code: string;
    name: string;
    address: string;
    taxId: string;
    bankAccount: string;
    bankName: string;
    phone: string;
    fax: string;
    email: string;
    creditLimit: number;
    supervisor: string;
    startDate: string;
    endDate: string;
    permanentResidence: string;
    created_at: string;
}

import { FlatpickrDirective } from "../../../utils/flatpickr.directive";

@Component({
    standalone: true,
    selector: "app-customers",
    imports: [CommonModule, FormsModule, FlatpickrDirective],
    templateUrl: "./customers.component.html",
    styleUrls: ["./customers.component.css"],
})
export class CustomersComponent implements OnInit {
    customers: SavedCustomer[] = [];
    selectedCustomerId: number | null = null;
    showDeleteConfirm = false;
    deletingCustomer: SavedCustomer | null = null;
    message = "";
    customerForm: CustomerForm = this.emptyForm();

    ngOnInit(): void {
        this.loadCustomers();
    }

    emptyForm(): CustomerForm {
        return {
            code: "",
            name: "",
            address: "",
            taxId: "",
            bankAccount: "",
            bankName: "",
            phone: "",
            fax: "",
            email: "",
            creditLimit: "",
            supervisor: "",
            startDate: "",
            endDate: "",
            permanentResidence: "",
        };
    }

    async loadCustomers(): Promise<void> {
        try {
            this.customers = await invoke<SavedCustomer[]>("list_customers");
            // Ensure ascending order by id on the client as a safety measure
            this.customers.sort((a, b) => a.id - b.id);
            this.message = "";
        } catch (error) {
            this.message = "Không thể tải danh sách nhân viên.";
            console.error(error);
        }
    }

    onAddNew(): void {
        this.selectedCustomerId = null;
        this.customerForm = this.emptyForm();
        this.message = "Form đã được reset để thêm mới.";
    }

    onSelectCustomer(customer: SavedCustomer): void {
        this.selectedCustomerId = customer.id;
        this.customerForm = {
            code: customer.code,
            name: customer.name,
            address: customer.address,
            taxId: customer.taxId,
            bankAccount: customer.bankAccount,
            bankName: customer.bankName,
            phone: customer.phone,
            fax: customer.fax,
            email: customer.email,
            creditLimit: customer.creditLimit?.toString() ?? "",
            supervisor: customer.supervisor,
            startDate: customer.startDate,
            endDate: customer.endDate,
            permanentResidence: customer.permanentResidence,
        };
        this.message = `Đang chỉnh sửa nhân viên "${customer.name}"`;
    }

    async onSave(): Promise<void> {
        // validate required fields: code and name
        const code = this.customerForm.code.trim();
        const name = this.customerForm.name.trim();
        if (!code || !name) {
            this.message = "Vui lòng nhập Mã và Tên nhân viên trước khi lưu.";
            return;
        }

        const payload = {
            code,
            name,
            address: this.customerForm.address.trim(),
            taxId: this.customerForm.taxId.trim(),
            bankAccount: this.customerForm.bankAccount.trim(),
            bankName: this.customerForm.bankName.trim(),
            phone: this.customerForm.phone.trim(),
            fax: this.customerForm.fax.trim(),
            email: this.customerForm.email.trim(),
            creditLimit: parseFloat(this.customerForm.creditLimit || "0") || 0,
            supervisor: this.customerForm.supervisor.trim(),
            startDate: this.customerForm.startDate,
            endDate: this.customerForm.endDate,
            permanentResidence: this.customerForm.permanentResidence.trim(),
        };

        try {
            if (this.selectedCustomerId != null) {
                await invoke<SavedCustomer>("update_customer", {
                    id: this.selectedCustomerId,
                    customer: payload,
                });
                this.message = "Thông tin nhân viên đã được cập nhật.";
            } else {
                await invoke<SavedCustomer>("save_customer", {
                    customer: payload,
                });
                this.message = "Nhân viên mới đã được thêm.";
            }
            await this.loadCustomers();
            this.onAddNew();
        } catch (error) {
            this.message = "Lỗi khi lưu nhân viên.";
            console.error(error);
        }
    }

    onDelete(customer: SavedCustomer): void {
        this.deletingCustomer = customer;
        this.showDeleteConfirm = true;
    }

    async confirmDelete(): Promise<void> {
        if (!this.deletingCustomer) {
            return;
        }

        try {
            await invoke("delete_customer", { id: this.deletingCustomer.id });
            this.message = `Đã xóa nhân viên "${this.deletingCustomer.name}".`;
            this.showDeleteConfirm = false;
            this.deletingCustomer = null;
            await this.loadCustomers();
            this.onAddNew();
        } catch (error) {
            this.message = "Lỗi khi xóa nhân viên.";
            console.error(error);
        }
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingCustomer = null;
    }

    get selectedTitle(): string {
        return this.selectedCustomerId != null ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới";
    }
}
