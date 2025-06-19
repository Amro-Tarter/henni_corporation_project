import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import { toast } from 'sonner';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faChartLine, faClipboardList, faHandHoldingUsd, faFire, faUserTie, faStar, faClock, faHandshake, 
  faChartPie, faThumbsUp, faCommentDots, faDollarSign, faPercent , faHandPointUp, faChartSimple, faListUl,
  faArrowUp, faArrowDown, faEye, 
} from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom';
import ElementalLoader from '../../theme/ElementalLoader';

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
  const [allPartnersList, setAllPartnersList] = useState([]);

  const [userRoleDistribution, setUserRoleDistribution] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [donationsByCurrency, setDonationsByCurrency] = useState([]);
  const [donationsByPaymentMethod, setDonationsByPaymentMethod] = useState([]);
  const [donationsByPurpose, setDonationsByPurpose] = useState([]);
  const [partnershipStatusDistribution, setPartnershipStatusDistribution] = useState([]);
  const [averageInvolvementRating, setAverageInvolvementRating] = useState(0);
  const [averageOverallProgressRating, setAverageOverallProgressRating] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [allUsersData, setAllUsersData] = useState([]);

  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  // Enhanced stat card component
  const StatCard = ({ title, value, icon, color, trend, subtitle, onClick, className = "" }) => (
    <div 
      className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <FontAwesomeIcon icon={icon} className="text-white text-xl" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <FontAwesomeIcon icon={trend > 0 ? faArrowUp : faArrowDown} className="text-xs" />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  // Enhanced chart container
  const ChartContainer = ({ title, children, className = "", actions }) => (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  // Enhanced user card component
  const UserCard = ({ user, onClick, metric, metricLabel, rank }) => (
    <div 
      className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {rank}
            </div>
            <div>
              <p className="font-medium text-gray-800 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">{metric}</p>
            <p className="text-xs text-gray-500">{metricLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data (keeping the existing logic)
        const usersSnapshot = await getDocs(query(collection(db, "users")));
        const fetchedUsersData = usersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(), 
          createdAt: doc.data().createdAt?.toDate() 
        }));
        setAllUsersData(fetchedUsersData);

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
        setTotalReports(reportsData.length);

        const donationsSnapshot = await getDocs(query(collection(db, "donations")));
        const donationsData = donationsSnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data(), 
          createdAt: doc.data().createdAt?.toDate() 
        }));
        
        const partnersSnapshot = await getDocs(query(collection(db, "partners")));
        const partnersData = partnersSnapshot.docs.map(doc => ({ ...doc.data() }));
        setAllPartnersList(partnersData);

        // Process all the data (keeping existing logic)
        // User Growth
        const userGrowthMap = new Map();
        fetchedUsersData.forEach(user => {
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

        // Daily Activity
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
        aggregateActivity(fetchedUsersData);
        aggregateActivity(postsData);
        aggregateActivity(reportsData);
        aggregateActivity(donationsData);
        const sortedDailyActivity = Array.from(dailyActivityMap.values())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setDailyActivityData(sortedDailyActivity);

        setTotalPosts(postsData.length);

        // Most Followed Users
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

        // Most Active Mentors
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
            username: fetchedUsersData.find(u => u.id === mentorId)?.username || profilesMap[mentorId]?.displayName || 'מנטור לא ידוע'
          }))
          .sort((a, b) => b.reportsCount - a.reportsCount)
          .slice(0, 5);
        setMostActiveMentors(activeMentorsList);

        // Donations Analytics
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

        // Partners Analytics
        setTotalPartners(partnersData.length);
        const activePartners = partnersData.filter(partner => partner.status === 'active').length;
        setActivePartnersCount(activePartners);
        const partnershipStatusMap = new Map();
        partnersData.forEach(partner => {
          partnershipStatusMap.set(partner.status, (partnershipStatusMap.get(partner.status) || 0) + 1);
        });
        setPartnershipStatusDistribution(Array.from(partnershipStatusMap.entries()).map(([name, value]) => ({ name, value })));

        // User Role Distribution
        const userRoleMap = new Map();
        fetchedUsersData.forEach(user => {
          if (user.role) {
            userRoleMap.set(user.role, (userRoleMap.get(user.role) || 0) + 1);
          }
        });
        setUserRoleDistribution(Array.from(userRoleMap.entries()).map(([name, value]) => ({ name, value })));

        // Top Posts
        const topPostsList = postsData
          .map(post => {
            const authorUser = fetchedUsersData.find(u => u.id === post.authorId);
            const authorDisplayName = authorUser?.displayName || authorUser?.username || 'משתמש לא ידוע';

            return {
              id: post.id,
              title: post.content ? post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '') : 'ללא כותרת',
              engagement: (post.likesCount || 0) + (post.commentsCount || 0),
              likes: post.likesCount || 0,
              comments: post.commentsCount || 0,
              authorId: post.authorId,
              authorDisplayName: authorDisplayName
            };
          })
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 5);
        setTopPosts(topPostsList);

        // Average Ratings
        let totalInvolvementRating = 0;
        let totalOverallProgressRating = 0;
        let involvementCount = 0;
        let overallProgressCount = 0;

        const ratingMap = {
          "נמוכה": 1, "בינונית": 2, "גבוהה": 3, "מאוד גבוהה": 4,
          "נמוך": 1, "בינוני": 2, "גבוה": 3, "מאוד גבוה": 4,
          "חלש": 1, "סביר": 2, "טוב": 3, "מצוין": 4,
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
  }, []);

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#374151" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getUserUsername = useCallback((userId) => {
    const user = allUsersData.find(u => u.id === userId);
    return user?.username || user?.displayName || 'unknown_user';
  }, [allUsersData]);

  if (loading) return <ElementalLoader/>;

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <FontAwesomeIcon icon={faChartLine} className="text-3xl text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">לוח מחוונים</h1>
              <p className="text-lg text-gray-600">סקירה כללית של נתוני המערכת</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="סה״כ משתמשים"
            value={allUsersData.length.toLocaleString()}
            icon={faUsers}
            color="from-blue-500 to-blue-600"
            trend={12}
            subtitle="משתמשים רשומים"
          />
          <StatCard
            title="סה״כ פוסטים"
            value={totalPosts.toLocaleString()}
            icon={faClipboardList}
            color="from-green-500 to-green-600"
            trend={8}
            subtitle="פוסטים פעילים"
          />
          <StatCard
            title="סה״כ תרומות"
            value={totalDonationsAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
            icon={faHandHoldingUsd}
            color="from-purple-500 to-purple-600"
            trend={15}
            subtitle="מסך התרומות"
          />
          <StatCard
            title="דוחות מנטורים"
            value={totalReports.toLocaleString()}
            icon={faUserTie}
            color="from-orange-500 to-orange-600"
            trend={-3}
            subtitle="דוחות שהוגשו"
          />
        </div>

        {/* Platform Overview */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FontAwesomeIcon icon={faChartLine} className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">סקירת פלטפורמה כללית</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer title="צמיחת משתמשים (מצטבר)" className="lg:col-span-1">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Total Users" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#4f46e5' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faChartLine} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני צמיחת משתמשים להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            <ChartContainer title="פעילות יומית" className="lg:col-span-1">
              {dailyActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dailyActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="total" 
                      fill="#10b981" 
                      name="סה׳׳כ פעילות"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faClock} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני פעילות יומית להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>
          </div>
        </div>

        {/* User Analytics */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">ניתוח משתמשים</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ChartContainer title="התפלגות תפקידי משתמשים" className="lg:col-span-1">
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
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faChartPie} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני תפקידים להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            <div className="lg:col-span-2 space-y-8">
              <ChartContainer title="משתמשים עם הכי הרבה עוקבים">
                {mostFollowedUsers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mostFollowedUsers.map((user, index) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onClick={() => navigate(`/profile/${user.username || user.displayName}`)}
                        metric={user.followers}
                        metricLabel="עוקבים"
                        rank={index + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500">
                    <p>אין נתוני עוקבים להצגה</p>
                  </div>
                )}
              </ChartContainer>

              <ChartContainer title="מנטורים פעילים ביותר">
                {mostActiveMentors.length > 0 ? (
                  <div className="space-y-3">
                    {mostActiveMentors.map((mentor, index) => (
                      <UserCard
                        key={mentor.id}
                        user={mentor}
                        onClick={() => navigate('/admin/reports')}
                        metric={mentor.reportsCount}
                        metricLabel="דוחות"
                        rank={index + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500">
                    <p>אין נתוני מנטורים להצגה</p>
                  </div>
                )}
              </ChartContainer>
            </div>
          </div>
        </div>
{/* Content & Engagement */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <FontAwesomeIcon icon={faFire} className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">תוכן ומעורבות</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer title="פוסטים בעלי המעורבות הגבוהה ביותר">
              {topPosts.length > 0 ? (
                <div className="space-y-4">
                  {topPosts.map((post, index) => (
                    <div 
                      key={post.id}
                      className="group bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => navigate('/admin/posts')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-600">מאת: {post.authorDisplayName}</span>
                          </div>
                          <p className="text-sm text-gray-800 mb-3 leading-relaxed">{post.title}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faThumbsUp} className="text-blue-500 text-sm" />
                              <span className="text-sm text-gray-600">{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faCommentDots} className="text-green-500 text-sm" />
                              <span className="text-sm text-gray-600">{post.comments}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-600">{post.engagement}</div>
                          <div className="text-xs text-gray-500">מעורבות כללית</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faEye} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני פוסטים להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            <div className="space-y-8">
              <ChartContainer title="נתוני מנטורינג">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FontAwesomeIcon icon={faStar} className="text-white text-lg" />
                    </div>
                    <div className="text-2xl font-bold text-indigo-700 mb-1">{averageInvolvementRating}</div>
                    <div className="text-sm text-indigo-600">ממוצע מעורבות</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 text-center">

                    <div className="text-2xl font-bold text-emerald-700 mb-1">{averageOverallProgressRating}</div>
                    <div className="text-sm text-emerald-600">ממוצע התקדמות</div>
                  </div>
                </div>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Financial Analytics */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
              <FontAwesomeIcon icon={faDollarSign} className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">ניתוח כספי</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="ממוצע תרומה"
              value={averageDonationAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
              icon={faPercent}
              color="from-emerald-500 to-emerald-600"
              subtitle="לכל תרומה"
            />
            <StatCard
              title="תרומות קבועות"
              value={recurringDonationsCount.toLocaleString()}
              icon={faHandPointUp}
              color="from-blue-500 to-blue-600"
              subtitle="תרומות חוזרות"
            />
            <StatCard
              title="שיתופי פעולה פעילים"
              value={activePartnersCount.toLocaleString()}
              icon={faHandshake}
              color="from-purple-500 to-purple-600"
              subtitle={`מתוך ${totalPartners} כולל`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ChartContainer title="תרומות לפי מטבע" className="lg:col-span-1">
              {donationsByCurrency.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donationsByCurrency}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {donationsByCurrency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faDollarSign} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני תרומות להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            <ChartContainer title="תרומות לפי אמצעי תשלום" className="lg:col-span-1">
              {donationsByPaymentMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donationsByPaymentMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {donationsByPaymentMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faChartSimple} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני אמצעי תשלום להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            <ChartContainer title="תרומות לפי מטרה" className="lg:col-span-1">
              {donationsByPurpose.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donationsByPurpose}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {donationsByPurpose.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faListUl} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני מטרות תרומה להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>
          </div>
        </div>

        {/* Partnership Analytics */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <FontAwesomeIcon icon={faHandshake} className="text-white text-lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">ניתוח שיתופי פעולה</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer title="התפלגות סטטוס שיתופי פעולה">
              {partnershipStatusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={partnershipStatusDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#06b6d4" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faHandshake} className="text-4xl mb-4 text-gray-300" />
                    <p>אין נתוני שיתופי פעולה להצגה</p>
                  </div>
                </div>
              )}
            </ChartContainer>

            <ChartContainer title="רשימת שותפים">
              {allPartnersList.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {allPartnersList.slice(0, 10).map((partner, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{partner.organization_name || 'שם ארגון לא זמין'}</h4>
                          <p className="text-sm text-gray-600">{partner.contact_person || 'איש קשר לא זמין'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            partner.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : partner.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {partner.status === 'active' ? 'פעיל' : 
                             partner.status === 'pending' ? 'ממתין' : 
                             partner.status || 'לא זמין'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {allPartnersList.length > 10 && (
                    <div className="text-center py-2">
                      <button 
                        onClick={() => navigate('/admin/partners')}
                        className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                      >
                        הצג עוד {allPartnersList.length - 10} שותפים...
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faHandshake} className="text-4xl mb-4 text-gray-300" />
                    <p>אין שותפים רשומים</p>
                  </div>
                </div>
              )}
            </ChartContainer>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-2xl p-8 border border-indigo-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">סיכום כללי</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              המערכת מונה {allUsersData.length.toLocaleString()} משתמשים רשומים, 
              {totalPosts.toLocaleString()} פוסטים פעילים, 
              ו{totalReports.toLocaleString()} דוחות מנטורים שהוגשו.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHandHoldingUsd} className="text-green-500" />
                <span>סה״כ תרומות: {totalDonationsAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHandshake} className="text-blue-500" />
                <span>שותפים פעילים: {activePartnersCount}/{totalPartners}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;