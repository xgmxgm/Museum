use axum::{
    http::{HeaderValue, Method},
    Router,
};
use tower_http::cors::CorsLayer;

mod routes;
mod handlers;
mod db;
mod models;
mod error; 
mod config; 

use sqlx::PgPool;
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let config = Config::from_env();
    
    let pool = db::create_pool(&config.database_url).await;
    println!("✅ Успешно подключились к PostgreSQL");

    let state = AppState { db: pool };
    
    let cors = CorsLayer::new()
        .allow_origin(config.frontend_url.parse::<HeaderValue>().unwrap()) 
        .allow_methods([
            Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ]);

    let app = routes::create_router(state).layer(cors);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], config.port));
    println!("🚀 Сервер Museum запущен на http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c().await.expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    println!("🛑 Получен сигнал завершения. Сервер останавливается...");
}
