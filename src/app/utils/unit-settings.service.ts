import { Injectable, signal } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";

export interface UnitSettings {
  parentOrg: string;
  parentOrgShort: string;
  subOrg: string;
  subOrgShort: string;
  docPrefix: string;
}

@Injectable({
  providedIn: "root"
})
export class UnitSettingsService {
  settings = signal<UnitSettings | null>(null);
  loading = signal<boolean>(true);
  showEditModal = signal<boolean>(false);

  constructor() {
    this.loadSettings();
  }

  async loadSettings(): Promise<UnitSettings | null> {
    this.loading.set(true);
    try {
      const res = await invoke<UnitSettings | null>("get_unit_settings");
      this.settings.set(res);
      this.loading.set(false);
      return res;
    } catch (err) {
      console.error("Failed to load unit settings", err);
      this.loading.set(false);
      return null;
    }
  }

  async saveSettings(input: UnitSettings): Promise<UnitSettings> {
    try {
      const res = await invoke<UnitSettings>("save_unit_settings", { settings: input });
      this.settings.set(res);
      return res;
    } catch (err) {
      console.error("Failed to save unit settings", err);
      throw err;
    }
  }
}
