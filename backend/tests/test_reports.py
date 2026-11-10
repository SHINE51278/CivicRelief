from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models import User
from app.auth import hash_password


def create_authenticated_citizen(client):
    """Register and log in a unique test citizen."""

    email = f"test_{uuid4().hex[:10]}@example.com"
    password = "TestCitizen@123"

    registration = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Citizen",
            "email": email,
            "password": password,
        },
    )

    assert registration.status_code == 201, registration.text

    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login.status_code == 200, login.text

    token = login.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def create_authenticated_admin(client):
    """Create and log in a unique test administrator."""

    email = f"admin_{uuid4().hex[:10]}@example.com"
    password = "TestAdmin@123"

    db = SessionLocal()

    try:
        admin = User(
            full_name="Test Administrator",
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

    finally:
        db.close()

    login = client.post(
        "/api/v1/auth/admin-login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login.status_code == 200, login.text

    token = login.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def create_test_report(client, headers):
    """Create a report and return its response data."""

    payload = {
        "title": "Automated test streetlight",
        "description": "Testing report creation and retrieval.",
        "category": "civic",
        "location": "Test location",
    }

    response = client.post(
        "/api/v1/reports/",
        json=payload,
        headers=headers,
    )

    assert response.status_code == 201, response.text

    return response.json()


def test_create_and_retrieve_report():
    with TestClient(app) as client:

        headers = create_authenticated_citizen(client)

        payload = {
            "title": "Automated test streetlight",
            "description": "Testing report creation and retrieval.",
            "category": "civic",
            "location": "Test location",
        }

        response = client.post(
            "/api/v1/reports/",
            json=payload,
            headers=headers,
        )

        assert response.status_code == 201

        report = response.json()

        assert report["title"] == payload["title"]
        assert report["status"] == "Submitted"

        response = client.get(
            "/api/v1/reports/mine",
            headers=headers,
        )

        assert response.status_code == 200

        reports = response.json()

        assert any(
            item["id"] == report["id"]
            for item in reports
        )


def test_invalid_report_category():
    with TestClient(app) as client:

        headers = create_authenticated_citizen(client)

        payload = {
            "title": "Invalid category test",
            "description": "Testing invalid category validation.",
            "category": "unknown",
            "location": "Test location",
        }

        response = client.post(
            "/api/v1/reports/",
            json=payload,
            headers=headers,
        )

        assert response.status_code == 422


def test_report_endpoints_require_authentication():
    with TestClient(app) as client:

        response = client.get("/api/v1/reports/mine")

        assert response.status_code == 401

        response = client.post(
            "/api/v1/reports/",
            json={
                "title": "Unauthorized report",
                "description": "This request should be rejected.",
                "category": "civic",
                "location": "Test location",
            },
        )

        assert response.status_code == 401


def test_new_report_creates_initial_history():
    """A new report should automatically get a Submitted history record."""

    with TestClient(app) as client:

        citizen_headers = create_authenticated_citizen(client)

        report = create_test_report(client, citizen_headers)

        response = client.get(
            f"/api/v1/reports/mine/{report['id']}/history",
            headers=citizen_headers,
        )

        assert response.status_code == 200, response.text

        history = response.json()

        assert len(history) >= 1
        assert history[0]["old_status"] is None
        assert history[0]["new_status"] == "Submitted"
        assert history[0]["remarks"] == "Report submitted"


def test_admin_can_update_status_with_remarks():
    """Admin status changes and remarks should be saved in history."""

    with TestClient(app) as client:

        citizen_headers = create_authenticated_citizen(client)
        admin_headers = create_authenticated_admin(client)

        report = create_test_report(client, citizen_headers)

        remarks = "The issue has been inspected and assigned for action."

        response = client.patch(
            f"/api/v1/reports/{report['id']}/status",
            json={
                "status": "In Review",
                "remarks": remarks,
            },
            headers=admin_headers,
        )

        assert response.status_code == 200, response.text

        response = client.get(
            f"/api/v1/reports/{report['id']}/history",
            headers=admin_headers,
        )

        assert response.status_code == 200, response.text

        history = response.json()

        assert len(history) >= 2

        latest = history[-1]

        assert latest["old_status"] == "Submitted"
        assert latest["new_status"] == "In Review"
        assert latest["remarks"] == remarks
        assert latest["changed_by_name"] == "Test Administrator"


def test_citizen_cannot_access_another_citizens_history():
    """A citizen must not access another citizen's report history."""

    with TestClient(app) as client:

        first_citizen = create_authenticated_citizen(client)
        second_citizen = create_authenticated_citizen(client)

        report = create_test_report(client, first_citizen)

        response = client.get(
            f"/api/v1/reports/mine/{report['id']}/history",
            headers=second_citizen,
        )

        assert response.status_code == 404