use rusqlite::{params, Result};
use serde::Deserialize;

use crate::db::connection::Database;
use crate::db::materials::models::{MaterialInput, PaginatedMaterials, SavedMaterial};

impl Database {
    pub fn save_material(&self, material: MaterialInput) -> Result<SavedMaterial> {
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO materials (
                code,
                barcode,
                name,
                parent_code,
                parent_name,
                unit,
                currency,
                warehouse,
                valuation_method,
                features,
                taxable,
                mrp_mps,
                calculate_inventory,
                start_date,
                end_date,
                image_data,
                created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                material.code,
                material.barcode,
                material.name,
                material.parent_code,
                material.parent_name,
                material.unit,
                material.currency,
                material.warehouse,
                material.valuation_method,
                material.features,
                material.taxable,
                material.mrp_mps,
                material.calculate_inventory,
                material.start_date,
                material.end_date,
                material.image_data,
                created_at,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        Ok(SavedMaterial {
            id,
            code: material.code,
            barcode: material.barcode,
            name: material.name,
            parent_code: material.parent_code,
            parent_name: material.parent_name,
            unit: material.unit,
            currency: material.currency,
            warehouse: material.warehouse,
            valuation_method: material.valuation_method,
            features: material.features,
            taxable: material.taxable,
            mrp_mps: material.mrp_mps,
            calculate_inventory: material.calculate_inventory,
            start_date: material.start_date,
            end_date: material.end_date,
            image_data: material.image_data,
            created_at,
        })
    }

    pub fn list_materials(&self) -> Result<Vec<SavedMaterial>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, code, barcode, name, parent_code, parent_name, unit, currency, warehouse, valuation_method, features, taxable, mrp_mps, calculate_inventory, start_date, end_date, image_data, created_at FROM materials ORDER BY id ASC",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(SavedMaterial {
                id: row.get(0)?,
                code: row.get(1)?,
                barcode: row.get(2)?,
                name: row.get(3)?,
                parent_code: row.get(4)?,
                parent_name: row.get(5)?,
                unit: row.get(6)?,
                currency: row.get(7)?,
                warehouse: row.get(8)?,
                valuation_method: row.get(9)?,
                features: row.get(10)?,
                taxable: row.get(11)?,
                mrp_mps: row.get(12)?,
                calculate_inventory: row.get(13)?,
                start_date: row.get(14)?,
                end_date: row.get(15)?,
                image_data: row.get(16)?,
                created_at: row.get(17)?,
            })
        })?;

        rows.collect()
    }

    pub fn list_materials_paginated(
        &self,
        limit: i64,
        offset: i64,
    ) -> Result<PaginatedMaterials> {
        let mut stmt = self.conn.prepare(
            "SELECT id, code, barcode, name, parent_code, parent_name, unit, currency, warehouse, valuation_method, features, taxable, mrp_mps, calculate_inventory, start_date, end_date, image_data, created_at FROM materials ORDER BY id ASC LIMIT ?1 OFFSET ?2",
        )?;
        let rows = stmt.query_map(params![limit, offset], |row| {
            Ok(SavedMaterial {
                id: row.get(0)?,
                code: row.get(1)?,
                barcode: row.get(2)?,
                name: row.get(3)?,
                parent_code: row.get(4)?,
                parent_name: row.get(5)?,
                unit: row.get(6)?,
                currency: row.get(7)?,
                warehouse: row.get(8)?,
                valuation_method: row.get(9)?,
                features: row.get(10)?,
                taxable: row.get(11)?,
                mrp_mps: row.get(12)?,
                calculate_inventory: row.get(13)?,
                start_date: row.get(14)?,
                end_date: row.get(15)?,
                image_data: row.get(16)?,
                created_at: row.get(17)?,
            })
        })?;

        let mut items = Vec::new();
        for r in rows {
            items.push(r?);
        }

        let total: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM materials",
            [],
            |row| row.get(0),
        )?;

        Ok(PaginatedMaterials { items, total })
    }

    pub fn get_material(&self, id: i64) -> Result<SavedMaterial> {
        self.conn.query_row(
            "SELECT id, code, barcode, name, parent_code, parent_name, unit, currency, warehouse, valuation_method, features, taxable, mrp_mps, calculate_inventory, start_date, end_date, image_data, created_at FROM materials WHERE id = ?1",
            params![id],
            |row| {
                Ok(SavedMaterial {
                    id: row.get(0)?,
                    code: row.get(1)?,
                    barcode: row.get(2)?,
                    name: row.get(3)?,
                    parent_code: row.get(4)?,
                    parent_name: row.get(5)?,
                    unit: row.get(6)?,
                    currency: row.get(7)?,
                    warehouse: row.get(8)?,
                    valuation_method: row.get(9)?,
                    features: row.get(10)?,
                    taxable: row.get(11)?,
                    mrp_mps: row.get(12)?,
                    calculate_inventory: row.get(13)?,
                    start_date: row.get(14)?,
                    end_date: row.get(15)?,
                    image_data: row.get(16)?,
                    created_at: row.get(17)?,
                })
            },
        )
    }

    pub fn update_material(&self, id: i64, material: MaterialInput) -> Result<SavedMaterial> {
        self.conn.execute(
            "UPDATE materials SET 
                code = ?1, 
                barcode = ?2, 
                name = ?3, 
                parent_code = ?4, 
                parent_name = ?5, 
                unit = ?6, 
                currency = ?7, 
                warehouse = ?8, 
                valuation_method = ?9, 
                features = ?10, 
                taxable = ?11, 
                mrp_mps = ?12, 
                calculate_inventory = ?13, 
                start_date = ?14, 
                end_date = ?15, 
                image_data = ?16 
            WHERE id = ?17",
            params![
                material.code,
                material.barcode,
                material.name,
                material.parent_code,
                material.parent_name,
                material.unit,
                material.currency,
                material.warehouse,
                material.valuation_method,
                material.features,
                material.taxable,
                material.mrp_mps,
                material.calculate_inventory,
                material.start_date,
                material.end_date,
                material.image_data,
                id,
            ],
        )?;
        self.get_material(id)
    }

    pub fn delete_material(&self, id: i64) -> Result<()> {
        self.conn
            .execute("DELETE FROM materials WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn get_material_stock(&self, material_code: &str, warehouse_code: &str) -> Result<f64> {
        #[derive(Deserialize, Debug)]
        struct DbItem {
            warehouse: String,
            #[serde(rename = "materialCode")]
            material_code: String,
            #[serde(rename = "quantityReal")]
            quantity_real: f64,
        }

        let mut total_in = 0.0;
        let mut total_out = 0.0;

        // Query all items from receipts
        let mut stmt = self.conn.prepare("SELECT items FROM warehouse_receipts")?;
        let receipt_items_list = stmt.query_map([], |row| {
            let items_str: String = row.get(0)?;
            Ok(items_str)
        })?;

        for items_str_res in receipt_items_list {
            if let Ok(items_str) = items_str_res {
                if let Ok(items) = serde_json::from_str::<Vec<DbItem>>(&items_str) {
                    for item in items {
                        if item.material_code.to_uppercase() == material_code.to_uppercase()
                            && item.warehouse.to_uppercase() == warehouse_code.to_uppercase()
                        {
                            total_in += item.quantity_real;
                        }
                    }
                }
            }
        }

        // Query all items from issues
        let mut stmt = self.conn.prepare("SELECT items FROM warehouse_issues")?;
        let issue_items_list = stmt.query_map([], |row| {
            let items_str: String = row.get(0)?;
            Ok(items_str)
        })?;

        for items_str_res in issue_items_list {
            if let Ok(items_str) = items_str_res {
                if let Ok(items) = serde_json::from_str::<Vec<DbItem>>(&items_str) {
                    for item in items {
                        if item.material_code.to_uppercase() == material_code.to_uppercase()
                            && item.warehouse.to_uppercase() == warehouse_code.to_uppercase()
                        {
                            total_out += item.quantity_real;
                        }
                    }
                }
            }
        }

        Ok(total_in - total_out)
    }

    /// Import hàng loạt vật tư từ Excel với 4 lớp tối ưu hiệu năng:
    /// 1. INSERT OR REPLACE thay vì SELECT EXISTS + UPDATE/INSERT (giảm 50% số query)
    /// 2. Prepared Statement compile SQL 1 lần/chunk
    /// 3. WAL + PRAGMA đã được bật ở migration v5
    /// 4. HashSet warehouse validation O(1) + chunked processing với progress event
    pub fn import_materials_optimized(
        &mut self,
        app_handle: &tauri::AppHandle,
        items: Vec<MaterialInput>,
    ) -> Result<String, String> {
        use std::collections::HashSet;
        use tauri::Emitter;

        let now = chrono::Utc::now().to_rfc3339();
        let total = items.len();

        if total == 0 {
            return Ok("Không có dữ liệu để import.".to_string());
        }

        // ── Tối ưu 4: Load tất cả warehouse codes hợp lệ vào HashSet — 1 query duy nhất ──
        let valid_warehouses: HashSet<String> = {
            let mut stmt = self
                .conn
                .prepare("SELECT code FROM supplies")
                .map_err(|e| e.to_string())?;
            // Collect vào Vec trước để stmt có thể drop trước khi block kết thúc
            let rows: Vec<String> = stmt
                .query_map([], |row| row.get::<_, String>(0))
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();
            rows.into_iter().collect()
        };

        // Validate tất cả warehouse trước khi bắt đầu bất kỳ transaction nào
        for (idx, item) in items.iter().enumerate() {
            if !valid_warehouses.contains(&item.warehouse) {
                return Err(format!(
                    "Dòng {}: Mã kho '{}' không tồn tại trong hệ thống.",
                    idx + 2, // +2 vì dòng 1 là header
                    item.warehouse
                ));
            }
        }

        // ── Xử lý theo chunk 500 dòng, mỗi chunk là 1 transaction ──────────────────────
        const CHUNK_SIZE: usize = 500;

        for (chunk_idx, chunk) in items.chunks(CHUNK_SIZE).enumerate() {
            let tx = self.conn.transaction().map_err(|e| e.to_string())?;

            {
                // ── Tối ưu 2: Prepared Statement — compile SQL 1 lần cho cả chunk ──
                // ── Tối ưu 1: INSERT OR REPLACE — không cần SELECT EXISTS ───────────
                let mut stmt = tx
                    .prepare(
                        "INSERT OR REPLACE INTO materials
                         (code, barcode, name, parent_code, parent_name, unit, currency,
                          warehouse, valuation_method, features, taxable, mrp_mps,
                          calculate_inventory, start_date, end_date, image_data, created_at)
                         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)",
                    )
                    .map_err(|e| e.to_string())?;

                for item in chunk.iter() {
                    stmt.execute(rusqlite::params![
                        item.code,
                        item.barcode,
                        item.name,
                        item.parent_code,
                        item.parent_name,
                        item.unit,
                        item.currency,
                        item.warehouse,
                        item.valuation_method,
                        item.features,
                        item.taxable,
                        item.mrp_mps,
                        item.calculate_inventory,
                        item.start_date,
                        item.end_date,
                        item.image_data,
                        now
                    ])
                    .map_err(|e| e.to_string())?;
                }
            } // stmt dropped ở đây — bắt buộc trước khi gọi tx.commit()

            tx.commit().map_err(|e| e.to_string())?;

            // ── Tối ưu 4: Emit progress event sau mỗi chunk ─────────────────────────
            let processed = ((chunk_idx + 1) * CHUNK_SIZE).min(total);
            let percent = (processed as f64 / total as f64 * 100.0) as u32;
            let _ = app_handle.emit(
                "import_materials_progress",
                serde_json::json!({
                    "processed": processed,
                    "total": total,
                    "percent": percent,
                }),
            );
        }

        Ok(format!("Import thành công {} vật tư.", total))
    }
}
