import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
    selector: "[appEnterFocusNext]",
    standalone: true,
})
export class EnterFocusNextDirective {
    constructor(private el: ElementRef) {}

    @HostListener("keydown", ["$event"])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            const target = event.target as HTMLElement;

            // Do not redirect focus if inside a textarea (needs Enter for newline)
            if (target.tagName === "TEXTAREA") {
                return;
            }

            // Do not redirect focus if target is a button or input[type="submit"]
            if (
                target.tagName === "BUTTON" ||
                (target.tagName === "INPUT" &&
                    (target as HTMLInputElement).type === "submit")
            ) {
                return;
            }

            // Prevent default form submission or normal enter key action
            event.preventDefault();

            const focusables = this.getFocusables();
            const index = focusables.indexOf(target);

            if (index !== -1 && index < focusables.length - 1) {
                const nextEl = focusables[index + 1];
                nextEl.focus();

                // Select the text for convenience if it's an InputElement
                if (nextEl instanceof HTMLInputElement) {
                    nextEl.select();
                }
            }
        }
    }

    private getFocusables(): HTMLElement[] {
        // Query all potential input and select fields (excluding hidden inputs, checkboxes, radios, disabled)
        const all = Array.from(
            this.el.nativeElement.querySelectorAll(
                'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]), select:not([disabled])'
            )
        ) as HTMLElement[];

        // Filter to include only visible elements
        return all.filter((el) => {
            const style = window.getComputedStyle(el);
            return (
                el.offsetWidth > 0 ||
                el.offsetHeight > 0 ||
                (style.display !== "none" && style.visibility !== "hidden")
            );
        });
    }
}
