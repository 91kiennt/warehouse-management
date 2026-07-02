use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SupplyInput {
    /// Mã kho vật tư (Duy nhất, ví dụ: KHO-YTE, KHO-QUANKHI)
    pub code: String,
    /// Tên gọi chi tiết kho
    pub name: String,
    /// Mã kho tổng quản lý cấp trên (nếu có)
    pub parent_warehouse: String,
    /// Ngày bắt đầu đưa kho vào sử dụng
    pub start_date: String,
    /// Ngày ngừng hoạt động kho
    pub end_date: String,
    /// Người chịu trách nhiệm quản lý kho (Thủ kho)
    pub manager: String,
    /// Địa chỉ vật lý của kho hàng
    pub location: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedSupply {
    /// Khóa chính tự tăng của kho
    pub id: i64,
    /// Mã kho vật tư (Duy nhất, ví dụ: KHO-YTE, KHO-QUANKHI)
    pub code: String,
    /// Tên gọi chi tiết kho
    pub name: String,
    /// Mã kho tổng quản lý cấp trên (nếu có)
    pub parent_warehouse: String,
    /// Ngày bắt đầu đưa kho vào sử dụng
    pub start_date: String,
    /// Ngày ngừng hoạt động kho
    pub end_date: String,
    /// Người chịu trách nhiệm quản lý kho (Thủ kho)
    pub manager: String,
    /// Địa chỉ vật lý của kho hàng
    pub location: String,
    /// Thời gian khởi tạo kho trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedSupplies {
    /// Danh sách kết quả phân trang
    pub items: Vec<SavedSupply>,
    /// Tổng số bản ghi thỏa mãn điều kiện
    pub total: i64,
}
