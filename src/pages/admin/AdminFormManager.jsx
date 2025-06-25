import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, Trash2, ExternalLink, FileText, Bookmark, Share2, Pencil, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { db } from '../../config/firbaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import ElementalLoader from '../../theme/ElementalLoader';

// Function to generate a simple mock Firestore-like ID for client-side management
const generateClientId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Define question types
const QUESTION_TYPES = [
    { key: "text", label: "תשובה קצרה" },
    { key: "paragraph", label: "פסקה" },
    { key: "multipleChoice", label: "בחירה מרובה" },
    { key: "checkboxes", label: "תיבות סימון" },
    { key: "dropdown", label: "רשימה נפתחת" },
    { key: "date", label: "תאריך" },
];

// Reusable Stat Card Component
const StatCard = ({ icon, label, value, iconBgColor, iconColor }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg">
        <div className="flex-1 text-right">
            <div className="text-4xl font-bold text-gray-900">{value}</div>
            <div className="text-gray-600 mt-1 text-sm">{label}</div>
        </div>
        <div className={`p-3 rounded-full ${iconBgColor} flex-shrink-0`}>
            {React.cloneElement(icon, { size: 32, className: iconColor })}
        </div>
    </div>
);


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
    const [copiedFormId, setCopiedFormId] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [stats, setStats] = useState({ total: 0, builtIn: 0, user: 0, totalResponses: 0 });

    const fetchForms = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "forms"));
            let formsData = [];
            let totalResponses = 0;
            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                formsData.push({
                    id: doc.id,
                    ...data,
                    fields: data.fields?.map(field => ({
                        id: field.id || generateClientId(),
                        ...field
                    })) || [],
                    built_in: !!data.built_in
                });
                totalResponses += data.responses || 0;
            });

            setAllForms(formsData);
            setStats({
                total: formsData.length,
                builtIn: formsData.filter(f => f.built_in).length,
                user: formsData.filter(f => !f.built_in).length,
                totalResponses: totalResponses,
            });

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
                formId: docRef.id,
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
            setStats(prev => ({ ...prev, total: prev.total + 1, user: prev.user + 1 }));
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
                setStats(prev => {
                    const deletedForm = allForms.find(f => f.id === formId);
                    return {
                        ...prev,
                        total: prev.total - 1,
                        user: prev.user - 1,
                        totalResponses: prev.totalResponses - (deletedForm?.responses || 0)
                    };
                });
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
            await updateDoc(formDocRef, { built_in: !currentStatus });

            setAllForms(prev => prev.map(form =>
                form.id === formId ? { ...form, built_in: !currentStatus } : form
            ));
            setStats(prev => ({
                ...prev,
                builtIn: currentStatus ? prev.builtIn - 1 : prev.builtIn + 1,
                user: currentStatus ? prev.user + 1 : prev.user - 1,
            }));
        } catch (err) {
            console.error("Error toggling built-in status:", err);
            setError("שגיאה בשינוי סטטוס הטופס.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (formId) => {
        const formLink = `${window.location.origin}/form/${formId}`;
        try {
            await navigator.clipboard.writeText(formLink);
            setCopySuccess('הקישור הועתק בהצלחה!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('שגיאה בהעתקת הקישור.');
            console.error('Failed to copy: ', err);
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };

    if (loading) return <ElementalLoader />;

    return (
        <DashboardLayout>
            {/* New Header and Stats Section */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Main Title */}
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-right leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        ניהול טפסים
                    </h1>
                    <BarChart2 size={40} className="text-gray-700" />
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={<FileText />}
                        label="סך הכל טפסים"
                        value={stats.total}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={<Bookmark />}
                        label="טפסים מובנים"
                        value={stats.builtIn}
                        iconBgColor="bg-red-100"
                        iconColor="text-red-600"
                    />
                    <StatCard
                        icon={<FileText />}
                        label="טפסים שלי"
                        value={stats.user}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                    />
                    <StatCard
                        icon={<ExternalLink />}
                        label="סך כל התגובות"
                        value={stats.totalResponses}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                    />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-sm sm:text-base">
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
                {copySuccess && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg text-sm sm:text-base">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Share2 className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-green-700 font-medium">{copySuccess}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Management Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">כל הטפסים</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <Plus size={20} />
                            צור טופס חדש
                        </button>
                    </div>

                    {allForms.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 px-6">
                            <FileText size={50} className="mx-auto text-gray-400 mb-6" />
                            <h3 className="text-xl font-medium text-gray-900 mb-3">אין טפסים עדיין</h3>
                            <p className="text-gray-600 mb-6">צור את הטופס הראשון שלך כדי להתחיל</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-8 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                            >
                                צור טופס חדש
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {allForms.map((form) => (
                                <div key={form.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight flex-grow ml-3 min-w-0">
                                            {form.title}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {form.built_in ? (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">מובנה</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">משלי</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-6 text-gray-600 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span>שדות: {form.fields?.length || 0}</span>
                                            <span className="flex items-center gap-1">
                                                <ExternalLink size={14} />
                                                תגובות: {form.responses || 0}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 text-right">
                                            נוצר: {form.createdAt?.toDate ? form.createdAt.toDate().toLocaleDateString('he-IL') : new Date(form.createdAt).toLocaleDateString('he-IL')}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link
                                            to={`/form/${form.id}`}
                                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-center rounded-xl hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Eye size={18} />
                                            צפייה
                                        </Link>
                                        <Link
                                            to={`/admin/submissions/${form.id}`}
                                            className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 text-center rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                        >
                                            <ExternalLink size={18} />
                                            תגובות
                                        </Link>
                                        <button
                                            onClick={() => setCopiedFormId(copiedFormId === form.id ? null : form.id)}
                                            className="flex-1 px-4 py-2.5 bg-purple-50 text-purple-600 text-center rounded-xl hover:bg-purple-100 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Share2 size={18} />
                                            קישור
                                        </button>
                                    </div>
                                    {copiedFormId === form.id && (
                                        <div className="mt-4 flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${window.location.origin}/form/${form.id}`}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleCopyLink(form.id)}
                                                className="p-2 bg-purple-200 text-purple-700 hover:bg-purple-300 rounded-lg transition-colors duration-200"
                                                title="העתק קישור"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-between gap-3">
                                        <button
                                            onClick={() => toggleBuiltInStatus(form.id, form.built_in)}
                                            className="flex-1 px-4 py-2.5 bg-red-100 text-red-600 text-center rounded-xl hover:bg-red-200 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                            title={form.built_in ? "הגדר כטופס רגיל" : "הגדר כטופס מובנה"}
                                        >
                                            <Bookmark size={18} />
                                            {form.built_in ? "הסר מובנה" : "הגדר מובנה"}
                                        </button>
                                        {!form.built_in && (
                                            <button
                                                onClick={() => deleteForm(form.id, form.built_in)}
                                                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 text-center rounded-xl hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                title="מחק טופס"
                                            >
                                                <Trash2 size={18} />
                                                מחק
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Creating New Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 shadow-2xl">
                        <div className="sticky top-0 bg-white p-6 rounded-t-3xl border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">צור טופס חדש</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Form Title */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    כותרת הטופס
                                </label>
                                <input
                                    type="text"
                                    value={newFormTitle}
                                    onChange={(e) => setNewFormTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-base placeholder:text-gray-400"
                                    placeholder="הכנס כותרת לטופס..."
                                />
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                {newFormFields.map((field, index) => (
                                    <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-bold text-gray-900">שאלה {index + 1}</h4>
                                            <button
                                                onClick={() => removeQuestion(field.id)}
                                                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors duration-200"
                                                disabled={newFormFields.length === 1}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    טקסט השאלה
                                                </label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateQuestion(field.id, "label", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    סוג השאלה
                                                </label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateQuestion(field.id, "type", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base bg-white"
                                                >
                                                    {QUESTION_TYPES.map((type) => (
                                                        <option key={type.key} value={type.key}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`required-${field.id}`}
                                                checked={field.required}
                                                onChange={(e) => updateQuestion(field.id, "required", e.target.checked)}
                                                className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <label htmlFor={`required-${field.id}`} className="mr-2 text-sm font-bold text-gray-700">
                                                שאלה חובה
                                            </label>
                                        </div>

                                        {/* Options for multiple choice questions */}
                                        {["multipleChoice", "checkboxes", "dropdown"].includes(field.type) && (
                                            <div className="mt-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-bold text-gray-700">אפשרויות</label>
                                                    <button
                                                        onClick={() => addOption(field.id)}
                                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors duration-200 font-medium"
                                                    >
                                                        הוסף אפשרות
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(field.options || []).map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                                                                placeholder={`אפשרות ${optionIndex + 1}`}
                                                            />
                                                            <button
                                                                onClick={() => removeOption(field.id, optionIndex)}
                                                                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors duration-200"
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
                            <div className="mt-8 text-center">
                                <button
                                    onClick={addQuestion}
                                    className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
                                >
                                    <Plus size={20} />
                                    הוסף שאלה
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white p-6 rounded-b-3xl border-t border-gray-200">
                            <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={saveForm}
                                    disabled={loading}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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