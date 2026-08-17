pub mod documents;
pub mod health;

use axum::{routing::get, Router};

use crate::state::AppState;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health::health))
        .route("/documents", get(documents::list).post(documents::create))
        .route(
            "/documents/{id}",
            get(documents::get).put(documents::update).delete(documents::delete),
        )
}
