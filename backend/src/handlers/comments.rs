use axum::{
    extract::{State, Path, Extension},
    Json,
    http::StatusCode,
};
use uuid::Uuid;
use crate::AppState;
use crate::models::{Comment, CreateCommentRequest};


pub async fn get_comments(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
) -> Result<Json<Vec<Comment>>, StatusCode> {
    let comments = sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE museum_id = $1 ORDER BY created_at DESC"
    )
    .bind(museum_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(comments))
}


pub async fn create_comment(
    State(state): State<AppState>,
    Path(museum_id): Path<Uuid>,
    Extension(user_id): Extension<String>, 
    Json(payload): Json<CreateCommentRequest>,
) -> Result<Json<Comment>, StatusCode> {
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

    let comment = sqlx::query_as::<_, Comment>(
        "INSERT INTO comments (museum_id, user_id, content) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(museum_id)
    .bind(user_uuid)
    .bind(&payload.content)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(comment))
}
