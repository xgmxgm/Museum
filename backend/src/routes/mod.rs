pub mod health;
pub mod museums;
pub mod auth;

use axum::Router;
use crate::AppState;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/", axum::routing::get(|| async { "Museum API работает!" }))
        .merge(health::health_routes())
        .merge(museums::museum_routes())
        .merge(auth::auth_routes())
        .with_state(state)
}
