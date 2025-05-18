import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables (if any)
load_dotenv()


def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized.")


def initialize_collections():
    try:
        initialize_firebase()
        db = firestore.client()         # Initialize Families Collection
        db.collection("family").document("placeholder_family").set({
            "participant_id": "",
            "parent1_name": "",
            "parent1_phone": "",
            "parent1_email": "",
            "parent2_name": "",
            "parent2_phone": "",
            "parent2_email": "",
            "address": "",
            "engagement_level": "",
            "family_notes": "",
            "last_meeting": None,
            "support_needs": ""
        })
        print("✅ Initialized 'families' collection.")

    except Exception as e:
        print(f"❌ Error initializing collections: {e}")


if __name__ == "__main__":
    initialize_collections()