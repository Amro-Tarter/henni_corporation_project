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


def initialize_collections():

    initialize_firebase()
    db = firestore.client()         # Initialize Families Collection
    # Your desired collection name
    COLLECTION_NAME = "newsletters"  # or "news" if you want

    # The document data
    doc_data = {
        "title": "Sample News Title",
        "body": "This is the main content of the news item.",
        "summary": "This is a summary of the news item.",
        "image": "https://example.com/image.jpg",
        "tags": ["community", "announcement"],
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "author": "Admin User",
        "authorId": "admin_id_123",
        "authorElement": "earth",
        "authorLocation": "Jerusalem"
    }

    # Add the document to Firestore
    doc_ref = db.collection(COLLECTION_NAME).add(doc_data)
    print(f"Document created with ID: {doc_ref[1].id}")

if __name__ == "__main__":
    initialize_collections()