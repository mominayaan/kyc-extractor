import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Config
from config.db import connect_db
from api import router as api_router

# Load configuration and database connection
connect_db()

app = FastAPI(
    title="KYC Dashboard",
    docs_url=None if Config.ENV == "prod" else "/docs",
    redoc_url=None if Config.ENV == "prod" else "/redoc",
)

# Configure CORS - Update these settings
origins = [
    "http://localhost:3000",  # React default port
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    # Add any other origins you need
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Hello from KYC Dashboard"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=Config.API_PORT)
