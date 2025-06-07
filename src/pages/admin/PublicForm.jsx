import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  increment, // Import increment
  updateDoc, // Import updateDoc
} from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { useAuth } from "../../context/AuthContext";

export default function PublicForm() {
  const { formId } = useParams();
  const { currentUser } = useAuth();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [username, setUsername] = useState("");


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

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      try {
        const formSnap = await getDoc(doc(db, "forms", formId));
        formSnap.exists() ? setForm(formSnap.data()) : setForm(null);
      } catch (err) {
        console.error("Error loading form:", err);
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    const loadUsername = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || "לא ידוע");
          }
        } catch (err) {
          console.error("Error loading username:", err);
          setUsername("לא ידוע");
        }
      }
    };

    loadForm();
    loadUsername();
  }, [formId, currentUser]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id, option) => {
    setAnswers((prev) => {
      const current = prev[id] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [id]: updated };
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitStatus(null);

  // --- Add these console.logs ---
  console.log("Submitting form...");
  console.log("formId:", formId); // Check if formId is valid
  console.log("answers:", answers); // Check content of answers object
  console.log("username (before submission):", username); // Check username value

  // Make sure answers has no undefined or non-serializable values
  const cleanedAnswers = {};
  for (const key in answers) {
    if (Object.prototype.hasOwnProperty.call(answers, key)) {
      const value = answers[key];
      // Convert undefined to null, or filter it out if not essential
      if (value === undefined) {
        // Option 1: Convert undefined to null (Firestore accepts null)
        cleanedAnswers[key] = null;
        console.warn(`Field "${key}" was undefined, converted to null.`);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date) && !(value._isFieldValue)) {
        // Option 2: Deep check for non-plain objects if your answers can contain them
        // For now, let's just log potential issues
        console.warn(`Field "${key}" is a complex object. Ensure it's plain or serializable. Value:`, value);
        cleanedAnswers[key] = JSON.parse(JSON.stringify(value)); // A crude way to "plain-ify"
      } else {
        cleanedAnswers[key] = value;
      }
    }
  }
  console.log("cleanedAnswers:", cleanedAnswers);
  // --- End console.logs ---

  try {
    // 1. Add submission
    await addDoc(collection(db, "submissions"), {
      formId,
      answers: cleanedAnswers, // Use cleanedAnswers
      username: currentUser ? username : "אורח/ת", // Ensure username is always a string
      submittedAt: serverTimestamp(),
    });

    // 2. Increment responses count in the 'forms' collection
    const formDocRef = doc(db, "forms", formId);
    await updateDoc(formDocRef, {
      responses: increment(1)
    });

    setSubmitStatus("הטופס נשלח בהצלחה!");
    setAnswers({});
  } catch (err) {
    console.error("Submission failed:", err);
    console.error("Full error details:", JSON.stringify(err, null, 2)); // Stringify for full error details
    setSubmitStatus("השליחה נכשלה.");
  }
};

  if (loading ) return <CleanElementalOrbitLoader />;
  if (!form) return <p className="text-center text-red-600">הטופס לא נמצא.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">{form.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields && form.fields.map((field, index) => { // Added check for form.fields
          const fieldId = field.id || `field-${index}`;
          const value = answers[fieldId] || "";

          return (
            <div key={fieldId} className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                {field.label || "שאלה ללא כותרת"}
                {field.required && <span className="text-red-500">*</span>} {/* Indicate required fields */}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  required={field.required}
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              )}

              {field.type === "paragraph" && (
                <textarea
                  required={field.required}
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                />
              )}

              {field.type === "multipleChoice" && (
                <div className="space-y-1">
                  {field.options?.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={fieldId}
                        value={option}
                        checked={value === option}
                        onChange={(e) => handleChange(fieldId, e.target.value)}
                        required={field.required} // Radio buttons often need one selected if required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "checkboxes" && (
                <div className="space-y-1">
                  {field.options?.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(value || []).includes(option)}
                        onChange={() => handleCheckboxChange(fieldId, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  {field.required && !value.length && (
                    <p className="text-red-500 text-xs mt-1">נדרשת בחירה אחת לפחות.</p>
                  )}
                </div>
              )}

              {field.type === "dropdown" && (
                <select
                  required={field.required}
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">בחר אפשרות</option>
                  {field.options?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "date" && (
                <input
                  type="date"
                  required={field.required}
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              )}

              {![
                "text",
                "paragraph",
                "multipleChoice",
                "checkboxes",
                "dropdown",
                "date",
              ].includes(field.type) && (
                <p className="text-red-600">
                  סוג שדה לא נתמך: {field.type}
                </p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          שלח
        </button>
      </form>

      {submitStatus && (
        <p className="mt-4 text-center text-blue-600">{submitStatus}</p>
      )}
    </div>
  );
}