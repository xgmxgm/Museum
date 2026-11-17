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
    User, UserResponse, RegisterRequest, LoginRequest, AuthResponse, Claims, 
    ChangePasswordRequest, TokenResponse, RefreshRequest
};

fn generate_tokens(user: &User, secret: &[u8]) -> Result<(String, String), StatusCode> {
    let exp = Utc::now().checked_add_signed(Duration::minutes(15)).unwrap().timestamp() as usize;
    let claims = Claims {
        sub: user.id.to_string(),
        exp,
        jti: Uuid::new_v4(),
        role: user.role.clone(),
    };
    let access_token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let refresh_token = Uuid::new_v4().to_string();

    Ok((access_token, refresh_token))
}

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
        "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING *"
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

    let (access_token, refresh_token) = generate_tokens(&user, state.jwt_secret.as_bytes())?;

    let expires_at = Utc::now() + Duration::days(7);
    sqlx::query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)")
        .bind(user.id)
        .bind(&refresh_token)
        .bind(expires_at)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token,
        user: UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
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

    let (access_token, refresh_token) = generate_tokens(&user, state.jwt_secret.as_bytes())?;

    let expires_at = Utc::now() + Duration::days(7);
    sqlx::query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)")
        .bind(user.id)
        .bind(&refresh_token)
        .bind(expires_at)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token,
        user: UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    }))
}

pub async fn refresh(
    State(state): State<AppState>,
    Json(payload): Json<RefreshRequest>,
) -> Result<Json<TokenResponse>, StatusCode> {
    let row = sqlx::query!(
        "SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
        payload.refresh_token
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::UNAUTHORIZED)?;

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(row.user_id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let (access_token, new_refresh_token) = generate_tokens(&user, state.jwt_secret.as_bytes())?;

    sqlx::query("DELETE FROM refresh_tokens WHERE token = $1")
        .bind(&payload.refresh_token)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let expires_at = Utc::now() + Duration::days(7);
    sqlx::query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)")
        .bind(user.id)
        .bind(&new_refresh_token)
        .bind(expires_at)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(TokenResponse {
        access_token,
        refresh_token: new_refresh_token,
    }))
}

pub async fn logout(
    State(state): State<AppState>,
    Json(payload): Json<RefreshRequest>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM refresh_tokens WHERE token = $1")
        .bind(&payload.refresh_token)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
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

pub async fn admin_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_key_museum_2026_super_long_and_safe".to_string());

    let token_data = decode::<Claims>(
        auth_header,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    if token_data.claims.role != "admin" {
        return Err(StatusCode::FORBIDDEN);
    }

    req.extensions_mut().insert(token_data.claims.sub);
    Ok(next.run(req).await)
}

pub async fn get_me(
    State(state): State<AppState>,
    Extension(user_id): Extension<String>,
) -> Result<Json<UserResponse>, StatusCode> {
    let uuid = Uuid::parse_str(&user_id).map_err(|_| StatusCode::BAD_REQUEST)?;

    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT id, username, email, role FROM users WHERE id = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(user))
}

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
