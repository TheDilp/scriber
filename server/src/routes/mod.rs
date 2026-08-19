pub mod document_versions;
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
        .route(
            "/documents/{document_id}/versions",
            get(document_versions::list).post(document_versions::create),
        )
        .route(
            "/documents/{document_id}/versions/{version_id}",
            get(document_versions::get)
                .put(document_versions::update)
                .delete(document_versions::delete),
        )
}
