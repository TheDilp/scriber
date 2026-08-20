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
    let pattern = format!("%{}%", query.q);

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
         LEFT JOIN document_aliases da ON da.document_id = d.id
         WHERE d.title LIKE ? OR da.title LIKE ?
         ORDER BY d.updated_at DESC",
    )
    .bind(&pattern)
    .bind(&pattern)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(docs))
}

pub async fn search_in_project(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Vec<DocumentSummary>>, AppError> {
    let pattern = format!("%{}%", query.q);

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
         LEFT JOIN document_aliases da ON da.document_id = d.id
         WHERE d.project_id = ? AND (d.title LIKE ? OR da.title LIKE ?)
         ORDER BY d.updated_at DESC",
    )
    .bind(&project_id)
    .bind(&pattern)
    .bind(&pattern)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(docs))
}
