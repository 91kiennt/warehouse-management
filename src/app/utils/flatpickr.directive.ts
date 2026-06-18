import { Directive, ElementRef, Input, OnInit, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import flatpickr from "flatpickr";

const VietnameseLocale = {
    weekdays: {
        shorthand: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        longhand: [
            "Chủ Nhật",
            "Thứ Hai",
            "Thứ Ba",
            "Thứ Tư",
            "Thứ Năm",
            "Thứ Sáu",
            "Thứ Bảy",
        ],
    },
    months: {
        shorthand: [
            "Th1",
            "Th2",
            "Th3",
            "Th4",
            "Th5",
            "Th6",
            "Th7",
            "Th8",
            "Th9",
            "Th10",
            "Th11",
            "Th12",
        ],
        longhand: [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
        ],
    },
    firstDayOfWeek: 1,
    rangeSeparator: " đến ",
    ordinal: () => "",
    amPM: ["SA", "CH"],
};

@Directive({
    selector: "[appFlatpickr]",
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FlatpickrDirective),
            multi: true,
        },
    ],
})
export class FlatpickrDirective implements OnInit, OnDestroy, ControlValueAccessor {
    private instance: any;
    private currentValue: string = "";

    onChange = (_: any) => {};
    onTouched = () => {};

    constructor(private el: ElementRef) {}

    ngOnInit(): void {
        this.instance = flatpickr(this.el.nativeElement, {
            locale: VietnameseLocale as any,
            dateFormat: "Y-m-d", // Under-the-hood model format
            altInput: true, // Show formatted alternative input
            altFormat: "d/m/Y", // Display format: dd/mm/yyyy
            allowInput: true, // Allow manual typing/editing
            onChange: (selectedDates, dateStr) => {
                if (selectedDates.length > 0) {
                    // Normalize timezone issue when creating ISO string
                    const date = selectedDates[0];
                    const offset = date.getTimezoneOffset();
                    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                    const value = localDate.toISOString().split("T")[0];
                    this.currentValue = value;
                    this.onChange(value);
                } else {
                    this.currentValue = "";
                    this.onChange("");
                }
            },
        });

        // Add class to styling target
        const altInput = this.el.nativeElement.nextSibling as HTMLElement;
        if (altInput && altInput.classList) {
            altInput.classList.add("flatpickr-custom-input");
        }
    }

    ngOnDestroy(): void {
        if (this.instance) {
            this.instance.destroy();
        }
    }

    // ControlValueAccessor methods
    writeValue(value: any): void {
        if (this.instance) {
            this.currentValue = value || "";
            this.instance.setDate(value || null);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        if (this.instance) {
            const altInput = this.el.nativeElement.nextSibling as HTMLInputElement;
            if (isDisabled) {
                this.el.nativeElement.setAttribute("disabled", "true");
                altInput?.setAttribute("disabled", "true");
            } else {
                this.el.nativeElement.removeAttribute("disabled");
                altInput?.removeAttribute("disabled");
            }
        }
    }
}
