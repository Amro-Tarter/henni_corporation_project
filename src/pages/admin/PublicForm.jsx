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
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'

export default function PublicForm() {
  const { formId } = useParams();
  const { currentUser } = useAuth();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [username, setUsername] = useState("");


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