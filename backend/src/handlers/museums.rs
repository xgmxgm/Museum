use axum::{
    extract::{State, Path, Query},
    Json,
};
use uuid::Uuid;
use serde::Deserialize;
use sqlx::QueryBuilder; 
use crate::AppState;
use crate::error::AppError;
use crate::models::Museum;

#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub lang: Option<String>,
    pub search: Option<String>, 
    pub city: Option<String>,   
}

pub async fn get_museums(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<serde_json::Value>>, AppError> {
    let page = pagination.page.unwrap_or(1);
    let limit = pagination.limit.unwrap_or(10);
    let offset = (page.saturating_sub(1)) * limit;
    let lang = pagination.lang.unwrap_or_else(|| "ru".to_string());

        let mut qb = QueryBuilder::new(
        r#"
        SELECT 
            m.id, m.name, m.name_kz, m.description, m.description_kz,
            m.city, m.city_kz, m.address, m.address_kz, m.founded_year,
            m.image_url, m.image_urls, m.two_gis_url,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        WHERE 1=1
        "#
    );

        if let Some(search) = &pagination.search {
        qb.push(" AND (m.name ILIKE ").push_bind(format!("%{}%", search))
          .push(" OR m.description ILIKE ").push_bind(format!("%{}%", search)).push(")");
    }

    
    if let Some(city) = &pagination.city {
        qb.push(" AND m.city ILIKE ").push_bind(format!("%{}%", city));
    }

    
    qb.push(" GROUP BY m.id, m.name, m.name_kz, m.description, m.description_kz, m.city, m.city_kz, m.address, m.address_kz, m.founded_year, m.image_url, m.image_urls, m.two_gis_url");
    qb.push(" LIMIT ").push_bind(limit as i64);
    qb.push(" OFFSET ").push_bind(offset as i64);

    
    let museums = qb.build_query_as::<Museum>()
        .fetch_all(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    
    let response: Vec<serde_json::Value> = museums
        .into_iter()
        .map(|m| {
            let name = if lang == "kz" { m.name_kz.unwrap_or(m.name.clone()) } else { m.name.clone() };
            let description = if lang == "kz" { m.description_kz.unwrap_or(m.description.clone()) } else { m.description.clone() };
            
            let (city, address) = if lang == "kz" {
                match m.name.as_str() {
                    "Музей Абая" => ("Семей".to_string(), "Абай көшесі, 10".to_string()),
                    "Музей Мухтара Ауэзова" => ("Алматы".to_string(), "Төлебаев көшесі, 185".to_string()),
                    "Музей Ахмета Байтурсынова" => ("Алматы".to_string(), "Байтұрсынов көшесі, 60".to_string()),
                    "Музей Габита Мусрепова" => ("Алматы".to_string(), "Қарасай батыр көшесі, 49/130".to_string()),
                    "Музей Сакена Сейфуллина" => ("Астана".to_string(), "Сейфуллин көшесі, 30".to_string()),
                    _ => (m.city.clone(), m.address.clone()),
                }
            } else {
                (m.city.clone(), m.address.clone())
            };

            serde_json::json!({
                "id": m.id,
                "name": name,
                "description": description,
                "city": city,
                "address": address,
                "founded_year": m.founded_year,
                "average_rating": m.average_rating,
                "image_url": m.image_url,
                "image_urls": m.image_urls,
                "two_gis_url": m.two_gis_url,
            })
        })
        .collect();

    Ok(Json(response))
}


pub async fn get_museum_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<serde_json::Value>, AppError> {
    let lang = pagination.lang.unwrap_or_else(|| "ru".to_string());

    let museum = sqlx::query_as::<_, Museum>(
        r#"
        SELECT 
            m.id, m.name, m.name_kz, m.description, m.description_kz,
            m.city, m.city_kz, m.address, m.address_kz, m.founded_year,
            m.image_url, m.image_urls, m.two_gis_url,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        WHERE m.id = $1
        GROUP BY 
            m.id, m.name, m.name_kz, m.description, m.description_kz, 
            m.city, m.city_kz, m.address, m.address_kz, m.founded_year, m.image_url, m.image_urls, m.two_gis_url
        "#
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or(AppError::NotFound("Музей не найден".into()))?;

    let name = if lang == "kz" { museum.name_kz.unwrap_or(museum.name.clone()) } else { museum.name.clone() };
    let description = if lang == "kz" { museum.description_kz.unwrap_or(museum.description.clone()) } else { museum.description.clone() };
    
    let (city, address) = if lang == "kz" {
        match museum.name.as_str() {
            "Музей Абая" => ("Семей".to_string(), "Абай көшесі, 10".to_string()),
            "Музей Мухтара Ауэзова" => ("Алматы".to_string(), "Төлебаев көшесі, 185".to_string()),
            "Музей Ахмета Байтурсынова" => ("Алматы".to_string(), "Байтұрсынов көшесі, 60".to_string()),
            "Музей Габита Мусрепова" => ("Алматы".to_string(), "Қарасай батыр көшесі, 49/130".to_string()),
            "Музей Сакена Сейфуллина" => ("Астана".to_string(), "Сейфуллин көшесі, 30".to_string()),
            _ => (museum.city.clone(), museum.address.clone()),
        }
    } else {
        (museum.city.clone(), museum.address.clone())
    };

    Ok(Json(serde_json::json!({
        "id": museum.id,
        "name": name,
        "description": description,
        "city": city,
        "address": address,
        "founded_year": museum.founded_year,
        "average_rating": museum.average_rating,
        "image_url": museum.image_url,
        "image_urls": museum.image_urls,
        "two_gis_url": museum.two_gis_url,
    })))
}
