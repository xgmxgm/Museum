use axum::{routing::post, Router};
use crate::handlers::auth::{register, login};
use crate::AppState;

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
}
