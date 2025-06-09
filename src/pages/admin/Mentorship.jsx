import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheck,
  faTimes,
  faPlus,
  faMinus,
  faUser,
  faChartLine,
  faFilter,
  faSortAmountDown,
  faUsers,
  faCrown,
  faMapMarkerAlt,
  faEnvelope,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import {
  Search,
  Filter,
  User as UserIcon,
  Star,
  TrendingUp,
  Award,
  MapPin,
  Mail,
  Users,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useUser } from "../../hooks/useUser";
import CleanElementalOrbitLoader from "../../theme/ElementalLoader";

// Enhanced Statistics Cards
const StatsCard = ({ title, value, icon, gradient, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {trend && (
          <div className="flex items-center mt-2 text-white/90">
            <TrendingUp size={16} className="ml-1" />
            <span className="text-sm">{trend}</span>
          </div>
        )}
      </div>
      <div className="bg-white/20 rounded-full p-3">
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>
    </div>
  </motion.div>
);


// Enhanced Assign/Unassign Modal
const AssignMentorshipModal = ({
  type,
  user,
  allMentors,
  allParticipants,
  onClose,
  onAssign,
  onUnassign,
  isProcessing,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isMentor = type === "mentor";
  const title = isMentor
    ? `ניהול חניכים למנטור: ${user.profile?.displayName || user.username}`
    : `ניהול מנטור לחניך: ${user.profile?.displayName || user.username}`;

  const associatedUserIds = isMentor
    ? user.participants || []
    : user.mentors || [];
  const associatedUsers = associatedUserIds
    .map((id) =>
      isMentor
        ? allParticipants.find((p) => p.id === id)
        : allMentors.find((m) => m.id === id)
    )
    .filter(Boolean);

  const availableUsers = isMentor
    ? allParticipants.filter(
        (p) =>
          !associatedUserIds.includes(p.id) && // not already assigned
          !(p.mentors && p.mentors.length > 0) && // has no mentor yet
          (p.profile?.displayName || p.username)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : allMentors.filter(
        (m) =>
          !associatedUserIds.includes(m.id) &&
          (!m.participants || m.participants.length < 5) &&
          (m.profile?.displayName || m.username)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-black">
              {title}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="bg-black-100 text-black-800 px-3 py-1 rounded-full text-sm font-medium">
                {associatedUsers.length} מתוך {isMentor ? 5 : 1}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Current Associations */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
            <FontAwesomeIcon icon={faUsers} className="ml-2 text-blue-600" />
            {isMentor ? "חניכים משויכים" : "מנטור משויך"}
          </h4>
          {associatedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associatedUsers.map((associatedUser) => (
                <motion.div
                  key={associatedUser.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl shadow-sm border border-slate-200"
                >
                  <Link
                    to={`/profile/${associatedUser.username}`}
                    className="flex items-center gap-3 hover:bg-slate-200 rounded-xl px-3 py-2 transition-all duration-200 flex-grow"
                  >
                    <img
                      src={
                        associatedUser.profile?.photoURL ||
                        "https://placehold.co/40x40/e2e8f0/64748b?text=User"
                      }
                      alt={associatedUser.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <span className="font-medium text-slate-800">
                        {associatedUser.profile?.displayName ||
                          associatedUser.username}
                      </span>
                      <p className="text-sm text-slate-600">
                        {associatedUser.email}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() =>
                      onUnassign(user.id, associatedUser.id, isMentor)
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <FontAwesomeIcon icon={faMinus} className="ml-1" />
                    הסר
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-2xl">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-4xl text-slate-400 mb-3"
              />
              <p className="text-slate-500">
                {isMentor
                  ? "אין חניכים משויכים כרגע."
                  : "אין מנטור משויך כרגע."}
              </p>
            </div>
          )}
        </div>

        {/* Assign New */}
        {((isMentor && associatedUsers.length < 5) ||
          (!isMentor && associatedUsers.length === 0)) && (
          <div className="border-t border-slate-200 pt-8">
            <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <FontAwesomeIcon icon={faPlus} className="ml-2 text-green-600" />
              {isMentor ? "שייך חניך חדש" : "שייך מנטור"}
            </h4>

            {/* Search for available users */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`חפש ${isMentor ? "חניכים..." : "מנטורים..."}`}
                  className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-400" />
                </div>
              </div>
            </div>

            {availableUsers.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {availableUsers.map((availableUser) => (
                    <motion.div
                      key={availableUser.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedUser === availableUser.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                      onClick={() => setSelectedUser(availableUser.id)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            availableUser.profile?.photoURL ||
                            "https://placehold.co/40x40/e2e8f0/64748b?text=User"
                          }
                          alt={availableUser.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-grow">
                          <h5 className="font-medium text-slate-800">
                            {availableUser.profile?.displayName ||
                              availableUser.username}
                          </h5>
                          <p className="text-sm text-slate-600">
                            {availableUser.email}
                          </p>
                          {availableUser.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin size={12} className="text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {availableUser.location}
                              </span>
                            </div>
                          )}
                        </div>
                        {selectedUser === availableUser.id && (
                          <div className="bg-blue-500 text-white rounded-full p-2">
                            <FontAwesomeIcon icon={faCheck} size="sm" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (isMentor) {
                        onAssign(user.id, selectedUser);
                      } else {
                        onAssign(selectedUser, user.id);
                      }
                      setSelectedUser("");
                      setSearchTerm("");
                    }}
                    disabled={isProcessing || !selectedUser}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2" />
                    ) : (
                      <FontAwesomeIcon icon={faPlus} className="ml-2" />
                    )}
                    שייך נבחר
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-4xl text-slate-400 mb-3"
                />
                <p className="text-slate-500">
                  {searchTerm
                    ? `לא נמצאו תוצאות עבור "${searchTerm}"`
                    : `אין ${isMentor ? "חניכים" : "מנטורים"} זמינים לשיוך.`}
                </p>
              </div>
            )}

            {!isMentor && associatedUsers.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-amber-800 text-sm flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                  חניך יכול להיות משויך למנטור אחד בלבד.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

function Mentorship() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterElement, setFilterElement] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [assigningUser, setAssigningUser] = useState(null);
  const [assigningUserType, setAssigningUserType] = useState(null);
  const [isProcessingMentorship, setIsProcessingMentorship] = useState(false);

  const { user: currentUser } = useUser();
  const isAdmin = currentUser?.role === "admin";



  // Fetch users with profiles
    const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Get users
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
        // you can add limit(50) for pagination
      );
      const [usersSnap, profilesSnap] = await Promise.all([
        getDocs(usersQuery),
        getDocs(collection(db, "profiles")),
      ]);

      // Build a map of profiles by userId
      const profileMap = profilesSnap.docs.reduce((map, d) => {
        map[d.id] = d.data();
        return map;
      }, {});

      // Merge users + profiles
      const allUsers = usersSnap.docs.map((docSnap) => {
        const u = { id: docSnap.id, ...docSnap.data() };
        if (profileMap[docSnap.id]) u.profile = profileMap[docSnap.id];
        return u;
      });

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        (user.username &&
          user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.profile?.displayName &&
          user.profile.displayName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      const matchesRole = user.role === "mentor";
      const matchesElement =
        filterElement === "" || user.element === filterElement;
      return matchesSearch && matchesRole && matchesElement;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.profile?.displayName || a.username || "";
          const nameB = b.profile?.displayName || b.username || "";
          return nameA.localeCompare(nameB);
        case "participants":
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        case "element":
          return (a.element || "").localeCompare(b.element || "");
        default:
          return 0;
      }
    });

    setDisplayedUsers(filtered);
  }, [searchTerm, filterElement, sortBy, users]);

  // Updated assign mentorship function using user-embedded relationships
  const handleAssignMentorship = async (mentorId, participantId) => {
    setIsProcessingMentorship(true);
    try {
      const mentorRef = doc(db, "users", mentorId);
      const participantRef = doc(db, "users", participantId);

      // Update Firestore
      await Promise.all([
        updateDoc(mentorRef, { participants: [...(users.find(u => u.id === mentorId)?.participants || []), participantId] }),
        updateDoc(participantRef, { mentors: [...(users.find(u => u.id === participantId)?.mentors || []), mentorId] }),
      ]);

      // Optimistically update state
      setUsers((us) =>
        us.map((u) => {
          if (u.id === mentorId) return { ...u, participants: [...(u.participants||[]), participantId] };
          if (u.id === participantId) return { ...u, mentors: [...(u.mentors||[]), mentorId] };
          return u;
        })
      );

      toast.success("השיוך בוצע בהצלחה!");
      setAssigningUser(null);
    } catch (error) {
      console.error("Error assigning mentorship:", error);
      toast.error("אירעה שגיאה בשיוך המנטור לחניך.");
    } finally {
      setIsProcessingMentorship(false);
    }
  };

  // Updated unassign mentorship function
   const handleUnassignMentorship = async (userId, associatedUserId, isMentor) => {
    setIsProcessingMentorship(true);
    try {
      const userRef = doc(db, "users", userId);
      const assocRef = doc(db, "users", associatedUserId);

      // Firestore updates
      if (isMentor) {
        await Promise.all([
          updateDoc(userRef, { participants: (users.find(u => u.id === userId)?.participants || []).filter(id => id !== associatedUserId) }),
          updateDoc(assocRef, { mentors: (users.find(u => u.id === associatedUserId)?.mentors || []).filter(id => id !== userId) }),
        ]);
      } else {
        await Promise.all([
          updateDoc(userRef, { mentors: (users.find(u => u.id === userId)?.mentors || []).filter(id => id !== associatedUserId) }),
          updateDoc(assocRef, { participants: (users.find(u => u.id === associatedUserId)?.participants || []).filter(id => id !== userId) }),
        ]);
      }

      // Optimistic state update
      setUsers((us) =>
        us.map((u) => {
          if (u.id === userId) {
            const key = isMentor ? 'participants' : 'mentors';
            return { ...u, [key]: (u[key]||[]).filter(id => id !== associatedUserId) };
          }
          if (u.id === associatedUserId) {
            const key = isMentor ? 'mentors' : 'participants';
            return { ...u, [key]: (u[key]||[]).filter(id => id !== userId) };
          }
          return u;
        })
      );

      toast.success("השיוך הוסר בהצלחה!");
    } catch (error) {
      console.error("Error unassigning mentorship:", error);
      toast.error("אירעה שגיאה בהסרת השיוך.");
    } finally {
      setIsProcessingMentorship(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterElement("");
    setSortBy("name");
  };

  const mentors = users.filter((user) => user.role === "mentor");
  const participants = users.filter((user) => user.role === "participant");

  // Statistics
  const totalMentors = mentors.length;
  const activeMentors = mentors.filter(
    (m) => m.participants?.length > 0
  ).length;
  const totalParticipants = participants.length;
  const assignedParticipants = participants.filter(
    (p) => p.mentors?.length > 0
  ).length;
  if (loading) return <CleanElementalOrbitLoader />;

  return (
    <DashboardLayout>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        dir="rtl"
      >
        {loading && <ElementalLoader />}

        <div className="p-6 space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent mb-2 leading-[1.5]">
              ניהול מנטורים
            </h1>
            <p className="text-slate-600 text-lg">
              נהל ושייך מנטורים וחניכים בקלות
            </p>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="סה״כ מנטורים"
              value={totalMentors}
              icon={faCrown}
              gradient="from-purple-600 to-blue-600"
              trend={`${activeMentors} פעילים`}
            />
            <StatsCard
              title="חניכים משויכים"
              value={assignedParticipants}
              icon={faUsers}
              gradient="from-green-600 to-teal-600"
              trend={`מתוך ${totalParticipants}`}
            />
            <StatsCard
              title="שיוכים פעילים"
              value={mentors.reduce(
                (sum, m) => sum + (m.participants?.length || 0),
                0
              )}
              icon={faChartLine}
              gradient="from-orange-600 to-red-600"
            />
            <StatsCard
              title="מנטורים זמינים"
              value={
                mentors.filter(
                  (m) => !m.participants || m.participants.length < 5
                ).length
              }
              icon={faUser}
              gradient="from-cyan-600 to-blue-600"
            />
          </div>

          {/* Enhanced Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center">
                  <Search size={16} className="ml-2" />
                  חיפוש מנטורים
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="חפש לפי שם או אימייל..."
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center">
                  <FontAwesomeIcon
                    icon={faSortAmountDown}
                    className="ml-2"
                    size="sm"
                  />
                  מיון
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90"
                >
                  <option value="name">לפי שם</option>
                  <option value="participants">לפי מספר חניכים</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} className="ml-2" />
                  נקה סינון
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Summary */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between bg-blue-50 rounded-2xl p-4 border border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full p-2">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <span className="text-blue-800 font-medium">
                  נמצאו {displayedUsers.length} מנטורים
                </span>
              </div>
              {(searchTerm || filterElement) && (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} />
                  סינון פעיל
                </div>
              )}
            </motion.div>
          )}

          {/* Main Mentors Grid */}
          {!loading && displayedUsers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {displayedUsers.map((user, index) => {
                const associated = (user.participants || [])
                  .map((pid) => users.find((u) => u.id === pid))
                  .filter(Boolean);

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 overflow-hidden"
                  >


                    {/* Admin controls */}
                    {isAdmin && (
                      <div className="absolute top-8 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={() => {
                            setAssigningUser(user);
                            setAssigningUserType("mentor");
                          }}
                          className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                          title="נהל חניכים"
                        >
                          <FontAwesomeIcon icon={faUsers} />
                        </button>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Profile image with element border */}
                      <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 rounded-full overflow-hidden  bg-red-900 p-1 shadow-lg`}>
                          <img
                            src={
                              user.profile?.photoURL ||
                              "https://placehold.co/100x100/e2e8f0/64748b?text=User"
                            }
                            alt={user.username}
                            className="w-full h-full object-cover rounded-full bg-white"
                          />
                        </div>
                      </div>

                      {/* User info */}
                      <div className="text-center space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {user.profile?.displayName || user.username}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                            <FontAwesomeIcon
                              icon={faCrown}
                              className="text-sm"
                            />
                            <span>מנטור</span>
                          </div>
                        </div>

                        {/* Contact info */}
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center justify-center gap-2">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="text-xs"
                            />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.location && (
                            <div className="flex items-center justify-center gap-2">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="text-xs"
                              />
                              <span>{user.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar for participants */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">
                              חניכים
                            </span>
                            <span className="text-sm text-slate-500">
                              {associated.length}/5
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${
                                associated.length === 0
                                  ? "from-gray-400 to-gray-500"
                                  : associated.length < 3
                                  ? "from-green-400 to-green-500"
                                  : associated.length < 5
                                  ? "from-yellow-400 to-orange-500"
                                  : "from-red-400 to-red-500"
                              } transition-all duration-300`}
                              style={{
                                width: `${(associated.length / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Participants list */}
                        {associated.length > 0 ? (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faUserGraduate}
                                className="ml-2 text-blue-600"
                              />
                              חניכים משויכים
                            </h4>
                            <div className="space-y-2">
                              {associated.map((assocUser) => (
                                <Link
                                  key={assocUser.id}
                                  to={`/profile/${assocUser.username}`}
                                  className="flex items-center gap-3 p-2 bg-white/70 rounded-xl hover:bg-white/90 transition-all duration-200 hover:shadow-md"
                                >
                                  <img
                                    src={
                                      assocUser.profile?.photoURL ||
                                      "https://placehold.co/32x32/e2e8f0/64748b?text=U"
                                    }
                                    alt={assocUser.username}
                                    className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                                  />
                                  <div className="flex-grow text-right">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                      {assocUser.profile?.displayName ||
                                        assocUser.username}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 border border-slate-200">
                            <div className="text-center text-slate-500">
                              <FontAwesomeIcon
                                icon={faUsers}
                                className="text-2xl mb-2 opacity-50"
                              />
                              <p className="text-sm">אין חניכים משויכים</p>
                              <p className="text-xs">זמין לשיוך חניכים חדשים</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20"
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                לא נמצאו מנטורים
              </h3>
              <p className="text-slate-600 mb-6">
                נסה לשנות את פרמטרי החיפוש שלך
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                אפס סינונים
              </button>
            </motion.div>
          ) : null}
        </div>

        {/* Assign/Unassign Modal */}
        <AnimatePresence>
          {assigningUser && isAdmin && (
            <AssignMentorshipModal
              type="mentor"
              user={assigningUser}
              allMentors={mentors}
              allParticipants={participants}
              onClose={() => setAssigningUser(null)}
              onAssign={handleAssignMentorship}
              onUnassign={handleUnassignMentorship}
              isProcessing={isProcessingMentorship}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
export default Mentorship;
