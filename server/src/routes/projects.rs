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
pub struct Project {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Deserialize, Default)]
pub struct CreateProject {
    pub title: String,
}

#[derive(Deserialize, Default)]
pub struct UpdateProject {
    pub title: Option<String>,
}

pub async fn list(State(state): State<AppState>) -> Result<Json<Vec<Project>>, AppError> {
    let projects = sqlx::query_as::<_, Project>(
        "SELECT id, title, created_at, updated_at
         FROM projects
         ORDER BY title ASC",
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(projects))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<CreateProject>,
) -> Result<Json<String>, AppError> {
    let id = Uuid::new_v4().to_string();

    sqlx::query("INSERT INTO projects (id, title) VALUES (?, ?)")
        .bind(&id)
        .bind(&body.title)
        .execute(&state.pool)
        .await?;

    Ok(Json(id))
}

pub async fn get(State(state): State<AppState>, Path(id): Path<String>) -> Result<Json<Project>, AppError> {
    let project = fetch_project(&state, &id).await?;
    Ok(Json(project))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<UpdateProject>,
) -> Result<Json<Project>, AppError> {
    sqlx::query(
        "UPDATE projects SET
            title = COALESCE(?, title),
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?",
    )
    .bind(&body.title)
    .bind(&id)
    .execute(&state.pool)
    .await?;

    let project = fetch_project(&state, &id).await?;
    Ok(Json(project))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<String>) -> Result<Json<()>, AppError> {
    let result = sqlx::query("DELETE FROM projects WHERE id = ?").bind(&id).execute(&state.pool).await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(()))
}

async fn fetch_project(state: &AppState, id: &str) -> Result<Project, AppError> {
    sqlx::query_as::<_, Project>(
        "SELECT id, title, created_at, updated_at
         FROM projects
         WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)
}
