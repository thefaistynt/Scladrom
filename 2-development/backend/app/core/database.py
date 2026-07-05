from datetime import datetime, timedelta
from pathlib import Path
from time import sleep

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def _add_column_if_missing(engine_to_check, table_name: str, column_name: str, column_sql: str) -> None:
    inspector = inspect(engine_to_check)
    if table_name not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns(table_name)}
    if column_name not in columns:
        with engine_to_check.begin() as conn:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}"))


def ensure_slot_schema_compatibility(engine_to_check) -> None:
    _add_column_if_missing(engine_to_check, "slots", "zone_name", "VARCHAR(100)")
    _add_column_if_missing(engine_to_check, "slots", "price", "INTEGER")


def ensure_booking_schema_compatibility(engine_to_check) -> None:
    _add_column_if_missing(engine_to_check, "clients", "experience_level", "VARCHAR(50) DEFAULT 'experienced'")
    _add_column_if_missing(engine_to_check, "bookings", "rental_option", "VARCHAR(50) DEFAULT 'none'")
    _add_column_if_missing(engine_to_check, "bookings", "training_amount", "INTEGER DEFAULT 0")
    _add_column_if_missing(engine_to_check, "bookings", "rental_amount", "INTEGER DEFAULT 0")
    _add_column_if_missing(engine_to_check, "bookings", "total_amount", "INTEGER DEFAULT 0")


def load_seed_sql() -> bool:
    seed_path = Path(__file__).resolve().parent.parent / "db" / "seed" / "001_mock_data.sql"
    if not seed_path.exists():
        return False

    statements = []
    buffer = []
    for line in seed_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("--"):
            continue
        buffer.append(stripped)
        if line.rstrip().endswith(";"):
            statement = " ".join(buffer).rstrip(";").strip()
            if statement:
                statements.append(statement)
            buffer = []

    if not statements:
        return False

    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))
    return True


def reset_seed_sequences(engine_to_check) -> None:
    if engine_to_check.dialect.name != "postgresql":
        return

    table_names = [
        "clients",
        "instructors",
        "training_formats",
        "zones",
        "slots",
        "bookings",
        "equipment_rentals",
        "instructor_ratings",
    ]

    with engine_to_check.begin() as conn:
        for table_name in table_names:
            conn.execute(
                text(
                    f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table_name}', 'id'),
                        COALESCE((SELECT MAX(id) + 1 FROM {table_name}), 1),
                        false
                    );
                    """
                )
            )


def init_db() -> None:
    if not settings.create_tables_on_startup:
        return

    for attempt in range(10):
        try:
            from app.models import booking, client, equipment_rental, info, instructor, instructor_rating, notification_settings, slot, training_format, zone  # noqa: F401

            Base.metadata.create_all(bind=engine)
            ensure_slot_schema_compatibility(engine)
            ensure_booking_schema_compatibility(engine)

            with SessionLocal() as db:
                Slot = slot.Slot
                Client = client.Client
                Booking = booking.Booking
                InfoPage = info.InfoPage

                if db.query(Slot).count() == 0 and db.query(Client).count() == 0 and db.query(Booking).count() == 0:
                    if not load_seed_sql():
                        slots = [
                            Slot(
                                start_time=datetime.utcnow() + timedelta(days=1, hours=2),
                                end_time=datetime.utcnow() + timedelta(days=1, hours=3),
                                capacity=8,
                                available_spots=3,
                                instructor_name="Илья",
                                format_name="Beginner",
                                zone_name="Новичковая зона",
                                price=1500,
                                status="scheduled",
                            ),
                            Slot(
                                start_time=datetime.utcnow() + timedelta(days=2, hours=4),
                                end_time=datetime.utcnow() + timedelta(days=2, hours=5),
                                capacity=12,
                                available_spots=10,
                                instructor_name="Марина",
                                format_name="Advanced",
                                zone_name="Основная зона",
                                price=2200,
                                status="scheduled",
                            ),
                        ]
                        db.add_all(slots)
                        db.add(
                            Client(
                                email="alex@example.com",
                                full_name="Алексей",
                                password_hash="placeholder-hash",
                                birth_date=datetime.utcnow().date() - timedelta(days=365 * 25),
                                accepted_terms=True,
                            )
                        )

                if db.query(InfoPage).count() == 0:
                    db.add(InfoPage(title="Правила посещения", content="Приходите за 10 минут до начала тренировки."))

                reset_seed_sequences(engine)
                db.commit()
            return
        except OperationalError:
            if attempt == 9:
                raise
            sleep(2)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
