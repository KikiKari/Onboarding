from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_contact_accepts_valid_payload() -> None:
    response = client.post(
        "/api/contact",
        json={"name": "Ada Lovelace", "email": "ada@example.com", "message": "Ich interessiere mich für Vision-Check."},
    )
    assert response.status_code == 202
    assert response.json()["accepted"] is True


def test_contact_rejects_invalid_payload() -> None:
    response = client.post("/api/contact", json={"name": "A", "email": "invalid", "message": "kurz"})
    assert response.status_code == 422
