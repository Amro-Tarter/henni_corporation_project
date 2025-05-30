import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire,
  faChartLine,
  faCalendarAlt,
  faUser,
  faUserTie,
  faStar,
  faComments,
  faCheckCircle, // For goals achieved
  faTimesCircle, // For goals not achieved
  faExclamationTriangle, // For challenges
  faLightbulb, // For recommendations
  faUsers, // For community involvement
  faMedal // For strengths
} from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Search, Filter, FileText, Calendar, Target, TrendingUp, MessageSquare } from "lucide-react";
import { toast } from 'sonner';

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
                transform: isActive ? 'translate(-50%, -50%) rotate(0deg) translateX(112px) rotate(0deg)' : 'translate(-50%, -50%) scale(1)',
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

function Reports() {
  const [reports, setReports] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchMentor, setSearchMentor] = useState("");
  const [searchParticipant, setSearchParticipant] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [displayedReports, setDisplayedReports] = useState([]);

  const elementGradients = {
    fire: 'bg-gradient-to-r from-rose-700 via-amber-550 to-yellow-500',
    water: 'bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-300',
    earth: 'bg-gradient-to-r from-lime-700 via-amber-600 to-stone-400',
    air: 'bg-gradient-to-r from-white via-sky-200 to-indigo-100',
    metal: 'bg-gradient-to-r from-zinc-300 via-slate-00 to-neutral-700',
  };

  const elementIcons = {
    fire: faFire,
    water: faWater,
    earth: faLeaf,
    air: faWind,
    metal: faHammer
  };

  const elementColors = {
    fire: 'text-red-500',
    water: 'text-blue-500',
    earth: 'text-green-500',
    air: 'text-cyan-500',
    metal: 'text-neutral-500'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First, fetch all users to build a lookup map
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersMap = {};
        
        usersSnapshot.docs.forEach(doc => {
          const userData = { id: doc.id, ...doc.data() };
          usersMap[doc.id] = userData;
        });

        // Also fetch profiles for display names
        const profilesQuery = query(collection(db, "profiles"));
        const profilesSnapshot = await getDocs(profilesQuery);
        
        profilesSnapshot.docs.forEach(doc => {
          const profileData = doc.data();
          if (profileData.associated_id && usersMap[profileData.associated_id]) {
            usersMap[profileData.associated_id].profile = profileData;
          }
        });

        setAllUsers(usersMap);

        // Fetch all reports from 'progress_reports'
        const reportsQuery = query(
          collection(db, "progress_reports"), 
          orderBy("report_date", "desc")
        );
        const reportsSnapshot = await getDocs(reportsQuery);
        
        const reportsData = reportsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setReports(reportsData);
        setDisplayedReports(reportsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("אירעה שגיאה בטעינת הדוחות");
        setLoading(false);
      }
    };

    fetchData();
  }, []); // This useEffect runs once on mount for data fetching

  useEffect(() => {
    const filterReports = async () => {
      let filtered = [...reports];

      // Filter by element - need to find mentors with specific element first
      if (elementFilter) {
        const mentorIds = Object.keys(allUsers).filter(userId => 
          allUsers[userId]?.element === elementFilter
        );
        filtered = filtered.filter(report => 
          mentorIds.includes(report.mentor_id)
        );
      }

      // Filter by mentor name
      if (searchMentor) {
        filtered = filtered.filter(report => {
          const mentor = allUsers[report.mentor_id];
          if (!mentor) return false;
          
          const mentorName = mentor.profile?.displayName || mentor.username || '';
          return mentorName.toLowerCase().includes(searchMentor.toLowerCase());
        });
      }

      // Filter by participant name
      if (searchParticipant) {
        filtered = filtered.filter(report => {
          const participant = allUsers[report.participant_id];
          if (!participant) return false;
          
          const participantName = participant.profile?.displayName || participant.username || '';
          return participantName.toLowerCase().includes(searchParticipant.toLowerCase());
        });
      }

      setDisplayedReports(filtered);
    };

    filterReports();
  }, [searchMentor, searchParticipant, elementFilter, reports, allUsers]);

  const clearFilters = () => {
    setSearchMentor("");
    setSearchParticipant("");
    setElementFilter("");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'לא מוגדר';
    
    try {
      let date;
      // Check if it's a Firestore Timestamp object
      if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        // Attempt to parse if it's a string (e.g., from date input)
        date = new Date(timestamp);
      }
      return date.toLocaleDateString('he-IL');
    } catch (err) {
      console.error("Error formatting date:", timestamp, err);
      return 'תאריך לא תקין';
    }
  };

  const getUserDisplayName = (userId) => {
    const user = allUsers[userId];
    if (!user) return 'משתמש לא נמצא';
    return user.profile?.displayName || user.username || 'לא מוגדר';
  };

  const getMentorElement = (mentorId) => {
    const mentor = allUsers[mentorId];
    return mentor?.element || 'לא מוגדר';
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
      
        
        {/* Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="text-3xl text-indigo-600" />
            <h2 className="text-3xl font-extrabold text-gray-900">דוחות מערכת CRM</h2>
          </div>
          <p className="mt-2 text-sm text-gray-700">ניהול וצפייה בדוחות משתמשים ומנטורים</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">חיפוש מנטור</label>
            <div className="relative">
              <input
                type="text"
                value={searchMentor}
                onChange={(e) => setSearchMentor(e.target.value)}
                placeholder="שם מנטור..."
                className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faUserTie} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">חיפוש משתתף</label>
            <div className="relative">
              <input
                type="text"
                value={searchParticipant}
                onChange={(e) => setSearchParticipant(e.target.value)}
                placeholder="שם משתתף..."
                className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">אלמנט מנטור</label>
            <div className="relative">
              <select
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
                className={`appearance-none rounded-md w-full px-3 py-3 pr-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right ${elementGradients[elementFilter] || "bg-white"}`}
              >
                <option value="">כל האלמנטים</option>
                <option value="fire">אש</option>
                <option value="water">מים</option>
                <option value="earth">אדמה</option>
                <option value="air">אוויר</option>
                <option value="metal">מתכת</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={clearFilters}
              className="py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              נקה סינון
            </button>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md text-center">
              <span className="font-medium">{displayedReports.length}</span> דוחות
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <CleanElementalOrbitLoader />
        ) : displayedReports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedReports.map((report) => {
              const mentorElement = getMentorElement(report.mentor_id);
              return (
                <div key={report.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  {/* Header with element gradient */}
                  <div className={`h-3 ${elementGradients[mentorElement] || "bg-gray-300"}`}></div>
                  
                  <div className="p-6">
                    {/* Report Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900">דוח תקופתי</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon 
                          icon={elementIcons[mentorElement] || faLeaf} 
                          className={`${elementColors[mentorElement] || "text-gray-400"}`} 
                        />
                      </div>
                    </div>

                    {/* Users Info */}
                    <div className="grid grid-cols-1 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserTie} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">מנטור:</span>
                        <span className="text-sm text-gray-900 font-semibold">{getUserDisplayName(report.mentor_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-700">משתתף:</span>
                        <span className="text-sm text-gray-900 font-semibold">{getUserDisplayName(report.participant_id)}</span>
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">תאריך דוח:</span>
                        <span className="text-sm text-gray-900">{formatDate(report.report_date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">תקופת דיווח:</span>
                        <span className="text-sm text-gray-900">{report.reporting_period || 'לא מוגדר'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">שנת תוכנית:</span>
                        <span className="text-sm text-gray-900">{report.program_year || 'לא מוגדר'}</span>
                      </div>
                    </div>

                    {/* Question 1: Personal Progress and Skill Development */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} />
                        התקדמות אישית ופיתוח כישורים
                      </h4>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">אמנותי:</span> {report.q1_artistic_development || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">חברתי:</span> {report.q1_social_skills_improvement || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">מעורבות ומוטיבציה:</span> {report.q1_involvement_motivation_rating || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 2: Challenges and Difficulties */}
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-1">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        אתגרים וקשיים
                      </h4>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">אתגרים עיקריים:</span> {report.q2_main_challenges || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">התמודדות:</span> {report.q2_challenge_coping_methods || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">תמיכה נדרשת:</span> {report.q2_professional_support_needed || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 3: Goals and Objectives */}
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-1">
                        <Target size={14} />
                        יעדים ומטרות
                      </h4>
                      <p className="text-xs font-medium text-gray-700 mb-1">יעדים קודמים:</p>
                      {report.q3_previous_goals && report.q3_previous_goals.length > 0 ? (
                        <ul className="list-inside text-xs text-gray-700 mb-2">
                          {report.q3_previous_goals.map((goal, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              {goal.status === "הושג" ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />}
                              {goal.goal_text} ({goal.status})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-700 mb-2">אין יעדים קודמים</p>
                      )}
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">יעדים לתקופה הבאה:</span> {report.q3_next_period_goals_text || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">אמצעים:</span> {report.q3_means_to_achieve_new_goals || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 4: Relationship with Family and Environment */}
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} />
                        קשר עם המשפחה והסביבה
                      </h4>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">תגובת משפחה:</span> {report.q4_family_response_support || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">שיתוף פעולה:</span> {report.q4_cooperation_with_others || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">המלצות למשפחה:</span> {report.q4_recommendations_for_family || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 5: General Assessment and Recommendations */}
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-1">
                        <FontAwesomeIcon icon={faLightbulb} />
                        הערכה כללית והמלצות
                      </h4>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">נקודות חוזק:</span> {report.q5_prominent_strengths || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">אירוע משמעותי:</span> {report.q5_most_significant_event || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">המלצות לליווי:</span> {report.q5_recommendations_for_guidance || 'לא מוגדר'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">דירוג התקדמות:</span> {report.q5_overall_progress_rating || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Additional Notes */}
                    {report.additional_notes && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                          <MessageSquare size={14} />
                          הערות נוספות
                        </h4>
                        <p className="text-xs text-gray-700">{report.additional_notes}</p>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-medium text-gray-700">לא נמצאו דוחות</h3>
            <p className="text-gray-500">ודא שאתה מחובר כמשתמש אדמין או נסה לשנות את פרמטרי החיפוש שלך</p>
          </div>
        )}
    </div>
    </DashboardLayout>
  );
}

export default Reports;
