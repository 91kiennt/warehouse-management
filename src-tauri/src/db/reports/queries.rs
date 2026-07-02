use rusqlite::{params, types::Type, Error, Result};

use crate::db::connection::Database;
use crate::db::reports::models::{ReportData, ReportInput, SavedReport};

impl Database {
    pub fn save_report(&self, report: ReportInput) -> Result<SavedReport> {
        let data_json = serde_json::to_string(&report.data)
            .map_err(|e| Error::ToSqlConversionFailure(Box::new(e)))?;
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO reports (template, title, data, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![report.template, report.title, data_json, created_at],
        )?;

        let id = self.conn.last_insert_rowid();
        Ok(SavedReport {
            id,
            template: report.template,
            title: report.title,
            data: report.data,
            created_at,
        })
    }

    pub fn list_reports(&self) -> Result<Vec<SavedReport>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, template, title, data, created_at FROM reports ORDER BY id DESC",
        )?;
        let rows = stmt.query_map([], |row| {
            let data_json: String = row.get(3)?;
            let data: ReportData = serde_json::from_str(&data_json)
                .map_err(|e| Error::FromSqlConversionFailure(3, Type::Text, Box::new(e)))?;
            Ok(SavedReport {
                id: row.get(0)?,
                template: row.get(1)?,
                title: row.get(2)?,
                data,
                created_at: row.get(4)?,
            })
        })?;

        rows.collect()
    }
}
