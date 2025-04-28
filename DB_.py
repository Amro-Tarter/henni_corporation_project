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
        db = firestore.client()

        # Initialize Participants Collection
        db.collection("participants").document("placeholder_participant").set({
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": "",
            "birth_date": None,
            "city": "",
            "school": "",
            "join_date": None,
            "program_year": 1,
            "art_focus": "",
            "secondary_art": "",
            "image": "",
            "personal_statement": "",
            "status": "active",
            "region": "",
            "gender": "",
            "sector": ""
        })
        print("✅ Initialized 'participants' collection.")

        # Initialize Families Collection
        db.collection("families").document("placeholder_family").set({
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

        # Initialize Mentors Collection
        db.collection("mentors").document("placeholder_mentor").set({
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": "",
            "art_expertise": "",
            "secondary_expertise": "",
            "bio": "",
            "profession": "",
            "organization": "",
            "start_date": None,
            "image": "",
            "availability": "",
            "status": "active",
            "max_participants": 5,
            "current_participants": 0
        })
        print("✅ Initialized 'mentors' collection.")

        # Initialize Programs Collection
        db.collection("programs").document("placeholder_program").set({
            "year_number": 1,
            "name": "",
            "description": "",
            "focus_area": "",
            "learning_outcomes": "",
            "min_participants": 0,
            "max_participants": 100,
            "duration_months": 12,
            "required_meetings": 10,
            "community_hours": 20
        })
        print("✅ Initialized 'programs' collection.")

        # Initialize Activities Collection
        db.collection("activities").document("placeholder_activity").set({
            "title": "",
            "description": "",
            "activity_type": "workshop",
            "program_year": 1,
            "domain_id": "",
            "start_date": None,
            "end_date": None,
            "location": "",
            "max_participants": 50,
            "current_participants": 0,
            "image": "",
            "status": "planned",
            "facilitator_id": "",
            "leadership_focus": ""
        })
        print("✅ Initialized 'activities' collection.")

        # Initialize Personal Projects Collection
        db.collection("personal_projects").document("placeholder_project").set({
            "participant_id": "",
            "title": "",
            "description": "",
            "domain_id": "",
            "start_date": None,
            "end_date": None,
            "status": "planned",
            "program_year": 2,
            "mentor_id": "",
            "community_impact": "",
            "materials": "",
            "budget": 0.00,
            "image": "",
            "portfolio_link": "",
            "public_display": False,
            "leadership_skills": ""
        })
        print("✅ Initialized 'personal_projects' collection.")

        # Initialize Staff Collection
        db.collection("staff").document("placeholder_staff").set({
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": "",
            "role": "",
            "start_date": None,
            "bio": "",
            "image": "",
            "expertise": "",
            "is_active": True,
            "region": "",
            "art_background": ""
        })
        print("✅ Initialized 'staff' collection.")

        # Initialize Users Collection (system users)
        db.collection("users").document("placeholder_user").set({
            "username": "",
            "email": "",
            "password_hash": "",
            "role": "",
            "associated_id": "",
            "created_at": firestore.SERVER_TIMESTAMP,
            "last_login": None,
            "is_active": True,
            "reset_token": None
        })
        print("✅ Initialized 'users' collection.")

        print("🎉 All collections have been initialized successfully!")

    except Exception as e:
        print(f"❌ Error initializing collections: {e}")


if __name__ == "__main__":
    initialize_collections()