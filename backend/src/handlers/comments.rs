use axum::{
    extract::{State, Path, Extension},
    Json,
};
use uuid::Uuid;
use validator::Validate; 
use crate::AppState;
use crate::error::AppError; 
use crate::models::{Comment, CreateCommentRequest};

pub async fn get_comments(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
) -> Result<Json<Vec<Comment>>, AppError> {
    let comments = sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE museum_id = $1 ORDER BY created_at DESC"
    )
    .bind(museum_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(Json(comments))
}

pub async fn create_comment(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
    Extension(user_id): Extension<String>, 
    Json(payload): Json<CreateCommentRequest>,
) -> Result<Json<Comment>, AppError> {
    
    payload.validate().map_err(|e| AppError::BadRequest(e.to_string()))?;

    
    let user_uuid = Uuid::parse_str(&user_id)
        .map_err(|_| AppError::BadRequest("Неверный ID пользователя".into()))?;

    
    let museum_exists = sqlx::query("SELECT 1 FROM museums WHERE id = $1")
        .bind(museum_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .is_some();

    if !museum_exists {
        return Err(AppError::NotFound("Музей не найден".into()));
    }

    
    let comment = sqlx::query_as::<_, Comment>(
        "INSERT INTO comments (museum_id, user_id, content) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(museum_id)
    .bind(user_uuid)
    .bind(&payload.content)
    .fetch_one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(Json(comment))
}
