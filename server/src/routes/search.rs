use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;

use crate::{error::AppError, routes::documents::DocumentSummary, state::AppState};

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

pub async fn search(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Vec<DocumentSummary>>, AppError> {
    Ok(Json(search_documents(&state, &query.q, None).await?))
}

pub async fn search_in_project(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Vec<DocumentSummary>>, AppError> {
    Ok(Json(search_documents(&state, &query.q, Some(&project_id)).await?))
}

async fn search_documents(
    state: &AppState,
    search_term: &str,
    project_id: Option<&str>,
) -> Result<Vec<DocumentSummary>, AppError> {
    let search_term = search_term.trim();

    if search_term.is_empty() {
        return Ok(Vec::new());
    }

    if search_term.chars().count() < 3 {
        search_with_like(state, search_term, project_id).await
    } else {
        search_with_fts(state, search_term, project_id).await
    }
}

async fn search_with_fts(
    state: &AppState,
    search_term: &str,
    project_id: Option<&str>,
) -> Result<Vec<DocumentSummary>, AppError> {
    let fts_query = format!("\"{}\"", search_term.replace('"', "\"\""));

    let docs = sqlx::query_as::<_, DocumentSummary>(
        "SELECT DISTINCT
            d.id,
            d.project_id,
            d.title,
            COALESCE(
                (SELECT version_number FROM document_versions
                 WHERE document_id = d.id
                 ORDER BY version_number DESC LIMIT 1),
                1
            ) AS current_version,
            d.updated_at
         FROM documents d
         JOIN document_search ON document_search.document_id = d.id
         WHERE document_search MATCH ?
           AND (? IS NULL OR d.project_id = ?)
         ORDER BY d.updated_at DESC",
    )
    .bind(&fts_query)
    .bind(project_id)
    .bind(project_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(docs)
}

async fn search_with_like(
    state: &AppState,
    search_term: &str,
    project_id: Option<&str>,
) -> Result<Vec<DocumentSummary>, AppError> {
    let pattern = format!("%{search_term}%");

    let docs = sqlx::query_as::<_, DocumentSummary>(
        "SELECT DISTINCT
            d.id,
            d.project_id,
            d.title,
            COALESCE(
                (SELECT version_number FROM document_versions
                 WHERE document_id = d.id
                 ORDER BY version_number DESC LIMIT 1),
                1
            ) AS current_version,
            d.updated_at
         FROM documents d
         JOIN document_search ON document_search.document_id = d.id
         WHERE (
            document_search.title LIKE ?
            OR document_search.aliases LIKE ?
            OR document_search.content LIKE ?
         )
           AND (? IS NULL OR d.project_id = ?)
         ORDER BY d.updated_at DESC",
    )
    .bind(&pattern)
    .bind(&pattern)
    .bind(&pattern)
    .bind(project_id)
    .bind(project_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(docs)
}
