import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, serverTimestamp, getDoc as fetchDoc } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed

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
        if (formSnap.exists()) setForm(formSnap.data());
        else setForm(null);
      } catch {
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    const loadUsername = async () => {
      if (currentUser) {
        const userDoc = await fetchDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || "Unknown");
        }
      }
    };

    loadForm();
    loadUsername();
  }, [formId, currentUser]);

  const handleChange = (label, value) => {
    setAnswers((prev) => ({ ...prev, [label]: value }));
  };

  const handleCheckboxChange = (label, option) => {
    setAnswers((prev) => {
      const current = prev[label] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [label]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    try {
      await addDoc(collection(db, "submissions"), {
        formId,
        answers,
        username,
        submittedAt: serverTimestamp(),
      });
      setSubmitStatus("Submitted successfully!");
      setAnswers({});
    } catch {
      setSubmitStatus("Failed to submit form.");
    }
  };

  if (loading) return <p className="text-center">Loading form...</p>;
  if (!form) return <p className="text-center text-red-600">Form not found.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">{form.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map((field) => (
  <div key={field.label || field.id} className="mb-4">
    <label className="block text-sm font-semibold mb-1">
      {field.label || "Untitled Question"}
    </label>

    {field.type === "text" ? (
      <input
        type="text"
        required={field.required}
        value={answers[field.label] || ""}
        onChange={(e) => handleChange(field.label, e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
    ) : field.type === "paragraph" ? (
      <textarea
        required={field.required}
        value={answers[field.label] || ""}
        onChange={(e) => handleChange(field.label, e.target.value)}
        className="w-full px-3 py-2 border rounded"
        rows={4}
      />
    ) : field.type === "multipleChoice" ? (
      <div className="space-y-1">
        {field.options?.map((option, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name={field.label}
              value={option}
              checked={answers[field.label] === option}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    ) : field.type === "checkboxes" ? (
      <div className="space-y-1">
        {field.options?.map((option, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={answers[field.label]?.includes(option) || false}
              onChange={() => handleCheckboxChange(field.label, option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    ) : field.type === "dropdown" ? (
      <select
        required={field.required}
        value={answers[field.label] || ""}
        onChange={(e) => handleChange(field.label, e.target.value)}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="">Select an option</option>
        {field.options?.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : field.type === "date" ? (
      <input
        type="date"
        required={field.required}
        value={answers[field.label] || ""}
        onChange={(e) => handleChange(field.label, e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
    ) : (
      <p className="text-red-600">Unsupported field type: {field.type}</p>
    )}
  </div>
))}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>
      {submitStatus && <p className="mt-4 text-center text-blue-600">{submitStatus}</p>}
    </div>
  );
}
