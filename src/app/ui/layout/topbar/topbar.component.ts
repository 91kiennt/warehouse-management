import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    selector: "app-topbar",
    imports: [CommonModule],
    templateUrl: "./topbar.component.html",
    styleUrls: ["./topbar.component.css"],
})
export class TopbarComponent { }
