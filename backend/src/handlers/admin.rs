use axum::{
    extract::{State, Path, Multipart},
    Json,
    http::StatusCode,
};
use uuid::Uuid;
use std::path::PathBuf;
use tokio::fs;
use crate::AppState;
use crate::error::AppError;
use crate::models::{Museum, CreateMuseumRequest, UpdateMuseumImagesRequest};

pub async fn create_museum(
    State(state): State<AppState>,
    Json(payload): Json<CreateMuseumRequest>,
) -> Result<Json<Museum>, AppError> {
    let museum = sqlx::query_as::<_, Museum>(
        r#"
        INSERT INTO museums (
            name, name_kz, description, description_kz, 
            city, city_kz, address, address_kz, 
            founded_year, image_url, two_gis_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING 
            id, name, name_kz, description, description_kz, 
            city, city_kz, address, address_kz, 
            founded_year, image_url, image_urls, two_gis_url,
            NULL::float8 as average_rating
        "#
    )
    .bind(&payload.name)
    .bind(&payload.name_kz)
    .bind(&payload.description)
    .bind(&payload.description_kz)
    .bind(&payload.city)
    .bind(&payload.city_kz)
    .bind(&payload.address)
    .bind(&payload.address_kz)
    .bind(payload.founded_year)
    .bind(&payload.image_url)
    .bind(&payload.two_gis_url)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Ошибка БД при создании музея: {}", e);
        AppError::Internal(e.to_string())
    })?;

    Ok(Json(museum))
}

pub async fn update_museum(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<CreateMuseumRequest>,
) -> Result<Json<Museum>, AppError> {
    let museum = sqlx::query_as::<_, Museum>(
        r#"
        UPDATE museums SET 
            name = $1, name_kz = $2, description = $3, description_kz = $4, 
            city = $5, city_kz = $6, address = $7, address_kz = $8, 
            founded_year = $9, image_url = $10, two_gis_url = $11
        WHERE id = $12
        RETURNING 
            id, name, name_kz, description, description_kz, 
            city, city_kz, address, address_kz, 
            founded_year, image_url, image_urls, two_gis_url,
            NULL::float8 as average_rating
        "#
    )
    .bind(&payload.name)
    .bind(&payload.name_kz)
    .bind(&payload.description)
    .bind(&payload.description_kz)
    .bind(&payload.city)
    .bind(&payload.city_kz)
    .bind(&payload.address)
    .bind(&payload.address_kz)
    .bind(payload.founded_year)
    .bind(&payload.image_url)
    .bind(&payload.two_gis_url)
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or(AppError::NotFound("Музей не найден".into()))?;

    Ok(Json(museum))
}

pub async fn update_museum_images(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateMuseumImagesRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "UPDATE museums SET image_urls = $1 WHERE id = $2"
    )
    .bind(&payload.image_urls)
    .bind(id)
    .execute(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Музей не найден".into()));
    }

    Ok(Json(serde_json::json!({
        "message": "Карусель успешно обновлена",
        "image_urls": payload.image_urls
    })))
}

pub async fn delete_museum(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query("DELETE FROM museums WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Музей не найден".into()));
    }

    Ok(StatusCode::NO_CONTENT)
}

pub async fn upload_image(
    State(_state): State<AppState>,
    Path(museum_id): Path<Uuid>,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let mut file_name = String::new();

    while let Some(field) = multipart.next_field().await.map_err(|e| AppError::BadRequest(e.to_string()))? {
        let name = field.name().unwrap_or("").to_string();
        
        if name == "image" {
            let original_filename = field.file_name().unwrap_or("upload.jpg").to_string();
            let extension = std::path::Path::new(&original_filename)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("jpg");
            
            let unique_id = Uuid::new_v4();
            file_name = format!("{}_{}.{}", museum_id, unique_id, extension);
            
            let file_path = PathBuf::from("static").join(&file_name);

            let data = field.bytes().await.map_err(|e| AppError::BadRequest(e.to_string()))?;
            
            fs::write(&file_path, data).await.map_err(|e| AppError::Internal(format!("Ошибка сохранения файла: {}", e)))?;
            
            break;
        }
    }

    if file_name.is_empty() {
        return Err(AppError::BadRequest("Файл не найден в запросе (ожидается поле 'image')".into()));
    }

    let url = format!("/static/{}", file_name);
    
    Ok(Json(serde_json::json!({
        "message": "Файл успешно загружен",
        "image_url": url
    })))
}

pub async fn delete_any_comment(
    State(state): State<AppState>,
    Path(comment_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query("DELETE FROM comments WHERE id = $1")
        .bind(comment_id)
        .execute(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Комментарий не найден".into()));
    }

    Ok(StatusCode::NO_CONTENT)
}

pub async fn delete_any_review(
    State(state): State<AppState>,
    Path(review_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query("DELETE FROM reviews WHERE id = $1")
        .bind(review_id)
        .execute(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Отзыв не найден".into()));
    }

    Ok(StatusCode::NO_CONTENT)
}
