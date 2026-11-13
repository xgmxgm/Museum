use axum::{
    http::{HeaderValue, Method},
};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer; 
use tower_http::services::ServeDir; 

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
    pub jwt_secret: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .init();

    dotenvy::dotenv().ok();
    let config = Config::from_env();
    
    let pool = db::create_pool(&config.database_url).await;
    tracing::info!("✅ Успешно подключились к PostgreSQL");

    let state = AppState { 
        db: pool,
        jwt_secret: config.jwt_secret.clone(), 
    };
    
    let cors = CorsLayer::new()
        .allow_origin(config.frontend_url.parse::<HeaderValue>().unwrap()) 
        .allow_methods([
            Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ]);

    
    let app = routes::create_router(state)
        .nest_service("/static", ServeDir::new("static")) // <-- Раздача статики
        .layer(TraceLayer::new_for_http()) 
        .layer(cors);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], config.port)); 
    tracing::info!("🚀 Сервер Museum запущен на http://{}", addr);
    
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

    tracing::info!("🛑 Получен сигнал завершения. Сервер останавливается...");
}
