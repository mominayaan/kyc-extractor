from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import boto3
from botocore.exceptions import ClientError
import os
from uuid import uuid4
import asyncio
from concurrent.futures import ThreadPoolExecutor
from models.Document import Document

# from modules.tasks import process_document
from config.celery import app
from config.s3_client import s3_client

router = APIRouter()


BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def upload_to_s3(file_content: bytes, key: str, content_type: str) -> str:
    """Upload file to S3 and return the URL."""
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME, Key=key, Body=file_content, ContentType=content_type
        )

        # Generate presigned URL
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, "Key": key},
            ExpiresIn=3600,  # URL expires in 1 hour
        )
        return url
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file to S3")


@router.post("/upload")
async def upload_file(file: UploadFile):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    try:
        # Read file content
        contents = await file.read()

        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{uuid4()}.{file_extension}"
        key = f"uploads/{unique_filename}"

        # Upload to S3 in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as pool:
            url = await loop.run_in_executor(
                pool,
                upload_to_s3,
                contents,
                key,
                file.content_type or "application/octet-stream",
            )

        document = Document(
            file_name=file.filename.split(".")[0], s3_file_name=key
        ).save()

        app.send_task("modules.tasks.process_document", args=[str(document.id)])

        return JSONResponse({"url": url, "fileName": unique_filename})

    except Exception as e:
        print(f"Error processing upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))
