use axum::{extract::State, Json, http::StatusCode};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::phc::PasswordHash;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use validator::Validate;
use chrono::{Utc, Duration};
use crate::AppState;
use crate::models::{User, RegisterRequest, LoginRequest, AuthResponse};

const JWT_SECRET: &[u8] = b"super_secret_key_museum_2026";

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
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
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse { token }))
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
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse { token }))
}
