use axum::{
    extract::{State, Request, Extension},
    Json,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::phc::PasswordHash;
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use validator::Validate;
use chrono::{Utc, Duration};
use uuid::Uuid;

use crate::AppState;
use crate::models::{
    User, UserResponse, RegisterRequest, LoginRequest, AuthResponse, Claims, ChangePasswordRequest
};

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    if payload.validate().is_err() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
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
        eprintln!("Ошибка БД при регистрации: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration,
        jti: Uuid::new_v4(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration,
        jti: Uuid::new_v4(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    }))
}

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Здесь мы не можем использовать state, поэтому читаем секрет из env (как раньше)
    // В идеале передавать через from_fn_with_state, но для простоты оставим так
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key_museum_2026_super_long_and_safe".to_string());

    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    req.extensions_mut().insert(token_data.claims.sub);
    Ok(next.run(req).await)
}

pub async fn get_me(
    State(state): State<AppState>,
    Extension(user_id): Extension<String>,
) -> Result<Json<UserResponse>, StatusCode> {
    let uuid = Uuid::parse_str(&user_id).map_err(|_| StatusCode::BAD_REQUEST)?;

    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT id, username, email FROM users WHERE id = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(user))
}

// НОВОЕ: Смена пароля
pub async fn change_password(
    State(state): State<AppState>,
    Extension(user_id): Extension<String>,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<StatusCode, crate::error::AppError> {
    payload.validate().map_err(|e| crate::error::AppError::BadRequest(e.to_string()))?;
    let uuid = Uuid::parse_str(&user_id).map_err(|_| crate::error::AppError::BadRequest("Неверный ID".into()))?;

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(uuid)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| crate::error::AppError::Internal(e.to_string()))?
        .ok_or(crate::error::AppError::NotFound("Пользователь не найден".into()))?;

    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| crate::error::AppError::Internal("Ошибка хеша".into()))?;

    if Argon2::default()
        .verify_password(payload.old_password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(crate::error::AppError::BadRequest("Неверный старый пароль".into()));
    }

    let argon2 = Argon2::default();
    let new_hash = argon2
        .hash_password(payload.new_password.as_bytes())
        .map_err(|_| crate::error::AppError::Internal("Ошибка хеширования".into()))?
        .to_string();

    sqlx::query("UPDATE users SET password_hash = $1 WHERE id = $2")
        .bind(&new_hash)
        .bind(uuid)
        .execute(&state.db)
        .await
        .map_err(|e| crate::error::AppError::Internal(e.to_string()))?;

    Ok(StatusCode::OK)
}

// НОВОЕ: Удаление аккаунта
pub async fn delete_account(
    State(state): State<AppState>,
    Extension(user_id): Extension<String>,
) -> Result<StatusCode, crate::error::AppError> {
    let uuid = Uuid::parse_str(&user_id).map_err(|_| crate::error::AppError::BadRequest("Неверный ID".into()))?;

    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(uuid)
        .execute(&state.db)
        .await
        .map_err(|e| crate::error::AppError::Internal(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::NotFound("Пользователь не найден".into()));
    }

    Ok(StatusCode::NO_CONTENT)
}
