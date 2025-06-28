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
  faMedal, // For strengths
  faTrash, // Added for delete functionality
} from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, deleteDoc, doc } from "firebase/firestore"; // Added deleteDoc and doc
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Search, Filter, FileText, Calendar, Target, TrendingUp, MessageSquare } from "lucide-react";
import { toast } from 'sonner';
import ElementalLoader from '../../theme/ElementalLoader'
import AirIcon from '@mui/icons-material/Air';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

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
    fire: <WhatshotRoundedIcon style={{color: '#fca5a1'}} />,
    water: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} />,
    earth: <LocalFloristIcon style={{color: '#4ade80'}} />,
    air: <AirIcon style={{color: '#87ceeb'}} />,
    metal: <ConstructionTwoToneIcon style={{color: '#4b5563'}} />
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

        usersSnapshot.docs.forEach(doci => {
          const userData = { id: doci.id, ...doci.data() };
          usersMap[doci.id] = userData;
        });

        // Also fetch profiles for display names
        const profilesQuery = query(collection(db, "profiles"));
        const profilesSnapshot = await getDocs(profilesQuery);

        profilesSnapshot.docs.forEach(doci => {
          const profileData = doci.data();
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

        const reportsData = reportsSnapshot.docs.map(doci => ({
          id: doci.id,
          ...doci.data()
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

  // Function to handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק דוח זה?")) {
      try {
        await deleteDoc(doc(db, "progress_reports", reportId));
        setReports(reports.filter(report => report.id !== reportId));
        toast.success("הדוח נמחק בהצלחה!");
      } catch (error) {
        console.error("Error deleting report:", error);
        toast.error("אירעה שגיאה במחיקת הדוח");
      }
    }
  };


  if (loading) return <ElementalLoader />;

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">


        {/* Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="text-3xl text-indigo-600" />
            <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent leading-[1.5]  px-4">דוחות</h1>
          </div>
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
                <div key={report.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200"> {/* Increased shadow */}
                  {/* Header with element gradient */}
                  <div className={`h-4 ${elementGradients[mentorElement] || "bg-gray-300"}`}></div> {/* Slightly taller header */}

                  <div className="p-7"> {/* Increased padding */}
                    {/* Report Header */}
                    <div className="flex items-center justify-between mb-5"> {/* Increased margin bottom */}
                      <div className="flex items-center gap-3"> {/* Increased gap */}
                        <FileText size={22} className="text-indigo-600" /> {/* Slightly larger icon */}
                        <h3 className="text-xl font-bold text-gray-900">דוח תקופתי</h3> {/* Larger heading */}
                      </div>
                      <div className="flex items-center gap-2"> {/* Increased gap */}
                        <FontAwesomeIcon
                          icon={elementIcons[mentorElement] || faLeaf}
                          className={`${elementColors[mentorElement] || "text-gray-400"} text-xl`} /* Larger element icon */
                        />
                        {/* Delete Icon */}
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                          aria-label={`מחק דוח עבור ${getUserDisplayName(report.participant_id)}`}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-lg" /> {/* Delete icon */}
                        </button>
                      </div>
                    </div>

                    {/* Users Info */}
                    <div className="grid grid-cols-1 gap-4 mb-5 p-4 bg-gray-50 rounded-lg"> {/* Increased gap and padding */}
                      <div className="flex items-center gap-3"> {/* Increased gap */}
                        <FontAwesomeIcon icon={faUserTie} className="text-blue-600 text-lg" /> {/* Larger icon */}
                        <span className="text-base font-medium text-gray-700">מנטור:</span> {/* Larger text */}
                        <span className="text-base text-gray-900 font-semibold">{getUserDisplayName(report.mentor_id)}</span> {/* Larger text */}
                      </div>
                      <div className="flex items-center gap-3"> {/* Increased gap */}
                        <FontAwesomeIcon icon={faUser} className="text-green-600 text-lg" /> {/* Larger icon */}
                        <span className="text-base font-medium text-gray-700">משתתף:</span> {/* Larger text */}
                        <span className="text-base text-gray-900 font-semibold">{getUserDisplayName(report.participant_id)}</span> {/* Larger text */}
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="space-y-4"> {/* Increased space between items */}
                      <div className="flex items-center gap-3"> {/* Increased gap */}
                        <Calendar size={18} className="text-gray-500" /> {/* Slightly larger icon */}
                        <span className="text-base font-medium text-gray-700">תאריך דוח:</span> {/* Larger text */}
                        <span className="text-base text-gray-900">{formatDate(report.report_date)}</span> {/* Larger text */}
                      </div>

                      <div className="flex items-center gap-3"> {/* Increased gap */}
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 text-lg" /> {/* Slightly larger icon */}
                        <span className="text-base font-medium text-gray-700">תקופת דיווח:</span> {/* Larger text */}
                        <span className="text-base text-gray-900">{report.reporting_period || 'לא מוגדר'}</span> {/* Larger text */}
                      </div>

                      <div className="flex items-center gap-3"> {/* Increased gap */}
                        <TrendingUp size={18} className="text-gray-500" /> {/* Slightly larger icon */}
                        <span className="text-base font-medium text-gray-700">שנת תוכנית:</span> {/* Larger text */}
                        <span className="text-base text-gray-900">{report.program_year || 'לא מוגדר'}</span> {/* Larger text */}
                      </div>
                    </div>

                    {/* Question 1: Personal Progress and Skill Development */}
                    <div className="mt-5 p-4 bg-blue-50 rounded-lg"> {/* Increased margin-top and padding */}
                      <h4 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2"> {/* Larger heading, increased gap */}
                        <FontAwesomeIcon icon={faStar} className="text-blue-700" /> {/* Added color to icon */}
                        התקדמות אישית ופיתוח כישורים
                      </h4>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">אמנותי:</span> {report.q1_artistic_development || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">חברתי:</span> {report.q1_social_skills_improvement || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700"> {/* Larger text */}
                        <span className="font-medium">מעורבות ומוטיבציה:</span> {report.q1_involvement_motivation_rating || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 2: Challenges and Difficulties */}
                    <div className="mt-5 p-4 bg-red-50 rounded-lg"> {/* Increased margin-top and padding */}
                      <h4 className="text-base font-semibold text-red-900 mb-3 flex items-center gap-2"> {/* Larger heading, increased gap */}
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-700" /> {/* Added color to icon */}
                        אתגרים וקשיים
                      </h4>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">אתגרים עיקריים:</span> {report.q2_main_challenges || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">התמודדות:</span> {report.q2_challenge_coping_methods || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700"> {/* Larger text */}
                        <span className="font-medium">תמיכה נדרשת:</span> {report.q2_professional_support_needed || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 3: Goals and Objectives */}
                    <div className="mt-5 p-4 bg-purple-50 rounded-lg"> {/* Increased margin-top and padding */}
                      <h4 className="text-base font-semibold text-purple-900 mb-3 flex items-center gap-2"> {/* Larger heading, increased gap */}
                        <Target size={16} className="text-purple-700" /> {/* Larger icon, added color */}
                        יעדים ומטרות
                      </h4>
                      <p className="text-sm font-medium text-gray-700 mb-2">יעדים קודמים:</p> 
                      {report.q3_previous_goals && report.q3_previous_goals.length > 0 ? (
                        <ul className="list-inside text-sm text-gray-700 mb-3 space-y-1"> {/* Larger text, increased margin-bottom, added space-y */}
                          {report.q3_previous_goals.map((goal, idx) => (
                            <li key={idx} className="flex items-center gap-2"> {/* Increased gap */}
                              {goal.status === "הושג" ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-base" /> : <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-base" />} {/* Larger icons */}
                              {goal.goal_text} ({goal.status})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-700 mb-3">אין יעדים קודמים</p>                      )}
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">יעדים לתקופה הבאה:</span> {report.q3_next_period_goals_text || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700"> {/* Larger text */}
                        <span className="font-medium">אמצעים:</span> {report.q3_means_to_achieve_new_goals || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 4: Relationship with Family and Environment */}
                    <div className="mt-5 p-4 bg-yellow-50 rounded-lg"> {/* Increased margin-top and padding */}
                      <h4 className="text-base font-semibold text-yellow-900 mb-3 flex items-center gap-2"> {/* Larger heading, increased gap */}
                        <FontAwesomeIcon icon={faUsers} className="text-yellow-700" /> {/* Added color to icon */}
                        קשר עם המשפחה והסביבה
                      </h4>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">תגובת משפחה:</span> {report.q4_family_response_support || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">שיתוף פעולה:</span> {report.q4_cooperation_with_others || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700"> {/* Larger text */}
                        <span className="font-medium">המלצות למשפחה:</span> {report.q4_recommendations_for_family || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Question 5: General Assessment and Recommendations */}
                    <div className="mt-5 p-4 bg-green-50 rounded-lg"> {/* Increased margin-top and padding */}
                      <h4 className="text-base font-semibold text-green-900 mb-3 flex items-center gap-2"> {/* Larger heading, increased gap */}
                        <FontAwesomeIcon icon={faLightbulb} className="text-green-700" /> {/* Added color to icon */}
                        הערכה כללית והמלצות
                      </h4>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">נקודות חוזק:</span> {report.q5_prominent_strengths || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">אירוע משמעותי:</span> {report.q5_most_significant_event || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700 mb-2"> {/* Larger text */}
                        <span className="font-medium">המלצות לליווי:</span> {report.q5_recommendations_for_guidance || 'לא מוגדר'}
                      </p>
                      <p className="text-sm text-gray-700"> {/* Larger text */}
                        <span className="font-medium">דירוג התקדמות:</span> {report.q5_overall_progress_rating || 'לא מוגדר'}
                      </p>
                    </div>

                    {/* Additional Notes */}
                    {report.additional_notes && (
                      <div className="mt-5 p-4 bg-gray-100 rounded-lg"> {/* Increased margin-top and padding */}
                        <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2"> {/* Larger heading, increased gap */}
                          <MessageSquare size={16} className="text-gray-600" /> {/* Larger icon, added color */}
                          הערות נוספות
                        </h4>
                        <p className="text-sm text-gray-700">{report.additional_notes}</p> {/* Larger text */}
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