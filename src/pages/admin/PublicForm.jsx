// src/pages/PublicForm.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { useAuth } from "../../context/AuthContext";
import ElementalLoader from '../../theme/ElementalLoader';

export default function PublicForm() {
  const { formId } = useParams();
  const { currentUser } = useAuth();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      try {
        const formSnap = await getDoc(doc(db, "forms", formId));
        if (formSnap.exists()) {
          const rawForm = formSnap.data();
          const fieldsWithIds = rawForm.fields.map((field, i) => ({
            ...field,
            id: field.id || `field-${i}`
          }));
          setForm({ ...rawForm, fields: fieldsWithIds });
        } else {
          setForm(null);
        }
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

  useEffect(() => {
    if (submitStatus === "הטופס נשלח בהצלחה!") {
      const timer = setTimeout(() => setSubmitStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleCheckboxChange = (id, option) => {
    setAnswers((prev) => {
      const current = prev[id] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];

      if (updated.length > 0) {
        setFieldErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[id];
          return newErrors;
        });
      }

      return { ...prev, [id]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setFieldErrors({});
    setIsSubmitting(true);

    let isValid = true;
    const newErrors = {};

    form.fields.forEach((field, index) => {
      const fieldId = field.id || `field-${index}`;
      const value = answers[fieldId];

      if (field.required) {
        if (["text", "paragraph", "date", "dropdown", "multipleChoice"].includes(field.type)) {
          if (!value || String(value).trim() === "") {
            isValid = false;
            newErrors[fieldId] = "שדה חובה זה חסר.";
          }
        } else if (field.type === "checkboxes" && (!value || value.length === 0)) {
          isValid = false;
          newErrors[fieldId] = "נדרשת בחירה אחת לפחות.";
        }
      }
    });

    if (!isValid) {
      setFieldErrors(newErrors);
      setSubmitStatus("אנא מלא/מלאי את כל השדות הנדרשים.");
      setIsSubmitting(false);
      return;
    }

    const cleanedAnswers = {};
    for (const key in answers) {
      if (Object.prototype.hasOwnProperty.call(answers, key)) {
        const value = answers[key];
        cleanedAnswers[key] = value === undefined ? null : value;
      }
    }

    try {
      await addDoc(collection(db, "submissions"), {
        formId,
        answers: cleanedAnswers,
        username: currentUser ? username : "אורח/ת",
        submittedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "forms", formId), {
        responses: increment(1)
      });

      setSubmitStatus("הטופס נשלח בהצלחה!");
      setAnswers({});
    } catch (err) {
      console.error("Submission failed:", err);
      let message = "השליחה נכשלה.";
      if (err.code === 'unavailable') {
        message = "השליחה נכשלה. אנא בדוק/בדקי את חיבור האינטרנט שלך.";
      } else if (err.message && process.env.NODE_ENV !== 'production') {
        message += ` פרטים: ${err.message}`;
      }
      setSubmitStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <ElementalLoader />;
  if (!form) return <p className="text-center text-red-600">הטופס לא נמצא.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">{form.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map((field, index) => {
          const fieldId = field.id || `field-${index}`;
          const value = answers[fieldId] || "";
          const error = fieldErrors[fieldId];

          return (
            <div key={fieldId} className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                {field.label || "שאלה ללא כותרת"}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
              )}

              {field.type === "paragraph" && (
                <textarea
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                </div>
              )}

              {field.type === "dropdown" && (
                <select
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">בחר אפשרות</option>
                  {field.options?.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {field.type === "date" && (
                <input
                  type="date"
                  value={value}
                  onChange={(e) => handleChange(fieldId, e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
              )}

              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

              {!["text", "paragraph", "multipleChoice", "checkboxes", "dropdown", "date"].includes(field.type) && (
                <p className="text-red-600">סוג שדה לא נתמך: {field.type}</p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "שולח..." : "שלח"}
        </button>
      </form>

      {submitStatus && (
        <p className={`mt-4 text-center ${submitStatus.includes("נכשל") ? 'text-red-600' : 'text-blue-600'}`}>
          {submitStatus}
        </p>
      )}
    </div>
  );
}
