import base64
import boto3
import os
from typing import Optional
import openai
from models.Document import Document
from pydantic import BaseModel, Field
from typing import Literal
from config.s3_client import s3_client


class DocumentClassification(BaseModel):
    document_type: Literal["passport", "drivers_license", "other"] = Field(
        description="The type of identification document"
    )
    document_orientation: Literal["up", "right", "left", "down"] = Field(
        description="The orientation of the document image"
    )


PROMPT = """Please analyze this identification document image carefully:

1. Document Type Classification:
   - Determine if this is a passport, driver's license or other
   - Look for distinctive features like:
     * Passport: Book-like format, country name, coat of arms
     * Driver's License: Card format, "Driver's License" text, DMV logos
     * Other: Image is any other type of image or document that is not a passport or driver's license

2. Document Orientation Analysis:
   - Determine how the document is oriented relative to the standard reading position
   - Orientation Guide:
     * "up" = Document & Text is strictly upright
     * "right" = Document & Text is rotated 90° clockwise
     * "down" = Document & Text is upside down
     * "left" = Document & Text is rotated 90° counterclockwise

Please provide a thought process in your analysis for the Document Type and Document Orientation.
Please provide your analysis in the required JSON format."""


def classify_document(document_id: str) -> Optional[DocumentClassification]:
    """
    Classify a document's type and orientation using Fireworks AI.

    Args:
        document_id: MongoDB document ID

    Returns:
        DocumentClassification object or None if classification fails
    """
    try:
        # Get document from MongoDB
        document = Document.find_by_id(document_id)

        # Get image from S3
        response = s3_client.get_object(
            Bucket=os.getenv("AWS_BUCKET_NAME"), Key=document.s3_file_name
        )
        image_bytes = response["Body"].read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # Initialize Fireworks AI client
        client = openai.OpenAI(
            api_key=os.getenv("FIREWORKS_API_KEY"),
            base_url="https://api.fireworks.ai/inference/v1",
        )

        # Enhanced prompt for better classification

        # Make API call
        response = client.chat.completions.create(
            model="accounts/fireworks/models/phi-3-vision-128k-instruct",
            response_format={
                "type": "json_object",
                "schema": DocumentClassification.model_json_schema(),
            },
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": PROMPT,
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            },
                        },
                    ],
                }
            ],
        )

        # Parse and return results
        result = DocumentClassification.model_validate_json(
            response.choices[0].message.content
        )

        # Update document type in MongoDB
        document.type = result.document_type
        document.document_orientation = result.document_orientation
        document.save()

        return document, image_base64

    except Exception as e:
        try:
            document = Document.find_by_id(document_id)
            if document:
                document.status = "failed"
                document.save()
        except Exception as e:
            print("Error in document classification: ", e)
            return None
        print(f"Error in document classification: {e}")
        return None
