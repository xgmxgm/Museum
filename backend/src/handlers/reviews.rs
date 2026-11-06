use axum::{
    extract::{State, Path, Extension},
    Json,
    http::StatusCode,
};
use uuid::Uuid;
use crate::AppState;
use crate::models::{Review, CreateReviewRequest};


pub async fn get_reviews(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
) -> Result<Json<Vec<Review>>, StatusCode> {
    let reviews = sqlx::query_as::<_, Review>(
        "SELECT * FROM reviews WHERE museum_id = $1 ORDER BY created_at DESC"
    )
    .bind(museum_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(reviews))
}


pub async fn create_review(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
    Extension(user_id): Extension<String>,
    Json(payload): Json<CreateReviewRequest>,
) -> Result<Json<Review>, StatusCode> {
    let user_uuid = Uuid::parse_str(&user_id).map_err(|_| StatusCode::BAD_REQUEST)?;

    
    let museum_exists = sqlx::query("SELECT 1 FROM museums WHERE id = $1")
        .bind(museum_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some();

    if !museum_exists {
        return Err(StatusCode::NOT_FOUND);
    }

    
    let review = sqlx::query_as::<_, Review>(
        "INSERT INTO reviews (museum_id, user_id, rating, content) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(museum_id)
    .bind(user_uuid)
    .bind(payload.rating)
    .bind(&payload.content)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Ошибка при создании отзыва: {}", e);
        StatusCode::CONFLICT 
    })?;

    Ok(Json(review))
}
