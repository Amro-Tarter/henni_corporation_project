import { useAdminCheck } from "./useAdminCheck";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'





export default function SubmissionViewer() {
  const { isAdmin, loading } = useAdminCheck();
  const [submissions, setSubmissions] = useState([]);
  const [forms, setForms] = useState({});
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (isAdmin) fetchAllData();
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoadingSubs(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "submissions"));
      const submissionData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const formIds = [...new Set(submissionData.map((s) => s.formId))];
      const formPromises = formIds.map(async (id) => {
        const formSnap = await getDoc(doc(db, "forms", id));
        return formSnap.exists() ? { id, ...formSnap.data() } : null;
      });

      const formDataArr = await Promise.all(formPromises);
      const formMap = {};
      formDataArr.forEach((form) => {
        if (form) formMap[form.id] = form;
      });

      setForms(formMap);
      setSubmissions(submissionData);
    } catch (err) {
      console.error(err);
      setError("המשיכה של התשובות או הטפסים נכשלה.");
    } finally {
      setLoadingSubs(false);
    }
  };


if (loading || loadingSubs) return <CleanElementalOrbitLoader />;
  if (!isAdmin) return <p className="text-center text-red-600">אין הרשאה</p>;

  
  return (
    <DashboardLayout>


    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">תשובות לטפסים</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {submissions.length === 0 ? (
        <p className="text-gray-600">עדיין אין תשובות.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s, i) => {
            const form = forms[s.formId];
            return (
              <div
                key={s.id || i}
                className="border border-gray-300 rounded p-4 shadow-sm"
              >
                <h4 className="font-semibold text-lg mb-2">
                  תשובה מספר {i + 1}
                </h4>
                <p className="text-sm mb-1">
                  <strong>שם הטופס:</strong> {form?.title || "טופס ללא שם"}
                </p>
                <p className="text-sm mb-1">
                  <strong>שם משתמש:</strong> {s.username || "לא ידוע"}
                </p>
                <p className="text-sm mb-2">
                  <strong>נשלח בתאריך:</strong>{" "}
                  {s.submittedAt?.toDate
                    ? s.submittedAt.toDate().toLocaleString()
                    : "לא זמין"}
                </p>

                 <div className="space-y-2">
                  {Object.entries(s.answers)
                    .sort(([qidA], [qidB]) => {
                      const indexA = parseInt(qidA.replace("field-", ""), 10);
                      const indexB = parseInt(qidB.replace("field-", ""), 10);
                      return indexA - indexB; // מיון לפי מספר השאלה בסדר עולה
                    })
                    .map(([qid, ans]) => {
                      const index = parseInt(qid.replace("field-", ""), 10);
                      const question = form?.fields?.[index]; 
                      // Use the question label directly
                      const label = question?.label || `שאלה ${index + 1}`;
                      return (
                        <div key={qid}>
                          <strong>{label}:</strong>{" "}
                          {Array.isArray(ans) ? (
                            <ul className="list-disc ml-5 text-sm">
                              {ans.map((val, idx) => (
                                <li key={idx}>{val}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-sm">{ans}</span>
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
    </div>
</DashboardLayout>
  );
}
