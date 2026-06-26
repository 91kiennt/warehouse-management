import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UnitSettingsService } from "../../../utils/unit-settings.service";

@Component({
    standalone: true,
    selector: "app-topbar",
    imports: [CommonModule],
    templateUrl: "./topbar.component.html",
    styleUrls: ["./topbar.component.css"],
})
export class TopbarComponent {
    constructor(private settingsService: UnitSettingsService) {}

    openSettings() {
        this.settingsService.showEditModal.set(true);
    }
}
