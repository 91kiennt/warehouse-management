mod database;

use crate::database::{
    CustomerInput, Database, EmployeeInput, ReportData, ReportInput, SavedCustomer, SavedEmployee,
    SavedSupply, SupplyInput, MaterialInput, SavedMaterial, WarehouseReceiptInput, SavedWarehouseReceipt,
    WarehouseIssueInput, SavedWarehouseIssue,
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
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.save_warehouse_receipt(receipt).map_err(|e| e.to_string()))
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
    state
        .db
        .lock()
        .map_err(|e| e.to_string())
        .and_then(|db| db.update_warehouse_receipt(id, receipt).map_err(|e| e.to_string()))
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

fn get_app_data_dir() -> PathBuf {
    let proj_dirs = ProjectDirs::from("com", "tauri", "tauri-warehouse-management")
        .expect("Could not determine app data directory");
    proj_dirs.data_dir().to_path_buf()
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
        .manage(AppState {
            db: Mutex::new(database),
        })
        .invoke_handler(tauri::generate_handler![
            save_report,
            list_reports,
            save_excel_buffer,
            save_customer,
            list_customers,
            update_customer,
            delete_customer,
            save_supply,
            list_supplies,
            update_supply,
            delete_supply,
            save_employee,
            get_employee_by_code,
            update_employee,
            save_material,
            list_materials,
            update_material,
            delete_material,
            save_warehouse_receipt,
            list_warehouse_receipts,
            update_warehouse_receipt,
            delete_warehouse_receipt,
            save_warehouse_issue,
            list_warehouse_issues,
            update_warehouse_issue,
            delete_warehouse_issue,
        ])
        .plugin(tauri_plugin_opener::init())
        .run(context)
        .expect("error while running tauri application");
}
