use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{error::AppError, state::AppState};

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct DocumentVersion {
    pub id: String,
    pub document_id: String,
    pub version_number: i64,
    pub content: String,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateDocumentVersion {
    pub content: String,
}

#[derive(Deserialize)]
pub struct UpdateDocumentVersionContent {
    pub content: String,
}

pub async fn list(
    State(state): State<AppState>,
    Path(document_id): Path<String>,
) -> Result<Json<Vec<DocumentVersion>>, AppError> {
    let versions = sqlx::query_as::<_, DocumentVersion>(
        "SELECT id, document_id, version_number, content, created_at
         FROM document_versions
         WHERE document_id = ?
         ORDER BY version_number DESC",
    )
    .bind(&document_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(versions))
}

pub async fn get(
    State(state): State<AppState>,
    Path((document_id, version_id)): Path<(String, String)>,
) -> Result<Json<DocumentVersion>, AppError> {
    let version = fetch_version(&state, &document_id, &version_id).await?;
    Ok(Json(version))
}

pub async fn create(
    State(state): State<AppState>,
    Path(document_id): Path<String>,
    Json(body): Json<CreateDocumentVersion>,
) -> Result<Json<DocumentVersion>, AppError> {
    let id = Uuid::new_v4().to_string();

    let mut tx = state.pool.begin().await?;

    let exists = sqlx::query_scalar::<_, i64>("SELECT 1 FROM documents WHERE id = ?")
        .bind(&document_id)
        .fetch_optional(&mut *tx)
        .await?;

    if exists.is_none() {
        return Err(AppError::NotFound);
    }

    sqlx::query(
        "INSERT INTO document_versions (id, document_id, version_number, content)
         VALUES (
            ?,
            ?,
            COALESCE((SELECT MAX(version_number) FROM document_versions WHERE document_id = ?), 0) + 1,
            ?
         )",
    )
    .bind(&id)
    .bind(&document_id)
    .bind(&document_id)
    .bind(&body.content)
    .execute(&mut *tx)
    .await?;

    sqlx::query("UPDATE documents SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?")
        .bind(&document_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    let version = fetch_version(&state, &document_id, &id).await?;
    Ok(Json(version))
}

pub async fn update(
    State(state): State<AppState>,
    Path((document_id, version_id)): Path<(String, String)>,
    Json(body): Json<UpdateDocumentVersionContent>,
) -> Result<Json<DocumentVersion>, AppError> {
    let result = sqlx::query(
        "UPDATE document_versions SET content = ? WHERE id = ? AND document_id = ?",
    )
    .bind(&body.content)
    .bind(&version_id)
    .bind(&document_id)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    let version = fetch_version(&state, &document_id, &version_id).await?;
    Ok(Json(version))
}

pub async fn delete(
    State(state): State<AppState>,
    Path((document_id, version_id)): Path<(String, String)>,
) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM document_versions WHERE id = ? AND document_id = ?")
        .bind(&version_id)
        .bind(&document_id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(()))
}

async fn fetch_version(
    state: &AppState,
    document_id: &str,
    version_id: &str,
) -> Result<DocumentVersion, AppError> {
    sqlx::query_as::<_, DocumentVersion>(
        "SELECT id, document_id, version_number, content, created_at
         FROM document_versions
         WHERE id = ? AND document_id = ?",
    )
    .bind(version_id)
    .bind(document_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)
}
