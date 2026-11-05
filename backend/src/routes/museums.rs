use axum::{routing::get, Router};
use crate::handlers::museums::get_museums;
use crate::AppState;

pub fn museum_routes() -> Router<AppState> {
    Router::new()
        .route("/api/museums", get(get_museums))
}
