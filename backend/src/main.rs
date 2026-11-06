use axum::{
    http::{HeaderValue, Method},
    Router,
};
use tower_http::cors::CorsLayer;

mod routes;
mod handlers;
mod db;
mod models;

use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL не задан в .env");
    let pool = db::create_pool(&database_url).await;
    println!("✅ Успешно подключились к PostgreSQL");

    let state = AppState { db: pool };

    
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap()) 
        .allow_origin("http://127.0.0.1:5173".parse::<HeaderValue>().unwrap())
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ]);

    let app = routes::create_router(state).layer(cors);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("🚀 Сервер Museum запущен на http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
