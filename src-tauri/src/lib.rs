mod db;

use crate::db::{
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

/// Windows: Vô hiệu hóa print header/footer của WebView2 (Chromium) bằng cách
/// sửa file Preferences JSON của WebView2 trước khi nó được khởi tạo.
///
/// Cơ chế hoạt động:
///   Chromium/WebView2 lưu cài đặt in ấn trong file Preferences tại:
///   `%APPDATA%\<app-identifier>\EBWebView\Default\Preferences`
///   Key `printing.print_header_footer` = false sẽ vô hiệu hóa header/footer
///   trong print preview dialog của Chromium.
///
///   Hàm này phải được gọi TRƯỚC `WebviewWindowBuilder::new()` trong setup hook
///   để đảm bảo WebView2 đọc cài đặt đã sửa khi khởi tạo lần đầu.
#[cfg(target_os = "windows")]
fn configure_print_no_headers() {
    // Lấy đường dẫn tới file Preferences của WebView2.
    // Tauri v2 lưu dữ liệu WebView2 tại %APPDATA%\<identifier>\EBWebView\.
    let app_data = match std::env::var("APPDATA") {
        Ok(p) => std::path::PathBuf::from(p),
        Err(_) => return, // Không thể xác định đường dẫn, bỏ qua.
    };

    let prefs_path = app_data
        .join("com.kien-19.tauri-warehouse-management") // Khớp với identifier trong tauri.conf.json
        .join("EBWebView")
        .join("Default")
        .join("Preferences");

    // Đọc Preferences hiện tại hoặc tạo object rỗng nếu file chưa tồn tại.
    let mut prefs: serde_json::Value = if prefs_path.exists() {
        std::fs::read_to_string(&prefs_path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    // Đảm bảo section "printing" tồn tại, sau đó đặt print_header_footer = false.
    // Đây là Chromium preference key chính thức kiểm soát header/footer trong print dialog.
    if prefs.get("printing").is_none() {
        prefs["printing"] = serde_json::json!({});
    }
    if let Some(printing) = prefs.get_mut("printing") {
        printing["print_header_footer"] = serde_json::Value::Bool(false);
    }

    // Tạo thư mục cha nếu chưa tồn tại (lần chạy đầu tiên).
    if let Some(parent) = prefs_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }

    // Ghi lại file Preferences. WebView2 sẽ đọc file này khi khởi tạo.
    let _ = std::fs::write(
        &prefs_path,
        serde_json::to_string(&prefs).unwrap_or_default(),
    );
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
            // Trên Windows: vô hiệu hóa Chromium print header/footer qua Preferences JSON.
            // Phải gọi TRƯỚC WebviewWindowBuilder::new() để WebView2 đọc khi khởi tạo.
            #[cfg(target_os = "windows")]
            configure_print_no_headers();

            // Tạo cửa sổ chính từ Rust để có thể thêm initialization_script.
            // Script inject beforeprint/afterprint event listeners:
            //   - beforeprint:  xóa document.title (ngăn tiêu đề "Warehouse Management"
            //                   xuất hiện trong print header trên mọi nền tảng)
            //   - afterprint:   khôi phục document.title sau khi đóng dialog in
            tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("Warehouse Management")
            .inner_size(1200.0, 800.0)
            .initialization_script(
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
