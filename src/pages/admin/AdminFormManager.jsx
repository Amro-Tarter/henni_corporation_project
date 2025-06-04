// AdminFormManager.jsx
import { useAdminCheck } from "./useAdminCheck";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../../config/firbaseConfig";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Plus, X } from 'lucide-react';

const QUESTION_TYPES = [
  { key: "text", label: "Short answer" },
  { key: "paragraph", label: "Paragraph" },
  { key: "multipleChoice", label: "Multiple choice" },
  { key: "checkboxes", label: "Checkboxes" },
  { key: "dropdown", label: "Dropdown" },
];

function CleanElementalOrbitLoader() {
  // ... Your loader code remains unchanged
}

export default function AdminFormManager() {
  const { isAdmin, loading } = useAdminCheck();
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("Untitled Form");
  const [newFormFields, setNewFormFields] = useState([
    {
      id: Date.now(),
      label: "Untitled Question",
      type: "text",
      required: false,
      options: [], // For choice questions
    },
  ]);

  useEffect(() => {
    if (isAdmin) fetchForms();
  }, [isAdmin]);

  const fetchForms = async () => {
    setLoadingForms(true);
    try {
      const snap = await getDocs(collection(db, "forms"));
      const formsData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setForms(formsData);
    } catch (err) {
      setError("Failed to fetch forms");
    } finally {
      setLoadingForms(false);
    }
  };

  const addQuestion = () => {
    setNewFormFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "Untitled Question",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (id, key, value) => {
    setNewFormFields((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const addOption = (questionId) => {
    setNewFormFields((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), "Option"] }
          : q
      )
    );
  };

  const updateOption = (questionId, index, value) => {
    setNewFormFields((prev) =>
      prev.map((q) => {
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
    setNewFormFields((prev) =>
      prev.map((q) => {
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
    setNewFormFields((prev) => prev.filter((q) => q.id !== questionId));
  };

  const saveForm = async () => {
    setError(null);
    try {
      // Basic validation: form title required, at least one question
      if (!newFormTitle.trim()) {
        setError("Form title cannot be empty");
        return;
      }
      if (newFormFields.length === 0) {
        setError("Add at least one question");
        return;
      }

      // For choice questions, ensure at least one option
      for (const q of newFormFields) {
        if (
          ["multipleChoice", "checkboxes", "dropdown"].includes(q.type) &&
          (!q.options || q.options.length === 0)
        ) {
          setError(
            `Question "${q.label}" requires at least one option`
          );
          return;
        }
      }

      const formData = {
        title: newFormTitle,
        fields: newFormFields.map(({ id, ...rest }) => rest), // Remove id before saving
      };
      const formDocRef = await addDoc(collection(db, "forms"), formData);
      await addDoc(collection(db, "publicForms"), { formId: formDocRef.id });
      fetchForms();
      setShowModal(false);
      setNewFormFields([]);
      setNewFormTitle("Untitled Form");
      setError(null);
    } catch {
      setError("Failed to save form");
    }
  };

  const deleteForm = async (formId) => {
    setError(null);
    try {
      await deleteDoc(doc(db, "forms", formId));
      const q = query(collection(db, "publicForms"), where("formId", "==", formId));
      const querySnap = await getDocs(q);
      querySnap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "publicForms", docSnap.id));
      });
      fetchForms();
    } catch {
      setError("Failed to delete form");
    }
  };

  if (loading || loadingForms) return <CleanElementalOrbitLoader />;
  if (!isAdmin) return <p className="text-center text-red-500">Unauthorized</p>;

  return (
    <DashboardLayout>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center overflow-auto p-6 pt-20">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                placeholder="Form title"
                className="text-2xl font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
              />
              <button
                onClick={() => setShowModal(false)}
                className="ml-4 text-gray-600 hover:text-gray-900"
                aria-label="Close modal"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {newFormFields.map((field, idx) => (
              <div
                key={field.id}
                className="border border-gray-300 rounded p-4 mb-4 relative"
              >
                <button
                  onClick={() => removeQuestion(field.id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-900"
                  title="Remove question"
                >
                  <X size={20} />
                </button>

                <input
                  type="text"
                  value={field.label}
                  onChange={(e) =>
                    updateQuestion(field.id, "label", e.target.value)
                  }
                  placeholder={`Question ${idx + 1}`}
                  className="w-full text-lg font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
                />

                <select
                  value={field.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    updateQuestion(field.id, "type", newType);
                    if (
                      ["multipleChoice", "checkboxes", "dropdown"].includes(
                        newType
                      ) &&
                      (!field.options || field.options.length === 0)
                    ) {
                      updateQuestion(field.id, "options", ["Option 1"]);
                    } else if (
                      !["multipleChoice", "checkboxes", "dropdown"].includes(
                        newType
                      )
                    ) {
                      updateQuestion(field.id, "options", []);
                    }
                  }}
                  className="mb-2 p-1 border rounded"
                >
                  {QUESTION_TYPES.map((qt) => (
                    <option key={qt.key} value={qt.key}>
                      {qt.label}
                    </option>
                  ))}
                </select>

                {["multipleChoice", "checkboxes", "dropdown"].includes(
                  field.type
                ) && (
                  <div className="mb-2">
                    {field.options.map((option, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 mb-1"
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(field.id, i, e.target.value)
                          }
                          className="flex-grow border border-gray-300 rounded p-1"
                        />
                        <button
                          onClick={() => removeOption(field.id, i)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove option"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(field.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      + Add option
                    </button>
                  </div>
                )}

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateQuestion(field.id, "required", e.target.checked)
                    }
                  />
                  Required
                </label>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="mb-4 px-4 py-2 border rounded hover:bg-gray-100"
            >
              + Add Question
            </button>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Form
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Admin Form Manager</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <button
          onClick={() => {
            setNewFormTitle("Untitled Form");
            setNewFormFields([
              {
                id: Date.now(),
                label: "Untitled Question",
                type: "text",
                required: false,
                options: [],
              },
            ]);
            setShowModal(true);
          }}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create Form
        </button>
        <div className="space-y-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="border rounded p-4 shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold">{form.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Public form link:{" "}
                <a
                  className="text-blue-500 underline"
                  href={`/form/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {window.location.origin}/form/{form.id}
                </a>
              </p>
              <button
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded"
                onClick={() => deleteForm(form.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
