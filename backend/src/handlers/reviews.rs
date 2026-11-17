use axum::{
    extract::{State, Path, Extension},
    Json,
};
use uuid::Uuid;
use validator::Validate;
use crate::AppState;
use crate::error::AppError;
use crate::models::{Review, CreateReviewRequest, UpdateReviewRequest};

pub async fn get_reviews(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
) -> Result<Json<Vec<Review>>, AppError> {
    let reviews = sqlx::query_as::<_, Review>(
        "SELECT * FROM reviews WHERE museum_id = $1 ORDER BY created_at DESC"
    )
    .bind(museum_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(Json(reviews))
}

pub async fn create_review(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
    Extension(user_id): Extension<String>,
    Json(payload): Json<CreateReviewRequest>,
) -> Result<Json<Review>, AppError> {
    payload.validate().map_err(|e| AppError::BadRequest(e.to_string()))?;
    let user_uuid = Uuid::parse_str(&user_id).map_err(|_| AppError::BadRequest("Неверный ID".into()))?;

    let museum_exists = sqlx::query("SELECT 1 FROM museums WHERE id = $1")
        .bind(museum_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .is_some();

    if !museum_exists {
        return Err(AppError::NotFound("Музей не найден".into()));
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
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.code().as_deref() == Some("23505") {
                return AppError::Conflict("Вы уже оставляли отзыв к этому музею. Используйте PUT для редактирования.".into());
            }
        }
        AppError::Internal(e.to_string())
    })?;

    Ok(Json(review))
}


pub async fn update_review(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
    Extension(user_id): Extension<String>,
    Json(payload): Json<UpdateReviewRequest>,
) -> Result<Json<Review>, AppError> {
    payload.validate().map_err(|e| AppError::BadRequest(e.to_string()))?;
    let user_uuid = Uuid::parse_str(&user_id).map_err(|_| AppError::BadRequest("Неверный ID".into()))?;

    let review = sqlx::query_as::<_, Review>(
        r#"
        UPDATE reviews 
        SET rating = $1, content = $2, created_at = CURRENT_TIMESTAMP
        WHERE museum_id = $3 AND user_id = $4
        RETURNING *
        "#
    )
    .bind(payload.rating)
    .bind(&payload.content)
    .bind(museum_id)
    .bind(user_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or(AppError::NotFound("Отзыв не найден. Сначала создайте его.".into()))?;

    Ok(Json(review))
}
