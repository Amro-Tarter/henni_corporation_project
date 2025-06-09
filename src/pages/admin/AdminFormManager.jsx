import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, Trash2, ExternalLink, FileText, Bookmark } from 'lucide-react'; // Changed Zap to Bookmark
import { Link } from 'react-router-dom';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { db } from '../../config/firbaseConfig'; // Import your Firebase db
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'

// Function to generate a simple mock Firestore-like ID for client-side management
const generateClientId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Define built-in forms statically in the code.
// These are primarily for initial setup/display if not yet fetched from Firestore.
// The primary source of truth should be Firestore.
const initialBuiltInForms = [
  {
    id: 'd9hdg5lqImzEPn8Mnspb', // IMPORTANT: This ID should match your Firestore document ID for this form
    title: 'טופס קליטה לעמותת תלגלות את האור',
    type: 'builtin',
    built_in: true, // New field: set to true for built-in forms
    createdAt: new Date('2025-01-01').toISOString(), // Use ISO string for consistency
    responses: 0, // This should be dynamically counted from submissions
    fields: [
      { label: 'שם פרטי', type: 'text', required: true },
      { label: 'שם משפחה', type: 'text', required: true },
      { label: 'תאריך לידה', type: 'text', required: true },
      { label: 'גיל', type: 'text', required: true },
      { label: 'מין', type: 'multipleChoice', required: true, options: ['זכר', 'נקבה'] },
      { label: 'כתובת מגורים', type: 'text', required: true },
      { label: 'עיר', type: 'text', required: true },
      { label: 'מיקוד', type: 'text', required: true },
      { label: 'בית ספר', type: 'text', required: true },
      { label: 'כיתה', type: 'text', required: true },
      { label: 'שם ההורה/אפוטרופוס הראשי', type: 'text', required: true },
      { label: 'קרבת משפחה', type: 'multipleChoice', required: true, options: ['אם', 'אב', 'סבא/סבתא', 'דוד/דודה', 'אפוטרופוס אחר'] },
      { label: 'טלפון נייד', type: 'text', required: true },
      { label: 'טלפון בית', type: 'text', required: false },
      { label: 'אימייל', type: 'text', required: true },
      { label: 'מקצוע', type: 'text', required: false },
      { label: 'מקום עבודה', type: 'text', required: false },
      { label: 'שם הורה שני', type: 'text', required: false },
      { label: 'מצב זוגי של ההורים', type: 'multipleChoice', required: true, options: ['נשואים', 'גרושים', 'אלמן/ה', 'רווקים', 'אחר'] },
      { label: 'מספר ילדים במשפחה', type: 'text', required: true },
      { label: 'מיקום הילד/ה בין האחים', type: 'text', required: true },
      { label: 'שפות הדיבור בבית', type: 'text', required: false },
      { label: 'מצב כלכלי משפחתי', type: 'multipleChoice', required: true, options: ['מעל הממוצע', 'ממוצע', 'מתחת לממוצע', 'קשיים כלכליים'] },
      { label: 'האם יש לילד/ה בעיות בריאותיות כרוניות?', type: 'multipleChoice', required: true, options: ['כן', 'לא'] },
      { label: 'פרטי בעיות בריאותיות', type: 'paragraph', required: false },
      { label: 'האם הילד/ה נוטל/ת תרופות באופן קבוע?', type: 'multipleChoice', required: true, options: ['כן', 'לא'] },
      { label: 'פרטי תרופות', type: 'paragraph', required: false },
      { label: 'האם יש אלרגיות?', type: 'multipleChoice', required: true, options: ['כן', 'לא'] },
      { label: 'פרטי אלרגיות', type: 'paragraph', required: false },
      { label: 'האם יש מוגבלויות פיזיות או קשיי למידה מאובחנים?', type: 'multipleChoice', required: true, options: ['כן', 'לא'] },
      { label: 'פרטי מוגבלויות/קשיי למידה', type: 'paragraph', required: false },
      { label: 'תארו את אישיות הילד/ה', type: 'paragraph', required: true },
      { label: 'האם הילד/ה מטופל/ת אצל פסיכולוג/עובד סוציאלי/יועץ?', type: 'multipleChoice', required: true, options: ['כן', 'לא'] },
      { label: 'פרטי הטיפול והסיבה', type: 'paragraph', required: false },
      { label: 'האם היו אירועים משמעותיים בחיי הילד/ה?', type: 'paragraph', required: false },
      { label: 'באילו תחומי אמנות הילד/ה מגלה עניין?', type: 'checkboxes', required: false, options: ['תיאטרון/משחק', 'מוזיקה/שירה', 'מחול/תנועה', 'אמנות חזותית', 'כתיבה יוצרת'] },
      { label: 'האם הילד/ה למד/ה בעבר תחומי אמנות?', type: 'multipleChoice', required: false, options: ['כן', 'לא'] },
      { label: 'פרטי לימודי אמנות קודמים', type: 'paragraph', required: false },
      { label: 'תארו כישרונות מיוחדים של הילד/ה', type: 'paragraph', required: false },
      { label: 'מה הילד/ה הכי אוהב/ת לעשות בזמן הפנוי?', type: 'paragraph', required: false },
      { label: 'מה הסיבה להצטרפות לעמותה?', type: 'checkboxes', required: true, options: ['פיתוח יכולות אמנותיות', 'חיזוק ביטחון עצמי', 'פיתוח כישורים חברתיים', 'העשרה תרבותית', 'מתן מסגרת תומכת', 'אחר'] },
      { label: 'מה הציפיות שלכם מהעמותה?', type: 'paragraph', required: false },
      { label: 'האם יש משהו מיוחד שחשוב לנו לדעת על הילד/ה?', type: 'paragraph', required: false },
      { label: 'איך שמעתם על העמותה?', type: 'multipleChoice', required: false, options: ['המלצה מחבר/בן משפחה', 'רשתות חברתיות', 'בית ספר', 'אתר אינטרנט', 'אחר'] },
      { label: 'האם תוכלו להגיע לפעילויות באופן קבוע?', type: 'multipleChoice', required: true, options: ['כן', 'לא בטוח', 'לא'] },
      { label: 'האם יש לכם דרישות מיוחדות להסעות?', type: 'multipleChoice', required: false, options: ['כן', 'לא'] },
      { label: 'פרטי דרישות הסעות', type: 'paragraph', required: false },
      { label: 'הסכמות והצהרות', type: 'checkboxes', required: true, options: [
        'אני מסכים/ה שהעמותה תיצור קשר עם גורמים רלוונטיים במידת הצורך',
        'אני מסכים/ה לצילום הילד/ה לצרכי תיעוד ופרסום של העמותה',
        'אני מתחייב/ת להודיע על שינויים במצב הבריאותי או האישי של הילד/ה',
        'אני מאשר/ת שכל המידע שמסרתי נכון ומדויק'
      ]},
      { label: 'שם חותם של ההורה/אפוטרופוס', type: 'text', required: true },
      { label: 'תאריך', type: 'text', required: true }
    ]
  },
  {
    id: 'mentor-prep-form-id', // IMPORTANT: This ID should match your Firestore document ID for this form
    title: 'שאלון הכנה למנטוריות',
    type: 'builtin',
    built_in: true, // New field: set to true for built-in forms
    createdAt: new Date('2025-06-06').toISOString(), // Use ISO string for consistency
    responses: 0, // This should be dynamically counted from submissions
    fields: [
      { label: 'שם הילד/ה', type: 'text', required: true },
      { label: 'תאריך', type: 'text', required: true },
      { label: 'הורים יקרים, כדי שהמנטור יוכל להכין מפגש מותאם ומועיל עבורכם, אנא מלאו את השאלון הקצר הזה ושלחו אותו 2-3 ימים לפני המפגש.', type: 'paragraph', required: false },
      { label: 'איך הילד/ה מרגיש/ה לאחרונה?', type: 'multipleChoice', required: true, options: ['מאושר/ת ואנרגטי/ת', 'רגוע/ה ומאוזן/ת', 'קצת עצוב/ה או מתוח/ה', 'משתנה הרבה'] },
      { label: 'שינויים שהבחנתם בהם בזמן האחרון: (התנהגות, מצב רוח, הרגלי שינה, תיאבון וכו\')', type: 'paragraph', required: false },
      { label: 'האם קרה משהו מיוחד בבית/בבית ספר/בחיים שלו/ה?', type: 'paragraph', required: false },
      { label: 'איך הילד/ה מספר/ת על הפעילויות בעמותה?', type: 'multipleChoice', required: true, options: ['מתלהב/ת ומספר/ת הרבה', 'אוהב/ת אבל לא מספר/ת הרבה', 'מתלונן/ת לפעמים', 'לא אוהב/ת לדבר על זה'] },
      { label: 'דברים שהילד/ה הכי אוהב/ת בעמותה:', type: 'paragraph', required: false },
      { label: 'דברים שגורמים לו/ה קושי או מתח:', type: 'paragraph', required: false },
      { label: 'בחרו עד 3 נושאים שהכי חשובים לכם לדבר עליהם:', type: 'checkboxes', required: true, options: ['התקדמות הילד/ה בתחום האמנותי', 'התפתחות חברתית ויחסים עם ילדים אחרים', 'בניית ביטחון עצמי', 'התמודדות עם קשיים או אתגרים', 'התנהגות של הילד/ה בבית', 'עבודת שיתוף עם בית הספר', 'יעדים לתקופה הקרובה', 'דרכים שאתם יכולים לעזור בבית', 'אחר'] },
      { label: 'השאלה הכי חשובה שרציתם לשאול:', type: 'paragraph', required: false },
      { label: 'איך הילד/ה מתנהג/ת בבית השבועות האחרונים?', type: 'multipleChoice', required: true, options: ['שיתופי/ת ונעים/ה', 'רגיל/ה כמו תמיד', 'קצת עצבני/ת או עקשן/ית', 'סגור/ה ושקט/ה', 'משתנה לפי היום'] },
      { label: 'האם יש דברים שגורמים במיוחד לעימותים או קושי?', type: 'paragraph', required: false },
      { label: 'דברים שמשמחים את הילד/ה בזמן האחרון:', type: 'paragraph', required: false },
      { label: 'האם יש נושא רגיש שחשוב שהמנטור ידע עליו? (גירושין, מחלה במשפחה, קשיים כלכליים, בעיות בבית ספר וכו\')', type: 'paragraph', required: false },
      { label: 'איך אתם מעדיפים שהמנטור יגיש לילד/ה עצות או ביקורת?', type: 'multipleChoice', required: true, options: ['ישירות וברור', 'בעדינות ובהדרגה', 'דרך סיפורים ודוגמאות', 'בהומור'] },
      { label: 'האם יש דברים שהילד/ה לא אוהב/ת לשמוע או שגורמים לו/ה לסגירות?', type: 'paragraph', required: false },
      { label: 'מה אתם הכי מקווים לקבל מהשיחה הזאת?', type: 'checkboxes', required: true, options: ['הבנת המצב הנוכחי של הילד/ה', 'כלים מעשיים לטיפול בבעיות', 'עידוד וחיזוק שאתם בדרך הנכונה', 'יעדים ברורים לתקופה הקרובה', 'הכנה לאירוע או שינוי מתוכנן', 'אחר'] },
      { label: 'בסיום השיחה, איך תדעו שהיא הייתה מוצלחת עבורכם?', type: 'paragraph', required: false },
      { label: 'עדיפות זמן לשיחה:', type: 'multipleChoice', required: true, options: ['בוקר', 'צהריים', 'אחר הצהריים', 'ערב'] },
      { label: 'איך מעדיפים לקיים את השיחה?', type: 'multipleChoice', required: true, options: ['פגישה פיזית', 'זום/שיחת וידאו', 'שיחת טלפון'] },
      { label: 'משך זמן מועדף:', type: 'multipleChoice', required: true, options: ['30 דקות', '45 דקות', 'שעה', 'יותר אם נדרש'] },
      { label: 'האם תרצו שהילד/ה יהיה/תהיה חלק מהשיחה?', type: 'multipleChoice', required: true, options: ['כן', 'כל השיחה', 'כן', 'חלק מהשיחה', 'לא', 'רק ההורים'] },
      { label: 'שם ההורה הממלא:', type: 'text', required: true },
      { label: 'חתימה:', type: 'text', required: true },
      { label: 'תאריך', type: 'text', required: true }
    ]
  }
];

const QUESTION_TYPES = [
  { key: "text", label: "תשובה קצרה" },
  { key: "paragraph", label: "פסקה" },
  { key: "multipleChoice", label: "בחירה מרובה" },
  { key: "checkboxes", label: "תיבות סימון" },
  { key: "dropdown", label: "רשימה נפתחת" },
  { key: "date", label: "תאריך" }, // Added 'date' type for completeness
];

// Simplified Loader Component
function QuietLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-gray-500">טוען...</p>
    </div>
  );
}

export default function AdminFormManager() {
  const [allForms, setAllForms] = useState([]); // This will now be populated from Firestore
  const [loading, setLoading] = useState(true); // Start as loading
  const [showModal, setShowModal] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("טופס חדש");
  const [newFormFields, setNewFormFields] = useState([
    {
      id: generateClientId(), // Use a client-side ID for local management
      label: "שאלה חדשה",
      type: "text",
      required: false,
      options: [],
    },
  ]);
  const [error, setError] = useState(null);

  // Function to fetch forms from Firestore
  const fetchForms = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "forms"));
      let formsData = querySnapshot.docs.map(doc => ({
        id: doc.id, // Use the actual Firestore document ID
        ...doc.data(),
        // Ensure fields array exists and each field has an 'id'
        fields: doc.data().fields?.map(field => ({
          id: field.id || generateClientId(), // Assign client-side ID if missing for existing fields
          ...field
        })) || [],
        // Ensure built_in field exists and is a boolean
        built_in: !!doc.data().built_in // Converts to boolean, defaults to false if undefined/null
      }));

      // In a real application, you'd only add built-in forms if they are missing
      // (e.g., using a Cloud Function trigger or the seedForms.js script once)
      // This client-side code will strictly show what's in Firestore.
      setAllForms(formsData);

    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("שגיאה בטעינת טפסים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(); // Fetch forms on component mount
  }, []);

  // Now, userForms and builtinForms are derived from the merged allForms state
  // Filtering built-in forms based on the 'built_in' field directly
  const userForms = allForms.filter(form => !form.built_in);
  const builtinForms = allForms.filter(form => form.built_in);


  const addQuestion = () => {
    setNewFormFields(prev => [
      ...prev,
      {
        id: generateClientId(), // Unique client-side ID for new question
        label: "שאלה חדשה",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (id, key, value) => {
    setNewFormFields(prev =>
      prev.map(q => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const addOption = (questionId) => {
    setNewFormFields(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), "אפשרות"] }
          : q
      )
    );
  };

  const updateOption = (questionId, index, value) => {
    setNewFormFields(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])];
          newOptions[index] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId, index) => {
    setNewFormFields(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])];
          newOptions.splice(index, 1);
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const removeQuestion = (questionId) => {
    setNewFormFields(prev => prev.filter(q => q.id !== questionId));
  };

  const saveForm = async () => {
    if (!newFormTitle.trim()) {
      setError("כותרת הטופס אינה יכולה להיות ריקה");
      return;
    }

    for (const field of newFormFields) {
      if (['multipleChoice', 'checkboxes', 'dropdown'].includes(field.type) && (!field.options || field.options.length === 0)) {
        setError(`שאלה "${field.label}" דורשת לפחות אפשרות אחת.`);
        return;
      }
    }
    setError(null);
    setLoading(true);

    try {
      const formToSave = {
        title: newFormTitle,
        type: 'user', // New forms are 'user' type
        built_in: false, // New forms are NOT built-in by default
        createdAt: serverTimestamp(), // Firestore timestamp
        responses: 0, // Initial responses count
        fields: newFormFields.map(({ id, ...rest }) => rest) // Remove client-side 'id' from fields before saving
      };

      const docRef = await addDoc(collection(db, "forms"), formToSave);
      
      // Add a reference to 'publicForms' collection
      await addDoc(collection(db, "publicForms"), {
        formRef: docRef.path, // Store the reference as /forms/{formId}
        title: newFormTitle,
        createdAt: serverTimestamp()
      });

      const newFormWithId = {
        id: docRef.id, // Get the actual Firestore document ID
        ...formToSave,
        createdAt: new Date(), // Use actual Date object for client-side sorting/display before full re-fetch
        fields: newFormFields // Keep client-side fields for display until re-fetch
      };
      
      setAllForms(prev => [newFormWithId, ...prev]);
      setShowModal(false);
      setNewFormTitle("טופס חדש");
      setNewFormFields([{
        id: generateClientId(),
        label: "שאלה חדודה",
        type: "text",
        required: false,
        options: [],
      }]);
    } catch (err) {
      console.error("Error saving form:", err);
      setError("שגיאה בשמירת הטופס.");
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (formId, isBuiltIn) => {
    if (isBuiltIn) {
      setError("לא ניתן למחוק טופס מובנה.");
      return;
    }
    if (window.confirm("האם אתה בטוח שברצונך למחוק טופס זה?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "forms", formId));
        // TODO: Also consider deleting corresponding entries in 'publicForms' and 'submissions' for full cleanup
        setAllForms(prev => prev.filter(form => form.id !== formId));
      } catch (err) {
        console.error("Error deleting form:", err);
        setError("שגיאה במחיקת הטופס.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleBuiltInStatus = async (formId, currentStatus) => {
    setLoading(true);
    try {
      const formDocRef = doc(db, "forms", formId);
      await updateDoc(formDocRef, {
        built_in: !currentStatus
      });
      // Optimistically update the local state
      setAllForms(prev => prev.map(form =>
        form.id === formId ? { ...form, built_in: !currentStatus } : form
      ));
      console.log(`Form ${formId} built_in status toggled to: ${!currentStatus}`);
    } catch (err) {
      console.error("Error toggling built-in status:", err); // Improved error logging
      setError("שגיאה בשינוי סטטוס הטופס.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <CleanElementalOrbitLoader/>;
  return (
    <DashboardLayout>
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">מנהל טפסים</h1>
              <p className="text-sm text-gray-600">נהל את הטפסים שלך</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={16} />
                טופס חדש
              </button>

              <Link 
                to="/admin/submissions" 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Eye size={16} />
                תשובות
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Built-in Forms Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-gray-600" />
            טפסים מובנים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtinForms.map((form) => (
              <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 leading-tight">{form.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">מובנה</span>
                    <button
                      onClick={() => toggleBuiltInStatus(form.id, form.built_in)}
                      className={`p-1 rounded transition-colors duration-200 ${
                        form.built_in ? 'bg-red-200 text-red-700 hover:bg-red-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={form.built_in ? 'הגדר כטופס רגיל' : 'הגדר כטופס מובנה'}
                    >
                      <Bookmark size={14} /> {/* Changed to Bookmark icon */}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>תשובות:</span>
                    <span className="font-medium">{form.responses !== undefined ? form.responses : 0}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <p className="text-xs text-gray-500 mb-1">קישור:</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600 font-mono truncate">/form/{form.id}</span>
                    <Link to={`/form/${form.id}`} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-600">
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => deleteForm(form.id, form.built_in)}
                  className={`w-full px-3 py-2 text-white rounded text-sm font-medium transition-colors duration-200 ${
                    form.built_in ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  disabled={form.built_in}
                >
                  {form.built_in ? 'לא ניתן למחוק' : 'מחק'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Forms Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">הטפסים שלי</h2>
          
          {userForms.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">אין טפסים עדיין</h3>
              <p className="text-gray-500 mb-4 text-sm">צור את הטופס הראשון שלך</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
              >
                צור טופס חדש
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userForms.map((form) => (
                <div key={form.id} className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 leading-tight">{form.title}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleBuiltInStatus(form.id, form.built_in)}
                        className={`p-1 rounded transition-colors duration-200 ${
                          form.built_in ? 'bg-red-200 text-red-700 hover:bg-red-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={form.built_in ? 'הגדר כטופס רגיל' : 'הגדר כטופס מובנה'}
                      >
                        <Bookmark size={14} /> {/* Changed to Bookmark icon */}
                      </button>
                      <Link to={`/form/${form.id}`} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <ExternalLink size={12} />
                      </Link>
                      <button 
                        onClick={() => deleteForm(form.id, form.built_in)}
                        className={`p-1 text-gray-400 rounded ${form.built_in ? 'cursor-not-allowed' : 'hover:text-red-600'}`}
                        disabled={form.built_in}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>נוצר:</span>
                      {/* Convert Firestore Timestamp to readable string for display */}
                      <span>{form.createdAt && typeof form.createdAt.toDate === 'function' ? form.createdAt.toDate().toLocaleDateString() : 'תאריך לא זמין'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>תשובות:</span>
                      <span className="font-medium text-red-600">{form.responses !== undefined ? form.responses : 0}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">קישור:</p>
                    <div className="flex items-center gap-1">
                      {/* The link now uses the actual Firestore document ID */}
                      <span className="text-xs text-gray-600 font-mono truncate">/form/{form.id}</span>
                      <Link to={`/form/${form.id}`} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-600">
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteForm(form.id, form.built_in)}
                    className={`w-full px-3 py-2 text-white rounded text-sm font-medium transition-colors duration-200 ${
                      form.built_in ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                    }`}
                    disabled={form.built_in}
                  >
                    {form.built_in ? 'לא ניתן למחוק' : 'מחק'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <input
                type="text"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                placeholder="כותרת הטופס"
                className="text-lg font-medium bg-transparent border-none outline-none flex-1"
              />
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded ml-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {newFormFields.map((field, idx) => (
                <div key={field.id} className="bg-gray-50 rounded-lg p-4 mb-3 relative">
                  <button
                    onClick={() => removeQuestion(field.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <X size={14} />
                  </button>

                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">שאלה:</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateQuestion(field.id, "label", e.target.value)}
                      className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">סוג:</label>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        updateQuestion(field.id, "type", newType);
                        if (["multipleChoice", "checkboxes", "dropdown"].includes(newType) && 
                            (!field.options || field.options.length === 0)) {
                          updateQuestion(field.id, "options", ["אפשרות 1"]);
                        } else if (!["multipleChoice", "checkboxes", "dropdown"].includes(newType)) {
                            updateQuestion(field.id, "options", []);
                        }
                      }}
                      className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {QUESTION_TYPES.map((qt) => (
                        <option key={qt.key} value={qt.key}>{qt.label}</option>
                      ))}
                    </select>
                  </div>

                  {["multipleChoice", "checkboxes", "dropdown"].includes(field.type) && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <p className="text-xs font-medium text-gray-700 mb-2">אפשרויות:</p>
                      {field.options.map((option, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(field.id, i, e.target.value)}
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                          <button
                            onClick={() => removeOption(field.id, i)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(field.id)}
                        className="mt-1 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Plus size={12} /> הוסף
                      </button>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateQuestion(field.id, "required", e.target.checked)}
                      className="w-3 h-3 text-red-600 rounded focus:ring-red-500"
                    />
                    חובה
                  </label>
                </div>
              ))}

              <button
                onClick={addQuestion}
                className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors duration-200 border border-dashed border-red-200"
              >
                + הוסף שאלה
              </button>
            </div>

            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded"
              >
                ביטול
              </button>
              <button
                onClick={saveForm}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition-colors duration-200"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}