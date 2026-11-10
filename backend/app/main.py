
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routes import router as reports_router
from app.auth_routes import router as auth_router


# =====================================
# DATABASE INITIALIZATION
# =====================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


# =====================================
# FASTAPI APPLICATION
# =====================================

app = FastAPI(
    title="CivicRelief API",
    description=(
        "Civic issue reporting and "
        "disaster relief coordination"
    ),
    version="0.2.0",
    lifespan=lifespan,
)


# =====================================
# CORS CONFIGURATION
# =====================================


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# ROOT ENDPOINT
# =====================================

@app.get("/")
def home():
    return {
        "message": "Welcome to CivicRelief",
        "status": "running",
    }


# =====================================
# HEALTH CHECK
# =====================================

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CivicRelief API",
        "version": "0.2.0",
    }


# =====================================
# API ROUTER REGISTRATION
# =====================================

app.include_router(reports_router)
app.include_router(auth_router)
