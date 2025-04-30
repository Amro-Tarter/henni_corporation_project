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

        # Initialize Mentorship Collection
        db.collection("mentorship").document("placeholder_mentorship").set({
            "mentor_id": "",
            "participant_id": "",
            "start_date": None,
            "end_date": None,
            "meeting_frequency": "",
            "last_meeting_date": None,
            "next_meeting_date": None,
            "goals": "",
            "progress_notes": "",
            "status": "active",
            "creative_focus": "",
            "leadership_focus": ""
        })
        print("✅ Initialized 'mentorship' collection.")

        # Initialize Art Domains Collection
        db.collection("art_domains").document("placeholder_domain").set({
            "name": "",
            "description": "",
            "category": "",
            "skills_developed": "",
            "materials_needed": "",
            "image": "",
            "parent_domain": "",
            "is_active": True
        })
        print("✅ Initialized 'art_domains' collection.")

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

        # Initialize Activity Participation Collection
        db.collection("activity_participation").document("placeholder_participation").set({
            "activity_id": "",
            "participant_id": "",
            "registration_date": None,
            "attendance_status": "registered",
            "feedback": "",
            "leadership_role": "",
            "reflection_notes": ""
        })
        print("✅ Initialized 'activity_participation' collection.")

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

        # Initialize Community Projects Collection
        db.collection("community_projects").document("placeholder_community_project").set({
            "title": "",
            "description": "",
            "domain_id": "",
            "start_date": None,
            "end_date": None,
            "status": "planned",
            "impact_area": "",
            "target_audience": "",
            "location": "",
            "budget": 0.00,
            "image": "",
            "public_display": False,
            "lead_mentor_id": "",
            "lead_staff_id": "",
            "required_participants": 0,
            "current_participants": 0
        })
        print("✅ Initialized 'community_projects' collection.")

        # Initialize Project Team Collection
        db.collection("project_team").document("placeholder_team_member").set({
            "project_id": "",
            "participant_id": "",
            "join_date": None,
            "role": "",
            "responsibilities": "",
            "hours_contributed": 0,
            "leadership_skills_demonstrated": "",
            "status": "active"
        })
        print("✅ Initialized 'project_team' collection.")

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

        # Initialize Partners Collection
        db.collection("partners").document("placeholder_partner").set({
            "name": "",
            "organization_type": "",
            "address": "",
            "contact_person": "",
            "contact_email": "",
            "contact_phone": "",
            "partnership_start": None,
            "partnership_end": None,
            "contribution_type": "",
            "description": "",
            "logo": "",
            "website": "",
            "status": "active"
        })
        print("✅ Initialized 'partners' collection.")

        # Initialize Events Collection
        db.collection("events").document("placeholder_event").set({
            "title": "",
            "description": "",
            "event_type": "",
            "start_date": None,
            "end_date": None,
            "location": "",
            "max_capacity": 0,
            "current_registrations": 0,
            "image": "",
            "is_public": True,
            "registration_deadline": None,
            "organizer_id": "",
            "partner_ids": [],
            "status": "planned"
        })
        print("✅ Initialized 'events' collection.")

        # Initialize Progress Reports Collection
        db.collection("progress_reports").document("placeholder_report").set({
            "participant_id": "",
            "reporting_period": "",
            "report_date": None,
            "artistic_growth": "",
            "leadership_growth": "",
            "community_involvement": "",
            "goals_achieved": "",
            "next_period_goals": "",
            "mentor_feedback": "",
            "staff_feedback": "",
            "self_assessment": "",
            "attendance_rate": 0.0,
            "program_year": 1
        })
        print("✅ Initialized 'progress_reports' collection.")

        # Initialize Artworks Collection
        db.collection("artworks").document("placeholder_artwork").set({
            "title": "",
            "description": "",
            "creator_id": "",
            "domain_id": "",
            "creation_date": None,
            "materials": "",
            "dimensions": "",
            "image": "",
            "video_link": "",
            "project_id": "",
            "public_display": False,
            "exhibition_history": "",
            "feedback": "",
            "status": "in_progress"
        })
        print("✅ Initialized 'artworks' collection.")

        # Initialize Media Collection
        db.collection("media").document("placeholder_media").set({
            "title": "",
            "description": "",
            "media_type": "",
            "file_url": "",
            "thumbnail_url": "",
            "upload_date": None,
            "uploader_id": "",
            "related_entity_type": "",
            "related_entity_id": "",
            "tags": [],
            "is_public": False,
            "size_bytes": 0
        })
        print("✅ Initialized 'media' collection.")

        # Initialize Applications Collection
        db.collection("applications").document("placeholder_application").set({
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": "",
            "birth_date": None,
            "city": "",
            "school": "",
            "art_interest": "",
            "why_join": "",
            "parent_name": "",
            "parent_phone": "",
            "parent_email": "",
            "submission_date": None,
            "status": "pending",
            "interview_date": None,
            "reviewer_id": "",
            "reviewer_notes": "",
            "decision_date": None
        })
        print("✅ Initialized 'applications' collection.")

        # Initialize Donations Collection
        db.collection("donations").document("placeholder_donation").set({
            "donor_name": "",
            "donor_email": "",
            "donor_phone": "",
            "amount": 0.00,
            "currency": "ILS",
            "donation_date": None,
            "payment_method": "",
            "is_recurring": False,
            "recurrence_period": "",
            "designated_purpose": "",
            "related_project_id": "",
            "related_participant_id": "",
            "tax_receipt_issued": False,
            "tax_receipt_date": None,
            "notes": "",
            "is_anonymous": False
        })
        print("✅ Initialized 'donations' collection.")

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