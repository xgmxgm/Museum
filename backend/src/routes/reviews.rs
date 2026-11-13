use axum::{routing::{get, post}, Router, middleware};
use crate::handlers::reviews::{get_reviews, create_review};
use crate::handlers::auth::auth_middleware;
use crate::AppState;

pub fn review_routes(state: AppState) -> Router<AppState> {
    let public = Router::new()
        .route("/api/museums/{id}/reviews", get(get_reviews));

    let protected = Router::new()
        .route("/api/museums/{id}/reviews", post(create_review))
        .layer(middleware::from_fn_with_state(state, auth_middleware));

    public.merge(protected)
}
