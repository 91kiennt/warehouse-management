use rusqlite::{Connection, Result};

use crate::db::migrations::migrate;

pub struct Database {
    pub(crate) conn: Connection,
}

impl Database {
    pub fn open(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Database { conn };
        migrate(&db.conn)?;
        Ok(db)
    }
}
