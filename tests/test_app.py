from fastapi.testclient import TestClient

from app import app


def test_app_title():
    assert app.title == "Curriculum Vitae"


def test_mounts_static_files_at_root():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert "Curriculum Vitae" in response.text


def test_serves_assets_directory():
    client = TestClient(app)
    response = client.get("/assets/nonexistent.txt")
    assert response.status_code == 404
