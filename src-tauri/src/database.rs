use rusqlite::{params, types::Type, Connection, Error, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerInput {
    pub code: String,
    pub name: String,
    pub address: String,
    pub tax_id: String,
    pub bank_account: String,
    pub bank_name: String,
    pub phone: String,
    pub fax: String,
    pub email: String,
    pub credit_limit: f64,
    pub supervisor: String,
    pub start_date: String,
    pub end_date: String,
    pub permanent_residence: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedCustomer {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub address: String,
    pub tax_id: String,
    pub bank_account: String,
    pub bank_name: String,
    pub phone: String,
    pub fax: String,
    pub email: String,
    pub credit_limit: f64,
    pub supervisor: String,
    pub start_date: String,
    pub end_date: String,
    pub permanent_residence: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SupplyInput {
    pub code: String,
    pub name: String,
    pub parent_warehouse: String,
    pub start_date: String,
    pub end_date: String,
    pub manager: String,
    pub location: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedSupply {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub parent_warehouse: String,
    pub start_date: String,
    pub end_date: String,
    pub manager: String,
    pub location: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmployeeInput {
    pub code: String,
    pub name: String,
    #[serde(alias = "date_of_birth")]
    pub date_of_birth: String,
    pub address: String,
    pub phone: String,
    pub fax: String,
    pub email: String,
    #[serde(alias = "id_number")]
    pub id_number: String,
    #[serde(alias = "id_issued_date")]
    pub id_issued_date: String,
    #[serde(alias = "id_issued_place")]
    pub id_issued_place: String,
    pub gender: String,
    pub superior: String,
    #[serde(alias = "effective_from_date")]
    pub effective_from_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedEmployee {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub date_of_birth: String,
    pub address: String,
    pub phone: String,
    pub fax: String,
    pub email: String,
    pub id_number: String,
    pub id_issued_date: String,
    pub id_issued_place: String,
    pub gender: String,
    pub superior: String,
    pub effective_from_date: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportItem {
    pub product: String,
    pub quantity: i64,
    pub price: f64,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportData {
    pub warehouse: String,
    pub manager: String,
    pub date: String,
    pub notes: String,
    pub items: Vec<ReportItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportInput {
    pub template: String,
    pub title: String,
    pub data: ReportData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SavedReport {
    pub id: i64,
    pub template: String,
    pub title: String,
    pub data: ReportData,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MaterialInput {
    pub code: String,
    pub barcode: String,
    pub name: String,
    pub parent_code: String,
    pub parent_name: String,
    pub unit: String,
    pub currency: String,
    pub warehouse: String,
    pub valuation_method: String,
    pub features: String,
    pub taxable: String,
    pub mrp_mps: i64,
    pub calculate_inventory: i64,
    pub start_date: String,
    pub end_date: String,
    pub image_data: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedMaterial {
    pub id: i64,
    pub code: String,
    pub barcode: String,
    pub name: String,
    pub parent_code: String,
    pub parent_name: String,
    pub unit: String,
    pub currency: String,
    pub warehouse: String,
    pub valuation_method: String,
    pub features: String,
    pub taxable: String,
    pub mrp_mps: i64,
    pub calculate_inventory: i64,
    pub start_date: String,
    pub end_date: String,
    pub image_data: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedCustomers {
    pub items: Vec<SavedCustomer>,
    pub total: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedSupplies {
    pub items: Vec<SavedSupply>,
    pub total: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedMaterials {
    pub items: Vec<SavedMaterial>,
    pub total: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WarehouseReceiptInput {
    pub receipt_number: String,
    pub posting_date: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub description: String,
    pub delivery_person: String,
    pub accompanied_doc: String,
    pub department: String,
    pub reason: String,
    pub warehouse_location: String,
    pub items: String, // JSON serialized list of items
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedWarehouseReceipt {
    pub id: i64,
    pub receipt_number: String,
    pub posting_date: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub description: String,
    pub delivery_person: String,
    pub accompanied_doc: String,
    pub department: String,
    pub reason: String,
    pub warehouse_location: String,
    pub items: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WarehouseIssueInput {
    pub issue_number: String,
    pub posting_date: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub description: String,
    pub accompanied_doc: String,
    pub receiver_name: String,
    pub department: String,
    pub reason: String,
    pub warehouse_location: String,
    pub items: String, // JSON serialized list of items
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedWarehouseIssue {
    pub id: i64,
    pub issue_number: String,
    pub posting_date: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub description: String,
    pub accompanied_doc: String,
    pub receiver_name: String,
    pub department: String,
    pub reason: String,
    pub warehouse_location: String,
    pub items: String,
    pub created_at: String,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn open(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Database { conn };
        db.migrate()?;
        Ok(db)
    }

    fn migrate(&self) -> Result<()> {
        let mut version: i32 = self.conn.query_row("PRAGMA user_version", [], |row| row.get(0))?;

        if version < 1 {
            self.conn.execute_batch(
                "CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code TEXT NOT NULL,
                    name TEXT NOT NULL,
                    address TEXT NOT NULL,
                    tax_id TEXT NOT NULL,
                    bank_account TEXT NOT NULL,
                    bank_name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    fax TEXT NOT NULL,
                    email TEXT NOT NULL,
                    credit_limit REAL NOT NULL,
                    supervisor TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    permanent_residence TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS supplies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code TEXT NOT NULL,
                    name TEXT NOT NULL,
                    parent_warehouse TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    manager TEXT NOT NULL,
                    location TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS employees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code TEXT NOT NULL,
                    name TEXT NOT NULL,
                    date_of_birth TEXT NOT NULL,
                    address TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    fax TEXT NOT NULL,
                    email TEXT NOT NULL,
                    id_number TEXT NOT NULL,
                    id_issued_date TEXT NOT NULL,
                    id_issued_place TEXT NOT NULL,
                    gender TEXT NOT NULL,
                    superior TEXT NOT NULL,
                    effective_from_date TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    template TEXT NOT NULL,
                    title TEXT NOT NULL,
                    data TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS materials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code TEXT NOT NULL,
                    barcode TEXT NOT NULL,
                    name TEXT NOT NULL,
                    parent_code TEXT NOT NULL,
                    parent_name TEXT NOT NULL,
                    unit TEXT NOT NULL,
                    currency TEXT NOT NULL,
                    warehouse TEXT NOT NULL,
                    valuation_method TEXT NOT NULL,
                    features TEXT NOT NULL,
                    taxable TEXT NOT NULL,
                    mrp_mps INTEGER NOT NULL,
                    calculate_inventory INTEGER NOT NULL DEFAULT 1,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    image_data TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS warehouse_receipts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    receipt_number TEXT NOT NULL,
                    posting_date TEXT NOT NULL,
                    invoice_number TEXT NOT NULL,
                    invoice_date TEXT NOT NULL,
                    description TEXT NOT NULL,
                    delivery_person TEXT NOT NULL DEFAULT '',
                    accompanied_doc TEXT NOT NULL DEFAULT '',
                    department TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    warehouse_location TEXT NOT NULL,
                    items TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS warehouse_issues (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    issue_number TEXT NOT NULL,
                    posting_date TEXT NOT NULL,
                    invoice_number TEXT NOT NULL,
                    invoice_date TEXT NOT NULL,
                    description TEXT NOT NULL,
                    accompanied_doc TEXT NOT NULL DEFAULT '',
                    receiver_name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    warehouse_location TEXT NOT NULL,
                    items TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );",
            )?;

            self.conn.execute("PRAGMA user_version = 1", [])?;
            version = 1;
            println!("[TAURI BE migrate] Database migrated to Version 1 (Initial schema created)");
        }

        if version < 2 {
            // Migrate customers table to add extra fields required for EmployeeManagerModal
            let _ = self.conn.execute(
                "ALTER TABLE customers ADD COLUMN date_of_birth TEXT NOT NULL DEFAULT ''",
                [],
            );
            let _ = self.conn.execute(
                "ALTER TABLE customers ADD COLUMN id_number TEXT NOT NULL DEFAULT ''",
                [],
            );
            let _ = self.conn.execute(
                "ALTER TABLE customers ADD COLUMN id_issued_date TEXT NOT NULL DEFAULT ''",
                [],
            );
            let _ = self.conn.execute(
                "ALTER TABLE customers ADD COLUMN id_issued_place TEXT NOT NULL DEFAULT ''",
                [],
            );
            let _ = self.conn.execute(
                "ALTER TABLE customers ADD COLUMN gender TEXT NOT NULL DEFAULT ''",
                [],
            );

            // Migrate warehouse tables to add delivery_person and accompanied_doc fields
            let _ = self.conn.execute(
                "ALTER TABLE warehouse_receipts ADD COLUMN delivery_person TEXT NOT NULL DEFAULT ''",
                [],
            );
            let _ = self.conn.execute(
                "ALTER TABLE warehouse_receipts ADD COLUMN accompanied_doc TEXT NOT NULL DEFAULT ''",
                [],
            );
            let _ = self.conn.execute(
                "ALTER TABLE warehouse_issues ADD COLUMN accompanied_doc TEXT NOT NULL DEFAULT ''",
                [],
            );

            // Drop status column from warehouse tables if they exist
            if let Err(e) = self.conn.execute("ALTER TABLE warehouse_receipts DROP COLUMN status", []) {
                println!("[TAURI BE migrate] Info: Alter table warehouse_receipts DROP COLUMN status returned/failed (ignore if column didn't exist): {:?}", e);
            } else {
                println!("[TAURI BE migrate] Success: Alter table warehouse_receipts DROP COLUMN status");
            }
            if let Err(e) = self.conn.execute("ALTER TABLE warehouse_issues DROP COLUMN status", []) {
                println!("[TAURI BE migrate] Info: Alter table warehouse_issues DROP COLUMN status returned/failed (ignore if column didn't exist): {:?}", e);
            } else {
                println!("[TAURI BE migrate] Success: Alter table warehouse_issues DROP COLUMN status");
            }

            self.conn.execute("PRAGMA user_version = 2", [])?;
            println!("[TAURI BE migrate] Database migrated to Version 2 (Dynamic fields and status drops processed)");
        }

        Ok(())
    }

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

    pub fn list_materials_paginated(&self, limit: i64, offset: i64) -> Result<PaginatedMaterials> {
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
