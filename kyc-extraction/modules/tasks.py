from __future__ import absolute_import
from config.celery import app
import time
from models.Document import Document
from config.db import connect_db
from modules.classification import classify_document
from modules.passport_extraction import extract_passport_info
from modules.license_extraction import extract_license_info

connect_db()


@app.task
def process_document(mongo_id):
    print("long time task begins")
    # sleep 5 seconds
    document, image_base64 = classify_document(mongo_id)

    if document.type == "passport":
        passport_extraction = extract_passport_info(document, image_base64)
    elif document.type == "drivers_license":
        license_extraction = extract_license_info(document, image_base64)
    # print('long time task finished')
    # Document.find_by_id_and_update(mongo_id, status="processing")
    return
