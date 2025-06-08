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

staff_members = [
    {
        "name": "ענת זגרון בוג'יו",
        "bio": "טכנולוגיות למידה בחינוך(MA) בעולם שבו נדמה לפעמים שהקשרים בין אנשים מתרופפים, אני מציעה דרך אחרת. הבנתי כי השינוי האמיתי מתחיל במקום הכי פנימי שלנו - באני האותנטי שבכל אחד מאיתנו. כאמא, אקטיביסטית חברתית וסביבתית, אני חיה את החיבור העמוק בין אהבת האדם לאהבת הטבע. מתוך הכרה עמוקה שהשינוי החברתי והסביבתי מתחיל בתוכנו, ייסדתי את העמותה עם חזון ברור: ליצור מרחב שבו אנשים יכולים להתחבר ליצירה שבתוכם ומשם לבנות קשרים משמעותיים גם עם הזולת. בעידן של מידע רב ולחצים חיצוניים, אני מציעה חזרה לפשטות - לקשר האותנטי עם עצמנו, עם אחרים ועם הטבע שמסביבנו. 'כשאנחנו פועלים ממקום של אמת פנימית, אנחנו לא רק משנים את עצמנו - אנחנו משנים את העולם'"
    },
    {
        "name": "ולרי חבוט",
        "bio": "בעבור השנים בהן פיקדתי על בני נוער מגוונים ומיוחדים כקצינה בצה״ל בסדיר ובמילואים, זכיתי לקחת חלק בעיצוב והעצמת דוד העתיד המתהווה לנגד עינינו בגאווה גדולה. יחד עם כלים שרכשתי מעולם הNLP המופלא, אני מאמינה שהמנהיגים הבאים שלנו יצמחו מתוכנו ויובילו שינויים מהותיים בחברה הישראלית 🇮🇱🇮🇱🇮🇱 משמעות-השראה-העצמה-התפתחות"
    },
    {
        "name": "אורלי עופר",
        "bio": "כמנחת קבוצות ומטפלת גופנפש כיום וכמעצבת טקסטיל בעבר, (וגם כאמא לבן מוסיקאי ומורה וכבת לאם אמנית), אני יודעת עד כמה החשיפה למגוון אמנויות בגיל צעיר יוצרת בסיס חזק לפיתוח אישיות מגוונת, מסייעת לגבש נפש רגישה ויצירתית בעלת דימיון עשיר ויכולת לאלתר ויחד עם זאת לבטא נוכחות אותנטית בכאן ועכשיו ופרספקטיבה בריאה לעתיד."
    },
    {
        "name": "עליזה עמיר",
        "bio": "טוענת רבנית, מטפלת זוגית, בוגרת בית ספר למשחק (MA) ספרות עברית. יוצרת ללא גבולות. מאמינה שיצירה היא חלק מהניצוץ האלוהי של כל אדם, עולם שיונהג על ידי יוצרים מעומק הלב והנשמה יהיה עולם טוב יותר. לא אוהבת להגדיר או לקטלג אנשים - גם לא את עצמה. כותבת, יוצרת, משחקת וטוענת. לפני הכל - אדם שאוהב אדם באשר הוא."
    },
    {
        "name": "ענת בר ושדי",
        "bio": "ביבליותרפיסטית (MA), מטפלת רגשית, מנחת קבוצות וסופרת. מאמינה בחינוך הדורות הבאים בדרך אחרת של חשיבה עצמאית, גמישות מחשבתית, יצירתיות, אחריות ואמפטיה לזולת."
    },
    {
        "name": "דקלה בר",
        "bio": "מדענית (MA בגנטיקה) ואשת חינוך. מובילה פרויקטים בבינה מלאכותית ובחינוך מותאם אישית, מינהל חדשנות וטכנולוגיה, משה\"ח. אוהבת לראות כיצד אומנות מזמינה פרשנות מתוך העצמי."
    }
]


def initialize_collections():
    initialize_firebase()
    db = firestore.client()

    for staff in staff_members:
        # 1. Create a user doc for the staff
        user_doc = {
            "username": staff["name"],
            "role": "staff",
            "email": "",           # add if you want, or leave blank
            "is_active": True,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP,
            # add other fields as needed
        }
        # Use the name as the doc ID (you can use .add for auto-ID, but then you have to store the ID somewhere)
        user_ref = db.collection('users').document(staff["name"])
        user_ref.set(user_doc)

        # 2. Add the staff doc, linking to the user document ID
        staff_doc = {
            "name": staff["name"],
            "bio": staff["bio"],
            "user_id": staff["name"],  # same as user doc ID
            "photoURL":"",  # add photo URL if available
        }
        db.collection('staff').document(staff["name"]).set(staff_doc)

    print("✅ Staff and users collections initialized and linked.")

if __name__ == "__main__":
    initialize_collections()
