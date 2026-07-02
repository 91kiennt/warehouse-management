use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnitSettings {
    /// Tên đầy đủ cơ quan chủ quản cấp trên (Ví dụ: BỘ TƯ LỆNH CẢNH SÁT CƠ ĐỘNG)
    pub parent_org: String,
    /// Tên viết tắt cơ quan cấp trên hoặc Đơn vị quản lý (Ví dụ: BỘ TƯ LỆNH CSCĐ hoặc BAN CHÍNH TRỊ HẬU CẦN)
    pub parent_org_short: String,
    /// Tên đầy đủ đơn vị báo cáo / Doanh nghiệp (Ví dụ: Trung tâm Huấn luyện... hoặc Công ty TNHH An Ngọc Lan)
    pub sub_org: String,
    /// Tên viết tắt đơn vị báo cáo hoặc Bộ phận trực thuộc (Ví dụ: TRUNG TÂM HL... hoặc BỘ PHẬN Y TẾ)
    pub sub_org_short: String,
    /// Ký hiệu / Số hiệu văn bản mặc định trên báo cáo (Ví dụ: BCTL-TTHL1- BCTHC)
    pub doc_prefix: String,
    /// Tên kho trên báo cáo quyết toán (Ví dụ: TÂN BINH K62)
    pub settlement_warehouse: String,
}
