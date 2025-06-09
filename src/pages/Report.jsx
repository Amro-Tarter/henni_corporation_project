import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import CleanElementalOrbitLoader from "../theme/ElementalLoader";
import { ThemeProvider } from '../theme/ThemeProvider';
import Navbar from '../components/social/Navbar';
import RightSidebar from '../components/social/Rightsidebar';
import { Bell, User, LogOut, Home as HomeIcon, MessageSquare, Settings } from 'lucide-react';

function MentorReportForm() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  // State for user ID and authentication readiness
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  // Add mentor element state
  const [mentorElement, setMentorElement] = useState('fire');

  // Form states
  const [mentorId, setMentorId] = useState(""); // This will be set from currentUserId
  const [participantName, setParticipantName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [programYear, setProgramYear] = useState(1);

  // New state for participants list
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [participantsError, setParticipantsError] = useState(null);

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
  const inputStyle = "appearance-none rounded-md w-full min-w-0 max-w-full px-2 py-2 sm:px-3 sm:py-3 pr-8 sm:pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a83232] focus:border-[#a83232] text-xs sm:text-sm text-right text-ellipsis overflow-hidden";
  const textareaStyle = "appearance-none rounded-md w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a83232] focus:border-[#a83232] sm:text-sm text-right h-24";

  // Authentication Listener
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUserId(user.uid);
          setMentorId(user.uid); // Automatically set mentorId to current user's UID
          // Fetch mentor's element from users collection
          try {
            const userSnap = await getDocs(
              query(collection(db, 'users'), where('associated_id', '==', user.uid))
            );
            if (!userSnap.empty) {
              const ud = userSnap.docs[0].data();
              setMentorElement(ud.element || 'fire');
            } else {
              setMentorElement('fire');
            }
          } catch (err) {
            setMentorElement('fire');
          }
        } else {
          console.warn("No user authenticated. MentorReportForm requires authentication.");
          // Optionally, redirect to login
          // navigate("/login");
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    } else {
      console.error("Firebase Auth instance not available. Check ../config/firbaseConfig.js");
      toast.error("Firebase authentication not configured correctly.");
      setIsAuthReady(true);
    }
  }, []);

  // Fetch Participants
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      setParticipantsError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const participantsList = [];
        for (const userDoc of querySnapshot.docs) {
          const data = userDoc.data();
          if (data.role === "participant" || data.role === "מנטור") {
            let displayName = data.displayName || data.name || data.username || userDoc.id;
            // Try to get displayName from profiles collection
            try {
              const profileSnap = await getDocs(query(collection(db, 'profiles'), where('associated_id', '==', userDoc.id)));
              if (!profileSnap.empty) {
                const profileData = profileSnap.docs[0].data();
                displayName = profileData.displayName || profileData.username || displayName;
              }
            } catch (e) { /* ignore profile errors */ }
            participantsList.push({
              id: userDoc.id,
              name: displayName,
            });
          }
        }
        setParticipants(participantsList);
      } catch (err) {
        console.error("Error fetching participants:", err);
        setParticipantsError("אירעה שגיאה בטעינת רשימת המשתתפים.");
        toast.error("אירעה שגיאה בטעינת רשימת המשתתפים.");
      } finally {
        setLoadingParticipants(false);
      }
    };

    if (db && isAuthReady) {
      fetchParticipants();
    }
  }, [db, isAuthReady]);

  // Handler for previous goals array
  const handlePreviousGoalChange = (index, field, value) => {
    const newGoals = [...q3PreviousGoals];
    newGoals[index][field] = value;
    setQ3PreviousGoals(newGoals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!db || !currentUserId) {
      toast.error("Firebase database not available or user not authenticated. Please try again.");
      return;
    }

    if (!mentorId || !participantName || !reportDate || !reportingPeriod || !q1ArtisticDevelopment || !q5OverallProgressRating) {
      toast.error("אנא מלא את כל שדות החובה.");
      return;
    }

    try {
      const reportData = {
        mentor_id: mentorId,
        participant_name: participantName,
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

      await setDoc(doc(db, "progress_reports", crypto.randomUUID()), reportData);
      toast.success("הדיווח נשלח בהצלחה!");

      // Reset form fields
      setParticipantName("");
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

  // Show loading state until authentication and participants are ready
  if (!isAuthReady || loadingParticipants) {
    return (
      <ThemeProvider element={mentorElement}>
        <div className="min-h-screen flex flex-col bg-red-50">
          <Navbar element={mentorElement} />
          <div className="flex-1 flex items-center justify-center">
            <CleanElementalOrbitLoader />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider element="red">
      <div className="min-h-screen flex flex-col bg-[#fff5f5]">
        <Navbar element="red" />
        <div className="h-4 sm:h-6" />
        <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center w-full max-w-full">
          {/* Main Content */}
          <div className={`flex-1 flex items-center justify-center py-8 px-2 sm:px-4 transition-all duration-300 ${isSidebarExpanded ? 'lg:mr-64' : 'lg:mr-16'}`}>
            <div className="w-full max-w-4xl bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-4 sm:p-8 z-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#a83232]">שאלון דיווח למנטורים - עמותת תלגלות את האור</h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-700">מלא את הפרטים הבאים כדי להגיש דיווח חדש</p>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                {/* Participant Select Field */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">בחר משתתף</label>
                    <select
                      required
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className={inputStyle}
                      disabled={loadingParticipants || participantsError}
                    >
                      <option value="">{loadingParticipants ? "טוען משתתפים..." : participantsError ? "שגיאה בטעינה" : "בחר משתתף *"}</option>
                      {participants.map((participant) => (
                        <option key={participant.id} value={participant.name}>
                          {participant.name}
                        </option>
                      ))}
                    </select>
                    {participantsError && <p className="text-red-500 text-xs mt-1">{participantsError}</p>}
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

                {/* Program Year */}
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

                {/* Question 1 */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#a83232] mb-4">שאלה 1: התקדמות אישית ופיתוח כישורים</h3>
                  <div className="bg-[#fff5f5] rounded-lg p-4 space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        א. תארו את ההתפתחות שהילד/ה הראה בתחום האמנותי העיקרי:
                      </label>
                      <textarea
                        required
                        value={q1ArtisticDevelopment}
                        onChange={(e) => setQ1ArtisticDevelopment(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ב. באילו כישורים חברתיים הילד/ה הראה שיפור?
                      </label>
                      <textarea
                        value={q1SocialSkillsImprovement}
                        onChange={(e) => setQ1SocialSkillsImprovement(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ג. דרגו את רמת המעורבות והמוטיבציה:
                      </label>
                      <select
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
                </div>

                {/* Question 2 */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#a83232] mb-4">שאלה 2: אתגרים וקשיים</h3>
                  <div className="bg-[#fff5f5] rounded-lg p-4 space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        א. אתגרים עיקריים:
                      </label>
                      <textarea
                        value={q2MainChallenges}
                        onChange={(e) => setQ2MainChallenges(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ב. התמודדות עם האתגרים:
                      </label>
                      <textarea
                        value={q2ChallengeCopingMethods}
                        onChange={(e) => setQ2ChallengeCopingMethods(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ג. תמיכה נדרשת:
                      </label>
                      <textarea
                        value={q2ProfessionalSupportNeeded}
                        onChange={(e) => setQ2ProfessionalSupportNeeded(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#a83232] mb-4">שאלה 3: יעדים ומטרות</h3>
                  <div className="bg-[#fff5f5] rounded-lg p-4 space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-2 text-sm font-medium text-gray-700">
                        א. יעדים קודמים והשגתם:
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
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ב. יעדים לתקופה הבאה:
                      </label>
                      <textarea
                        value={q3NextPeriodGoalsText}
                        onChange={(e) => setQ3NextPeriodGoalsText(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ג. אמצעים להשגת היעדים:
                      </label>
                      <textarea
                        value={q3MeansToAchieveNewGoals}
                        onChange={(e) => setQ3MeansToAchieveNewGoals(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Question 4 */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#a83232] mb-4">שאלה 4: הקשר עם המשפחה והסביבה</h3>
                  <div className="bg-[#fff5f5] rounded-lg p-4 space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        א. תגובת המשפחה:
                      </label>
                      <textarea
                        value={q4FamilyResponseSupport}
                        onChange={(e) => setQ4FamilyResponseSupport(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ב. שיתוף פעולה עם גורמים נוספים:
                      </label>
                      <textarea
                        value={q4CooperationWithOthers}
                        onChange={(e) => setQ4CooperationWithOthers(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ג. המלצות למשפחה:
                      </label>
                      <textarea
                        value={q4RecommendationsForFamily}
                        onChange={(e) => setQ4RecommendationsForFamily(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Question 5 */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#a83232] mb-4">שאלה 5: הערכה כללית והמלצות</h3>
                  <div className="bg-[#fff5f5] rounded-lg p-4 space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        א. נקודות חוזק:
                      </label>
                      <textarea
                        value={q5ProminentStrengths}
                        onChange={(e) => setQ5ProminentStrengths(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ב. אירוע משמעותי:
                      </label>
                      <textarea
                        value={q5MostSignificantEvent}
                        onChange={(e) => setQ5MostSignificantEvent(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ג. המלצות להמשך:
                      </label>
                      <textarea
                        value={q5RecommendationsForGuidance}
                        onChange={(e) => setQ5RecommendationsForGuidance(e.target.value)}
                        className={textareaStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        ד. דירוג התקדמות כללי:
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
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#a83232] mb-4">הערות נוספות</h3>
                  <div className="bg-[#fff5f5] rounded-lg p-4">
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className={textareaStyle}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-1 md:col-span-2 mt-6">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-md font-medium text-white text-lg bg-[#a83232] hover:bg-[#922b21] focus:ring-2 focus:ring-[#a83232] focus:ring-offset-2 transition duration-300 ease-in-out shadow-md"
                  >
                    שלח דיווח
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Right Sidebar: desktop only, fixed, no extra space below */}
          <div className="hidden lg:flex flex-col">
            <div className={`fixed right-0 top-6 h-[calc(100vh-1.5rem)] shadow-2xl transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-16'} lg:shadow-lg bg-white`}>
              <RightSidebar element="red" onExpandChange={setIsSidebarExpanded} />
            </div>
          </div>
        </div>
        {/* Mobile Bottom Bar: match Home.jsx */}
        <nav className="fixed bottom-0 right-0 left-0 z-30 bg-white border-t border-gray-200 flex justify-around items-center py-2 lg:hidden shadow-lg">
          <button className="relative flex flex-col items-center text-xs text-[#a83232]">
            <span><HomeIcon size={20} /></span>
            <span>דף הבית</span>
          </button>
          <button className="relative flex flex-col items-center text-xs text-gray-500 hover:text-[#a83232]">
            <span><MessageSquare size={20} /></span>
            <span>הודעות</span>
          </button>
          <button className="relative flex flex-col items-center text-xs text-gray-500 hover:text-[#a83232]">
            <span><Settings size={20} /></span>
            <span>הגדרות</span>
          </button>
          <button className="relative flex flex-col items-center text-xs text-gray-500 hover:text-[#a83232]">
            <span><Bell size={20} /></span>
            <span>התראות</span>
          </button>
          <button className="flex flex-col items-center text-xs text-gray-500 hover:text-[#a83232]">
            <User size={20} />
            <span>פרופיל</span>
          </button>
        </nav>
      </div>
    </ThemeProvider>
  );
}

export default MentorReportForm;