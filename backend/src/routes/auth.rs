use axum::{
    routing::{post, get},
    Router,
    middleware,
};
use crate::handlers::auth::{register, login, get_me, logout, auth_middleware};
use crate::AppState;

pub fn auth_routes(state: AppState) -> Router<AppState> {
    // Публичные маршруты (без токена)
    let public_routes = Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login));

    // Защищённые маршруты (нужен токен)
    let protected_routes = Router::new()
        .route("/api/users/me", get(get_me))
        .route("/api/auth/logout", post(logout))
        .layer(middleware::from_fn_with_state(state, auth_middleware));

    public_routes.merge(protected_routes)
}
