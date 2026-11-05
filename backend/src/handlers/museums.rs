use axum::{extract::State, Json, http::StatusCode};
use crate::AppState;
use crate::models::Museum;

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
