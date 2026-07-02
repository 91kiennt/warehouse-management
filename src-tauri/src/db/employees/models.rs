use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmployeeInput {
    /// Mã nhân viên (Duy nhất)
    pub code: String,
    /// Họ và tên nhân viên
    pub name: String,
    /// Ngày tháng năm sinh
    #[serde(alias = "date_of_birth")]
    pub date_of_birth: String,
    /// Địa chỉ liên lạc của nhân viên
    pub address: String,
    /// Số điện thoại di động
    pub phone: String,
    /// Số fax nội bộ
    pub fax: String,
    /// Email công vụ
    pub email: String,
    /// Số CCCD / CMND
    #[serde(alias = "id_number")]
    pub id_number: String,
    /// Ngày cấp thẻ căn cước
    #[serde(alias = "id_issued_date")]
    pub id_issued_date: String,
    /// Nơi cấp thẻ căn cước
    #[serde(alias = "id_issued_place")]
    pub id_issued_place: String,
    /// Giới tính nhân viên
    pub gender: String,
    /// Tên người quản lý trực tiếp
    pub superior: String,
    /// Ngày bắt đầu làm việc / Hiệu lực
    #[serde(alias = "effective_from_date")]
    pub effective_from_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedEmployee {
    /// Khóa chính tự tăng
    pub id: i64,
    /// Mã nhân viên (Duy nhất)
    pub code: String,
    /// Họ và tên nhân viên
    pub name: String,
    /// Ngày tháng năm sinh
    pub date_of_birth: String,
    /// Địa chỉ liên lạc của nhân viên
    pub address: String,
    /// Số điện thoại di động
    pub phone: String,
    /// Số fax nội bộ
    pub fax: String,
    /// Email công vụ
    pub email: String,
    /// Số CCCD / CMND
    pub id_number: String,
    /// Ngày cấp thẻ căn cước
    pub id_issued_date: String,
    /// Nơi cấp thẻ căn cước
    pub id_issued_place: String,
    /// Giới tính nhân viên
    pub gender: String,
    /// Tên người quản lý trực tiếp
    pub superior: String,
    /// Ngày bắt đầu làm việc / Hiệu lực
    pub effective_from_date: String,
    /// Thời gian tạo hồ sơ nhân viên trên hệ thống (Chuỗi ISO 8601)
    pub created_at: String,
}
