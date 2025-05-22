import React, { useState, useEffect } from "react";
// Assuming db and auth are already initialized and exported from firbaseConfig.js
import { db, auth } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Only need onAuthStateChanged, not getAuth or signInAnonymously here
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

function MentorReportForm() {
  const navigate = useNavigate();

  // State for user ID and authentication readiness
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Form states
  const [mentorId, setMentorId] = useState(""); // This will be set from currentUserId
  const [participantId, setParticipantId] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [programYear, setProgramYear] = useState(1);

  // Q1 states
  const [q1ArtisticDevelopment, setQ1ArtisticDevelopment] = useState("");
  const [q1SocialSkillsImprovement, setQ1SocialSkillsImprovement] = useState("");
  const [q1InvolvementMotivationRating, setQ1InvolvementMotivationRating] = useState("");

  // Q2 states
  const [q2MainChallenges, setQ2MainChallenges] = useState("");
  const [q2ChallengeCopingMethods, setQ2ChallengeCopingMethods] = useState("");
  const [q2ProfessionalSupportNeeded, setQ2ProfessionalSupportNeeded] = useState("");

  // Q3 states (for up to 3 previous goals)
  const [q3PreviousGoals, setQ3PreviousGoals] = useState([
    { goal_text: "", status: "" },
    { goal_text: "", status: "" },
    { goal_text: "", status: "" },
  ]);
  const [q3NextPeriodGoalsText, setQ3NextPeriodGoalsText] = useState("");
  const [q3MeansToAchieveNewGoals, setQ3MeansToAchieveNewGoals] = useState("");

  // Q4 states
  const [q4FamilyResponseSupport, setQ4FamilyResponseSupport] = useState("");
  const [q4CooperationWithOthers, setQ4CooperationWithOthers] = useState("");
  const [q4RecommendationsForFamily, setQ4RecommendationsForFamily] = useState("");

  // Q5 states
  const [q5ProminentStrengths, setQ5ProminentStrengths] = useState("");
  const [q5MostSignificantEvent, setQ5MostSignificantEvent] = useState("");
  const [q5RecommendationsForGuidance, setQ5RecommendationsForGuidance] = useState("");
  const [q5OverallProgressRating, setQ5OverallProgressRating] = useState("");

  const [additionalNotes, setAdditionalNotes] = useState("");

  // Tailwind CSS input style for consistency
  const inputStyle = "appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";
  const textareaStyle = "appearance-none rounded-md w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right h-24";

  // Authentication Listener
  useEffect(() => {
    // Ensure auth is available from the imported config
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserId(user.uid);
          setMentorId(user.uid); // Automatically set mentorId to current user's UID
        } else {
          // Handle cases where user is not logged in, e.g., redirect to login
          // For now, setting a placeholder or navigating if not authenticated
          console.warn("No user authenticated. MentorReportForm requires authentication.");
          // You might want to redirect to a login page here:
          // navigate("/login");
        }
        setIsAuthReady(true); // Mark authentication as ready
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    } else {
      console.error("Firebase Auth instance not available. Check ../config/firbaseConfig.js");
      toast.error("Firebase authentication not configured correctly.");
      setIsAuthReady(true); // Still mark as ready to avoid infinite loading, but with an error
    }
  }, []); // Empty dependency array means this runs once on mount

  // Handler for previous goals array
  const handlePreviousGoalChange = (index, field, value) => {
    const newGoals = [...q3PreviousGoals];
    newGoals[index][field] = value;
    setQ3PreviousGoals(newGoals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure Firestore DB and current user ID are available
    if (!db || !currentUserId) {
      toast.error("Firebase database not available or user not authenticated. Please try again.");
      return;
    }

    // Basic validation
    if (!mentorId || !participantId || !reportDate || !reportingPeriod || !q1ArtisticDevelopment || !q5OverallProgressRating) {
      toast.error("אנא מלא את כל השדות החובה.");
      return;
    }

    try {
      const reportData = {
        mentor_id: mentorId,
        participant_id: participantId,
        report_date: new Date(reportDate),
        reporting_period: reportingPeriod,
        program_year: Number(programYear),

        q1_artistic_development: q1ArtisticDevelopment,
        q1_social_skills_improvement: q1SocialSkillsImprovement,
        q1_involvement_motivation_rating: q1InvolvementMotivationRating,

        q2_main_challenges: q2MainChallenges,
        q2_challenge_coping_methods: q2ChallengeCopingMethods,
        q2_professional_support_needed: q2ProfessionalSupportNeeded,

        q3_previous_goals: q3PreviousGoals.filter(goal => goal.goal_text),
        q3_next_period_goals_text: q3NextPeriodGoalsText,
        q3_means_to_achieve_new_goals: q3MeansToAchieveNewGoals,

        q4_family_response_support: q4FamilyResponseSupport,
        q4_cooperation_with_others: q4CooperationWithOthers,
        q4_recommendations_for_family: q4RecommendationsForFamily,

        q5_prominent_strengths: q5ProminentStrengths,
        q5_most_significant_event: q5MostSignificantEvent,
        q5_recommendations_for_guidance: q5RecommendationsForGuidance,
        q5_overall_progress_rating: q5OverallProgressRating,

        additional_notes: additionalNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add a new document with a generated ID in the 'reports' collection
      await setDoc(doc(db, "progress_reports", crypto.randomUUID()), reportData);
      toast.success("הדיווח נשלח בהצלחה!");

      // Reset form fields after successful submission
      setParticipantId("");
      setReportDate("");
      setReportingPeriod("");
      setProgramYear(1);
      setQ1ArtisticDevelopment("");
      setQ1SocialSkillsImprovement("");
      setQ1InvolvementMotivationRating("");
      setQ2MainChallenges("");
      setQ2ChallengeCopingMethods("");
      setQ2ProfessionalSupportNeeded("");
      setQ3PreviousGoals([{ goal_text: "", status: "" }, { goal_text: "", status: "" }, { goal_text: "", status: "" }]);
      setQ3NextPeriodGoalsText("");
      setQ3MeansToAchieveNewGoals("");
      setQ4FamilyResponseSupport("");
      setQ4CooperationWithOthers("");
      setQ4RecommendationsForFamily("");
      setQ5ProminentStrengths("");
      setQ5MostSignificantEvent("");
      setQ5RecommendationsForGuidance("");
      setQ5OverallProgressRating("");
      setAdditionalNotes("");


    } catch (err) {
      console.error("Error submitting report:", err);
      toast.error("אירעה שגיאה בשליחת הדיווח. אנא נסה שנית.");
    }
  };

  // Show loading state until authentication is ready
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
        <div className="text-xl font-semibold text-gray-700">טוען...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8 relative"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-white backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">שאלון דיווח למנטורים - עמותת תלגלות את האור</h2>
          <p className="mt-2 text-sm text-gray-700">מלא את הפרטים הבאים כדי להגיש דיווח חדש</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Mentor and Participant IDs (for example, these would be dynamic) */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">מזהה מנטור (אוטומטי)</label>
              <input
                type="text"
                value={mentorId}
                readOnly // Make it read-only as it's auto-filled
                className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                placeholder="מזהה מנטור"
              />
              <p className="text-xs text-gray-500 mt-1">
                *ביישום אמיתי, מזהה המנטור יילקח אוטומטית מהמשתמש המחובר.
              </p>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">מזהה משתתף</label>
              <input
                type="text"
                required
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                placeholder="מזהה משתתף *"
                className={inputStyle}
              />
              <p className="text-xs text-gray-500 mt-1">
                *ביישום אמיתי, מזהה המשתתף ייבחר מרשימת משתתפים.
              </p>
            </div>
          </div>

          {/* Report Date and Period */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך הדיווח</label>
            <input
              type="date"
              required
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תקופת הדיווח</label>
            <input
              type="text"
              required
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              placeholder="לדוגמא: אוגוסט 2024"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700">שנת תוכנית</label>
            <input
              type="number"
              required
              value={programYear}
              onChange={(e) => setProgramYear(e.target.value)}
              placeholder="שנת התוכנית (לדוגמא: 1)"
              className={inputStyle}
            />
          </div>

          {/* Question 1: Personal Progress and Skill Development */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">שאלה 1: התקדמות אישית ופיתוח כישורים</h3>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                א. תארו את ההתפתחות שהילד/ה הראה בתחום האמנותי העיקרי (תיאטרון/מוזיקה/מחול/אמנות/כתיבה):
              </label>
              <textarea
                required
                value={q1ArtisticDevelopment}
                onChange={(e) => setQ1ArtisticDevelopment(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ב. באילו כישורים חברתיים הילד/ה הראה שיפור? (תקשורת, עבודת צוות, ביטחון עצמי וכו')
              </label>
              <textarea
                value={q1SocialSkillsImprovement}
                onChange={(e) => setQ1SocialSkillsImprovement(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ג. דרגו את רמת המעורבות והמוטיבציה של הילד/ה בפעילויות:
              </label>
              <select
                required
                value={q1InvolvementMotivationRating}
                onChange={(e) => setQ1InvolvementMotivationRating(e.target.value)}
                className={inputStyle}
              >
                <option value="">בחר דירוג</option>
                <option value="נמוכה">נמוכה</option>
                <option value="בינונית">בינונית</option>
                <option value="גבוהה">גבוהה</option>
                <option value="מאוד גבוהה">מאוד גבוהה</option>
              </select>
            </div>
          </div>

          {/* Question 2: Challenges and Difficulties */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">שאלה 2: אתגרים וקשיים</h3>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                א. אילו אתגרים עיקריים הילד/ה מתמודד איתם? (רגשיים, חברתיים, לימודיים, משפחתיים)
              </label>
              <textarea
                value={q2MainChallenges}
                onChange={(e) => setQ2MainChallenges(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ב. כיצד התמודדתם יחד עם האתגרים הללו? פרטו על השיטות והכלים שהשתמשתם בהם:
              </label>
              <textarea
                value={q2ChallengeCopingMethods}
                onChange={(e) => setQ2ChallengeCopingMethods(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ג. האם נדרשת התערבות נוספת או תמיכה מקצועית? אם כן, מה סוג התמיכה הנדרשת?
              </label>
              <textarea
                value={q2ProfessionalSupportNeeded}
                onChange={(e) => setQ2ProfessionalSupportNeeded(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
          </div>

          {/* Question 3: Goals and Objectives */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">שאלה 3: יעדים ומטרות</h3>
            <label className="mb-1 text-sm font-medium text-gray-700">
                א. אילו יעדים הוצבו בתחילת התקופה ועד כמה הושגו?
            </label>
            {q3PreviousGoals.map((goal, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={goal.goal_text}
                  onChange={(e) => handlePreviousGoalChange(index, "goal_text", e.target.value)}
                  placeholder={`יעד ${index + 1}`}
                  className={`${inputStyle} col-span-2`}
                />
                <select
                  value={goal.status}
                  onChange={(e) => handlePreviousGoalChange(index, "status", e.target.value)}
                  className={inputStyle}
                >
                  <option value="">סטטוס</option>
                  <option value="הושג">הושג</option>
                  <option value="הושג חלקית">הושג חלקית</option>
                  <option value="לא הושג">לא הושג</option>
                </select>
              </div>
            ))}
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ב. אילו יעדים תציבו לתקופה הבאה?
              </label>
              <textarea
                value={q3NextPeriodGoalsText}
                onChange={(e) => setQ3NextPeriodGoalsText(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ג. באילו אמצעים תשתמשו להשגת היעדים החדשים?
              </label>
              <textarea
                value={q3MeansToAchieveNewGoals}
                onChange={(e) => setQ3MeansToAchieveNewGoals(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
          </div>

          {/* Question 4: Relationship with Family and Environment */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">שאלה 4: הקשר עם המשפחה והסביבה</h3>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                א. כיצד משפחת הילד/ה מגיבה ותומכת בתהליך?
              </label>
              <textarea
                value={q4FamilyResponseSupport}
                onChange={(e) => setQ4FamilyResponseSupport(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ב. האם יש שיתוף פעולה עם גורמים נוספים? (בית ספר, עובד סוציאלי, פסיכולוג וכו')
              </label>
              <textarea
                value={q4CooperationWithOthers}
                onChange={(e) => setQ4CooperationWithOthers(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ג. אילו המלצות תתנו למשפחה להמשך התמיכה בבית?
              </label>
              <textarea
                value={q4RecommendationsForFamily}
                onChange={(e) => setQ4RecommendationsForFamily(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
          </div>

          {/* Question 5: General Assessment and Recommendations */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">שאלה 5: הערכה כללית והמלצות</h3>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                א. מהן נקודות החוזק הבולטות של הילד/ה שכדאי להמשיך לפתח?
              </label>
              <textarea
                value={q5ProminentStrengths}
                onChange={(e) => setQ5ProminentStrengths(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ב. מה הדבר הכי משמעותי שקרה עם הילד/ה בתקופה האחרונה?
              </label>
              <textarea
                value={q5MostSignificantEvent}
                onChange={(e) => setQ5MostSignificantEvent(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ג. אילו המלצות יש לכם להמשך הליווי? (שינוי בגישה, פעילויות נוספות, תדירות מפגשים וכו')
              </label>
              <textarea
                value={q5RecommendationsForGuidance}
                onChange={(e) => setQ5RecommendationsForGuidance(e.target.value)}
                className={textareaStyle}
              ></textarea>
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700">
                ד. דרגו את הרושם הכללי שלכם מההתקדמות:
              </label>
              <select
                required
                value={q5OverallProgressRating}
                onChange={(e) => setQ5OverallProgressRating(e.target.value)}
                className={inputStyle}
              >
                <option value="">בחר דירוג</option>
                <option value="מתקדם מעל לציפיות">מתקדם מעל לציפיות</option>
                <option value="מתקדם כצפוי">מתקדם כצפוי</option>
                <option value="מתקדם לאט">מתקדם לאט</option>
                <option value="זקוק לתשומת לב מיוחדת">זקוק לתשומת לב מיוחדת</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">הערות נוספות:</h3>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className={textareaStyle}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md font-medium text-white text-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out shadow-md"
            >
              שלח דיווח
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MentorReportForm;
