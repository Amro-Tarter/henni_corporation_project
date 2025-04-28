import os
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

        # Initialize Users Collection
        db.collection("users").document("placeholder_user").set({
            "user_id": "",
            "name": "",
            "email": "",
            "role": "",
            "profile_image": "",
            "created_at": firestore.SERVER_TIMESTAMP,
            "followers": [],
            "guide": None,
            "parent": None
        })
        print("✅ Initialized 'users' collection.")

        # Initialize Posts Collection
        db.collection("posts").document("placeholder_post").set({
            "post_ID": "",
            "user_Id": "",
            "content": "",
            "media_Url": None,
            "created_at": firestore.SERVER_TIMESTAMP,
            "likes": []
        })
        print("✅ Initialized 'posts' collection.")

        # Initialize Comments Subcollection under Posts
        db.collection("posts").document("placeholder_post").collection("comments").document("placeholder_comment").set({
            "commentId": "",
            "text": "",
            "user_Id": "",
            "timestamp": firestore.SERVER_TIMESTAMP
        })
        print("✅ Initialized 'comments' subcollection under 'posts'.")

        # Initialize Chat Collection
        db.collection("chats").document("placeholder_chat").set({
            "participants": [],
            "type": "",
            "createdAt": firestore.SERVER_TIMESTAMP,
            "text": []
        })
        print("✅ Initialized 'chats' collection.")

        # Initialize Report Collection
        db.collection("reports").document("placeholder_report").set({
            "report_Id": "",
            "student_Id": "",
            "content": "",
            "guide_Id": "",
            "status": "",
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        print("✅ Initialized 'reports' collection.")

        print("🎉 All collections and fields have been initialized!")

    except Exception as e:
        print(f"❌ Error initializing collections: {e}")

if __name__ == "__main__":
    initialize_collections()
    