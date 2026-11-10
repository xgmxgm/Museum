use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Museum {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub city: String,
    pub address: String,
    pub founded_year: Option<i32>,
    pub average_rating: Option<f64>,
    pub image_url: Option<String>,
    pub two_gis_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(length(min = 3, max = 50))]
    pub username: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,  
}


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Comment {
    pub id: Uuid,
    pub museum_id: Uuid,
    pub user_id: Uuid,
    pub content: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}


#[derive(Debug, Deserialize, Validate)]
pub struct CreateCommentRequest {
    #[validate(length(min = 1, max = 1000))]
    pub content: String,
}


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Review {
    pub id: Uuid,
    pub museum_id: Uuid,
    pub user_id: Uuid,
    pub rating: i32,
    pub content: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateReviewRequest {
    #[validate(range(min = 1, max = 5))]
    pub rating: i32,
    pub content: Option<String>,
}


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
}
