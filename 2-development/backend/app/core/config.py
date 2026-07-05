from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Client Booking API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./app.db"
    create_tables_on_startup: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
