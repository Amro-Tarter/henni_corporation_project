import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig'; // Corrected import syntax
import { toast } from 'sonner';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faChartLine, faClipboardList, faHandHoldingUsd, faFire, faUserTie, faStar, faClock, faHandshake, 
  faChartPie, faThumbsUp, faCommentDots, faDollarSign, faPercent , faHandPointUp, faChartSimple, faListUl
} from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom';

// Custom Loader Component
const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100' },
  { key: 'air', emoji: '💨', color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100' },
  { key: 'fire', emoji: '🔥', color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100' },
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
      // Added 'fixed inset-0 z-50' to make it a full-screen overlay
      className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
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

const DashboardHome = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [dailyActivityData, setDailyActivityData] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [mostFollowedUsers, setMostFollowedUsers] = useState([]);
  const [mostActiveMentors, setMostActiveMentors] = useState([]);
  
  const [totalDonationsAmount, setTotalDonationsAmount] = useState(0);
  const [averageDonationAmount, setAverageDonationAmount] = useState(0);
  const [recurringDonationsCount, setRecurringDonationsCount] = useState(0);

  const [totalPartners, setTotalPartners] = useState(0);
  const [activePartnersCount, setActivePartnersCount] = useState(0);
  const [allPartnersList, setAllPartnersList] = useState([]); // New state for all partners

  const [userRoleDistribution, setUserRoleDistribution] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [donationsByCurrency, setDonationsByCurrency] = useState([]);
  const [donationsByPaymentMethod, setDonationsByPaymentMethod] = useState([]);
  const [donationsByPurpose, setDonationsByPurpose] = useState([]);
  const [partnershipStatusDistribution, setPartnershipStatusDistribution] = useState([]);
  const [averageInvolvementRating, setAverageInvolvementRating] = useState(0);
  const [averageOverallProgressRating, setAverageOverallProgressRating] = useState(0);
  const [totalReports, setTotalReports] = useState(0); // New state for total reports

  // State to store all users data for lookup
  const [allUsersData, setAllUsersData] = useState([]);

  const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // --- Fetch All Data ---
        const usersSnapshot = await getDocs(query(collection(db, "users")));
        const fetchedUsersData = usersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(), 
          createdAt: doc.data().createdAt?.toDate() 
        }));
        setAllUsersData(fetchedUsersData); // Store fetched users data in state

        const profilesSnapshot = await getDocs(query(collection(db, "profiles")));
        const profilesMap = {};
        profilesSnapshot.docs.forEach(doc => {
          const profile = doc.data();
          profilesMap[profile.associated_id] = {
            displayName: profile.displayName || profile.username,
            followersCount: Array.isArray(profile.followers) ? profile.followers.length : 0 
          };
        });

        const postsSnapshot = await getDocs(query(collection(db, "posts")));
        const postsData = postsSnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data(), 
          createdAt: doc.data().createdAt?.toDate() 
        }));

        const reportsSnapshot = await getDocs(query(collection(db, "progress_reports")));
        const reportsData = reportsSnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data(), 
          createdAt: doc.data().createdAt?.toDate() 
        }));
        setTotalReports(reportsData.length); // Set total reports count

        const donationsSnapshot = await getDocs(query(collection(db, "donations")));
        const donationsData = donationsSnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data(), 
          createdAt: doc.data().createdAt?.toDate() 
        }));
        
        const partnersSnapshot = await getDocs(query(collection(db, "partners")));
        const partnersData = partnersSnapshot.docs.map(doc => ({ ...doc.data() }));
        setAllPartnersList(partnersData); // Store all partners data in state

        // --- Process Data for Graphs and Lists ---

        // 1. User Growth (Monthly/Daily)
        const userGrowthMap = new Map();
        fetchedUsersData.forEach(user => { // Use fetchedUsersData here
          if (user.createdAt instanceof Date) { 
            const dateKey = user.createdAt.toISOString().split('T')[0]; 
            userGrowthMap.set(dateKey, (userGrowthMap.get(dateKey) || 0) + 1);
          }
        });
        const sortedUserGrowth = Array.from(userGrowthMap.entries())
          .sort((a, b) => new Date(a[0]) - new Date(b[0])) 
          .map(([date, count]) => ({ date, "New Users": count }));
        let accumulatedUsers = 0;
        const finalUserGrowthData = sortedUserGrowth.map(item => {
          accumulatedUsers += item["New Users"];
          return { ...item, "Total Users": accumulatedUsers };
        });
        setUserGrowthData(finalUserGrowthData);


        // 2. Daily Activity (New Users + New Posts + New Reports + New Donations)
        const dailyActivityMap = new Map();
        const aggregateActivity = (data) => {
          data.forEach(item => {
            if (item.createdAt instanceof Date) {
              const dateKey = item.createdAt.toISOString().split('T')[0];
              const currentActivity = dailyActivityMap.get(dateKey) || { date: dateKey, total: 0 };
              currentActivity.total += 1;
              dailyActivityMap.set(dateKey, currentActivity);
            }
          });
        };
        aggregateActivity(fetchedUsersData); // Use fetchedUsersData here
        aggregateActivity(postsData);
        aggregateActivity(reportsData);
        aggregateActivity(donationsData);
        const sortedDailyActivity = Array.from(dailyActivityMap.values())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setDailyActivityData(sortedDailyActivity);


        // 3. Total Post Counts
        setTotalPosts(postsData.length);

        // 4. Most Followed Users
        const followedUsersList = Object.keys(profilesMap)
          .filter(userId => profilesMap[userId].followersCount > 0)
          .map(userId => ({
            id: userId,
            displayName: profilesMap[userId].displayName,
            followers: profilesMap[userId].followersCount,
            username: fetchedUsersData.find(u => u.id === userId)?.username || profilesMap[userId].displayName 
          }))
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 6);
        setMostFollowedUsers(followedUsersList);

        // 5. Most Active Mentors (based on reports submitted)
        const mentorActivityMap = new Map();
        reportsData.forEach(report => {
          if (report.mentor_id) {
            mentorActivityMap.set(report.mentor_id, (mentorActivityMap.get(report.mentor_id) || 0) + 1);
          }
        });
        const activeMentorsList = Array.from(mentorActivityMap.entries())
          .map(([mentorId, count]) => ({
            id: mentorId,
            displayName: profilesMap[mentorId]?.displayName || fetchedUsersData.find(u => u.id === mentorId)?.username || 'מנטור לא ידוע',
            reportsCount: count,
            username: fetchedUsersData.find(u => u.id === mentorId)?.username || profilesMap[mentorId]?.displayName || 'מנטור לא ידוע' // Add username for navigation
          }))
          .sort((a, b) => b.reportsCount - a.reportsCount)
          .slice(0, 5);
        setMostActiveMentors(activeMentorsList);

        // 6. Donations Analytics
        let totalAmount = 0;
        let recurringCount = 0;
        const currencyMap = new Map();
        const paymentMethodMap = new Map();
        const purposeMap = new Map();

        donationsData.forEach(donation => {
          if (typeof donation.amount === 'number') {
            totalAmount += donation.amount;
            currencyMap.set(donation.currency, (currencyMap.get(donation.currency) || 0) + donation.amount);
          }
          if (donation.is_recurring) {
            recurringCount++;
          }
          if (donation.payment_method) {
            paymentMethodMap.set(donation.payment_method, (paymentMethodMap.get(donation.payment_method) || 0) + 1);
          }
          if (donation.designated_purpose) {
            purposeMap.set(donation.designated_purpose, (purposeMap.get(donation.designated_purpose) || 0) + 1);
          }
        });
        setTotalDonationsAmount(totalAmount);
        setAverageDonationAmount(donationsData.length > 0 ? totalAmount / donationsData.length : 0);
        setRecurringDonationsCount(recurringCount);
        setDonationsByCurrency(Array.from(currencyMap.entries()).map(([name, value]) => ({ name, value })));
        setDonationsByPaymentMethod(Array.from(paymentMethodMap.entries()).map(([name, value]) => ({ name, value })));
        setDonationsByPurpose(Array.from(purposeMap.entries()).map(([name, value]) => ({ name, value })));


        // 7. Partners Analytics
        setTotalPartners(partnersData.length);
        const activePartners = partnersData.filter(partner => partner.status === 'active').length;
        setActivePartnersCount(activePartners);
        const partnershipStatusMap = new Map();
        partnersData.forEach(partner => {
          partnershipStatusMap.set(partner.status, (partnershipStatusMap.get(partner.status) || 0) + 1);
        });
        setPartnershipStatusDistribution(Array.from(partnershipStatusMap.entries()).map(([name, value]) => ({ name, value })));

        // 8. User Role Distribution
        const userRoleMap = new Map();
        fetchedUsersData.forEach(user => { // Use fetchedUsersData here
          if (user.role) {
            userRoleMap.set(user.role, (userRoleMap.get(user.role) || 0) + 1);
          }
        });
        setUserRoleDistribution(Array.from(userRoleMap.entries()).map(([name, value]) => ({ name, value })));

        // 9. Top Posts by Engagement
        const topPostsList = postsData
          .map(post => {
            const authorUser = fetchedUsersData.find(u => u.id === post.authorId);
            const authorDisplayName = authorUser?.displayName || authorUser?.username || 'משתמש לא ידוע';

            return {
              id: post.id,
              // Use content for title, truncate if too long
              title: post.content ? post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '') : 'ללא כותרת',
              engagement: (post.likesCount || 0) + (post.commentsCount || 0),
              likes: post.likesCount || 0,
              comments: post.commentsCount || 0,
              authorId: post.authorId,
              authorDisplayName: authorDisplayName // Add author's display name
            };
          })
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 5); // Top 5
        setTopPosts(topPostsList);

        // 10. Average Report Rating/Involvement
        let totalInvolvementRating = 0;
        let totalOverallProgressRating = 0;
        let involvementCount = 0;
        let overallProgressCount = 0;

        const ratingMap = {
          "נמוכה": 1,
          "בינונית": 2,
          "גבוהה": 3,
          "מאוד גבוהה": 4,
          "נמוך": 1, 
          "בינוני": 2,
          "גבוה": 3,
          "מאוד גבוה": 4,
          "חלש": 1, 
          "סביר": 2,
          "טוב": 3,
          "מצוין": 4,
        };

        reportsData.forEach(report => {
          const involvement = ratingMap[report.q1_involvement_motivation_rating];
          if (typeof involvement === 'number') {
            totalInvolvementRating += involvement;
            involvementCount++;
          }
          const overallProgress = ratingMap[report.q5_overall_progress_rating];
          if (typeof overallProgress === 'number') {
            totalOverallProgressRating += overallProgress;
            overallProgressCount++;
          }
        });

        setAverageInvolvementRating(involvementCount > 0 ? (totalInvolvementRating / involvementCount).toFixed(1) : 0);
        setAverageOverallProgressRating(overallProgressCount > 0 ? (totalOverallProgressRating / overallProgressCount).toFixed(1) : 0);

      } catch (err) {
        console.error("Error fetching analytics data:", err); 
        toast.error("אירעה שגיאה בטעינת נתוני האנליטיקה.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run once on component mount

  // Helper for Pie Chart Labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10; // Position outside the slice
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Function to get username from user ID for navigation - now uses allUsersData state
  // Using useCallback to memoize the function, preventing unnecessary re-creations
  const getUserUsername = useCallback((userId) => {
    const user = allUsersData.find(u => u.id === userId); // Access allUsersData from state
    return user?.username || user?.displayName || 'unknown_user';
  }, [allUsersData]); // Dependency array: re-create if allUsersData changes

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FontAwesomeIcon icon={faChartLine} className="text-3xl text-indigo-600" />
              <h2 className="text-3xl font-extrabold text-gray-900">לוח מחוונים - אנליטיקה</h2>
            </div>
            <p className="mt-2 text-sm text-gray-700">סקירה כללית של נתוני המערכת</p>
          </div>

          {loading ? (
            <CleanElementalOrbitLoader /> // Using the custom loader here
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              
              {/* SECTION: Web/Platform Overview Analytics */}
              <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 col-span-full mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartLine} className="text-indigo-600" />
                  סקירת פלטפורמה כללית
                </h2>
                {/* User Growth Chart */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                    צמיחת משתמשים (מצטבר)
                  </h3>
                  {userGrowthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Total Users" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני צמיחת משתמשים להצגה.</p>
                  )}
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-green-500" />
                    פעילות יומית (משתמשים, פוסטים, דוחות, תרומות)
                  </h3>
                  {dailyActivityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#82ca9d" name="סה" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני פעילות יומית להצגה.</p>
                  )}
                </div>
              </div>

              {/* SECTION: User-Centric Analytics */}
              <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 col-span-full mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-purple-600" />
                  ניתוח משתמשים
                </h2>
                {/* User Role Distribution */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartPie} className="text-purple-500" />
                    התפלגות תפקידי משתמשים
                  </h3>
                  {userRoleDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userRoleDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userRoleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני תפקידי משתמשים להצגה.</p>
                  )}
                </div>

                {/* Most Followed Users - Clickable Cards */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md"> 
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    משתמשים עם הכי הרבה עוקבים
                  </h3>
                  {mostFollowedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
                      {mostFollowedUsers.map(user => (
                        <div 
                          key={user.id} 
                          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200"
                          onClick={() => navigate(`/profile/${user.username || user.displayName}`)} 
                        >
                          <FontAwesomeIcon icon={faUsers} className="text-indigo-400 text-3xl mb-2" />
                          <span className="text-lg font-semibold text-gray-800 text-center">{user.displayName}</span>
                          <span className="text-sm text-indigo-600 font-bold mt-1">{user.followers} עוקבים</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני עוקבים להצגה.</p>
                  )}
                </div>

                {/* Most Active Mentors - Now Clickable */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md"> 
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserTie} className="text-purple-500" />
                    מנטורים פעילים ביותר (לפי דוחות)
                  </h3>
                  {mostActiveMentors.length > 0 ? (
                    <ul className="space-y-2">
                      {mostActiveMentors.map(mentor => (
                        <li 
                          key={mentor.id} 
                          className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                          onClick={() => navigate(`/admin/reports`)} /*${mentor.username || mentor.displayName}*/
                        >
                          <span className="text-gray-700 font-medium">{mentor.displayName}</span>
                          <span className="text-purple-600 font-bold">{mentor.reportsCount} דוחות</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני פעילות מנטורים להצגה.</p>
                  )}
                </div>
              </div>


              {/* SECTION: Content & Engagement Analytics */}
              <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 col-span-full mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faThumbsUp} className="text-pink-600" />
                  ניתוח תוכן ומעורבות
                </h2>
                {/* Total Posts Count */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md"> 
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardList} className="text-blue-500" />
                    סה"כ פוסטים במערכת
                  </h3>
                  <p className="text-3xl font-extrabold text-center text-blue-600">{totalPosts}</p>
                </div>
                {/* Top Posts by Engagement - Now Clickable */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                   <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faThumbsUp} className="text-pink-500" />
                    פוסטים מובילים לפי מעורבות
                   </h3>
                  {topPosts.length > 0 ? (
                    <ul className="space-y-2">
                      {topPosts.map(post => (
                        <li 
                          key={post.id} 
                          className="bg-white p-3 rounded-md shadow-sm flex flex-col items-start cursor-pointer hover:shadow-md transition-shadow duration-200"
                          onClick={() => navigate(`/profile/${getUserUsername(post.authorId)}`)} 
                        >
                          <span className="text-gray-700 font-medium text-right w-full mb-1">{post.title}</span>
                          <span className="text-sm text-gray-500 mb-2">מאת: {post.authorDisplayName}</span> 
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><FontAwesomeIcon icon={faThumbsUp} className="text-blue-400" /> {post.likes}</span>
                            <span className="flex items-center gap-1"><FontAwesomeIcon icon={faCommentDots} className="text-green-400" /> {post.comments}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-600">אין פוסטים מובילים להצגה.</p>
                  )}
                </div>

                {/* Average Report Ratings */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-cyan-500" />
                    ממוצע דירוגי דוחות
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ממוצע דירוגי המעורבות וההתקדמות הכללית מתוך דוחות המנטורים.
                    {totalReports > 0 && <span className="block mt-1"> ( סכ"ה דוחות במערכת: {totalReports} )</span>}
                  </p>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-700 flex items-center gap-2">
                      <FontAwesomeIcon icon={faHandPointUp} className="text-cyan-500" />
                      <span className="font-medium">מעורבות ומוטיבציה:</span>{' '}
                      <span className="font-bold text-cyan-600">
                        {averageInvolvementRating > 0 ? `${averageInvolvementRating} / 4` : 'אין נתונים'}
                      </span>
                    </p>
                    <p className="text-lg text-gray-700 flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartSimple} className="text-cyan-500" />
                      <span className="font-medium">התקדמות כללית:</span>{' '}
                      <span className="font-bold text-cyan-600">
                        {averageOverallProgressRating > 0 ? `${averageOverallProgressRating} / 4` : 'אין נתונים'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>


              {/* SECTION: Financial & Partnership Analytics */}
              <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 col-span-full mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faDollarSign} className="text-teal-600" />
                  ניתוח פיננסיה ושוטפים
                </h2>
                {/* Donations Overview */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHandHoldingUsd} className="text-teal-500" />
                    סקירת תרומות
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-700">
                      <span className="font-medium">סה"כ סכום תרומות:</span>{' '}
                      <span className="font-bold text-teal-600">{totalDonationsAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
                    </p>
                    <p className="text-lg text-gray-700">
                      <span className="font-medium">ממוצע תרומה:</span>{' '}
                      <span className="font-bold text-teal-600">{averageDonationAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
                    </p>
                    <p className="text-lg text-gray-700">
                      <span className="font-medium">תרומות חוזרות:</span>{' '}
                      <span className="font-bold text-teal-600">{recurringDonationsCount}</span>
                    </p>
                  </div>
                </div>

                {/* Donations by Currency */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />
                    תרומות לפי מטבע
                  </h3>
                  {donationsByCurrency.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={donationsByCurrency}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {donationsByCurrency.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => value.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני תרומות לפי מטבע להצגה.</p>
                  )}
                </div>

                {/* Donations by Payment Method */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHandHoldingUsd} className="text-blue-500" />
                    תרומות לפי אמצעי תשלום
                  </h3>
                  {donationsByPaymentMethod.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={donationsByPaymentMethod}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {donationsByPaymentMethod.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני תרומות לפי אמצעי תשלום להצגה.</p>
                  )}
                </div>

                {/* Donations by Designated Purpose */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardList} className="text-purple-500" />
                    תרומות לפי מטרה ייעודית
                  </h3>
                  {donationsByPurpose.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={donationsByPurpose}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {donationsByPurpose.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני תרומות לפי מטרה ייעודית להצגה.</p>
                  )}
                </div>

                {/* Partners Overview */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHandshake} className="text-orange-500" />
                    סקירת שותפים
                  </h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-lg text-gray-700">
                      <span className="font-medium">סה"כ שותפים:</span>{' '}
                      <span className="font-bold text-orange-600">{totalPartners}</span>
                    </p>
                    <p className="text-lg text-gray-700">
                      <span className="font-medium">שותפים פעילים:</span>{' '}
                      <span className="font-bold text-orange-600">{activePartnersCount}</span>
                    </p>
                  </div>
                  <h4 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faListUl} className="text-gray-500" />
                    כל השותפים:
                  </h4>
                  {allPartnersList.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                      <ul className="space-y-1">
                        {allPartnersList.map(partner => (
                          <li 
                            key={partner.id} 
                            className="text-gray-700 text-sm py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                            onClick={() => navigate('/admin/Partners')}
                          >
                            {partner.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 text-sm">אין שותפים להצגה.</p>
                  )}
                </div>

                {/* Partnership Status Distribution */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartPie} className="text-indigo-500" />
                    התפלגות סטטוס שותפים
                  </h3>
                  {partnershipStatusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={partnershipStatusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {partnershipStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-600">אין נתוני סטטוס שותפים להצגה.</p>
                  )}
                </div>
              </div>

            </div>
          )}
      </div>
    </DashboardLayout>
  );
}

export default DashboardHome;
