use rusqlite::{params, Result};

use crate::db::connection::Database;
use crate::db::supplies::models::{PaginatedSupplies, SavedSupply, SupplyInput};

impl Database {
    pub fn save_supply(&self, supply: SupplyInput) -> Result<SavedSupply> {
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO supplies (
                code,
                name,
                parent_warehouse,
                start_date,
                end_date,
                manager,
                location,
                created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                supply.code,
                supply.name,
                supply.parent_warehouse,
                supply.start_date,
                supply.end_date,
                supply.manager,
                supply.location,
                created_at,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        Ok(SavedSupply {
            id,
            code: supply.code,
            name: supply.name,
            parent_warehouse: supply.parent_warehouse,
            start_date: supply.start_date,
            end_date: supply.end_date,
            manager: supply.manager,
            location: supply.location,
            created_at,
        })
    }

    pub fn list_supplies(&self) -> Result<Vec<SavedSupply>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, code, name, parent_warehouse, start_date, end_date, manager, location, created_at FROM supplies ORDER BY id ASC",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(SavedSupply {
                id: row.get(0)?,
                code: row.get(1)?,
                name: row.get(2)?,
                parent_warehouse: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                manager: row.get(6)?,
                location: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?;

        rows.collect()
    }

    pub fn list_supplies_paginated(&self, limit: i64, offset: i64) -> Result<PaginatedSupplies> {
        let mut stmt = self.conn.prepare(
            "SELECT id, code, name, parent_warehouse, start_date, end_date, manager, location, created_at FROM supplies ORDER BY id ASC LIMIT ?1 OFFSET ?2",
        )?;
        let rows = stmt.query_map(params![limit, offset], |row| {
            Ok(SavedSupply {
                id: row.get(0)?,
                code: row.get(1)?,
                name: row.get(2)?,
                parent_warehouse: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                manager: row.get(6)?,
                location: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?;

        let mut items = Vec::new();
        for r in rows {
            items.push(r?);
        }

        let total: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM supplies",
            [],
            |row| row.get(0),
        )?;

        Ok(PaginatedSupplies { items, total })
    }

    pub fn get_supply(&self, id: i64) -> Result<SavedSupply> {
        self.conn.query_row(
            "SELECT id, code, name, parent_warehouse, start_date, end_date, manager, location, created_at FROM supplies WHERE id = ?1",
            params![id],
            |row| {
                Ok(SavedSupply {
                    id: row.get(0)?,
                    code: row.get(1)?,
                    name: row.get(2)?,
                    parent_warehouse: row.get(3)?,
                    start_date: row.get(4)?,
                    end_date: row.get(5)?,
                    manager: row.get(6)?,
                    location: row.get(7)?,
                    created_at: row.get(8)?,
                })
            },
        )
    }

    pub fn update_supply(&self, id: i64, supply: SupplyInput) -> Result<SavedSupply> {
        self.conn.execute(
            "UPDATE supplies SET code = ?1, name = ?2, parent_warehouse = ?3, start_date = ?4, end_date = ?5, manager = ?6, location = ?7 WHERE id = ?8",
            params![
                supply.code,
                supply.name,
                supply.parent_warehouse,
                supply.start_date,
                supply.end_date,
                supply.manager,
                supply.location,
                id,
            ],
        )?;
        self.get_supply(id)
    }

    pub fn delete_supply(&self, id: i64) -> Result<()> {
        self.conn
            .execute("DELETE FROM supplies WHERE id = ?1", params![id])?;
        Ok(())
    }
}
