import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, Trash2, ExternalLink, FileText, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { db } from '../../config/firbaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'

// Function to generate a simple mock Firestore-like ID for client-side management
const generateClientId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Define
const QUESTION_TYPES = [
  { key: "text", label: "תשובה קצרה" },
  { key: "paragraph", label: "פסקה" },
  { key: "multipleChoice", label: "בחירה מרובה" },
  { key: "checkboxes", label: "תיבות סימון" },
  { key: "dropdown", label: "רשימה נפתחת" },
  { key: "date", label: "תאריך" },
];


export default function AdminFormManager() {
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("טופס חדש");
  const [newFormFields, setNewFormFields] = useState([
    {
      id: generateClientId(),
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
        id: doc.id,
        ...doc.data(),
        fields: doc.data().fields?.map(field => ({
          id: field.id || generateClientId(),
          ...field
        })) || [],
        built_in: !!doc.data().built_in
      }));

      setAllForms(formsData);

    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("שגיאה בטעינת טפסים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const userForms = allForms.filter(form => !form.built_in);
  const builtinForms = allForms.filter(form => form.built_in);

  const addQuestion = () => {
    setNewFormFields(prev => [
      ...prev,
      {
        id: generateClientId(),
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
        type: 'user',
        built_in: false,
        createdAt: serverTimestamp(),
        responses: 0,
        fields: newFormFields.map(({ id, ...rest }) => rest)
      };

      const docRef = await addDoc(collection(db, "forms"), formToSave);
      
      await addDoc(collection(db, "publicForms"), {
        formRef: docRef.path,
        title: newFormTitle,
        createdAt: serverTimestamp()
      });

      const newFormWithId = {
        id: docRef.id,
        ...formToSave,
        createdAt: new Date(),
        fields: newFormFields
      };
      
      setAllForms(prev => [newFormWithId, ...prev]);
      setShowModal(false);
      setNewFormTitle("טופס חדש");
      setNewFormFields([{
        id: generateClientId(),
        label: "שאלה חדשה",
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
      setAllForms(prev => prev.map(form =>
        form.id === formId ? { ...form, built_in: !currentStatus } : form
      ));
      console.log(`Form ${formId} built_in status toggled to: ${!currentStatus}`);
    } catch (err) {
      console.error("Error toggling built-in status:", err);
      setError("שגיאה בשינוי סטטוס הטופס.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CleanElementalOrbitLoader/>;
  
  return (
    <DashboardLayout>
      {/* Enhanced Header with Better Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                טופס חדש
              </button>

              <Link 
                to="/admin/submissions" 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Eye size={18} />
                תשובות
              </Link>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent leading-[1.5]"
              >מנהל טפסים</h1>
            </div>

            {/* Right side - Statistics or additional info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{allForms.length}</div>
                <div>טפסים</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{builtinForms.length}</div>
                <div>מובנים</div>
              </div>
            </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Built-in Forms Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">טפסים מובנים</h2>
              <p className="text-gray-600 text-sm">טפסים מוכנים מראש לשימוש מיידי</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builtinForms.map((form) => (
              <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 ml-3">{form.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">מובנה</span>
                    <button
                      onClick={() => toggleBuiltInStatus(form.id, form.built_in)}
                      className="p-2 bg-red-200 text-red-700 hover:bg-red-300 rounded-lg transition-colors duration-200"
                      title="הגדר כטופס רגיל"
                    >
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>שדות: {form.fields?.length || 0}</span>
                    <span>תגובות: {form.responses || 0}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    נוצר: {new Date(form.createdAt).toLocaleDateString('he-IL')}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    to={`/form/${form.id}`}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    צפייה
                  </Link>
                  <Link
                    to={`/admin/submissions`}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 text-center rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    תגובות
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Forms Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">הטפסים שלי</h2>
              <p className="text-gray-600 text-sm">טפסים שיצרת ונוהל על ידך</p>
            </div>
          </div>
          
          {userForms.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין טפסים עדיין</h3>
              <p className="text-gray-600 mb-4">צור את הטופס הראשון שלך כדי להתחיל</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
              >
                צור טופס חדש
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userForms.map((form) => (
                <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 ml-3">{form.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">משלי</span>
                      <button
                        onClick={() => toggleBuiltInStatus(form.id, form.built_in)}
                        className="p-2 bg-blue-200 text-blue-700 hover:bg-blue-300 rounded-lg transition-colors duration-200"
                        title="הגדר כטופס מובנה"
                      >
                        <Bookmark size={16} />
                      </button>
                      <button
                        onClick={() => deleteForm(form.id, form.built_in)}
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
                        title="מחק טופס"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>שדות: {form.fields?.length || 0}</span>
                      <span>תגובות: {form.responses || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      נוצר: {form.createdAt?.toDate ? form.createdAt.toDate().toLocaleDateString('he-IL') : new Date(form.createdAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/submissions`}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      צפייה
                    </Link>
                    <Link
                      to={`/admin/submissions`}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 text-center rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      תגובות
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating New Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">צור טופס חדש</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Form Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כותרת הטופס
                </label>
                <input
                  type="text"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                  placeholder="הכנס כותרת לטופס..."
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {newFormFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">שאלה {index + 1}</h4>
                      <button
                        onClick={() => removeQuestion(field.id)}
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
                        disabled={newFormFields.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          טקסט השאלה
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateQuestion(field.id, "label", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          סוג השאלה
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateQuestion(field.id, "type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type.key} value={type.key}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateQuestion(field.id, "required", e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor={`required-${field.id}`} className="mr-2 text-sm font-medium text-gray-700">
                        שאלה חובה
                      </label>
                    </div>

                    {/* Options for multiple choice questions */}
                    {["multipleChoice", "checkboxes", "dropdown"].includes(field.type) && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">אפשרויות</label>
                          <button
                            onClick={() => addOption(field.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors duration-200"
                          >
                            הוסף אפשרות
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(field.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder={`אפשרות ${optionIndex + 1}`}
                              />
                              <button
                                onClick={() => removeOption(field.id, optionIndex)}
                                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors duration-200"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={addQuestion}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus size={18} />
                  הוסף שאלה
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  ביטול
                </button>
                <button
                  onClick={saveForm}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "שומר..." : "שמור טופס"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}