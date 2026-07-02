use rusqlite::{params, Result};

use crate::db::connection::Database;
use crate::db::customers::models::{CustomerInput, PaginatedCustomers, SavedCustomer};

impl Database {
    pub fn save_customer(&self, customer: CustomerInput) -> Result<SavedCustomer> {
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO customers (
                code,
                name,
                address,
                tax_id,
                bank_account,
                bank_name,
                phone,
                fax,
                email,
                credit_limit,
                supervisor,
                start_date,
                end_date,
                permanent_residence,
                created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                customer.code,
                customer.name,
                customer.address,
                customer.tax_id,
                customer.bank_account,
                customer.bank_name,
                customer.phone,
                customer.fax,
                customer.email,
                customer.credit_limit,
                customer.supervisor,
                customer.start_date,
                customer.end_date,
                customer.permanent_residence,
                created_at,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        Ok(SavedCustomer {
            id,
            code: customer.code,
            name: customer.name,
            address: customer.address,
            tax_id: customer.tax_id,
            bank_account: customer.bank_account,
            bank_name: customer.bank_name,
            phone: customer.phone,
            fax: customer.fax,
            email: customer.email,
            credit_limit: customer.credit_limit,
            supervisor: customer.supervisor,
            start_date: customer.start_date,
            end_date: customer.end_date,
            permanent_residence: customer.permanent_residence,
            created_at,
        })
    }

    pub fn list_customers(&self) -> Result<Vec<SavedCustomer>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, code, name, address, tax_id, bank_account, bank_name, phone, fax, email, credit_limit, supervisor, start_date, end_date, permanent_residence, created_at FROM customers ORDER BY id ASC",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(SavedCustomer {
                id: row.get(0)?,
                code: row.get(1)?,
                name: row.get(2)?,
                address: row.get(3)?,
                tax_id: row.get(4)?,
                bank_account: row.get(5)?,
                bank_name: row.get(6)?,
                phone: row.get(7)?,
                fax: row.get(8)?,
                email: row.get(9)?,
                credit_limit: row.get(10)?,
                supervisor: row.get(11)?,
                start_date: row.get(12)?,
                end_date: row.get(13)?,
                permanent_residence: row.get(14)?,
                created_at: row.get(15)?,
            })
        })?;

        rows.collect()
    }

    pub fn list_customers_paginated(&self, limit: i64, offset: i64) -> Result<PaginatedCustomers> {
        let mut stmt = self.conn.prepare(
            "SELECT id, code, name, address, tax_id, bank_account, bank_name, phone, fax, email, credit_limit, supervisor, start_date, end_date, permanent_residence, created_at FROM customers ORDER BY id ASC LIMIT ?1 OFFSET ?2",
        )?;
        let rows = stmt.query_map(params![limit, offset], |row| {
            Ok(SavedCustomer {
                id: row.get(0)?,
                code: row.get(1)?,
                name: row.get(2)?,
                address: row.get(3)?,
                tax_id: row.get(4)?,
                bank_account: row.get(5)?,
                bank_name: row.get(6)?,
                phone: row.get(7)?,
                fax: row.get(8)?,
                email: row.get(9)?,
                credit_limit: row.get(10)?,
                supervisor: row.get(11)?,
                start_date: row.get(12)?,
                end_date: row.get(13)?,
                permanent_residence: row.get(14)?,
                created_at: row.get(15)?,
            })
        })?;

        let mut items = Vec::new();
        for r in rows {
            items.push(r?);
        }

        let total: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM customers",
            [],
            |row| row.get(0),
        )?;

        Ok(PaginatedCustomers { items, total })
    }

    pub fn get_customer(&self, id: i64) -> Result<SavedCustomer> {
        self.conn.query_row(
            "SELECT id, code, name, address, tax_id, bank_account, bank_name, phone, fax, email, credit_limit, supervisor, start_date, end_date, permanent_residence, created_at FROM customers WHERE id = ?1",
            params![id],
            |row| {
                Ok(SavedCustomer {
                    id: row.get(0)?,
                    code: row.get(1)?,
                    name: row.get(2)?,
                    address: row.get(3)?,
                    tax_id: row.get(4)?,
                    bank_account: row.get(5)?,
                    bank_name: row.get(6)?,
                    phone: row.get(7)?,
                    fax: row.get(8)?,
                    email: row.get(9)?,
                    credit_limit: row.get(10)?,
                    supervisor: row.get(11)?,
                    start_date: row.get(12)?,
                    end_date: row.get(13)?,
                    permanent_residence: row.get(14)?,
                    created_at: row.get(15)?,
                })
            },
        )
    }

    pub fn update_customer(&self, id: i64, customer: CustomerInput) -> Result<SavedCustomer> {
        self.conn.execute(
            "UPDATE customers SET code = ?1, name = ?2, address = ?3, tax_id = ?4, bank_account = ?5, bank_name = ?6, phone = ?7, fax = ?8, email = ?9, credit_limit = ?10, supervisor = ?11, start_date = ?12, end_date = ?13, permanent_residence = ?14 WHERE id = ?15",
            params![
                customer.code,
                customer.name,
                customer.address,
                customer.tax_id,
                customer.bank_account,
                customer.bank_name,
                customer.phone,
                customer.fax,
                customer.email,
                customer.credit_limit,
                customer.supervisor,
                customer.start_date,
                customer.end_date,
                customer.permanent_residence,
                id,
            ],
        )?;
        self.get_customer(id)
    }

    pub fn delete_customer(&self, id: i64) -> Result<()> {
        self.conn
            .execute("DELETE FROM customers WHERE id = ?1", params![id])?;
        Ok(())
    }
}
