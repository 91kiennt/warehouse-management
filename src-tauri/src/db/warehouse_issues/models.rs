use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WarehouseIssueInput {
    /// Số phiếu xuất kho (Duy nhất)
    pub issue_number: String,
    /// Ngày ghi sổ / Ngày thực hiện xuất kho
    pub posting_date: String,
    /// Số chứng từ / Số yêu cầu xuất
    pub invoice_number: String,
    /// Ngày lập yêu cầu xuất
    pub invoice_date: String,
    /// Diễn giải lý do xuất kho chung
    pub description: String,
    /// Chứng từ, văn bản chỉ đạo kèm theo khi xuất
    pub accompanied_doc: String,
    /// Họ tên người nhận hàng
    pub receiver_name: String,
    /// Bộ phận / Đơn vị nhận hàng
    pub department: String,
    /// Lý do chi tiết xuất kho
    pub reason: String,
    /// Mã kho thực hiện xuất hàng
    pub warehouse_location: String,
    /// Danh sách vật tư chi tiết: Chuỗi JSON lưu trữ mảng các sản phẩm xuất, số lượng yêu cầu, số lượng thực xuất, đơn giá, thành tiền, v.v.
    pub items: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedWarehouseIssue {
    /// Khóa chính tự tăng
    pub id: i64,
    /// Số phiếu xuất kho (Duy nhất)
    pub issue_number: String,
    /// Ngày ghi sổ / Ngày thực hiện xuất kho
    pub posting_date: String,
    /// Số chứng từ / Số yêu cầu xuất
    pub invoice_number: String,
    /// Ngày lập yêu cầu xuất
    pub invoice_date: String,
    /// Diễn giải lý do xuất kho chung
    pub description: String,
    /// Chứng từ, văn bản chỉ đạo kèm theo khi xuất
    pub accompanied_doc: String,
    /// Họ tên người nhận hàng
    pub receiver_name: String,
    /// Bộ phận / Đơn vị nhận hàng
    pub department: String,
    /// Lý do chi tiết xuất kho
    pub reason: String,
    /// Mã kho thực hiện xuất hàng
    pub warehouse_location: String,
    /// Danh sách vật tư chi tiết: Chuỗi JSON lưu trữ mảng các sản phẩm xuất, số lượng yêu cầu, số lượng thực xuất, đơn giá, thành tiền, v.v.
    pub items: String,
    /// Thời gian tạo phiếu xuất trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}
