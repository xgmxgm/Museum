use axum::{
    extract::{State, Path, Query},
    Json,
};
use uuid::Uuid;
use serde::Deserialize;
use crate::AppState;
use crate::error::AppError;
use crate::models::Museum;

#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub lang: Option<String>,
}

pub async fn get_museums(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<serde_json::Value>>, AppError> {
    let page = pagination.page.unwrap_or(1);
    let limit = pagination.limit.unwrap_or(10);
    let offset = (page.saturating_sub(1)) * limit;
    let lang = pagination.lang.unwrap_or_else(|| "ru".to_string());

    let museums = sqlx::query_as::<_, Museum>(
        r#"
        SELECT 
            m.id, m.name, m.name_kz, m.description, m.description_kz,
            m.city, m.address, m.founded_year,
            m.image_url, m.two_gis_url,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        GROUP BY m.id
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let response: Vec<serde_json::Value> = museums
        .into_iter()
        .map(|m| {
            
            let (kz_name, kz_desc, ru_city, kz_city, ru_addr, kz_addr) = match m.name.as_str() {
                "Музей Абая" => (
                    "Абай мұражайы",
                    "Абай Құнанбаевтың әдеби-мемориалдық мұражайы.",
                    "Семей", "Семей", "ул. Абая, 10", "Абай көшесі, 10"
                ),
                "Музей Мухтара Ауэзова" => (
                    "Мұхтар Әуезов мұражайы",
                    "Мұхтар Әуезовтің әдеби-мемориалдық мұражайы.",
                    "Алматы", "Алматы", "ул. Тулебаева, 185", "Төлебаев көшесі, 185"
                ),
                "Музей Ахмета Байтурсынова" => (
                    "Ахмет Байтұрсынов мұражайы",
                    "Ахмет Байтұрсыновтың мұражайы.",
                    "Алматы", "Алматы", "ул. Байтурсынова, 60", "Байтұрсынов көшесі, 60"
                ),
                "Музей Габита Мусрепова" => (
                    "Ғабит Мүсірепов мұражайы",
                    "Ғабит Мүсіреповтің әдеби-мемориалдық мұражайы.",
                    "Алматы", "Алматы", "ул. Карасай батыра, 49/130", "Қарасай батыр көшесі, 49/130"
                ),
                "Музей Сакена Сейфуллина" => (
                    "Сәкен Сейфуллин мұражайы",
                    "Сәкен Сейфуллиннің мұражайы.",
                    "Астана", "Астана", "ул. Сейфуллина, 30", "Сейфуллин көшесі, 30"
                ),
                _ => (
                    m.name.as_str(), 
                    m.description.as_str(), 
                    m.city.as_str(), 
                    m.city.as_str(), 
                    m.address.as_str(), 
                    m.address.as_str()
                ),
            };

            let name = if lang == "kz" { kz_name } else { m.name.as_str() };
            let description = if lang == "kz" { kz_desc } else { m.description.as_str() };
            let city = if lang == "kz" { kz_city } else { ru_city };
            let address = if lang == "kz" { kz_addr } else { ru_addr };

            serde_json::json!({
                "id": m.id,
                "name": name,
                "description": description,
                "city": city,           
                "address": address,     
                "founded_year": m.founded_year,
                "average_rating": m.average_rating,
                "image_url": m.image_url,
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
            m.city, m.address, m.founded_year,
            m.image_url, m.two_gis_url,
            AVG(r.rating)::float8 as average_rating
        FROM museums m
        LEFT JOIN reviews r ON m.id = r.museum_id
        WHERE m.id = $1
        GROUP BY m.id
        "#
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or(AppError::NotFound("Музей не найден".into()))?;

    
    let (kz_name, kz_desc, ru_city, kz_city, ru_addr, kz_addr) = match museum.name.as_str() {
        "Музей Абая" => (
            "Абай мұражайы",
            "Абай Құнанбаевтың әдеби-мемориалдық мұражайы.",
            "Семей", "Семей", "ул. Абая, 10", "Абай көшесі, 10"
        ),
        "Музей Мухтара Ауэзова" => (
            "Мұхтар Әуезов мұражайы",
            "Мұхтар Әуезовтің әдеби-мемориалдық мұражайы.",
            "Алматы", "Алматы", "ул. Тулебаева, 185", "Төлебаев көшесі, 185"
        ),
        "Музей Ахмета Байтурсынова" => (
            "Ахмет Байтұрсынов мұражайы",
            "Ахмет Байтұрсыновтың мұражайы.",
            "Алматы", "Алматы", "ул. Байтурсынова, 60", "Байтұрсынов көшесі, 60"
        ),
        "Музей Габита Мусрепова" => (
            "Ғабит Мүсірепов мұражайы",
            "Ғабит Мүсіреповтің әдеби-мемориалдық мұражайы.",
            "Алматы", "Алматы", "ул. Карасай батыра, 49/130", "Қарасай батыр көшесі, 49/130"
        ),
        "Музей Сакена Сейфуллина" => (
            "Сәкен Сейфуллин мұражайы",
            "Сәкен Сейфуллиннің мұражайы.",
            "Астана", "Астана", "ул. Сейфуллина, 30", "Сейфуллин көшесі, 30"
        ),
        _ => (
            museum.name.as_str(), 
            museum.description.as_str(), 
            museum.city.as_str(), 
            museum.city.as_str(), 
            museum.address.as_str(), 
            museum.address.as_str()
        ),
    };

    let name = if lang == "kz" { kz_name } else { museum.name.as_str() };
    let description = if lang == "kz" { kz_desc } else { museum.description.as_str() };
    let city = if lang == "kz" { kz_city } else { ru_city };
    let address = if lang == "kz" { kz_addr } else { ru_addr };

    Ok(Json(serde_json::json!({
        "id": museum.id,
        "name": name,
        "description": description,
        "city": city,
        "address": address,
        "founded_year": museum.founded_year,
        "average_rating": museum.average_rating,
        "image_url": museum.image_url,
        "two_gis_url": museum.two_gis_url,
    })))
}
