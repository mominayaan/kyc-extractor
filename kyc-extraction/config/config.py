import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    CORS_HEADERS = "Content-Type"
    ENV = "dev"
    API_PORT = os.getenv("API_PORT", 5000)
    DB_NAME = os.getenv("DB_NAME", "KYCExtractorDB")
    DB_URL = os.getenv("DB_URL")
    CORS_ORIGIN_WHITELIST = "*"  # any origin
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION")
    AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
    RABBIT_MQ_URL = os.getenv("RABBIT_MQ_URL")
    FIREWORKS_API_KEY = os.getenv("FIREWORKS_API_KEY")
