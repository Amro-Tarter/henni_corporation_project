import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import random

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Define element metadata
elements = {
    "earth": {
        "emoji": "🌱",
        "projects": [
            ("גינון ביתי", "ירושלים", "2025-05-15"),
            ("הכנת קומפוסט", "תל אביב", "2025-06-02"),
            ("בנייה מאדמה", "חיפה", "2025-06-10")
        ],
        "images": ["/images/earth1.jpg", "/images/earth2.jpg", "/images/earth3.jpg"]
    },
    "metal": {
        "emoji": "⚒️",
        "projects": [
            ("מבוא לריתוך", "חולון", "2025-05-17"),
            ("עיצוב מתכת", "רמת גן", "2025-06-01"),
            ("פיסול בברזל", "אשדוד", "2025-06-12")
        ],
        "images": ["/images/metal1.jpg", "/images/metal2.jpg", "/images/metal3.jpg"]
    },
    "air": {
        "emoji": "💨",
        "projects": [
            ("נשימה מודעת", "מודיעין", "2025-05-19"),
            ("מדיטציה מודרכת", "רמת השרון", "2025-06-03"),
            ("שיח יצירתי", "כפר סבא", "2025-06-13")
        ],
        "images": ["/images/air1.jpg", "/images/air2.jpg", "/images/air3.jpg"]
    },
    "water": {
        "emoji": "💧",
        "projects": [
            ("תרפיה באמנות", "רמת גן", "2025-05-24"),
            ("תנועה במים", "נתניה", "2025-06-05"),
            ("ציור באקוורל", "חדרה", "2025-06-14")
        ],
        "images": ["/images/water1.jpg", "/images/water2.jpg", "/images/water3.jpg"]
    },
    "fire": {
        "emoji": "🔥",
        "projects": [
            ("תיאטרון רחוב", "תל אביב", "2025-05-29"),
            ("מחול מודרני", "באר שבע", "2025-06-06"),
            ("שירה בימתית", "נצרת", "2025-06-15")
        ],
        "images": ["/images/fire1.jpg", "/images/fire2.jpg", "/images/fire3.jpg"]
    }
}

def seed_elemental_projects():
    collection_ref = db.collection("elemental_projects")

    for element, data in elements.items():
        print(f"🌟 Seeding projects for element: {element}")
        for idx, (title, location, date) in enumerate(data["projects"]):
            doc = {
                "element": element,
                "title": title,
                "location": location,
                "date": date,
                "image": data["images"][idx],
                "created_by": "system_seed",
                "created_at": datetime.utcnow().isoformat()
            }
            collection_ref.add(doc)
            print(f"✅ Added project: {title} ({element})")

    print("\n🎉 All sample projects added to 'elemental_projects' collection.")

if __name__ == "__main__":
    seed_elemental_projects()
