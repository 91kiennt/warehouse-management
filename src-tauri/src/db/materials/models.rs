use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MaterialInput {
    /// Mã vật tư (Duy nhất, dùng để liên kết giao dịch)
    pub code: String,
    /// Mã vạch vật tư (Dùng để quét nhanh hoặc hiển thị)
    pub barcode: String,
    /// Tên chi tiết vật tư / hàng hóa
    pub name: String,
    /// Mã nhóm vật tư cấp trên
    pub parent_code: String,
    /// Tên nhóm vật tư (Dùng để gom nhóm phân loại vật tư)
    pub parent_name: String,
    /// Đơn vị tính (Ví dụ: Cái, Thùng, Mét, Tấn, Lọ, v.v.)
    pub unit: String,
    /// Loại tiền tệ áp dụng (Mặc định: VND)
    pub currency: String,
    /// Mã kho chứa mặc định của vật tư
    pub warehouse: String,
    /// Phương pháp tính giá xuất kho (Ví dụ: FIFO, Bình quân gia quyền)
    pub valuation_method: String,
    /// Đặc tính kỹ thuật hoặc thông tin bổ sung của vật tư
    pub features: String,
    /// Cấu hình thuế (Ví dụ: Có thuế, Không thuế)
    pub taxable: String,
    /// Cấu hình kế hoạch nhu cầu vật tư (1: Hoạt động, 0: Tắt)
    pub mrp_mps: i64,
    /// Cờ xác định có tính toán tồn kho hay không (1: Có, 0: Không)
    pub calculate_inventory: i64,
    /// Ngày bắt đầu áp dụng theo dõi
    pub start_date: String,
    /// Ngày kết thúc theo dõi
    pub end_date: String,
    /// Chuỗi dữ liệu ảnh đại diện (Định dạng Base64)
    pub image_data: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedMaterial {
    /// Khóa chính tự tăng
    pub id: i64,
    /// Mã vật tư (Duy nhất, dùng để liên kết giao dịch)
    pub code: String,
    /// Mã vạch vật tư (Dùng để quét nhanh hoặc hiển thị)
    pub barcode: String,
    /// Tên chi tiết vật tư / hàng hóa
    pub name: String,
    /// Mã nhóm vật tư cấp trên
    pub parent_code: String,
    /// Tên nhóm vật tư (Dùng để gom nhóm phân loại vật tư)
    pub parent_name: String,
    /// Đơn vị tính (Ví dụ: Cái, Thùng, Mét, Tấn, Lọ, v.v.)
    pub unit: String,
    /// Loại tiền tệ áp dụng (Mặc định: VND)
    pub currency: String,
    /// Mã kho chứa mặc định của vật tư
    pub warehouse: String,
    /// Phương pháp tính giá xuất kho (Ví dụ: FIFO, Bình quân gia quyền)
    pub valuation_method: String,
    /// Đặc tính kỹ thuật hoặc thông tin bổ sung của vật tư
    pub features: String,
    /// Cấu hình thuế (Ví dụ: Có thuế, Không thuế)
    pub taxable: String,
    /// Cấu hình kế hoạch nhu cầu vật tư (1: Hoạt động, 0: Tắt)
    pub mrp_mps: i64,
    /// Cờ xác định có tính toán tồn kho hay không (1: Có, 0: Không)
    pub calculate_inventory: i64,
    /// Ngày bắt đầu áp dụng theo dõi
    pub start_date: String,
    /// Ngày kết thúc theo dõi
    pub end_date: String,
    /// Chuỗi dữ liệu ảnh đại diện (Định dạng Base64)
    pub image_data: String,
    /// Thời gian tạo vật tư trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedMaterials {
    /// Danh sách kết quả phân trang
    pub items: Vec<SavedMaterial>,
    /// Tổng số bản ghi thỏa mãn điều kiện
    pub total: i64,
}
