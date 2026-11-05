mod routes;
mod handlers;
mod db;

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


    let app = routes::create_router(state);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("🚀 Сервер Museum запущен на http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
