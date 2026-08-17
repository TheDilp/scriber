use std::env;

pub struct Config {
    pub db_path: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        let db_path = env::var("SCRIBER_DB_PATH").unwrap_or_else(|_| "./data/scriber.db".to_string());
        let port = env::var("SCRIBER_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);

        Self { db_path, port }
    }
}
