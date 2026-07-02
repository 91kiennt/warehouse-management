use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WarehouseReceiptInput {
    /// Số phiếu nhập kho (Duy nhất, tự sinh hoặc nhập tay)
    pub receipt_number: String,
    /// Ngày ghi sổ / Ngày thực hiện nhập kho
    pub posting_date: String,
    /// Số hóa đơn / Số chứng từ kèm theo
    pub invoice_number: String,
    /// Ngày phát hành hóa đơn đi kèm
    pub invoice_date: String,
    /// Diễn giải lý do nhập kho chung của phiếu
    pub description: String,
    /// Họ tên người giao hàng
    pub delivery_person: String,
    /// Danh sách chứng từ đi kèm (Ví dụ: Hóa đơn đỏ, biên bản bàn giao)
    pub accompanied_doc: String,
    /// Địa chỉ / Đơn vị giao nhận hàng
    pub department: String,
    /// Lý do chi tiết nhập kho
    pub reason: String,
    /// Mã kho thực hiện nhập hàng
    pub warehouse_location: String,
    /// Danh sách vật tư chi tiết: Chuỗi JSON lưu trữ mảng các sản phẩm nhập, số lượng chứng từ, số lượng thực nhập, đơn giá, thành tiền, v.v.
    pub items: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedWarehouseReceipt {
    /// Khóa chính tự tăng
    pub id: i64,
    /// Số phiếu nhập kho (Duy nhất, tự sinh hoặc nhập tay)
    pub receipt_number: String,
    /// Ngày ghi sổ / Ngày thực hiện nhập kho
    pub posting_date: String,
    /// Số hóa đơn / Số chứng từ kèm theo
    pub invoice_number: String,
    /// Ngày phát hành hóa đơn đi kèm
    pub invoice_date: String,
    /// Diễn giải lý do nhập kho chung của phiếu
    pub description: String,
    /// Họ tên người giao hàng
    pub delivery_person: String,
    /// Danh sách chứng từ đi kèm (Ví dụ: Hóa đơn đỏ, biên bản bàn giao)
    pub accompanied_doc: String,
    /// Địa chỉ / Đơn vị giao nhận hàng
    pub department: String,
    /// Lý do chi tiết nhập kho
    pub reason: String,
    /// Mã kho thực hiện nhập hàng
    pub warehouse_location: String,
    /// Danh sách vật tư chi tiết: Chuỗi JSON lưu trữ mảng các sản phẩm nhập, số lượng chứng từ, số lượng thực nhập, đơn giá, thành tiền, v.v.
    pub items: String,
    /// Thời gian tạo phiếu trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}
