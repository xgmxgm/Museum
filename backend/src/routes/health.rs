use axum::{routing::get, Router};
use crate::handlers::health::health_check;

pub fn health_routes() -> Router {
    Router::new()
        .route("/health", get(health_check))
}
