use axum::{extract::State, Json, http::StatusCode};
use axum::extract::Path;
use uuid::Uuid;
use crate::AppState;
use crate::models::Museum;


pub async fn get_museums(
    State(state): State<AppState>,
) -> Result<Json<Vec<Museum>>, StatusCode> {
    let museums = sqlx::query_as::<_, Museum>(
        r#"
        SELECT 
            m.id, m.name, m.description, m.city, m.address, m.founded_year,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        GROUP BY m.id
        "#
    )
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


pub async fn get_museum_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Museum>, StatusCode> {
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
