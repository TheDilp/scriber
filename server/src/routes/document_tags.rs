use axum::{
    extract::{Path, State},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{error::AppError, routes::tags::Tag, state::AppState};

#[derive(Deserialize)]
pub struct CreateDocumentTag {
    pub title: String,
}

pub async fn list(
    State(state): State<AppState>,
    Path(document_id): Path<String>,
) -> Result<Json<Vec<Tag>>, AppError> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT t.id, t.project_id, t.title, t.created_at, t.updated_at
         FROM tags t
         JOIN document_tags dt ON dt.tag_id = t.id
         WHERE dt.document_id = ?
         ORDER BY t.title ASC",
    )
    .bind(&document_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(tags))
}

pub async fn create(
    State(state): State<AppState>,
    Path(document_id): Path<String>,
    Json(body): Json<CreateDocumentTag>,
) -> Result<Json<Tag>, AppError> {
    let mut tx = state.pool.begin().await?;

    let project_id = sqlx::query_scalar::<_, String>("SELECT project_id FROM documents WHERE id = ?")
        .bind(&document_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or(AppError::NotFound)?;

    let title = body.title.trim();

    let existing_id = sqlx::query_scalar::<_, String>("SELECT id FROM tags WHERE project_id = ? AND title = ?")
        .bind(&project_id)
        .bind(title)
        .fetch_optional(&mut *tx)
        .await?;

    let tag_id = if let Some(id) = existing_id {
        id
    } else {
        let id = Uuid::new_v4().to_string();

        sqlx::query("INSERT INTO tags (id, project_id, title) VALUES (?, ?, ?)")
            .bind(&id)
            .bind(&project_id)
            .bind(title)
            .execute(&mut *tx)
            .await?;

        id
    };

    sqlx::query("INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)")
        .bind(&document_id)
        .bind(&tag_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    let tag = sqlx::query_as::<_, Tag>("SELECT id, project_id, title, created_at, updated_at FROM tags WHERE id = ?")
        .bind(&tag_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(tag))
}

pub async fn delete(
    State(state): State<AppState>,
    Path((document_id, tag_id)): Path<(String, String)>,
) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM document_tags WHERE document_id = ? AND tag_id = ?")
        .bind(&document_id)
        .bind(&tag_id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(()))
}
