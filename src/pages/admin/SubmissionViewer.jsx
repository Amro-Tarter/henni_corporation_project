import { useAdminCheck } from "./useAdminCheck";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, query, where, orderBy } from "firebase/firestore"; // Import query, where, orderBy
import { db } from "../../config/firbaseConfig";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ElementalLoader from '../../theme/ElementalLoader';
import { useParams, Link } from 'react-router-dom';

export default function SubmissionViewer() {
    const { isAdmin, loading } = useAdminCheck();
    const { formId } = useParams();

    const [submissions, setSubmissions] = useState([]);
    const [allForms, setAllForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loadingSubs, setLoadingSubs] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            if (formId) {
                fetchSubmissionsForForm(formId);
            } else {
                fetchAllFormsForSelection();
            }
        }
    }, [isAdmin, formId]);

    const fetchAllFormsForSelection = async () => {
        setLoadingSubs(true);
        setError(null);
        try {
            const querySnapshot = await getDocs(collection(db, "forms"));
            const formsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllForms(formsData);
        } catch (err) {
            console.error("Error fetching forms for selection:", err);
            setError("שגיאה בטעינת רשימת הטפסים.");
        } finally {
            setLoadingSubs(false);
        }
    };

    const fetchSubmissionsForForm = async (currentFormId) => {
        setLoadingSubs(true);
        setError(null);
        try {
            // Fetch the form details first
            const formDoc = await getDoc(doc(db, "forms", currentFormId));
            if (!formDoc.exists()) {
                setError("הטופס אינו קיים.");
                setLoadingSubs(false);
                setSelectedForm(null);
                setSubmissions([]);
                return;
            }
            setSelectedForm({ id: formDoc.id, ...formDoc.data() });

            // CORRECTED: Fetch submissions from the top-level 'submissions' collection
            const submissionsCollectionRef = collection(db, "submissions");
            const q = query(
                submissionsCollectionRef,
                where("formId", "==", currentFormId), // Filter by the formId field
                orderBy("submittedAt", "desc") // Order by submission time
            );

            const snap = await getDocs(q); // Use the query
            const submissionData = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setSubmissions(submissionData);
        } catch (err) {
            console.error("Error fetching submissions:", err);
            setError("המשיכה של התשובות נכשלה.");
            setSubmissions([]);
        } finally {
            setLoadingSubs(false);
        }
    };

    if (loading || loadingSubs) return <ElementalLoader />;
    if (!isAdmin) return <p className="text-center text-red-600">אין הרשאה</p>;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    {formId ? `תשובות עבור: ${selectedForm?.title || 'טופס נבחר'}` : 'בחר טופס לצפייה בתשובות'}
                </h2>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                {!formId && (
                    <>
                        <p className="text-gray-600 mb-4">בחר טופס מהרשימה כדי לצפות בתשובותיו:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allForms.length === 0 ? (
                                <p className="col-span-full text-center text-gray-500">אין טפסים זמינים.</p>
                            ) : (
                                allForms.map(form => (
                                    <Link
                                        key={form.id}
                                        to={`/admin/submissions/${form.id}`}
                                        className="block p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                                    >
                                        <h3 className="font-semibold text-lg text-gray-800">{form.title}</h3>
                                        <p className="text-sm text-gray-600">שדות: {form.fields?.length || 0}</p>
                                        <p className="text-xs text-gray-500">נוצר: {new Date(form.createdAt?.toDate ? form.createdAt.toDate() : form.createdAt).toLocaleDateString('he-IL')}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </>
                )}

                {formId && (
                    <>
                        <Link
                            to="/admin/forms"
                            className="inline-flex items-center px-4 py-2 bg-rose-500 text-white hover:bg-rose-600  rounded-md  transition-colors mb-6"
                        >
                            חזור לרשימת הטפסים
                        </Link>

                        {submissions.length === 0 ? (
                            <p className="text-gray-600">אין עדיין תשובות לטופס זה.</p>
                        ) : (
                            <div className="space-y-6">
                                {submissions.map((s, i) => {
                                    return (
                                        <div
                                            key={s.id || i}
                                            className="border border-gray-300 rounded-xl p-6 shadow-md bg-white"
                                        >
                                            <h4 className="font-bold text-xl mb-3 text-gray-800">
                                                תשובה מספר {i + 1}
                                            </h4>
                                            <p className="text-sm mb-1 text-gray-700">
                                                <strong>שם הטופס:</strong> {selectedForm?.title || "טופס ללא שם"}
                                            </p>
                                            <p className="text-sm mb-1 text-gray-700">
                                                <strong>שם משתמש:</strong> {s.username || "לא ידוע"}
                                            </p>
                                            <p className="text-sm mb-3 text-gray-700">
                                                <strong>נשלח בתאריך:</strong>{" "}
                                                {s.submittedAt?.toDate
                                                    ? s.submittedAt.toDate().toLocaleString('he-IL')
                                                    : "לא זמין"}
                                            </p>

                                            <div className="space-y-2 border-t pt-4 mt-4">
                                                {Object.entries(s.answers)
                                                    .sort(([qidA], [qidB]) => {
                                                        // Assuming field-0, field-1, etc. for sorting
                                                        const indexA = parseInt(qidA.replace("field-", ""), 10);
                                                        const indexB = parseInt(qidB.replace("field-", ""), 10);
                                                        return indexA - indexB;
                                                    })
                                                    .map(([qid, ans]) => {
                                                        // Find the corresponding question label from the selectedForm
                                                        const question = selectedForm?.fields?.find(field => field.id === qid || `field-${selectedForm.fields.indexOf(field)}` === qid);
                                                        const label = question?.label || `שאלה: ${qid}`; // Fallback to QID if label not found

                                                        return (
                                                            <div key={qid}>
                                                                <strong className="text-gray-800">{label}:</strong>{" "}
                                                                {Array.isArray(ans) ? (
                                                                    <ul className="list-disc mr-6 text-sm text-gray-600">
                                                                        {ans.map((val, idx) => (
                                                                            <li key={idx}>{val}</li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <span className="text-sm text-gray-600">{ans}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}