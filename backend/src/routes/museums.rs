use axum::{routing::get, Router};
use crate::handlers::museums::{get_museums, get_museum_by_id};
use crate::AppState;

pub fn museum_routes() -> Router<AppState> {
    Router::new()
        .route("/api/museums", get(get_museums))
        .route("/api/museums/{id}", get(get_museum_by_id))
}
