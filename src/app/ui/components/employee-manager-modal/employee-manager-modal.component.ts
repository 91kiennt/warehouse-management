import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';

export interface EmployeeForm {
    id?: number;
    code: string;
    name: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    idNumber: string;
    idIssuedDate: string;
    idIssuedPlace: string;
    gender: string;
    superior: string;
    effectiveFromDate: string;
}

import { FlatpickrDirective } from "../../../utils/flatpickr.directive";
import { EnterFocusNextDirective } from "../../../utils/enter-focus-next.directive";

@Component({
    selector: 'app-employee-manager-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, FlatpickrDirective, EnterFocusNextDirective],
    templateUrl: './employee-manager-modal.component.html',
    styleUrls: ['./employee-manager-modal.component.css'],
})
export class EmployeeManagerModalComponent {
    @Input() isOpen = false;
    @Output() isOpenChange = new EventEmitter<boolean>();
    @Output() employeeSelected = new EventEmitter<{ id: number; name: string }>();

    form: EmployeeForm = {
        code: '',
        name: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        fax: '',
        email: '',
        idNumber: '',
        idIssuedDate: '',
        idIssuedPlace: '',
        gender: '',
        superior: '',
        effectiveFromDate: '',
    };

    message = '';
    messageType: 'success' | 'error' = 'success';
    isLoading = false;

    async onCodeKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            await this.loadEmployeeByCode();
        }
    }

    async loadEmployeeByCode() {
        const code = this.form.code.trim();
        if (!code) {
            this.message = 'Vui lòng nhập Mã';
            this.messageType = 'error';
            return;
        }

        this.isLoading = true;
        this.message = '';

        try {
            const result = await invoke<any>('get_employee_by_code', { code });
            console.log('Employee loaded from DB:', result);
            this.mapDatabaseToForm(result);
            this.message = 'Tìm thấy dữ liệu nhân viên';
            this.messageType = 'success';
            setTimeout(() => this.message = '', 2000);
        } catch (error: any) {
            // Not found is expected - it means new employee
            console.log('Employee not found or error:', error);
            this.resetFormExceptCode();
            this.message = 'Không tìm thấy nhân viên với mã này (tạo mới)';
            this.messageType = 'error';
            setTimeout(() => this.message = '', 2000);
        } finally {
            this.isLoading = false;
        }
    }

    private mapDatabaseToForm(employee: any) {
        console.log('Mapping employee to form:', employee);
        this.form = {
            id: employee.id,
            code: employee.code,
            name: employee.name,
            dateOfBirth: employee.dateOfBirth || employee.date_of_birth || '',
            address: employee.address || '',
            phone: employee.phone || '',
            fax: employee.fax || '',
            email: employee.email || '',
            idNumber: employee.idNumber || employee.id_number || '',
            idIssuedDate: employee.idIssuedDate || employee.id_issued_date || '',
            idIssuedPlace: employee.idIssuedPlace || employee.id_issued_place || '',
            gender: employee.gender || '',
            superior: employee.superior || '',
            effectiveFromDate: employee.effectiveFromDate || employee.effective_from_date || '',
        };
        console.log('Form after mapping:', this.form);
    }

    private resetFormExceptCode() {
        const code = this.form.code;
        this.form = {
            code,
            name: '',
            dateOfBirth: '',
            address: '',
            phone: '',
            fax: '',
            email: '',
            idNumber: '',
            idIssuedDate: '',
            idIssuedPlace: '',
            gender: '',
            superior: '',
            effectiveFromDate: '',
        };
    }

    async onSave() {
        const code = this.form.code.trim();
        const name = this.form.name.trim();

        if (!code || !name) {
            this.message = 'Vui lòng điền Mã và Tên';
            this.messageType = 'error';
            return;
        }

        this.isLoading = true;

        try {
            const employeeData = {
                code: this.form.code.trim(),
                name: this.form.name.trim(),
                dateOfBirth: this.form.dateOfBirth || '',
                address: this.form.address || '',
                phone: this.form.phone || '',
                fax: this.form.fax || '',
                email: this.form.email || '',
                idNumber: this.form.idNumber || '',
                idIssuedDate: this.form.idIssuedDate || '',
                idIssuedPlace: this.form.idIssuedPlace || '',
                gender: this.form.gender || '',
                superior: this.form.superior || '',
                effectiveFromDate: this.form.effectiveFromDate || '',
            };

            console.log('Saving employee payload:', employeeData);

            let result;
            if (this.form.id) {
                result = await invoke<any>('update_employee', {
                    id: this.form.id,
                    employee: employeeData,
                });
            } else {
                result = await invoke<any>('save_employee', { employee: employeeData });
            }

            console.log('Save employee result:', result);
            this.message = 'Lưu thành công';
            this.messageType = 'success';

            setTimeout(() => {
                this.employeeSelected.emit({
                    id: result.id,
                    name: result.name,
                });
                this.closeModal();
            }, 500);
        } catch (error: any) {
            this.message = 'Lưu thất bại: ' + (error.message || error);
            this.messageType = 'error';
        } finally {
            this.isLoading = false;
        }
    }

    async onAdd() {
        const code = this.form.code.trim();
        const name = this.form.name.trim();

        if (!code || !name) {
            this.message = 'Vui lòng điền Mã và Tên';
            this.messageType = 'error';
            return;
        }

        this.isLoading = true;

        try {
            const employeeData = {
                code: this.form.code.trim(),
                name: this.form.name.trim(),
                dateOfBirth: this.form.dateOfBirth || '',
                address: this.form.address || '',
                phone: this.form.phone || '',
                fax: this.form.fax || '',
                email: this.form.email || '',
                idNumber: this.form.idNumber || '',
                idIssuedDate: this.form.idIssuedDate || '',
                idIssuedPlace: this.form.idIssuedPlace || '',
                gender: this.form.gender || '',
                superior: this.form.superior || '',
                effectiveFromDate: this.form.effectiveFromDate || '',
            };

            console.log('Adding employee payload:', employeeData);
            const result = await invoke<any>('save_employee', { employee: employeeData });

            console.log('Add employee result:', result);
            this.message = 'Thêm thành công';
            this.messageType = 'success';

            setTimeout(() => {
                this.employeeSelected.emit({
                    id: result.id,
                    name: result.name,
                });
                this.closeModal();
            }, 500);
        } catch (error: any) {
            this.message = 'Thêm thất bại: ' + (error.message || error);
            this.messageType = 'error';
        } finally {
            this.isLoading = false;
        }
    }

    closeModal() {
        this.isOpen = false;
        this.isOpenChange.emit(false);
        this.resetForm();
    }

    private resetForm() {
        this.form = {
            code: '',
            name: '',
            dateOfBirth: '',
            address: '',
            phone: '',
            fax: '',
            email: '',
            idNumber: '',
            idIssuedDate: '',
            idIssuedPlace: '',
            gender: '',
            superior: '',
            effectiveFromDate: '',
        };
        this.message = '';
    }
}
