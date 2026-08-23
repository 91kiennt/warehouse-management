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
    /// Import hàng loạt vật tư từ Excel với 4 lớp tối ưu hiệu năng:
    /// 1. INSERT OR REPLACE thay vì SELECT EXISTS + UPDATE/INSERT (giảm 50% số query)
    /// 2. Prepared Statement compile SQL 1 lần/chunk
    /// 3. WAL + PRAGMA đã được bật ở migration v5
    /// 4. HashSet warehouse validation O(1) + Master Receipt merge cho tồn kho đầu kỳ
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

        // Validate tất cả dữ liệu trước khi bắt đầu bất kỳ transaction nào
        for (idx, item) in items.iter().enumerate() {
            let row_num = idx + 2; // +2 vì dòng 1 là header Excel

            if item.code.trim().is_empty() {
                return Err(format!("Dòng {}: Mã vật tư không được để trống.", row_num));
            }

            if !valid_warehouses.contains(&item.warehouse) {
                return Err(format!(
                    "Dòng {}: Mã kho '{}' không tồn tại trong hệ thống.",
                    row_num, item.warehouse
                ));
            }

            if let Some(stock) = item.opening_stock {
                if stock < 0.0 {
                    return Err(format!(
                        "Dòng {}: Số lượng tồn không được là số âm (giá trị: {}).",
                        row_num, stock
                    ));
                }
            }
        }

        // ── Phase 1: Upsert Materials (10% → 60%) ────────────────────────────────────
        const CHUNK_SIZE: usize = 500;
        let num_chunks = (total + CHUNK_SIZE - 1) / CHUNK_SIZE;

        for (chunk_idx, chunk) in items.chunks(CHUNK_SIZE).enumerate() {
            let tx = self.conn.transaction().map_err(|e| e.to_string())?;

            {
                // Prepared Statement — compile SQL 1 lần cho cả chunk
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
            } // stmt dropped trước khi commit

            tx.commit().map_err(|e| e.to_string())?;

            // Emit progress cho Phase 1: từ 10% đến 60%
            let progress_percent = 10 + (((chunk_idx + 1) as f64 / num_chunks as f64) * 50.0) as u32;
            let _ = app_handle.emit(
                "import_materials_progress",
                serde_json::json!({
                    "processed": ((chunk_idx + 1) * CHUNK_SIZE).min(total),
                    "total": total,
                    "percent": progress_percent.min(60),
                }),
            );
        }

        // ── Phase 2: Merge Phiếu Tồn Đầu Kỳ Master (60% → 90%) ───────────────────────
        #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
        #[serde(rename_all = "camelCase")]
        struct ReceiptItemDto {
            pub warehouse: String,
            pub material_code: String,
            pub material_name: String,
            pub unit: String,
            #[serde(default)]
            pub stock_qty: f64,
            #[serde(default)]
            pub quantity_doc: f64,
            #[serde(default)]
            pub quantity_real: f64,
            #[serde(default)]
            pub price: f64,
            #[serde(default)]
            pub amount: f64,
            #[serde(default)]
            pub amount_after_tax: f64,
            #[serde(default)]
            pub composition: String,
        }

        let stock_items: Vec<&MaterialInput> = items
            .iter()
            .filter(|i| i.opening_stock.unwrap_or(0.0) > 0.0)
            .collect();

        let stock_count = stock_items.len();

        if stock_count > 0 {
            let _ = app_handle.emit(
                "import_materials_progress",
                serde_json::json!({
                    "processed": total,
                    "total": total,
                    "percent": 75,
                }),
            );

            // Kiểm tra xem đã có phiếu Master "Tồn đầu kỳ" trong hệ thống chưa
            let existing_receipt: Option<(i64, String)> = self
                .conn
                .query_row(
                    "SELECT id, items FROM warehouse_receipts WHERE reason = 'Tồn đầu kỳ' LIMIT 1",
                    [],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .ok();

            if let Some((existing_id, items_json_str)) = existing_receipt {
                // Đã có phiếu Master → Deserialize và Merge
                let mut receipt_items: Vec<ReceiptItemDto> =
                    serde_json::from_str(&items_json_str).unwrap_or_default();

                for item in stock_items.iter() {
                    let stock = item.opening_stock.unwrap_or(0.0);
                    if let Some(existing_entry) = receipt_items.iter_mut().find(|e| {
                        e.material_code.eq_ignore_ascii_case(&item.code)
                            && e.warehouse.eq_ignore_ascii_case(&item.warehouse)
                    }) {
                        // Case 3: Cập nhật số lượng tồn trong phiếu Master
                        existing_entry.quantity_real = stock;
                        existing_entry.quantity_doc = stock;
                        existing_entry.material_name = item.name.clone();
                        existing_entry.unit = item.unit.clone();
                    } else {
                        // Case 1: Thêm dòng mới vào phiếu Master
                        receipt_items.push(ReceiptItemDto {
                            warehouse: item.warehouse.clone(),
                            material_code: item.code.clone(),
                            material_name: item.name.clone(),
                            unit: item.unit.clone(),
                            stock_qty: 0.0,
                            quantity_doc: stock,
                            quantity_real: stock,
                            price: 0.0,
                            amount: 0.0,
                            amount_after_tax: 0.0,
                            composition: String::new(),
                        });
                    }
                }

                let updated_items_json =
                    serde_json::to_string(&receipt_items).map_err(|e| e.to_string())?;

                self.conn
                    .execute(
                        "UPDATE warehouse_receipts SET items = ?1 WHERE id = ?2",
                        rusqlite::params![updated_items_json, existing_id],
                    )
                    .map_err(|e| e.to_string())?;
            } else {
                // Chưa có phiếu Master → Tạo phiếu nhập đầu kỳ mới
                let receipt_items: Vec<ReceiptItemDto> = stock_items
                    .iter()
                    .map(|item| {
                        let stock = item.opening_stock.unwrap_or(0.0);
                        ReceiptItemDto {
                            warehouse: item.warehouse.clone(),
                            material_code: item.code.clone(),
                            material_name: item.name.clone(),
                            unit: item.unit.clone(),
                            stock_qty: 0.0,
                            quantity_doc: stock,
                            quantity_real: stock,
                            price: 0.0,
                            amount: 0.0,
                            amount_after_tax: 0.0,
                            composition: String::new(),
                        }
                    })
                    .collect();

                let items_json =
                    serde_json::to_string(&receipt_items).map_err(|e| e.to_string())?;
                let receipt_num = format!("DK-{}", chrono::Local::now().format("%Y%m%d%H%M%S"));
                let posting_date = chrono::Local::now().format("%Y-%m-%d").to_string();

                self.conn
                    .execute(
                        "INSERT INTO warehouse_receipts (
                            receipt_number,
                            posting_date,
                            invoice_number,
                            invoice_date,
                            description,
                            delivery_person,
                            accompanied_doc,
                            department,
                            reason,
                            warehouse_location,
                            items,
                            created_at
                        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                        rusqlite::params![
                            receipt_num,
                            posting_date,
                            "",
                            posting_date,
                            "Nhập tồn kho đầu kỳ - Import từ Excel",
                            "",
                            "",
                            "",
                            "Tồn đầu kỳ",
                            "",
                            items_json,
                            now,
                        ],
                    )
                    .map_err(|e| e.to_string())?;
            }
        }

        // ── Hoàn tất (100%) ─────────────────────────────────────────────────────────
        let _ = app_handle.emit(
            "import_materials_progress",
            serde_json::json!({
                "processed": total,
                "total": total,
                "percent": 100,
            }),
        );

        if stock_count > 0 {
            Ok(format!(
                "Import thành công {} vật tư. Đã cập nhật phiếu tồn đầu kỳ ({} vật tư có số lượng tồn).",
                total, stock_count
            ))
        } else {
            Ok(format!("Import thành công {} vật tư.", total))
        }
    }
}
