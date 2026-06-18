import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../layout/sidebar/sidebar.component";
import { TopbarComponent } from "../layout/topbar/topbar.component";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent { }
