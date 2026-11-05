use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Museum {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub city: String,
    pub address: String,
    pub founded_year: Option<i32>,
}
