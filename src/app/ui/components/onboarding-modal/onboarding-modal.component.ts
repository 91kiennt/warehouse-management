import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UnitSettingsService } from "../../../utils/unit-settings.service";

@Component({
  standalone: true,
  selector: "app-onboarding-modal",
  imports: [CommonModule, FormsModule],
  templateUrl: "./onboarding-modal.component.html",
  styleUrls: ["./onboarding-modal.component.css"]
})
export class OnboardingModalComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Output() closed = new EventEmitter<void>();

  parentOrg: string = "";
  parentOrgShort: string = "";
  subOrg: string = "";
  subOrgShort: string = "";
  docPrefix: string = "";
  settlementWarehouse: string = "";

  errorMessage: string = "";
  isSaving: boolean = false;

  constructor(private settingsService: UnitSettingsService) {}

  ngOnInit() {
    const current = this.settingsService.settings();
    if (current) {
      this.parentOrg = current.parentOrg || "";
      this.parentOrgShort = current.parentOrgShort || "";
      this.subOrg = current.subOrg || "";
      this.subOrgShort = current.subOrgShort || "";
      this.docPrefix = current.docPrefix || "";
      this.settlementWarehouse = current.settlementWarehouse || "";
    } else {
      this.parentOrg = "BỘ TƯ LỆNH CẢNH SÁT CƠ ĐỘNG";
      this.parentOrgShort = "BỘ TƯ LỆNH CSCĐ";
      this.subOrg = "Trung tâm Huấn luyện, bồi dưỡng nghiệp vụ và giáo dục nghề nghiệp số 1";
      this.subOrgShort = "TRUNG TÂM HL, BDNV&GDNN SỐ 1";
      this.docPrefix = "BCTL-TTHL1- BCTHC";
      this.settlementWarehouse = "TÂN BINH K62";
    }
  }

  async onSave() {
    if (
      !this.parentOrg.trim() ||
      !this.parentOrgShort.trim() ||
      !this.subOrg.trim() ||
      !this.subOrgShort.trim() ||
      !this.docPrefix.trim() ||
      !this.settlementWarehouse.trim()
    ) {
      this.errorMessage = "Vui lòng nhập đầy đủ tất cả các trường thông tin bắt buộc.";
      return;
    }

    this.errorMessage = "";
    this.isSaving = true;

    try {
      await this.settingsService.saveSettings({
        parentOrg: this.parentOrg.trim(),
        parentOrgShort: this.parentOrgShort.trim(),
        subOrg: this.subOrg.trim(),
        subOrgShort: this.subOrgShort.trim(),
        docPrefix: this.docPrefix.trim(),
        settlementWarehouse: this.settlementWarehouse.trim()
      });
      this.closed.emit();
    } catch (err: any) {
      this.errorMessage = "Có lỗi xảy ra khi lưu cấu hình: " + (err.message || err);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel() {
    if (this.isEditMode) {
      this.closed.emit();
    }
  }
}
