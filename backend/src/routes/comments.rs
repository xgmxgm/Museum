use axum::{routing::{get, post}, Router, middleware};
use crate::handlers::comments::{get_comments, create_comment};
use crate::handlers::auth::auth_middleware;
use crate::AppState;

pub fn comment_routes() -> Router<AppState> {
    let public = Router::new()
        .route("/api/museums/{id}/comments", get(get_comments));

    let protected = Router::new()
        .route("/api/museums/{id}/comments", post(create_comment))
        .layer(middleware::from_fn(auth_middleware));

    public.merge(protected)
}
