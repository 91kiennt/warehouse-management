use rusqlite::{params, Result};

use crate::db::connection::Database;
use crate::db::unit_settings::models::UnitSettings;

impl Database {
    pub fn get_unit_settings(&self) -> Result<Option<UnitSettings>> {
        let mut stmt = self.conn.prepare(
            "SELECT parent_org, parent_org_short, sub_org, sub_org_short, doc_prefix, settlement_warehouse FROM unit_settings LIMIT 1"
        )?;
        let mut rows = stmt.query([])?;
        if let Some(row) = rows.next()? {
            Ok(Some(UnitSettings {
                parent_org: row.get(0)?,
                parent_org_short: row.get(1)?,
                sub_org: row.get(2)?,
                sub_org_short: row.get(3)?,
                doc_prefix: row.get(4)?,
                settlement_warehouse: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn save_unit_settings(&self, settings: UnitSettings) -> Result<UnitSettings> {
        let created_at = chrono::Utc::now().to_rfc3339();
        let exists: bool = self.conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM unit_settings WHERE id = 1)",
            [],
            |row| row.get(0),
        )?;

        if exists {
            self.conn.execute(
                "UPDATE unit_settings SET 
                    parent_org = ?1, 
                    parent_org_short = ?2, 
                    sub_org = ?3, 
                    sub_org_short = ?4, 
                    doc_prefix = ?5,
                    settlement_warehouse = ?6
                 WHERE id = 1",
                params![
                    settings.parent_org,
                    settings.parent_org_short,
                    settings.sub_org,
                    settings.sub_org_short,
                    settings.doc_prefix,
                    settings.settlement_warehouse,
                ],
            )?;
        } else {
            self.conn.execute(
                "INSERT INTO unit_settings (
                    id, 
                    parent_org, 
                    parent_org_short, 
                    sub_org, 
                    sub_org_short, 
                    doc_prefix, 
                    settlement_warehouse,
                    created_at
                ) VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    settings.parent_org,
                    settings.parent_org_short,
                    settings.sub_org,
                    settings.sub_org_short,
                    settings.doc_prefix,
                    settings.settlement_warehouse,
                    created_at,
                ],
            )?;
        }
        Ok(settings)
    }
}
