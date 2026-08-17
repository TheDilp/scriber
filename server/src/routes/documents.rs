use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{error::AppError, state::AppState};

#[derive(Serialize, FromRow)]
pub struct DocumentSummary {
    pub id: String,
    pub title: String,
    pub updated_at: String,
}

#[derive(Serialize, FromRow)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Deserialize, Default)]
pub struct CreateDocument {
    pub title: Option<String>,
}

#[derive(Deserialize, Default)]
pub struct UpdateDocument {
    pub title: Option<String>,
    pub content: Option<String>,
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
) -> Result<Json<Document>, AppError> {
    let id = Uuid::new_v4().to_string();
    let title = body.title.unwrap_or_else(|| "Untitled".to_string());

    sqlx::query("INSERT INTO documents (id, title) VALUES (?, ?)")
        .bind(&id)
        .bind(&title)
        .execute(&state.pool)
        .await?;

    let doc = fetch_document(&state, &id).await?;
    Ok(Json(doc))
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
            content = COALESCE(?, content),
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?",
    )
    .bind(&body.title)
    .bind(&body.content)
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
        "SELECT id, title, content, created_at, updated_at FROM documents WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)
}
