mod assets;
mod config;
mod db;
mod error;
mod routes;
mod state;

use axum::Router;
use tower_http::{compression::CompressionLayer, trace::TraceLayer};

use crate::{config::Config, state::AppState};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let config = Config::from_env();
    let pool = db::connect(&config.db_path).await?;
    let state = AppState { pool };

    let app = Router::new()
        .nest("/api/v1", routes::api_router())
        .fallback(assets::serve_spa)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", config.port)).await?;
    tracing::info!("listening on http://0.0.0.0:{}", config.port);
    axum::serve(listener, app).await?;

    Ok(())
}
