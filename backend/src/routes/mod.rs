pub mod health;
pub mod museums;
pub mod auth;
pub mod comments;
pub mod reviews;

use axum::Router;
use crate::AppState;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/", axum::routing::get(|| async { "Museum API работает!" }))
        .merge(health::health_routes())
        .merge(museums::museum_routes())
        .merge(auth::auth_routes())
        .merge(comments::comment_routes())
        .merge(reviews::review_routes())
        .with_state(state)
}
