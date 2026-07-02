use rusqlite::{Connection, Result};

/// Thực thi tất cả các bước migration từ schema Version 1 → 4.
/// Được gọi ngay khi mở kết nối database trong `Database::open()`.
pub fn migrate(conn: &Connection) -> Result<()> {
    let mut version: i32 = conn.query_row("PRAGMA user_version", [], |row| row.get(0))?;

    if version < 1 {
        conn.execute_batch(
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

        conn.execute("PRAGMA user_version = 1", [])?;
        version = 1;
        println!("[TAURI BE migrate] Database migrated to Version 1 (Initial schema created)");
    }

    if version < 2 {
        // Migrate customers table to add extra fields required for EmployeeManagerModal
        let _ = conn.execute(
            "ALTER TABLE customers ADD COLUMN date_of_birth TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE customers ADD COLUMN id_number TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE customers ADD COLUMN id_issued_date TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE customers ADD COLUMN id_issued_place TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE customers ADD COLUMN gender TEXT NOT NULL DEFAULT ''",
            [],
        );

        // Migrate warehouse tables to add delivery_person and accompanied_doc fields
        let _ = conn.execute(
            "ALTER TABLE warehouse_receipts ADD COLUMN delivery_person TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE warehouse_receipts ADD COLUMN accompanied_doc TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE warehouse_issues ADD COLUMN accompanied_doc TEXT NOT NULL DEFAULT ''",
            [],
        );

        // Drop status column from warehouse tables if they exist
        if let Err(e) = conn.execute("ALTER TABLE warehouse_receipts DROP COLUMN status", []) {
            println!("[TAURI BE migrate] Info: Alter table warehouse_receipts DROP COLUMN status returned/failed (ignore if column didn't exist): {:?}", e);
        } else {
            println!("[TAURI BE migrate] Success: Alter table warehouse_receipts DROP COLUMN status");
        }
        if let Err(e) = conn.execute("ALTER TABLE warehouse_issues DROP COLUMN status", []) {
            println!("[TAURI BE migrate] Info: Alter table warehouse_issues DROP COLUMN status returned/failed (ignore if column didn't exist): {:?}", e);
        } else {
            println!("[TAURI BE migrate] Success: Alter table warehouse_issues DROP COLUMN status");
        }

        conn.execute("PRAGMA user_version = 2", [])?;
        println!("[TAURI BE migrate] Database migrated to Version 2 (Dynamic fields and status drops processed)");
    }

    if version < 3 {
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS unit_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_org TEXT NOT NULL,
                parent_org_short TEXT NOT NULL,
                sub_org TEXT NOT NULL,
                sub_org_short TEXT NOT NULL,
                doc_prefix TEXT NOT NULL,
                settlement_warehouse TEXT NOT NULL DEFAULT 'TÂN BINH K62',
                created_at TEXT NOT NULL
            );"
        )?;
        conn.execute("PRAGMA user_version = 3", [])?;
        println!("[TAURI BE migrate] Database migrated to Version 3 (unit_settings table created)");
    }

    if version < 4 {
        // Alter existing table to add settlement_warehouse column if not already present
        let _ = conn.execute(
            "ALTER TABLE unit_settings ADD COLUMN settlement_warehouse TEXT NOT NULL DEFAULT 'TÂN BINH K62'",
            [],
        );
        conn.execute("PRAGMA user_version = 4", [])?;
        println!("[TAURI BE migrate] Database migrated to Version 4 (added settlement_warehouse column)");
    }

    Ok(())
}
