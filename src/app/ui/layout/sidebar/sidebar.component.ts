import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    standalone: true,
    selector: "app-sidebar",
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent { }
