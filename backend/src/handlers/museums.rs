use axum::{
    extract::{State, Path, Query},
    Json,
};
use uuid::Uuid;
use serde::Deserialize;
use crate::AppState;
use crate::error::AppError;
use crate::models::Museum;


#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

pub async fn get_museums(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Museum>>, AppError> {
    let page = pagination.page.unwrap_or(1);
    let limit = pagination.limit.unwrap_or(10); 
    let offset = (page.saturating_sub(1)) * limit;

    let museums = sqlx::query_as::<_, Museum>(
        r#"
        SELECT 
            m.id, m.name, m.description, m.city, m.address, m.founded_year,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        GROUP BY m.id
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(Json(museums))
}

pub async fn get_museum_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Museum>, AppError> {
    let museum = sqlx::query_as::<_, Museum>(
        r#"
        SELECT 
            m.id, m.name, m.description, m.city, m.address, m.founded_year,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        WHERE m.id = $1
        GROUP BY m.id
        "#
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or(AppError::NotFound("Музей не найден".into()))?;

    Ok(Json(museum))
}
