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
}
