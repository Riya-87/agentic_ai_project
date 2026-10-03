import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.seeds.seed_data import seed_database

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_academic.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def setup_module():
    db = TestingSessionLocal()
    seed_database(db)
    db.close()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_demo_user():
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "alex.chen@university.edu", "password": "student123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" == list(data.keys())[0] or "access_token" in data
    assert data["user"]["email"] == "alex.chen@university.edu"

def test_opportunities_and_matching():
    # Login
    login_res = client.post(
        "/api/v1/auth/login/json",
        json={"email": "alex.chen@university.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List opportunities
    opps_res = client.get("/api/v1/opportunities", headers=headers)
    assert opps_res.status_code == 200
    opps = opps_res.json()
    assert len(opps) > 0
    assert "opportunity" in opps[0]
    assert "match" in opps[0]
    assert "overall_match" in opps[0]["match"]

def test_ai_assistant_grounded_chat():
    login_res = client.post(
        "/api/v1/auth/login/json",
        json={"email": "alex.chen@university.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    chat_res = client.post(
        "/api/v1/assistant/chat",
        json={"message": "What deadlines do I have this week?"},
        headers=headers
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "response" in chat_data
    assert len(chat_data["response"]) > 10

def test_deadlines_and_analytics():
    login_res = client.post(
        "/api/v1/auth/login/json",
        json={"email": "alex.chen@university.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Deadlines
    dl_res = client.get("/api/v1/deadlines", headers=headers)
    assert dl_res.status_code == 200
    
    # Analytics
    analytics_res = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_opportunities"] > 0
    assert len(analytics_data["category_distribution"]) > 0
