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
pub struct DocumentSummary {
    pub id: String,
    pub title: String,
    pub updated_at: String,
}

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub current_version: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Deserialize, Default)]
pub struct CreateDocument {
    pub title: String,
}

#[derive(Deserialize, Default)]
pub struct UpdateDocument {
    pub title: Option<String>,
}

pub async fn list(State(state): State<AppState>) -> Result<Json<Vec<DocumentSummary>>, AppError> {
    let docs = sqlx::query_as::<_, DocumentSummary>(
        "SELECT id, title, updated_at FROM documents ORDER BY updated_at DESC",
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(docs))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateDocument>,
) -> Result<Json<String>, AppError> {
    let id = Uuid::new_v4().to_string();
    let version_id = Uuid::new_v4().to_string();

    let mut tx = state.pool.begin().await?;

    sqlx::query("INSERT INTO documents (id, title) VALUES (?, ?)")
        .bind(&id)
        .bind(&body.title)
        .execute(&mut *tx)
        .await?;

    sqlx::query(
        "INSERT INTO document_versions (id, document_id, version_number, content) VALUES (?, ?, 1, '')",
    )
    .bind(&version_id)
    .bind(&id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(Json(id))
}

pub async fn get(State(state): State<AppState>, Path(id): Path<String>) -> Result<Json<Document>, AppError> {
    let doc = fetch_document(&state, &id).await?;
    Ok(Json(doc))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<UpdateDocument>,
) -> Result<Json<Document>, AppError> {
    sqlx::query(
        "UPDATE documents SET
            title = COALESCE(?, title),
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?",
    )
    .bind(&body.title)
    .bind(&id)
    .execute(&state.pool)
    .await?;

    let doc = fetch_document(&state, &id).await?;
    Ok(Json(doc))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<String>) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM documents WHERE id = ?").bind(&id).execute(&state.pool).await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(()))
}

async fn fetch_document(state: &AppState, id: &str) -> Result<Document, AppError> {
    sqlx::query_as::<_, Document>(
        "SELECT
            d.id,
            d.title,
            COALESCE(
                (SELECT content FROM document_versions
                 WHERE document_id = d.id
                 ORDER BY version_number DESC LIMIT 1),
                ''
            ) AS content,
            COALESCE(
                (SELECT version_number FROM document_versions
                 WHERE document_id = d.id
                 ORDER BY version_number DESC LIMIT 1),
                0
            ) AS current_version,
            d.created_at,
            d.updated_at
         FROM documents d
         WHERE d.id = ?",
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)
}
