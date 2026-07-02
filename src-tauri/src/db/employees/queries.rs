use rusqlite::{params, Result};

use crate::db::connection::Database;
use crate::db::employees::models::{EmployeeInput, SavedEmployee};

impl Database {
    pub fn save_employee(&self, employee: EmployeeInput) -> Result<SavedEmployee> {
        let created_at = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO customers (
                code,
                name,
                date_of_birth,
                address,
                phone,
                fax,
                email,
                id_number,
                id_issued_date,
                id_issued_place,
                gender,
                supervisor,
                start_date,
                tax_id,
                bank_account,
                bank_name,
                credit_limit,
                end_date,
                permanent_residence,
                created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, '', '', '', 0.0, '', '', ?14)",
            params![
                employee.code,
                employee.name,
                employee.date_of_birth,
                employee.address,
                employee.phone,
                employee.fax,
                employee.email,
                employee.id_number,
                employee.id_issued_date,
                employee.id_issued_place,
                employee.gender,
                employee.superior,
                employee.effective_from_date,
                created_at,
            ],
        )?;

        let id = self.conn.last_insert_rowid();
        Ok(SavedEmployee {
            id,
            code: employee.code,
            name: employee.name,
            date_of_birth: employee.date_of_birth,
            address: employee.address,
            phone: employee.phone,
            fax: employee.fax,
            email: employee.email,
            id_number: employee.id_number,
            id_issued_date: employee.id_issued_date,
            id_issued_place: employee.id_issued_place,
            gender: employee.gender,
            superior: employee.superior,
            effective_from_date: employee.effective_from_date,
            created_at,
        })
    }

    pub fn get_employee_by_code(&self, code: &str) -> Result<SavedEmployee> {
        self.conn.query_row(
            "SELECT id, code, name, date_of_birth, address, phone, fax, email, id_number, id_issued_date, id_issued_place, gender, supervisor, start_date, created_at FROM customers WHERE code = ?1",
            params![code],
            |row| {
                Ok(SavedEmployee {
                    id: row.get(0)?,
                    code: row.get(1)?,
                    name: row.get(2)?,
                    date_of_birth: row.get(3)?,
                    address: row.get(4)?,
                    phone: row.get(5)?,
                    fax: row.get(6)?,
                    email: row.get(7)?,
                    id_number: row.get(8)?,
                    id_issued_date: row.get(9)?,
                    id_issued_place: row.get(10)?,
                    gender: row.get(11)?,
                    superior: row.get(12)?,
                    effective_from_date: row.get(13)?,
                    created_at: row.get(14)?,
                })
            },
        )
    }

    pub fn update_employee(&self, id: i64, employee: EmployeeInput) -> Result<SavedEmployee> {
        self.conn.execute(
            "UPDATE customers SET 
                code = ?1, 
                name = ?2, 
                date_of_birth = ?3, 
                address = ?4, 
                phone = ?5, 
                fax = ?6, 
                email = ?7, 
                id_number = ?8, 
                id_issued_date = ?9, 
                id_issued_place = ?10, 
                gender = ?11, 
                supervisor = ?12, 
                start_date = ?13 
            WHERE id = ?14",
            params![
                employee.code,
                employee.name,
                employee.date_of_birth,
                employee.address,
                employee.phone,
                employee.fax,
                employee.email,
                employee.id_number,
                employee.id_issued_date,
                employee.id_issued_place,
                employee.gender,
                employee.superior,
                employee.effective_from_date,
                id,
            ],
        )?;
        self.conn.query_row(
            "SELECT id, code, name, date_of_birth, address, phone, fax, email, id_number, id_issued_date, id_issued_place, gender, supervisor, start_date, created_at FROM customers WHERE id = ?1",
            params![id],
            |row| {
                Ok(SavedEmployee {
                    id: row.get(0)?,
                    code: row.get(1)?,
                    name: row.get(2)?,
                    date_of_birth: row.get(3)?,
                    address: row.get(4)?,
                    phone: row.get(5)?,
                    fax: row.get(6)?,
                    email: row.get(7)?,
                    id_number: row.get(8)?,
                    id_issued_date: row.get(9)?,
                    id_issued_place: row.get(10)?,
                    gender: row.get(11)?,
                    superior: row.get(12)?,
                    effective_from_date: row.get(13)?,
                    created_at: row.get(14)?,
                })
            },
        )
    }
}
