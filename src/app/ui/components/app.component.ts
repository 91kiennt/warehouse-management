import { Component, computed } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../layout/sidebar/sidebar.component";
import { TopbarComponent } from "../layout/topbar/topbar.component";
import { OnboardingModalComponent } from "./onboarding-modal/onboarding-modal.component";
import { UnitSettingsService } from "../../utils/unit-settings.service";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, OnboardingModalComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  showOnboarding = computed(() => {
    return !this.settingsService.loading() && this.settingsService.settings() === null;
  });

  constructor(public settingsService: UnitSettingsService) {}
}
