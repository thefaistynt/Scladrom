from datetime import date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine, init_db
from app.main import app
from app.models.booking import Booking
from app.models.client import Client
from app.models.info import InfoPage
from app.models.slot import Slot
from app.core.security import hash_password
from app.models.notification_settings import NotificationSettings


@pytest.fixture()
def client() -> TestClient:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    original_create_tables_on_startup = settings.create_tables_on_startup
    settings.create_tables_on_startup = False

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        settings.create_tables_on_startup = original_create_tables_on_startup


@pytest.fixture()
def db_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_init_db_seeds_default_data() -> None:
    Base.metadata.drop_all(bind=engine)
    init_db()

    with SessionLocal() as session:
        assert session.query(Slot).count() > 0


def test_init_db_loads_mock_seed_data() -> None:
    Base.metadata.drop_all(bind=engine)
    init_db()

    with SessionLocal() as session:
        assert session.query(Client).filter(Client.email == "alex@example.com").count() == 1
        assert session.query(Slot).count() >= 2
        assert session.query(Booking).count() >= 1


def test_register_client_with_age_and_terms(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "john@example.com",
            "full_name": "John Doe",
            "password": "secret123",
            "birth_date": "2000-01-01",
            "accepted_terms": True,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["email"] == "john@example.com"
    assert payload["full_name"] == "John Doe"


def test_register_client_after_init_db_seed(client: TestClient) -> None:
    Base.metadata.drop_all(bind=engine)
    init_db()

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "secret123",
            "birth_date": "2000-01-01",
            "accepted_terms": True,
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"


def test_slot_validation_rejects_invalid_capacity() -> None:
    with pytest.raises(ValueError):
        Slot(
            start_time=datetime.utcnow() + timedelta(days=1),
            end_time=datetime.utcnow() + timedelta(days=1, hours=1),
            capacity=0,
            available_spots=0,
            instructor_name="Илья",
            format_name="Beginner",
            status="scheduled",
        )


def test_slot_validation_rejects_spots_above_capacity() -> None:
    with pytest.raises(ValueError):
        Slot(
            start_time=datetime.utcnow() + timedelta(days=1),
            end_time=datetime.utcnow() + timedelta(days=1, hours=1),
            capacity=2,
            available_spots=3,
            instructor_name="Илья",
            format_name="Beginner",
            status="scheduled",
        )


def test_booking_validation_rejects_invalid_status() -> None:
    with pytest.raises(ValueError):
        Booking(
            client_id=1,
            slot_id=1,
            status="unknown_status",
            booked_at=datetime.utcnow(),
        )


def test_create_booking_rejects_cancelled_slot(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=1),
        end_time=datetime.utcnow() + timedelta(days=1, hours=1),
        capacity=8,
        available_spots=2,
        instructor_name="Илья",
        format_name="Beginner",
        status="cancelled_by_gym",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.post(
        "/api/v1/bookings",
        json={"slot_id": slot.id, "seats_count": 1, "offer_accepted": True},
    )

    assert response.status_code == 410
    assert response.json()["detail"] == "slot is cancelled"


def test_create_booking_rejects_advanced_slot_for_beginner_client(client: TestClient, db_session: Session) -> None:
    client_record = Client(
        email="beginner@example.com",
        full_name="Beginner User",
        password_hash=hash_password("secret123"),
        birth_date=date(1995, 1, 1),
        accepted_terms=True,
        experience_level="beginner",
    )
    db_session.add(client_record)
    db_session.commit()

    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=2),
        end_time=datetime.utcnow() + timedelta(days=2, hours=1),
        capacity=6,
        available_spots=6,
        instructor_name="Марина",
        format_name="Advanced",
        status="scheduled",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.post(
        "/api/v1/bookings",
        json={"slot_id": slot.id, "seats_count": 1, "offer_accepted": True},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "slot format is not suitable for this client"


def test_create_booking_calculates_rental_price(client: TestClient, db_session: Session) -> None:
    client_record = Client(
        email="experienced@example.com",
        full_name="Experienced User",
        password_hash=hash_password("secret123"),
        birth_date=date(1990, 1, 1),
        accepted_terms=True,
        experience_level="experienced",
    )
    db_session.add(client_record)
    db_session.commit()

    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=3),
        end_time=datetime.utcnow() + timedelta(days=3, hours=1),
        capacity=4,
        available_spots=4,
        instructor_name="Илья",
        format_name="Beginner",
        price=2000,
        status="scheduled",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.post(
        "/api/v1/bookings",
        json={"slot_id": slot.id, "seats_count": 1, "rental_option": "full", "offer_accepted": True},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["training_amount"] == 2000
    assert payload["rental_amount"] == 1000
    assert payload["total_amount"] == 3000


def test_get_visiting_rules_returns_document(client: TestClient, db_session: Session) -> None:
    db_session.add(InfoPage(title="Правила посещения", content="Приходите за 10 минут до начала тренировки."))
    db_session.commit()

    response = client.get("/api/v1/info/visiting-rules")

    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Правила посещения"
    assert payload["address"]
    assert payload["schedule"]
    assert payload["what_to_bring"]
    assert payload["safety_rules"]


def test_notification_settings_can_be_read_and_updated(client: TestClient, db_session: Session) -> None:
    settings = NotificationSettings(client_id=1, enabled=True, reminder_minutes_before=60, cancellation_notifications=True)
    db_session.add(settings)
    db_session.commit()

    response = client.get("/api/v1/me/notification-settings")
    assert response.status_code == 200
    payload = response.json()
    assert payload["enabled"] is True
    assert payload["reminderMinutesBefore"] == 60
    assert payload["cancellationNotifications"] is True

    update_response = client.put(
        "/api/v1/me/notification-settings",
        json={"enabled": False, "reminderMinutesBefore": 120, "cancellationNotifications": False},
    )
    assert update_response.status_code == 200
    updated_payload = update_response.json()
    assert updated_payload["enabled"] is False
    assert updated_payload["reminderMinutesBefore"] == 120
    assert updated_payload["cancellationNotifications"] is False


def test_login_uses_hashed_password(client: TestClient, db_session: Session) -> None:
    password = "secret123"
    client_record = Client(
        email="login@example.com",
        full_name="Login User",
        password_hash=hash_password(password),
        birth_date=date(1990, 1, 1),
        accepted_terms=True,
    )
    db_session.add(client_record)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": password,
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == "login@example.com"


def test_login_rejects_wrong_password(client: TestClient, db_session: Session) -> None:
    client_record = Client(
        email="wrong-password@example.com",
        full_name="Wrong Password User",
        password_hash=hash_password("correct-password"),
        birth_date=date(1990, 1, 1),
        accepted_terms=True,
    )
    db_session.add(client_record)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrong-password@example.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "invalid credentials"


def test_list_slots_filters_by_format(client: TestClient, db_session: Session) -> None:
    beginner_slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=1, hours=2),
        end_time=datetime.utcnow() + timedelta(days=1, hours=3),
        capacity=6,
        available_spots=6,
        instructor_name="Илья",
        format_name="Beginner",
        status="scheduled",
    )
    advanced_slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=1, hours=4),
        end_time=datetime.utcnow() + timedelta(days=1, hours=5),
        capacity=6,
        available_spots=6,
        instructor_name="Марина",
        format_name="Advanced",
        status="scheduled",
    )
    db_session.add_all([beginner_slot, advanced_slot])
    db_session.commit()

    response = client.get("/api/v1/slots?format=Beginner")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["format_name"] == "Beginner"


def test_get_slot_detail_returns_slot_data(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=2),
        end_time=datetime.utcnow() + timedelta(days=2, hours=1),
        capacity=8,
        available_spots=4,
        instructor_name="Анна",
        format_name="Intermediate",
        zone_name="Main Zone",
        price=1500,
        status="scheduled",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.get(f"/api/v1/slots/{slot.id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == slot.id
    assert payload["instructor_name"] == "Анна"
    assert payload["zone_name"] == "Main Zone"
    assert payload["price"] == 1500


def test_get_booking_detail_returns_booking_data(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=3),
        end_time=datetime.utcnow() + timedelta(days=3, hours=1),
        capacity=4,
        available_spots=4,
        instructor_name="Лена",
        format_name="Beginner",
        status="scheduled",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    booking = Booking(
        client_id=1,
        slot_id=slot.id,
        status="confirmed",
        booked_at=datetime.utcnow(),
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.get(f"/api/v1/bookings/{booking.id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == booking.id
    assert payload["slot_id"] == slot.id


def test_cancel_booking_for_gym_cancelled_slot_marks_booking_as_cancelled_by_gym(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=2),
        end_time=datetime.utcnow() + timedelta(days=2, hours=1),
        capacity=4,
        available_spots=4,
        instructor_name="Саша",
        format_name="Beginner",
        status="cancelled_by_gym",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    booking = Booking(
        client_id=1,
        slot_id=slot.id,
        status="confirmed",
        booked_at=datetime.utcnow(),
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.delete(f"/api/v1/bookings/{booking.id}")

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled_by_gym"

    with SessionLocal() as fresh_session:
        updated_booking = fresh_session.query(Booking).filter(Booking.id == booking.id).one()
        assert updated_booking.status == "cancelled_by_gym"


def test_booking_api_contract_exposes_expected_fields(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=4),
        end_time=datetime.utcnow() + timedelta(days=4, hours=1),
        capacity=4,
        available_spots=4,
        instructor_name="Аня",
        format_name="Beginner",
        status="scheduled",
        price=1800,
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.post(
        "/api/v1/bookings",
        json={"slot_id": slot.id, "seats_count": 1, "rental_option": "full", "offer_accepted": True},
    )

    assert response.status_code == 201
    payload = response.json()
    assert set(payload.keys()) >= {"id", "status", "training_amount", "rental_amount", "total_amount", "slot"}
    assert payload["status"] == "confirmed"
    assert payload["training_amount"] == 1800
    assert payload["rental_amount"] == 1000
    assert payload["total_amount"] == 2800


def test_create_booking_requires_offer_acceptance(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(days=5),
        end_time=datetime.utcnow() + timedelta(days=5, hours=1),
        capacity=4,
        available_spots=4,
        instructor_name="Аня",
        format_name="Beginner",
        status="scheduled",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    response = client.post(
        "/api/v1/bookings",
        json={"slot_id": slot.id, "seats_count": 1},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "offer must be accepted"


def test_cancel_booking_within_24_hours_is_rejected(client: TestClient, db_session: Session) -> None:
    slot = Slot(
        start_time=datetime.utcnow() + timedelta(hours=12),
        end_time=datetime.utcnow() + timedelta(hours=13),
        capacity=4,
        available_spots=4,
        instructor_name="Саша",
        format_name="Beginner",
        status="scheduled",
    )
    db_session.add(slot)
    db_session.commit()
    db_session.refresh(slot)

    booking = Booking(
        client_id=1,
        slot_id=slot.id,
        status="confirmed",
        booked_at=datetime.utcnow(),
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    response = client.delete(f"/api/v1/bookings/{booking.id}")

    assert response.status_code == 409
    assert response.json()["detail"] == "cancellation is not allowed within 24 hours"
