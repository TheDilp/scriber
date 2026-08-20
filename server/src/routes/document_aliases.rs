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
pub struct DocumentAlias {
    pub id: String,
    pub document_id: String,
    pub title: String,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateDocumentAlias {
    pub title: String,
}

pub async fn list(
    State(state): State<AppState>,
    Path(document_id): Path<String>,
) -> Result<Json<Vec<DocumentAlias>>, AppError> {
    let aliases = sqlx::query_as::<_, DocumentAlias>(
        "SELECT id, document_id, title, created_at
         FROM document_aliases
         WHERE document_id = ?
         ORDER BY title ASC",
    )
    .bind(&document_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(aliases))
}

pub async fn create(
    State(state): State<AppState>,
    Path(document_id): Path<String>,
    Json(body): Json<CreateDocumentAlias>,
) -> Result<Json<DocumentAlias>, AppError> {
    let id = Uuid::new_v4().to_string();
    let title = body.title.trim();

    sqlx::query("INSERT INTO document_aliases (id, document_id, title) VALUES (?, ?, ?)")
        .bind(&id)
        .bind(&document_id)
        .bind(title)
        .execute(&state.pool)
        .await?;

    let alias = sqlx::query_as::<_, DocumentAlias>(
        "SELECT id, document_id, title, created_at FROM document_aliases WHERE id = ?",
    )
    .bind(&id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(alias))
}

pub async fn delete(
    State(state): State<AppState>,
    Path((document_id, alias_id)): Path<(String, String)>,
) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM document_aliases WHERE document_id = ? AND id = ?")
        .bind(&document_id)
        .bind(&alias_id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(()))
}
