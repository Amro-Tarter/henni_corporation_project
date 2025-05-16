import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os

# Use the absolute path to the service account key file
service_account_path = r'C:\Users\Lenovo\Desktop\henni_prj\henni_corporation_project\serviceAccountKey.json'

# Initialize Firebase Admin SDK
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

sample_users = [
    {
        'id': 'mentor1',
        'user': {
            'associated_id': 'mentor1',
            'role': 'mentor',
            'email': 'mentor1@example.com',
            'username': 'מנטור_אמנות',
            'element': 'fire',
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'is_active': True,
            'last_login': firestore.SERVER_TIMESTAMP,
            'phone': '050-1234567',
            'location': 'תל אביב',
        },
        'profile': {
            'associated_id': 'mentor1',
            'displayName': 'שרה כהן',
            'username': 'מנטור_אמנות',
            'element': 'fire',
            'bio': 'מנטורית אמנות עם ניסיון של 10 שנים. מתמחה בציור שמן ופיסול.',
            'location': 'תל אביב',
            'followersCount': 120,
            'followingCount': 45,
            'postsCount': 23,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'photoURL': 'https://ui-avatars.com/api/?name=שרה+כהן&background=random',
            'expertise': 'ציור שמן',
            'region': 'תל אביב',
        }
    },
    {
        'id': 'mentor2',
        'user': {
            'associated_id': 'mentor2',
            'role': 'mentor',
            'email': 'mentor2@example.com',
            'username': 'מנטור_פיסול',
            'element': 'earth',
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'is_active': True,
            'last_login': firestore.SERVER_TIMESTAMP,
            'phone': '050-2345678',
            'location': 'ירושלים',
        },
        'profile': {
            'associated_id': 'mentor2',
            'displayName': 'דוד לוי',
            'username': 'מנטור_פיסול',
            'element': 'earth',
            'bio': 'מנטור פיסול עם התמחות בחומרים טבעיים וקרמיקה.',
            'location': 'ירושלים',
            'followersCount': 85,
            'followingCount': 32,
            'postsCount': 15,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'photoURL': 'https://ui-avatars.com/api/?name=דוד+לוי&background=random',
            'expertise': 'פיסול',
            'region': 'ירושלים',
        }
    },
    {
        'id': 'mentor3',
        'user': {
            'associated_id': 'mentor3',
            'role': 'mentor',
            'email': 'mentor3@example.com',
            'username': 'מנטור_צילום',
            'element': 'water',
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'is_active': True,
            'last_login': firestore.SERVER_TIMESTAMP,
            'phone': '050-3456789',
            'location': 'חיפה',
        },
        'profile': {
            'associated_id': 'mentor3',
            'displayName': 'מיכל אברהם',
            'username': 'מנטור_צילום',
            'element': 'water',
            'bio': 'מנטורית צילום אמנותי ופורטרטים. מתמחה בצילום דיגיטלי ואנלוגי.',
            'location': 'חיפה',
            'followersCount': 150,
            'followingCount': 60,
            'postsCount': 30,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'photoURL': 'https://ui-avatars.com/api/?name=מיכל+אברהם&background=random',
            'expertise': 'צילום',
            'region': 'חיפה',
        }
    },
    {
        'id': 'mentor4',
        'user': {
            'associated_id': 'mentor4',
            'role': 'mentor',
            'email': 'mentor4@example.com',
            'username': 'מנטור_ארכיטקטורה',
            'element': 'metal',
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'is_active': True,
            'last_login': firestore.SERVER_TIMESTAMP,
            'phone': '050-4567890',
            'location': 'רמת גן',
        },
        'profile': {
            'associated_id': 'mentor4',
            'displayName': 'עידן שפירא',
            'username': 'מנטור_ארכיטקטורה',
            'element': 'metal',
            'bio': 'מנטור ארכיטקטורה ועיצוב פנים. מתמחה בעיצוב בר-קיימא.',
            'location': 'רמת גן',
            'followersCount': 95,
            'followingCount': 40,
            'postsCount': 18,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'photoURL': 'https://ui-avatars.com/api/?name=עידן+שפירא&background=random',
            'expertise': 'ארכיטקטורה',
            'region': 'רמת גן',
        }
    },
    {
        'id': 'mentor5',
        'user': {
            'associated_id': 'mentor5',
            'role': 'mentor',
            'email': 'mentor5@example.com',
            'username': 'מנטור_מוזיקה',
            'element': 'air',
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'is_active': True,
            'last_login': firestore.SERVER_TIMESTAMP,
            'phone': '050-5678901',
            'location': 'באר שבע',
        },
        'profile': {
            'associated_id': 'mentor5',
            'displayName': 'נועה דהן',
            'username': 'מנטור_מוזיקה',
            'element': 'air',
            'bio': 'מנטורית מוזיקה והלחנה. מתמחה במוזיקה אלקטרונית וקומפוזיציה.',
            'location': 'באר שבע',
            'followersCount': 110,
            'followingCount': 50,
            'postsCount': 25,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'photoURL': 'https://ui-avatars.com/api/?name=נועה+דהן&background=random',
            'expertise': 'מוזיקה',
            'region': 'באר שבע',
        }
    }
]

def add_sample_users():
    try:
        for user in sample_users:
            # Add user document
            db.collection('users').document(user['id']).set(user['user'])
            
            # Add profile document
            db.collection('profiles').document(user['id']).set(user['profile'])
            
            print(f"Added user: {user['profile']['displayName']}")
        
        print('Successfully added all sample users!')
    except Exception as e:
        print(f'Error adding sample users: {str(e)}')

if __name__ == '__main__':
    add_sample_users() 