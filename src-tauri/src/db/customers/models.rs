use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerInput {
    /// Mã đối tác / khách hàng (Duy nhất)
    pub code: String,
    /// Tên đối tác / khách hàng
    pub name: String,
    /// Địa chỉ đối tác / khách hàng
    pub address: String,
    /// Mã số thuế đối tác
    pub tax_id: String,
    /// Số tài khoản ngân hàng
    pub bank_account: String,
    /// Tên ngân hàng thụ hưởng
    pub bank_name: String,
    /// Số điện thoại liên hệ
    pub phone: String,
    /// Số fax
    pub fax: String,
    /// Địa chỉ thư điện tử (Email)
    pub email: String,
    /// Hạn mức công nợ cho phép đối với đối tác này
    pub credit_limit: f64,
    /// Người giám sát / Phụ trách đối tác
    pub supervisor: String,
    /// Ngày bắt đầu hợp tác
    pub start_date: String,
    /// Ngày kết thúc hợp tác
    pub end_date: String,
    /// Hộ khẩu thường trú (Trong trường hợp đối tác cá nhân)
    pub permanent_residence: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedCustomer {
    /// Khóa chính tự tăng của đối tác
    pub id: i64,
    /// Mã đối tác / khách hàng (Duy nhất)
    pub code: String,
    /// Tên đối tác / khách hàng
    pub name: String,
    /// Địa chỉ đối tác / khách hàng
    pub address: String,
    /// Mã số thuế đối tác
    pub tax_id: String,
    /// Số tài khoản ngân hàng
    pub bank_account: String,
    /// Tên ngân hàng thụ hưởng
    pub bank_name: String,
    /// Số điện thoại liên hệ
    pub phone: String,
    /// Số fax
    pub fax: String,
    /// Địa chỉ thư điện tử (Email)
    pub email: String,
    /// Hạn mức công nợ cho phép đối với đối tác này
    pub credit_limit: f64,
    /// Người giám sát / Phụ trách đối tác
    pub supervisor: String,
    /// Ngày bắt đầu hợp tác
    pub start_date: String,
    /// Ngày kết thúc hợp tác
    pub end_date: String,
    /// Hộ khẩu thường trú (Trong trường hợp đối tác cá nhân)
    pub permanent_residence: String,
    /// Thời gian tạo đối tác trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedCustomers {
    /// Danh sách kết quả phân trang
    pub items: Vec<SavedCustomer>,
    /// Tổng số bản ghi thỏa mãn điều kiện
    pub total: i64,
}
