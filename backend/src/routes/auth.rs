use axum::{routing::{post, get, patch, delete}, Router, middleware};
use crate::handlers::auth::{register, login, get_me, change_password, delete_account, refresh, logout};
use crate::handlers::auth::auth_middleware;
use crate::AppState;

pub fn auth_routes(state: AppState) -> Router<AppState> {
    let public_routes = Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/refresh", post(refresh))
        .route("/api/auth/logout", post(logout));

    let protected_routes = Router::new()
        .route("/api/users/me", get(get_me))
        .route("/api/users/me/password", patch(change_password))
        .route("/api/users/me", delete(delete_account))
        .layer(middleware::from_fn_with_state(state, auth_middleware));

    public_routes.merge(protected_routes)
}
