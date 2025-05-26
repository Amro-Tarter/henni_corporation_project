import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables (if any)
load_dotenv()

def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized.")

def upload_art_skills():
    initialize_firebase()
    db = firestore.client()

    artSkills = [
        {
            "title": "אמנות פלסטית",
            "description": "חשיבה יצירתית וחדשנית המאפשרת פתרון בעיות בדרכים לא שגרתיות",
            "icon": "",  # Empty string for the icon field
            "iconName": "Paintbrush",  # New field for the icon name
            "color": "bg-green-100 text-green-800",
            "accent": "bg-green-500", # Added accent field
            "gradient": "from-green-400 to-emerald-500",
        },
        {
            "title": "מוזיקה",
            "description": "הקשבה עמוקה, שיתוף פעולה הרמוני והובלת קבוצות במטרה ליצור יצירות משותפות",
            "icon": "",
            "iconName": "Music",
            "color": "bg-blue-100 text-blue-800",
            "accent": "bg-blue-500", # Added accent field
            "gradient": "from-blue-400 to-indigo-500",
        },
        {
            "title": "תיאטרון",
            "description": "ביטחון עצמי, תקשורת אפקטיבית ומנהיגות רגשית המאפשרת השפעה והשראה",
            "icon": "",
            "iconName": "TheaterIcon",
            "color": "bg-purple-100 text-purple-800",
            "accent": "bg-purple-500", # Added accent field
            "gradient": "from-purple-400 to-pink-500",
        },
        {
            "title": "מחול",
            "description": "משמעת אישית, התמדה ודוגמה אישית המחזקת כושר גופני ומנטלי",
            "icon": "",
            "iconName": "Move3D",
            "color": "bg-sky-100 text-sky-800",
            "accent": "bg-sky-500", # Added accent field
            "gradient": "from-sky-400 to-cyan-500",
        },
        {
            "title": "כתיבה יוצרת",
            "description": "פיתוח קול אישי והשפעה תרבותית דרך יכולת ביטוי מילולי מדויק",
            "icon": "",
            "iconName": "Pen",
            "color": "bg-orange-100 text-orange-800",
            "accent": "bg-orange-500", # Added accent field
            "gradient": "from-orange-400 to-red-500",
        },
    ]

    for skill in artSkills:
        try:
            doc_ref = db.collection("artSkills").add(skill)
            print(f"Added art skill '{skill['title']}' with ID: {doc_ref[1].id}")
        except Exception as e:
            print(f"Error adding art skill '{skill['title']}': {e}")

# ---
# This part remains as it was for existing functionality
# ---

def initialize_collections():
    initialize_firebase()
    db = firestore.client()

if __name__ == "__main__":
    upload_art_skills()
    initialize_collections()