import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Sample event data
sample_events = [
    {
        "title": "ערב הופעות - תיאטרון ומוזיקה",
        "description": "אירוע סיום שנה לתיאטרון ומוזיקה בשיתוף ההורים והקהילה.",
        "event_type": "performance",
        "start_date": datetime(2025, 5, 12),
        "end_date": datetime(2025, 5, 12, 20, 30),
        "location": "מרכז אמנויות הבמה, תל אביב",
        "max_capacity": 200,
        "current_registrations": random.randint(50, 150),
        "image": "https://source.unsplash.com/800x600/?concert,theater",
        "is_public": True,
        "registration_deadline": datetime(2025, 5, 10),
        "organizer_id": "staff_001",
        "partner_ids": ["partner_1"],
        "status": "planned"
    },
    {
        "title": "תערוכת אמנות - יצירות חניכים",
        "description": "תערוכה המציגה את עבודות הגמר של החניכים בשנה ב׳.",
        "event_type": "exhibition",
        "start_date": datetime(2025, 5, 20),
        "end_date": datetime(2025, 5, 25),
        "location": "גלריה עירונית, חיפה",
        "max_capacity": 100,
        "current_registrations": random.randint(10, 90),
        "image": "https://source.unsplash.com/800x600/?art,exhibition",
        "is_public": True,
        "registration_deadline": datetime(2025, 5, 18),
        "organizer_id": "staff_002",
        "partner_ids": [],
        "status": "planned"
    },
    {
        "title": "סדנת מנהיגות - מובילים צעירים",
        "description": "סדנה ייחודית לבניית יכולות הובלה ותקשורת בקרב בני נוער.",
        "event_type": "workshop",
        "start_date": datetime(2025, 6, 1),
        "end_date": datetime(2025, 6, 1, 15, 0),
        "location": "מרכז הצעירים, באר שבע",
        "max_capacity": 60,
        "current_registrations": random.randint(20, 55),
        "image": "https://source.unsplash.com/800x600/?leadership,workshop",
        "is_public": True,
        "registration_deadline": datetime(2025, 5, 30),
        "organizer_id": "staff_003",
        "partner_ids": [],
        "status": "planned"
    },
]

# Upload to Firestore
def upload_events():
    for event in sample_events:
        doc_ref = db.collection("events").document()
        doc_ref.set(event)
        print(f"✅ Added event: {event['title']}")

if __name__ == "__main__":
    upload_events()
