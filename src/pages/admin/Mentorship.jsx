import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, orderBy, updateDoc, doc, getDoc, where, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire,
  faEdit,
  faTrash,
  faEye,
  faSave,
  faTimes,
  faPlus,
  faMinus,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Search, Filter, User as UserIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useUser } from "../../hooks/useUser"; // Assuming this hook provides current user info including role
// Corrected CleanElementalOrbitLoader Component
function CleanElementalOrbitLoader() {
  // Move ELEMENTS declaration to the top of the component function
  const ELEMENTS = [
    { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100' },
    { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100' },
    { key: 'air', emoji: '💨', color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100' },
    { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100' },
    { key: 'fire', emoji: '🔥', color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100' },
  ];

  const [activeElement, setActiveElement] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElement(a => (a + 1) % ELEMENTS.length); // ELEMENTS is now defined
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = ELEMENTS[activeElement]; // ELEMENTS is now defined
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

        {ELEMENTS.map((el, i) => { // ELEMENTS is now defined
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
// Re-using the EditUserModal from your provided code (make sure it's accessible or copy-pasted)
const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: user.username || '',
        email: user.email || '',
        element: user.element || '',
        location: user.location || '',
        role: user.role || 'participant',
        displayName: user.profile?.displayName || '',
        bio: user.profile?.bio || '',
        photoURL: user.profile?.photoURL || ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const elementOptions = [
        { value: 'fire', label: 'אש' },
        { value: 'water', label: 'מים' },
        { value: 'earth', label: 'אדמה' },
        { value: 'air', label: 'אוויר' },
        { value: 'metal', label: 'מתכת' }
    ];

    const roleOptions = [
        { value: 'mentor', label: 'מנטור' },
        { value: 'participant', label: 'משתתף' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(user.id, formData);
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        עריכת משתמש: {user.username}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">שם משתמש</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">שם תצוגה</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">אלמנט</label>
                            <select
                                value={formData.element}
                                onChange={(e) => setFormData({ ...formData, element: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">בחר אלמנט</option>
                                {elementOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {roleOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">מיקום</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">תמונת פרופיל (URL)</label>
                        <input
                            type="url"
                            value={formData.photoURL}
                            onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ביו</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                            ) : (
                                <FontAwesomeIcon icon={faSave} className="ml-2" />
                            )}
                            שמור
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// Delete Confirmation Modal (Re-used from your provided code)
const DeleteConfirmModal = ({ user, onConfirm, onCancel, isLoading }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    אישור מחיקה
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    האם אתה בטוח שברצונך למחוק את המשתמש <strong>{user.username}</strong>?
                    פעולה זו לא ניתנת לביטול.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={() => onConfirm(user.id)}
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                        ) : (
                            <FontAwesomeIcon icon={faTrash} className="ml-2" />
                        )}
                        מחק
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// New Assign/Unassign Modal
const AssignMentorshipModal = ({ type, user, allMentors, allParticipants, currentMentorships, onClose, onAssign, onUnassign, isProcessing }) => {
    const [selectedUser, setSelectedUser] = useState(""); // This will hold the ID of the mentor or participant to assign/unassign

    const isMentor = type === 'mentor';
    const title = isMentor ? `ניהול חניכים למנטור: ${user.profile?.displayName || user.username}` : `ניהול מנטור לחניך: ${user.profile?.displayName || user.username}`;

    const associatedUsers = currentMentorships.filter(ms =>
        isMentor ? ms.mentorId === user.id : ms.participantId === user.id
    ).map(ms =>
        isMentor ? allParticipants.find(p => p.id === ms.participantId) : allMentors.find(m => m.id === ms.mentorId)
    ).filter(Boolean); // Filter out undefined if a user is not found

    const availableUsers = isMentor
        ? allParticipants.filter(p => !associatedUsers.some(au => au.id === p.id))
        : allMentors.filter(m => !associatedUsers.some(au => au.id === m.id));

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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Current Associations */}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-700 mb-3">
                        {isMentor ? "חניכים משויכים" : "מנטור משויך"} ({associatedUsers.length} מתוך 5)
                    </h4>
                    {associatedUsers.length > 0 ? (
                        <ul className="space-y-2">
                            {associatedUsers.map(associatedUser => (
                                <li key={associatedUser.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                                    <Link
                                        to={`/profile/${associatedUser.username}`}
                                        className="flex items-center gap-3 hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors"
                                        >
                                        <img
                                        src={associatedUser.profile?.photoURL || "https://placehold.co/40x40/e2e8f0/64748b?text=User"}
                                        alt={associatedUser.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="text-gray-800">{associatedUser.profile?.displayName || associatedUser.username}</span>
                                        </Link>
                                    <button
                                        onClick={() => onUnassign(user.id, associatedUser.id, isMentor)}
                                        disabled={isProcessing}
                                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FontAwesomeIcon icon={faMinus} className="ml-1" />
                                        הסר
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">אין חניכים משויכים כרגע.</p>
                    )}
                </div>

                {/* Assign New */}
                {isMentor && associatedUsers.length < 5 && (
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-slate-700 mb-3">שייך חניך חדש</h4>
                        <div className="flex gap-3">
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="flex-grow px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">בחר חניך</option>
                                {availableUsers.map(participant => (
                                    <option key={participant.id} value={participant.id}>
                                        {participant.profile?.displayName || participant.username}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => onAssign(user.id, selectedUser)}
                                disabled={isProcessing || !selectedUser}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                                ) : (
                                    <FontAwesomeIcon icon={faPlus} className="ml-2" />
                                )}
                                שייך
                            </button>
                        </div>
                    </div>
                )}
                {!isMentor && associatedUsers.length === 0 && (
                     <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-slate-700 mb-3">שייך מנטור</h4>
                        <div className="flex gap-3">
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="flex-grow px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">בחר מנטור</option>
                                {availableUsers.map(mentor => (
                                    <option key={mentor.id} value={mentor.id}>
                                        {mentor.profile?.displayName || mentor.username}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => onAssign(selectedUser, user.id)}
                                disabled={isProcessing || !selectedUser}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                                ) : (
                                    <FontAwesomeIcon icon={faPlus} className="ml-2" />
                                )}
                                שייך
                            </button>
                        </div>
                    </div>
                )}
                 {!isMentor && associatedUsers.length > 0 && (
                    <p className="text-slate-500 border-t pt-4">חניך יכול להיות משויך למנטור אחד בלבד.</p>
                )}
            </motion.div>
        </motion.div>
    );
};


function Mentorship() {
    const [users, setUsers] = useState([]);
    const [mentorships, setMentorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [assigningUser, setAssigningUser] = useState(null); // User for whom to assign/unassign mentorship
    const [assigningUserType, setAssigningUserType] = useState(null); // 'mentor' or 'participant'
    const [isProcessingMentorship, setIsProcessingMentorship] = useState(false);

    const { user: currentUser } = useUser();
    const isAdmin = currentUser?.role === 'admin';

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
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-25px) rotate(8deg) scale(1.05); }
            100% { transform: translateY(0) rotate(0deg) scale(1); }
          }
          .animate-float-1 { animation: float 8s ease-in-out infinite; }
          .animate-float-2 { animation: float 9s ease-in-out 1s infinite; }
          .animate-float-3 { animation: float 10s ease-in-out 2s infinite; }
          .animate-float-4 { animation: float 11s ease-in-out 3s infinite; }
          .animate-float-5 { animation: float 12s ease-in-out 4s infinite; }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const mentorshipQuery = query(collection(db, "mentorship"));

        const [usersSnapshot, mentorshipSnapshot] = await Promise.all([
            getDocs(usersQuery),
            getDocs(mentorshipQuery)
        ]);

        const usersData = [];
        for (const userDoc of usersSnapshot.docs) {
            const userData = { id: userDoc.id, ...userDoc.data() };
            try {
                const profileSnap = await getDoc(doc(db, "profiles", userDoc.id));
                if (profileSnap.exists()) {
                    userData.profile = profileSnap.data();
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
            usersData.push(userData);
        }

        const mentorshipsData = mentorshipSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setUsers(usersData);
        setMentorships(mentorshipsData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        const filtered = users.filter(user => {
            const matchesSearch = searchTerm === "" ||
                (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.profile?.displayName && user.profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = user.role === 'mentor'; // Only show mentors
            return matchesSearch && matchesRole;
        });
        setDisplayedUsers(filtered);
    }, [searchTerm, users]);

    const handleAssignMentorship = async (mentorId, participantId) => {
        setIsProcessingMentorship(true);
        try {
            // Check if participant is already assigned to any mentor
            const existingParticipantMentorship = mentorships.find(ms => ms.participantId === participantId);
            if (existingParticipantMentorship) {
                toast.error("החניך כבר משויך למנטור אחר. יש להסיר אותו קודם.");
                setIsProcessingMentorship(false);
                return;
            }

            // Check mentor's current participant count
            const mentorParticipants = mentorships.filter(ms => ms.mentorId === mentorId).length;
            if (mentorParticipants >= 5) {
                toast.error("למנטור זה כבר יש 5 חניכים משויכים. לא ניתן לשייך יותר.");
                setIsProcessingMentorship(false);
                return;
            }

            await addDoc(collection(db, "mentorship"), {
                mentorId,
                participantId,
                createdAt: new Date(),
            });
            toast.success("השיוך בוצע בהצלחה!");
            await fetchAllData(); // Re-fetch all data to update UI
            setAssigningUser(null); // Close modal
        } catch (error) {
            console.error("Error assigning mentorship:", error);
            toast.error("אירעה שגיאה בשיוך המנטור לחניך.");
        } finally {
            setIsProcessingMentorship(false);
        }
    };

    const handleUnassignMentorship = async (userId, associatedUserId, isMentor) => {
        setIsProcessingMentorship(true);
        try {
            let mentorshipToDelete;
            if (isMentor) {
                mentorshipToDelete = mentorships.find(ms => ms.mentorId === userId && ms.participantId === associatedUserId);
            } else {
                mentorshipToDelete = mentorships.find(ms => ms.participantId === userId && ms.mentorId === associatedUserId);
            }

            if (mentorshipToDelete) {
                await deleteDoc(doc(db, "mentorship", mentorshipToDelete.id));
                toast.success("השיוך הוסר בהצלחה!");
                await fetchAllData(); // Re-fetch all data to update UI
            } else {
                toast.error("שיוך לא נמצא.");
            }
        } catch (error) {
            console.error("Error unassigning mentorship:", error);
            toast.error("אירעה שגיאה בהסרת השיוך.");
        } finally {
            setIsProcessingMentorship(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
    };

    const mentors = users.filter(user => user.role === 'mentor');
    const participants = users.filter(user => user.role === 'participant');

    // Function to get associated users for display
    const getAssociatedUsers = (userId, userRole) => {
        if (userRole === 'mentor') {
            const participantIds = mentorships.filter(ms => ms.mentorId === userId).map(ms => ms.participantId);
            return users.filter(u => participantIds.includes(u.id));
        } else if (userRole === 'participant') {
            const mentorId = mentorships.find(ms => ms.participantId === userId)?.mentorId;
            return mentorId ? [users.find(u => u.id === mentorId)] : [];
        }
        return [];
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900">ניהול מנטורים</h2>
            </div>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">חיפוש מנטורים</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="חפש לפי שם משתמש..."
                            className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
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
            </div>

            {loading ? (
                <CleanElementalOrbitLoader />
            ) : displayedUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayedUsers.map((user) => {
                        const associated = getAssociatedUsers(user.id, 'mentor');

                        return (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
                            >
                                <div className={`h-4 ${elementGradients[user.element] || "bg-gray-300"}`}></div>

                                {isAdmin && (
                                    <div className="absolute top-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 z-10">
                                        <button
                                            onClick={() => { setAssigningUser(user); setAssigningUserType('mentor'); }}
                                            className="p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
                                            title="נהל חניכים"
                                        >
                                            <FontAwesomeIcon icon={faUser} size="sm" />
                                        </button>
                                    </div>
                                )}

                                <div className="p-5">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                                            <img
                                                src={user.profile?.photoURL || "https://placehold.co/100x100/e2e8f0/64748b?text=User"}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://placehold.co/100x100/e2e8f0/64748b?text=User";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-900">{user.profile?.displayName || user.username}</h3>
                                        <p className="text-sm text-gray-600">מנטור</p>
                                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                                            <UserIcon size={14} />
                                            <span>{user.email}</span>
                                        </div>

                                        <div className="flex items-center justify-center gap-1 mt-2">
                                            <FontAwesomeIcon
                                                icon={elementIcons[user.element] || faLeaf}
                                                className={`${elementColors[user.element] || "text-gray-400"}`}
                                            />
                                            <span className="text-sm capitalize">
                                                {user.element === "fire" && "אש"}
                                                {user.element === "water" && "מים"}
                                                {user.element === "earth" && "אדמה"}
                                                {user.element === "air" && "אוויר"}
                                                {user.element === "metal" && "מתכת"}
                                                {!user.element && "לא מוגדר"}
                                            </span>
                                        </div>

                                        {user.location && (
                                            <p className="text-sm text-gray-500 mt-1">{user.location}</p>
                                        )}

                                        {/* Display Associated Participants */}
                                        {associated.length > 0 && (
                                            <div className="mt-3 text-sm">
                                                <p className="font-semibold text-gray-700">חניכים:</p>
                                                <ul className="text-gray-600">
                                                    {associated.map(assocUser => (
                                                        <li key={assocUser.id}>
                                                            {assocUser.profile?.displayName || assocUser.username}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {associated.length === 0 && (
                                            <p className="mt-3 text-sm text-gray-500">אין חניכים משויכים.</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-4xl mb-3">🔎</div>
                    <h3 className="text-xl font-medium text-gray-700">לא נמצאו מנטורים</h3>
                    <p className="text-gray-500">נסה לשנות את פרמטרי החיפוש שלך</p>
                </div>
            )}

            {/* Assign/Unassign Mentorship Modal */}
            <AnimatePresence>
                {assigningUser && isAdmin && (
                    <AssignMentorshipModal
                        type="mentor"
                        user={assigningUser}
                        allMentors={mentors}
                        allParticipants={participants}
                        currentMentorships={mentorships}
                        onClose={() => setAssigningUser(null)}
                        onAssign={handleAssignMentorship}
                        onUnassign={handleUnassignMentorship}
                        isProcessing={isProcessingMentorship}
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

export default Mentorship;