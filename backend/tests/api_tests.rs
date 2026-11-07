use reqwest::Client;
use serde_json::json;

// Базовый URL (сервер должен быть запущен на этом порту!)
const BASE_URL: &str = "http://127.0.0.1:3000";

#[tokio::test]
async fn test_health_check() {
    let client = Client::new();
    let res = client
        .get(format!("{}/health", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(res.status(), 200);
    let text = res.text().await.unwrap();
    assert_eq!(text, "OK");
}

#[tokio::test]
async fn test_get_museums() {
    let client = Client::new();
    let res = client
        .get(format!("{}/api/museums", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(res.status(), 200);
    let museums: Vec<serde_json::Value> = res.json().await.unwrap();
    assert!(museums.len() >= 5, "Должно быть минимум 5 музеев");
}

#[tokio::test]
async fn test_auth_fail_without_token() {
    let client = Client::new();
    let res = client
        .get(format!("{}/api/users/me", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(res.status(), 401, "Без токена должно быть 401");
}

#[tokio::test]
async fn test_register_and_login() {
    let client = Client::new();
    let test_user = json!({
        "username": format!("testuser_{}", uuid::Uuid::new_v4()),
        "email": format!("test_{}@museum.kz", uuid::Uuid::new_v4()),
        "password": "password123"
    });

    // Регистрация
    let res = client
        .post(format!("{}/api/auth/register", BASE_URL))
        .json(&test_user)
        .send()
        .await
        .expect("Failed to register");

    assert_eq!(res.status(), 200, "Регистрация должна вернуть 200");
    let auth: serde_json::Value = res.json().await.unwrap();
    assert!(auth["token"].is_string(), "Должен быть токен");

    // Логин
    let login_data = json!({
        "email": test_user["email"],
        "password": "password123"
    });
    let res = client
        .post(format!("{}/api/auth/login", BASE_URL))
        .json(&login_data)
        .send()
        .await
        .expect("Failed to login");

    assert_eq!(res.status(), 200, "Логин должен вернуть 200");
    let auth: serde_json::Value = res.json().await.unwrap();
    assert!(auth["token"].is_string(), "Должен быть токен");
}

#[tokio::test]
async fn test_get_museum_by_id_not_found() {
    let client = Client::new();
    // Несуществующий UUID
    let fake_id = "00000000-0000-0000-0000-000000000000";
    let res = client
        .get(format!("{}/api/museums/{}", BASE_URL, fake_id))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(res.status(), 404, "Несуществующий музей должен вернуть 404");
}

#[tokio::test]
async fn test_create_comment_without_token() {
    let client = Client::new();
    let museum_id = "073a81a9-0825-4461-b220-1aad4192a38f"; // ID первого музея
    let payload = json!({ "content": "Тестовый комментарий" });

    let res = client
        .post(format!("{}/api/museums/{}/comments", BASE_URL, museum_id))
        .json(&payload)
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(res.status(), 401, "Без токена комментарий не должен создаваться");
}
