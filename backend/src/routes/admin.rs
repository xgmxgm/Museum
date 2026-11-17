use axum::{
    routing::{post, put, delete},
    Router,
    middleware,
};
use crate::handlers::admin::*;
use crate::handlers::auth::admin_middleware;
use crate::AppState;

pub fn admin_routes(state: AppState) -> Router<AppState> {
    Router::new()
        
        .route("/api/admin/museums", post(create_museum))
        .route("/api/admin/museums/{id}", put(update_museum))
        .route("/api/admin/museums/{id}", delete(delete_museum))
        
        
        .route("/api/admin/comments/{id}", delete(delete_any_comment))
        .route("/api/admin/reviews/{id}", delete(delete_any_review))
        
        
        .layer(middleware::from_fn_with_state(state, admin_middleware))
}
