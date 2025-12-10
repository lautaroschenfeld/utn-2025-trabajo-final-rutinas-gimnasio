from functools import lru_cache
from typing import List

from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    app_name: str = "Sistema de Rutinas de Gimnasio"
    debug: bool = False
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/gimnasio",
        env="DATABASE_URL",
    )
    cors_origins: List[str] = Field(default_factory=lambda: ["*"], env="CORS_ORIGINS")
    api_key: str | None = Field(default=None, env="API_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @validator("cors_origins", pre=True)
    def split_cors_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache()
def get_settings() -> Settings:
    return Settings()
