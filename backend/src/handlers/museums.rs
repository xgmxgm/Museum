use axum::{extract::State, Json, http::StatusCode};
use axum::extract::Path;
use uuid::Uuid;
use crate::AppState;
use crate::models::Museum;

// 1. Получить все музеи
pub async fn get_museums(
    State(state): State<AppState>,
) -> Result<Json<Vec<Museum>>, StatusCode> {
    let museums = sqlx::query_as::<_, Museum>("SELECT * FROM museums")
        .fetch_all(&state.db)
        .await;

    match museums {
        Ok(list) => Ok(Json(list)),
        Err(e) => {
            eprintln!("Ошибка БД: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// 2. Получить музей по ID
pub async fn get_museum_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Museum>, StatusCode> {
    let museum = sqlx::query_as::<_, Museum>("SELECT * FROM museums WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await;

    match museum {
        Ok(Some(m)) => Ok(Json(m)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            eprintln!("Ошибка БД: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
