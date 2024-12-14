from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from models.Document import Document
from typing import Optional
import boto3
from botocore.config import Config
from config import (
    Config as AppConfig,
)  # Assuming you have S3 config in your Config class
from datetime import datetime
from config.celery import app

router = APIRouter()
from config import s3_client


def generate_presigned_url(s3_file_name: str, expiration=3600):
    """Generate a presigned URL for the S3 object"""
    try:
        print(f"Attempting to generate presigned URL for file: {s3_file_name}")
        print(f"Using bucket: {AppConfig.AWS_BUCKET_NAME}")

        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": AppConfig.AWS_BUCKET_NAME, "Key": s3_file_name},
            ExpiresIn=expiration,
        )
        print(f"Generated URL: {url}")
        return url
    except Exception as e:
        print(f"Error generating presigned URL: {str(e)}")
        print(f"Error type: {type(e)}")
        return None


@router.get("/documents")
async def get_documents(
    page: Optional[int] = Query(1, ge=1, description="Page number"),
    per_page: Optional[int] = Query(10, ge=1, le=100, description="Items per page"),
):
    try:
        # Get total count of unseen documents
        total_documents = Document.count(seen=False)

        # Get paginated unseen documents sorted by created_at
        documents = Document.find(
            seen=False,  # Only get documents where seen is False
            page=page,
            per_page=per_page,
        ).order_by("created_at")

        # Convert documents to dictionary format and add presigned URLs
        documents_list = []
        for doc in documents:
            doc_dict = doc.to_dict()
            # Generate presigned URL for the S3 file
            doc_dict["view_url"] = generate_presigned_url(doc.s3_file_name)
            documents_list.append(doc_dict)

        return JSONResponse(
            {
                "data": documents_list,
                "pagination": {
                    "current_page": page,
                    "per_page": per_page,
                    "total_items": total_documents,
                    "total_pages": -(-total_documents // per_page),
                },
            }
        )

    except Exception as e:
        print(f"Error retrieving documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/documents/{document_id}/mark-seen")
async def mark_document_as_seen(document_id: str):
    try:
        # Update the document's seen status
        updated_document = Document.find_by_id_and_update(
            document_id, set__seen=True, set__updated_at=datetime.utcnow()
        )

        if not updated_document:
            raise HTTPException(
                status_code=404, detail=f"Document with id {document_id} not found"
            )

        # Convert the updated document to dictionary format
        doc_dict = updated_document.to_dict()
        # Add presigned URL for consistency with other endpoints
        doc_dict["view_url"] = generate_presigned_url(updated_document.s3_file_name)

        return JSONResponse({"message": "Document marked as seen", "data": doc_dict})

    except Exception as e:
        print(f"Error marking document as seen: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents/{document_id}/retry")
async def retry_document_processing(document_id: str):
    try:
        # First, verify the document exists
        document = Document.find_by_id(document_id)

        if not document:
            raise HTTPException(
                status_code=404, detail=f"Document with id {document_id} not found"
            )

        # Send the task to Celery worker for reprocessing
        app.send_task("modules.tasks.process_document", args=[document_id])

        # Convert the document to dictionary format and add presigned URL

        document.status = "processing"
        document.save()

        doc_dict = document.to_dict()
        doc_dict["view_url"] = generate_presigned_url(document.s3_file_name)

        return JSONResponse(
            {"message": "Document processing retriggered", "data": doc_dict}
        )

    except Exception as e:
        print(f"Error retrying document processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))
