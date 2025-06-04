import { useAdminCheck } from "./useAdminCheck";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";

export default function SubmissionViewer() {
  const { isAdmin, loading } = useAdminCheck();
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchSubmissions();
  }, [isAdmin]);

  const fetchSubmissions = async () => {
    setLoadingSubs(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "submissions"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
    } catch {
      setError("Failed to fetch submissions");
    } finally {
      setLoadingSubs(false);
    }
  };

  if (loading || loadingSubs) return <p className="text-center">Loading...</p>;
  if (!isAdmin) return <p className="text-center text-red-600">Unauthorized</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Form Submissions</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s, i) => (
            <div
              key={s.id || i}
              className="border border-gray-300 rounded p-4 shadow-sm"
            >
              <h4 className="font-semibold text-lg mb-2">Submission {i + 1}</h4>
              <p className="text-sm mb-1">
                <strong>Form ID:</strong> {s.formId}
              </p>
              <p className="text-sm mb-1">
                <strong>Username:</strong> {s.username || "Unknown"}
              </p>
              <p className="text-sm mb-2">
                <strong>Submitted At:</strong>{" "}
                {s.submittedAt?.toDate
                  ? s.submittedAt.toDate().toLocaleString()
                  : "N/A"}
              </p>
              <div className="space-y-2">
                {Object.entries(s.answers).map(([q, a]) => (
                  <div key={q}>
                    <strong>{q}:</strong>{" "}
                    {Array.isArray(a) ? (
                      <ul className="list-disc ml-5 text-sm">
                        {a.map((val, idx) => (
                          <li key={idx}>{val}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm">{a}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
