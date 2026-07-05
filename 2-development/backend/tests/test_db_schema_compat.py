from sqlalchemy import create_engine, inspect, text

from app.core.database import ensure_slot_schema_compatibility


def test_ensure_slot_schema_adds_missing_zone_name_column():
    engine = create_engine("sqlite:///:memory:")

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE slots (
                    id INTEGER PRIMARY KEY,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME NOT NULL,
                    capacity INTEGER NOT NULL,
                    available_spots INTEGER NOT NULL,
                    instructor_name VARCHAR(255) NOT NULL,
                    format_name VARCHAR(100) NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'scheduled'
                )
                """
            )
        )

    ensure_slot_schema_compatibility(engine)

    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("slots")}

    assert "zone_name" in columns
    assert "price" in columns
