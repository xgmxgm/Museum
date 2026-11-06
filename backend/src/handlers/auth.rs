use axum::{
    extract::{State, Request, Extension},
    Json,
    middleware::Next,
    response::Response,
};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::phc::PasswordHash;
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use validator::Validate;
use chrono::{Utc, Duration};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError; // <-- Подключаем наш AppError
use crate::models::{User, UserResponse, RegisterRequest, LoginRequest, AuthResponse, Claims};

fn get_jwt_secret() -> Vec<u8> {
    std::env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set in .env")
        .into_bytes()
}

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    
    payload.validate().map_err(|e| AppError::BadRequest(e.to_string()))?;

    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes())
        .map_err(|_| AppError::Internal("Ошибка хеширования".into()))?
        .to_string();

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(&payload.username)
    .bind(&payload.email)
    .bind(&password_hash)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        
        if e.to_string().contains("duplicate key") {
            AppError::Conflict("Пользователь с таким email или username уже существует".into())
        } else {
            AppError::Internal(e.to_string())
        }
    })?;

    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(&get_jwt_secret()),
    )
    .map_err(|_| AppError::Internal("Ошибка генерации токена".into()))?;

    Ok(Json(AuthResponse { token }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or(AppError::Unauthorized)?; // Если не нашли — 401

    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| AppError::Internal("Ошибка парсинга хеша".into()))?;

    if Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(AppError::Unauthorized);
    }

    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(&get_jwt_secret()),
    )
    .map_err(|_| AppError::Internal("Ошибка генерации токена".into()))?;

    Ok(Json(AuthResponse { token }))
}

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> { // <-- Теперь AppError
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .ok_or(AppError::Unauthorized)?;

    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(&get_jwt_secret()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized)?;

    req.extensions_mut().insert(token_data.claims.sub);
    Ok(next.run(req).await)
}

pub async fn get_me(
    State(state): State<AppState>,
    Extension(user_id): Extension<String>,
) -> Result<Json<UserResponse>, AppError> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| AppError::BadRequest("Неверный формат UUID".into()))?;

    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT id, username, email FROM users WHERE id = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or(AppError::NotFound("Пользователь не найден".into()))?;

    Ok(Json(user))
}
