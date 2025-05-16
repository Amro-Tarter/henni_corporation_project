import firebase_admin
from firebase_admin import credentials, firestore

# Use the absolute path to the service account key file
service_account_path = r'C:\Users\Lenovo\Desktop\henni_prj\henni_corporation_project\serviceAccountKey.json'

# Initialize Firebase Admin SDK
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

# Template for user fields
user_fields = {
    'associated_id': '',
    'role': '',
    'email': '',
    'username': '',
    'element': '',
    'updatedAt': firestore.SERVER_TIMESTAMP,
    'createdAt': firestore.SERVER_TIMESTAMP,
    'is_active': True,
    'last_login': firestore.SERVER_TIMESTAMP,
    'phone': '',
    'location': '',
}

# Template for profile fields
profile_fields = {
    'associated_id': '',
    'displayName': '',
    'username': '',
    'element': '',
    'bio': '',
    'location': '',
    'followersCount': 0,
    'followingCount': 0,
    'postsCount': 0,
    'createdAt': firestore.SERVER_TIMESTAMP,
    'photoURL': '',
    'expertise': '',
    'region': '',
}

def init_collection_fields():
    try:
        # Initialize a document with empty fields as template
        db.collection('users').document('template').set(user_fields)
        db.collection('profiles').document('template').set(profile_fields)
        print('Successfully initialized collection fields!')
    except Exception as e:
        print(f'Error initializing fields: {str(e)}')

if __name__ == '__main__':
    init_collection_fields()
