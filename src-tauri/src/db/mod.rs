// Khai báo tất cả sub-module
pub(crate) mod connection;
pub mod customers;
pub mod employees;
pub mod materials;
pub mod migrations;
pub mod reports;
pub mod supplies;
pub mod unit_settings;
pub mod warehouse_issues;
pub mod warehouse_receipts;

// Re-export Database struct và tất cả public types
// để lib.rs có thể dùng `use crate::db::{...}`.
pub use connection::Database;
pub use customers::models::{CustomerInput, PaginatedCustomers, SavedCustomer};
pub use employees::models::{EmployeeInput, SavedEmployee};
pub use materials::models::{MaterialInput, PaginatedMaterials, SavedMaterial};
pub use reports::models::{ReportData, ReportInput};
pub use supplies::models::{PaginatedSupplies, SavedSupply, SupplyInput};
pub use unit_settings::models::UnitSettings;
pub use warehouse_issues::models::{SavedWarehouseIssue, WarehouseIssueInput};
pub use warehouse_receipts::models::{SavedWarehouseReceipt, WarehouseReceiptInput};
