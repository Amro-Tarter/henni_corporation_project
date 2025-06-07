import { useAdminCheck } from "./useAdminCheck";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import DashboardLayout from "../../components/dashboard/DashboardLayout";



// Custom Loader Component (provided by user)
const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100' },
  { key: 'air',   emoji: '💨', color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100' },
  { key: 'fire',  emoji: '🔥', color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100' },
];



function CleanElementalOrbitLoader() {
  const [activeElement, setActiveElement] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElement(a => (a + 1) % ELEMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = ELEMENTS[activeElement];
  const orbitDuration = 12; 
  
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
      role="status"
      aria-label="Loading elements"
    >
      <div 
        className={`relative w-64 h-64 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 rounded-full border border-gray-200 opacity-30"></div>
        
        <div 
          className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center shadow transition-all duration-700 ${current.bgColor}`}
        >
          <span className="text-4xl">{current.emoji}</span>
        </div>
        
        {ELEMENTS.map((el, i) => {
          const isActive = activeElement === i;
          
          return (
            <div
              key={el.key}
              className={`absolute top-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow transition-all duration-500 bg-white ${isActive ? 'z-20' : 'z-10'}`}
              style={{
                transform: isActive ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)',
                animation: `orbitAnimation ${orbitDuration}s linear infinite`,
                animationDelay: `-${(i * orbitDuration) / ELEMENTS.length}s`,
              }}
            >
              <span className="text-lg">{el.emoji}</span>
            </div>
          );
        })}

        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={`particle-${i}`} 
              className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-40"
              style={{
                animation: `orbitAnimation ${orbitDuration}s linear infinite`,
                animationDelay: `-${(i * orbitDuration) / 20}s`,
              }}
            ></div>
          ))}
        </div>

        <style>{`
          @keyframes orbitAnimation {
            0% {
              transform: translate(-50%, -50%) rotate(0deg) translateX(112px) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg) translateX(112px) rotate(-360deg);
            }
          }
          
          @media (max-width: 640px) {
            .text-4xl {
              font-size: 1.5rem;
            }
            .text-2xl {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}


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
