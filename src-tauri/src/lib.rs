mod database;

use crate::database::{
    CustomerInput, Database, EmployeeInput, ReportData, ReportInput, SavedCustomer, SavedEmployee,
    SavedSupply, SupplyInput, MaterialInput, SavedMaterial, WarehouseReceiptInput, SavedWarehouseReceipt,
    WarehouseIssueInput, SavedWarehouseIssue, PaginatedCustomers, PaginatedSupplies, PaginatedMaterials,
    UnitSettings,
};
use base64::Engine;
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

struct AppState {
    db: Mutex<Database>,
}

#[derive(Serialize, Deserialize)]
pub struct ReportInputDto {
    pub template: String,
    pub title: String,
    pub data: ReportData,
}

#[derive(Serialize)]
pub struct SavedReportDto {
    pub id: i64,
    pub template: String,
    pub title: String,
    pub data: ReportData,
    pub created_at: String,
}

#[tauri::command]
fn save_report(
    state: tauri::State<'_, AppState>,
    report: ReportInputDto,
) -> Result<SavedReportDto, String> {
    let report_input = ReportInput {
        template: report.template,
        title: report.title,
        data: report.data,
    };

    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_report(report_input).map_err(|e| e.to_string()))
        .map(|saved| SavedReportDto {
            id: saved.id,
            template: saved.template,
            title: saved.title,
            data: saved.data,
            created_at: saved.created_at,
        })
}

#[tauri::command]
fn list_reports(state: tauri::State<'_, AppState>) -> Result<Vec<SavedReportDto>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_reports().map_err(|e| e.to_string()))
        .map(|reports| {
            reports
                .into_iter()
                .map(|saved| SavedReportDto {
                    id: saved.id,
                    template: saved.template,
                    title: saved.title,
                    data: saved.data,
                    created_at: saved.created_at,
                })
                .collect()
        })
}

#[tauri::command]
fn save_customer(
    state: tauri::State<'_, AppState>,
    customer: CustomerInput,
) -> Result<SavedCustomer, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_customer(customer).map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_customers(state: tauri::State<'_, AppState>) -> Result<Vec<SavedCustomer>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_customers().map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_customers_paginated(
    state: tauri::State<'_, AppState>,
    limit: i64,
    offset: i64,
) -> Result<PaginatedCustomers, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_customers_paginated(limit, offset).map_err(|e| e.to_string()))
}

#[tauri::command]
fn update_customer(
    state: tauri::State<'_, AppState>,
    id: i64,
    customer: CustomerInput,
) -> Result<SavedCustomer, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_customer(id, customer).map_err(|e| e.to_string()))
}

#[tauri::command]
fn delete_customer(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.delete_customer(id).map_err(|e| e.to_string()))
}

#[tauri::command]
fn save_supply(
    state: tauri::State<'_, AppState>,
    supply: SupplyInput,
) -> Result<SavedSupply, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_supply(supply).map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_supplies(state: tauri::State<'_, AppState>) -> Result<Vec<SavedSupply>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_supplies().map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_supplies_paginated(
    state: tauri::State<'_, AppState>,
    limit: i64,
    offset: i64,
 ) -> Result<PaginatedSupplies, String> {
     state
         .db
         .lock()
         .map_err(|e| e.to_string())
         .and_then(|db| db.list_supplies_paginated(limit, offset).map_err(|e| e.to_string()))
}

#[tauri::command]
fn update_supply(
    state: tauri::State<'_, AppState>,
    id: i64,
    supply: SupplyInput,
) -> Result<SavedSupply, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_supply(id, supply).map_err(|e| e.to_string()))
}

#[tauri::command]
fn delete_supply(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.delete_supply(id).map_err(|e| e.to_string()))
}

#[tauri::command]
fn save_material(
    state: tauri::State<'_, AppState>,
    material: MaterialInput,
) -> Result<SavedMaterial, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_material(material).map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_materials(state: tauri::State<'_, AppState>) -> Result<Vec<SavedMaterial>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_materials().map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_materials_paginated(
    state: tauri::State<'_, AppState>,
    limit: i64,
    offset: i64,
) -> Result<PaginatedMaterials, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_materials_paginated(limit, offset).map_err(|e| e.to_string()))
}

#[tauri::command]
fn update_material(
    state: tauri::State<'_, AppState>,
    id: i64,
    material: MaterialInput,
) -> Result<SavedMaterial, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_material(id, material).map_err(|e| e.to_string()))
}

#[tauri::command]
fn delete_material(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.delete_material(id).map_err(|e| e.to_string()))
}

#[tauri::command]
fn save_warehouse_receipt(
    state: tauri::State<'_, AppState>,
    receipt: WarehouseReceiptInput,
) -> Result<SavedWarehouseReceipt, String> {
    println!("[TAURI BE] save_warehouse_receipt payload: {:?}", receipt);
    let result = state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_warehouse_receipt(receipt).map_err(|e| e.to_string()));
    println!("[TAURI BE] save_warehouse_receipt result: {:?}", result);
    result
}

#[tauri::command]
fn list_warehouse_receipts(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<SavedWarehouseReceipt>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_warehouse_receipts().map_err(|e| e.to_string()))
}

#[tauri::command]
fn update_warehouse_receipt(
    state: tauri::State<'_, AppState>,
    id: i64,
    receipt: WarehouseReceiptInput,
) -> Result<SavedWarehouseReceipt, String> {
    println!("[TAURI BE] update_warehouse_receipt id: {}, payload: {:?}", id, receipt);
    let result = state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_warehouse_receipt(id, receipt).map_err(|e| e.to_string()));
    println!("[TAURI BE] update_warehouse_receipt result: {:?}", result);
    result
}

#[tauri::command]
fn delete_warehouse_receipt(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.delete_warehouse_receipt(id).map_err(|e| e.to_string()))
}

#[tauri::command]
fn get_material_stock(
    state: tauri::State<'_, AppState>,
    material_code: String,
    warehouse_code: String,
) -> Result<f64, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())?
        .get_material_stock(&material_code, &warehouse_code)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_warehouse_issue(
    state: tauri::State<'_, AppState>,
    issue: WarehouseIssueInput,
) -> Result<SavedWarehouseIssue, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_warehouse_issue(issue).map_err(|e| e.to_string()))
}

#[tauri::command]
fn list_warehouse_issues(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<SavedWarehouseIssue>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.list_warehouse_issues().map_err(|e| e.to_string()))
}

#[tauri::command]
fn update_warehouse_issue(
    state: tauri::State<'_, AppState>,
    id: i64,
    issue: WarehouseIssueInput,
) -> Result<SavedWarehouseIssue, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_warehouse_issue(id, issue).map_err(|e| e.to_string()))
}

#[tauri::command]
fn delete_warehouse_issue(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.delete_warehouse_issue(id).map_err(|e| e.to_string()))
}

#[tauri::command]
fn save_employee(
    state: tauri::State<'_, AppState>,
    employee: EmployeeInput,
) -> Result<SavedEmployee, String> {
    println!("[TAURI] Saving employee payload: {:?}", employee);
    let result = state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_employee(employee).map_err(|e| e.to_string()));
    println!("[TAURI] Save result: {:?}", result);
    result
}

#[tauri::command]
fn get_employee_by_code(
    state: tauri::State<'_, AppState>,
    code: String,
) -> Result<SavedEmployee, String> {
    println!("[TAURI] Getting employee by code: {}", code);
    let result = state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.get_employee_by_code(&code).map_err(|e| e.to_string()));
    println!("[TAURI] Get employee result: {:?}", result);
    result
}

#[tauri::command]
fn update_employee(
    state: tauri::State<'_, AppState>,
    id: i64,
    employee: EmployeeInput,
) -> Result<SavedEmployee, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_employee(id, employee).map_err(|e| e.to_string()))
}

#[tauri::command]
fn save_excel_buffer(
    _state: tauri::State<'_, AppState>,
    filename: String,
    content: String,
) -> Result<String, String> {
    let app_dir = get_app_data_dir();
    let export_dir = app_dir.join("exports");
    std::fs::create_dir_all(&export_dir).map_err(|e| e.to_string())?;
    let file_path = export_dir.join(filename);

    let engine = base64::engine::general_purpose::STANDARD;
    let bytes = engine.decode(&content).map_err(|e| e.to_string())?;
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(&bytes).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_unit_settings(state: tauri::State<'_, AppState>) -> Result<Option<UnitSettings>, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.get_unit_settings().map_err(|e| e.to_string()))
}

#[tauri::command]
fn save_unit_settings(
    state: tauri::State<'_, AppState>,
    settings: UnitSettings,
) -> Result<UnitSettings, String> {
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_unit_settings(settings).map_err(|e| e.to_string()))
}

fn get_app_data_dir() -> PathBuf {
    let proj_dirs = ProjectDirs::from("com", "tauri", "tauri-warehouse-management")
        .expect("Could not determine app data directory");
    proj_dirs.data_dir().to_path_buf()
}

/// macOS: Đặt NSPrintInfo.sharedPrintInfo margins = 0 ngay khi khởi động app.
/// Khi window.print() được gọi, WKWebView sẽ đọc NSPrintInfo và không còn
/// không gian để render native print decorations (ngày tháng, URL, tiêu đề,
/// số trang). CSS `@page { margin: 0 }` chỉ ảnh hưởng CSS page-box layout,
/// KHÔNG ảnh hưởng OS-level NSPrintInfo — đây là lý do CSS đơn thuần thất bại
/// trên macOS WKWebView.
#[cfg(target_os = "macos")]
fn configure_print_no_headers() {
    use objc::{class, msg_send, runtime::Object, sel, sel_impl};
    unsafe {
        // NSPrintInfo.sharedPrintInfo là singleton toàn cục được WKWebView sử dụng
        // khi window.print() được gọi.
        let print_info: *mut Object = msg_send![class!(NSPrintInfo), sharedPrintInfo];
        if !print_info.is_null() {
            // Đặt 4 margins = 0 → loại bỏ không gian render header/footer của WKWebView.
            let _: () = msg_send![print_info, setTopMargin: 0.0_f64];
            let _: () = msg_send![print_info, setBottomMargin: 0.0_f64];
            let _: () = msg_send![print_info, setLeftMargin: 0.0_f64];
            let _: () = msg_send![print_info, setRightMargin: 0.0_f64];
        }
    }
}

/// Windows: Tauri sử dụng WebView2 (Chromium-based engine) trên Windows.
/// Khác với macOS WKWebView, WebView2/Chromium TÔN TRỌNG CSS `@page { margin: 0 }`
/// để loại bỏ native print headers/footers. Quy tắc toàn cục này đã được đặt
/// trong src/styles.css nên không cần gọi Windows API riêng.
///
/// Ngoài ra, `beforeprint`/`afterprint` JS event handlers đã được inject qua
/// `initializationScript` trong tauri.conf.json để xóa document.title trước khi
/// in (ngăn tiêu đề "Warehouse Management" hiển thị trong print header).
#[cfg(target_os = "windows")]
fn configure_print_no_headers() {
    // No-op trên Windows:
    // - CSS `@page { margin: 0 !important }` trong src/styles.css đã xử lý Chromium.
    // - JS beforeprint/afterprint trong tauri.conf.json initializationScript xử lý title.
}

/// Linux và các nền tảng khác: CSS `@page { margin: 0 }` là cách xử lý chính.
#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn configure_print_no_headers() {
    // No-op: CSS @page { margin: 0 !important } trong src/styles.css đã xử lý.
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();
    let app_dir = get_app_data_dir();
    std::fs::create_dir_all(&app_dir).expect("Failed to create app dir");
    let database_path = app_dir.join("reports.db");

    let database =
        Database::open(database_path.to_string_lossy().as_ref()).expect("Failed to open database");

    tauri::Builder::default()
        .setup(|app| {
            // 1. Platform-specific native print configuration.
            //    macOS: set NSPrintInfo margins = 0 to suppress WKWebView native headers/footers.
            //    Windows/Linux: no-op — CSS `@page { margin: 0 }` handles Chromium/WebView2.
            configure_print_no_headers();

            // 2. Tạo cửa sổ chính từ Rust để có thể thêm initialization_script.
            //    Script này chạy trước khi trang web load, đăng ký beforeprint/afterprint
            //    event listeners để xóa document.title trước khi in (trên mọi nền tảng).
            //    Điều này ngăn "Warehouse Management" xuất hiện trong print header.
            //    Kết hợp với:
            //      - macOS: NSPrintInfo margins = 0 (loại bỏ native headers/footers)
            //      - Windows: CSS @page { margin: 0 } (Chromium tự loại bỏ headers/footers)
            tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("Warehouse Management")
            .inner_size(1200.0, 800.0)
            .initialization_script(
                // Minified IIFE: lưu title, xóa trước khi in, khôi phục sau khi in.
                "(function(){var s;window.addEventListener('beforeprint',function(){s=document.title;document.title='';});window.addEventListener('afterprint',function(){if(s!==undefined)document.title=s;});})();",
            )
            .build()?;

            Ok(())
        })
        .manage(AppState {
            db: Mutex::new(database),
        })
        .invoke_handler(tauri::generate_handler![
            save_report,
            list_reports,
            save_excel_buffer,
            save_customer,
            list_customers,
            list_customers_paginated,
            update_customer,
            delete_customer,
            save_supply,
            list_supplies,
            list_supplies_paginated,
            update_supply,
            delete_supply,
            save_employee,
            get_employee_by_code,
            update_employee,
            save_material,
            list_materials,
            list_materials_paginated,
            update_material,
            delete_material,
            save_warehouse_receipt,
            list_warehouse_receipts,
            update_warehouse_receipt,
            delete_warehouse_receipt,
            get_material_stock,
            save_warehouse_issue,
            list_warehouse_issues,
            update_warehouse_issue,
            delete_warehouse_issue,
            get_unit_settings,
            save_unit_settings,
        ])
        .plugin(tauri_plugin_opener::init())
        .run(context)
        .expect("error while running tauri application");
}
