pub mod document_tags;
pub mod document_versions;
pub mod documents;
pub mod health;
pub mod projects;
pub mod search;
pub mod tags;

use axum::{
    routing::{delete, get},
    Router,
};

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
            "/documents/{document_id}/versions/{version_number}",
            get(document_versions::get)
                .put(document_versions::update)
                .delete(document_versions::delete),
        )
        .route(
            "/documents/{document_id}/tags",
            get(document_tags::list).post(document_tags::create),
        )
        .route("/documents/{document_id}/tags/{tag_id}", delete(document_tags::delete))
        .route("/projects", get(projects::list).post(projects::create))
        .route(
            "/projects/{id}",
            get(projects::get).put(projects::update).delete(projects::delete),
        )
        .route("/search", get(search::search))
        .route("/projects/{project_id}/search", get(search::search_in_project))
        .route("/projects/{project_id}/tags", get(tags::list))
        .route("/projects/{project_id}/tags/{id}", delete(tags::delete))
}
