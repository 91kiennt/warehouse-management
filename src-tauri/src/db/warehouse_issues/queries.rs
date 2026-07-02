use rusqlite::{params, Result};

use crate::db::connection::Database;
use crate::db::warehouse_issues::models::{SavedWarehouseIssue, WarehouseIssueInput};

impl Database {
    pub fn save_warehouse_issue(
        &self,
        issue: WarehouseIssueInput,
    ) -> Result<SavedWarehouseIssue> {
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO warehouse_issues (
                issue_number,
                posting_date,
                invoice_number,
                invoice_date,
                description,
                accompanied_doc,
                receiver_name,
                department,
                reason,
                warehouse_location,
                items,
                created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                issue.issue_number,
                issue.posting_date,
                issue.invoice_number,
                issue.invoice_date,
                issue.description,
                issue.accompanied_doc,
                issue.receiver_name,
                issue.department,
                issue.reason,
                issue.warehouse_location,
                issue.items,
                created_at,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        self.get_warehouse_issue(id)
    }

    pub fn list_warehouse_issues(&self) -> Result<Vec<SavedWarehouseIssue>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, issue_number, posting_date, invoice_number, invoice_date, description, accompanied_doc, receiver_name, department, reason, warehouse_location, items, created_at FROM warehouse_issues",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(SavedWarehouseIssue {
                id: row.get(0)?,
                issue_number: row.get(1)?,
                posting_date: row.get(2)?,
                invoice_number: row.get(3)?,
                invoice_date: row.get(4)?,
                description: row.get(5)?,
                accompanied_doc: row.get(6)?,
                receiver_name: row.get(7)?,
                department: row.get(8)?,
                reason: row.get(9)?,
                warehouse_location: row.get(10)?,
                items: row.get(11)?,
                created_at: row.get(12)?,
            })
        })?;

        rows.collect()
    }

    pub fn get_warehouse_issue(&self, id: i64) -> Result<SavedWarehouseIssue> {
        self.conn.query_row(
            "SELECT id, issue_number, posting_date, invoice_number, invoice_date, description, accompanied_doc, receiver_name, department, reason, warehouse_location, items, created_at FROM warehouse_issues WHERE id = ?1",
            params![id],
            |row| {
                Ok(SavedWarehouseIssue {
                    id: row.get(0)?,
                    issue_number: row.get(1)?,
                    posting_date: row.get(2)?,
                    invoice_number: row.get(3)?,
                    invoice_date: row.get(4)?,
                    description: row.get(5)?,
                    accompanied_doc: row.get(6)?,
                    receiver_name: row.get(7)?,
                    department: row.get(8)?,
                    reason: row.get(9)?,
                    warehouse_location: row.get(10)?,
                    items: row.get(11)?,
                    created_at: row.get(12)?,
                })
            },
        )
    }

    pub fn update_warehouse_issue(
        &self,
        id: i64,
        issue: WarehouseIssueInput,
    ) -> Result<SavedWarehouseIssue> {
        self.conn.execute(
            "UPDATE warehouse_issues SET
                issue_number = ?1,
                posting_date = ?2,
                invoice_number = ?3,
                invoice_date = ?4,
                description = ?5,
                accompanied_doc = ?6,
                receiver_name = ?7,
                department = ?8,
                reason = ?9,
                warehouse_location = ?10,
                items = ?11
            WHERE id = ?12",
            params![
                issue.issue_number,
                issue.posting_date,
                issue.invoice_number,
                issue.invoice_date,
                issue.description,
                issue.accompanied_doc,
                issue.receiver_name,
                issue.department,
                issue.reason,
                issue.warehouse_location,
                issue.items,
                id,
            ],
        )?;
        self.get_warehouse_issue(id)
    }

    pub fn delete_warehouse_issue(&self, id: i64) -> Result<()> {
        self.conn
            .execute("DELETE FROM warehouse_issues WHERE id = ?1", params![id])?;
        Ok(())
    }
}
