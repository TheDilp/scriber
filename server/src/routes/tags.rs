use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;
use sqlx::FromRow;

use crate::{error::AppError, state::AppState};

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

pub async fn list(
    State(state): State<AppState>,
    Path(project_id): Path<String>,
) -> Result<Json<Vec<Tag>>, AppError> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT id, project_id, title, created_at, updated_at
         FROM tags
         WHERE project_id = ?
         ORDER BY title ASC",
    )
    .bind(&project_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(tags))
}

pub async fn delete(
    State(state): State<AppState>,
    Path((project_id, id)): Path<(String, String)>,
) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM tags WHERE id = ? AND project_id = ?")
        .bind(&id)
        .bind(&project_id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(()))
}
