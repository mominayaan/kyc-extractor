from .base_model import BaseModel
from mongoengine import *
from config import Config
from typing import Literal, Dict, Any


###cost to pricing
class Document(BaseModel):
    file_name: str = StringField(required=True)
    s3_file_name: str = StringField(required=True)
    type: Literal["passport", "drivers_license"] = StringField(required=False)
    status: Literal["processing", "completed", "failed"] = StringField(
        required=False, default="pending"
    )
    document_orientation: Literal["up", "right", "left", "down"] = StringField(
        required=False
    )
    metadata: Dict[str, Any] = DictField(required=False)
    seen: bool = BooleanField(required=False, default=False)

    meta = {
        "indexes": ["file_name", "created_at"],
        "collection": "document",
        "db_alias": "default",
    }
