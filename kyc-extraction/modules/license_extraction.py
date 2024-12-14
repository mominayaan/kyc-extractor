import base64
import boto3
import os
from typing import Optional
import openai
from models.Document import Document
from pydantic import BaseModel, Field
from typing import Literal
from config.s3_client import s3_client


class LicenseExtraction(BaseModel):
    surname: str = Field(
        description="The license holder's surname/family name as shown on the driver's license"
    )
    surname_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted surname value"
    )

    given_names: str = Field(
        description="The license holder's given name(s)/first name(s) as shown on the driver's license"
    )
    given_names_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted given name(s) value"
    )

    date_of_birth: str = Field(
        description="The license holder's date of birth in ISO format (YYYY-MM-DD)"
    )
    date_of_birth_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted date of birth value"
    )

    license_number: str = Field(
        description="The unique driver's license identification number"
    )
    license_number_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted license number value"
    )

    expiry_date: str = Field(
        description="The license expiration date in ISO format (YYYY-MM-DD)"
    )
    expiry_date_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted expiration date value"
    )

    date_of_issue: str = Field(
        description="The license issuance date in ISO format (YYYY-MM-DD)"
    )
    date_of_issue_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted issue date value"
    )

    issuing_state: str = Field(
        description="The state/province that issued the driver's license"
    )
    issuing_state_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted issuing state value"
    )

    license_class: str = Field(description="The class/type of driver's license")
    license_class_confidence: Literal["high", "medium", "low", "unreadable"] = Field(
        description="Confidence level in the extracted license class value"
    )


PROMPT = """Please carefully analyze this driver's license image and extract the following information with high precision. For each field, assess your confidence level in the extraction (high/medium/low/unreadable) based on factors like image quality, text clarity, and potential ambiguity.

Required Information:
1. Personal Details
- Surname/Family Name
- Given Name(s)/First Name(s)
- Date of Birth (YYYY-MM-DD format)

2. Document Details
- License Number
- Expiry Date (YYYY-MM-DD format)
- Date of Issue (YYYY-MM-DD format)
- Issuing State/Province
- License Class/Type

Guidelines for Confidence Levels:
- High: Text is clearly visible and unambiguous
- Medium: Text is visible but with some unclear characters or potential ambiguity
- Low: Text is partially visible or significantly degraded
- Unreadable: Text cannot be reliably extracted

Important:
- Ensure all dates are converted to ISO format (YYYY-MM-DD)
- For partially visible or unclear text, mark confidence accordingly
- Use full state/province names rather than abbreviations when possible
- Extract names exactly as they appear on the license

Please provide your analysis in the required JSON format, including both the extracted values and confidence levels for each field."""


def extract_license_info(document, image_base64) -> Optional[LicenseExtraction]:
    try:

        # Initialize Fireworks AI client
        client = openai.OpenAI(
            api_key=os.getenv("FIREWORKS_API_KEY"),
            base_url="https://api.fireworks.ai/inference/v1",
        )

        # Make API call
        response = client.chat.completions.create(
            model="accounts/fireworks/models/phi-3-vision-128k-instruct",
            response_format={
                "type": "json_object",
                "schema": LicenseExtraction.model_json_schema(),
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
        result = LicenseExtraction.model_validate_json(
            response.choices[0].message.content
        )

        print("&***********", type(result))
        # Update document type in MongoDB
        document.metadata = dict(result)
        document.status = "completed"
        document.save()

        return document

    except Exception as e:
        try:
            document.status = "failed"
            document.save()
        except Exception as e:
            print("Error in document classification: ", e)
            return None
        print(f"Error in document classification: {e}")
        return None