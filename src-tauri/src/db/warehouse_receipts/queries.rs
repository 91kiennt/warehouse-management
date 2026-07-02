use rusqlite::{params, Result};

use crate::db::connection::Database;
use crate::db::warehouse_receipts::models::{SavedWarehouseReceipt, WarehouseReceiptInput};

impl Database {
    pub fn save_warehouse_receipt(
        &self,
        receipt: WarehouseReceiptInput,
    ) -> Result<SavedWarehouseReceipt> {
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
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
            params![
                receipt.receipt_number,
                receipt.posting_date,
                receipt.invoice_number,
                receipt.invoice_date,
                receipt.description,
                receipt.delivery_person,
                receipt.accompanied_doc,
                receipt.department,
                receipt.reason,
                receipt.warehouse_location,
                receipt.items,
                created_at,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        self.get_warehouse_receipt(id)
    }

    pub fn list_warehouse_receipts(&self) -> Result<Vec<SavedWarehouseReceipt>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, receipt_number, posting_date, invoice_number, invoice_date, description, delivery_person, accompanied_doc, department, reason, warehouse_location, items, created_at FROM warehouse_receipts",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(SavedWarehouseReceipt {
                id: row.get(0)?,
                receipt_number: row.get(1)?,
                posting_date: row.get(2)?,
                invoice_number: row.get(3)?,
                invoice_date: row.get(4)?,
                description: row.get(5)?,
                delivery_person: row.get(6)?,
                accompanied_doc: row.get(7)?,
                department: row.get(8)?,
                reason: row.get(9)?,
                warehouse_location: row.get(10)?,
                items: row.get(11)?,
                created_at: row.get(12)?,
            })
        })?;

        rows.collect()
    }

    pub fn get_warehouse_receipt(&self, id: i64) -> Result<SavedWarehouseReceipt> {
        self.conn.query_row(
            "SELECT id, receipt_number, posting_date, invoice_number, invoice_date, description, delivery_person, accompanied_doc, department, reason, warehouse_location, items, created_at FROM warehouse_receipts WHERE id = ?1",
            params![id],
            |row| {
                Ok(SavedWarehouseReceipt {
                    id: row.get(0)?,
                    receipt_number: row.get(1)?,
                    posting_date: row.get(2)?,
                    invoice_number: row.get(3)?,
                    invoice_date: row.get(4)?,
                    description: row.get(5)?,
                    delivery_person: row.get(6)?,
                    accompanied_doc: row.get(7)?,
                    department: row.get(8)?,
                    reason: row.get(9)?,
                    warehouse_location: row.get(10)?,
                    items: row.get(11)?,
                    created_at: row.get(12)?,
                })
            },
        )
    }

    pub fn update_warehouse_receipt(
        &self,
        id: i64,
        receipt: WarehouseReceiptInput,
    ) -> Result<SavedWarehouseReceipt> {
        self.conn.execute(
            "UPDATE warehouse_receipts SET
                receipt_number = ?1,
                posting_date = ?2,
                invoice_number = ?3,
                invoice_date = ?4,
                description = ?5,
                delivery_person = ?6,
                accompanied_doc = ?7,
                department = ?8,
                reason = ?9,
                warehouse_location = ?10,
                items = ?11
            WHERE id = ?12",
            params![
                receipt.receipt_number,
                receipt.posting_date,
                receipt.invoice_number,
                receipt.invoice_date,
                receipt.description,
                receipt.delivery_person,
                receipt.accompanied_doc,
                receipt.department,
                receipt.reason,
                receipt.warehouse_location,
                receipt.items,
                id,
            ],
        )?;
        self.get_warehouse_receipt(id)
    }

    pub fn delete_warehouse_receipt(&self, id: i64) -> Result<()> {
        self.conn
            .execute("DELETE FROM warehouse_receipts WHERE id = ?1", params![id])?;
        Ok(())
    }
}
