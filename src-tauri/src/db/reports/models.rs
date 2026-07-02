use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportItem {
    /// Tên hoặc mã của sản phẩm / vật tư trong báo cáo
    pub product: String,
    /// Số lượng sản phẩm / vật tư
    pub quantity: i64,
    /// Đơn giá sản phẩm / vật tư
    pub price: f64,
    /// Thành tiền (Số lượng * Đơn giá)
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportData {
    /// Kho thực hiện báo cáo
    pub warehouse: String,
    /// Người phụ trách / Thủ kho thực hiện xuất báo cáo
    pub manager: String,
    /// Ngày tháng lập báo cáo
    pub date: String,
    /// Ghi chú / Giải trình báo cáo
    pub notes: String,
    /// Danh sách chi tiết các mặt hàng trong báo cáo
    pub items: Vec<ReportItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportInput {
    /// Mã loại mẫu báo cáo (Ví dụ: strength-report, settlement-report)
    pub template: String,
    /// Tiêu đề của báo cáo
    pub title: String,
    /// Dữ liệu chi tiết của báo cáo
    pub data: ReportData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedReport {
    /// Khóa chính tự tăng
    pub id: i64,
    /// Mã loại mẫu báo cáo (Ví dụ: strength-report, settlement-report)
    pub template: String,
    /// Tiêu đề của báo cáo
    pub title: String,
    /// Dữ liệu chi tiết của báo cáo
    pub data: ReportData,
    /// Thời gian xuất báo cáo trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}
