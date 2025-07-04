import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserClock, FaTimes, FaCheck, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaSearch, FaUsers, FaTrash, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import { doc, getDocs, collection, updateDoc, serverTimestamp, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import { useUser } from '../../hooks/useUser';
import { toast } from 'sonner';

// Rejection Confirmation Modal Component (unchanged, for brevity)
const RejectionConfirmationModal = ({ user, onConfirm, onCancel, isProcessing }) => {
    const [notifyUser, setNotifyUser] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
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
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <FaExclamationTriangle className="text-red-600 dark:text-red-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            אישור דחיית בקשה
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            פעולה זו לא ניתנת לביטול
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`;
                            }}
                        />
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{user.displayName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700 dark:text-red-300">
                            <p className="font-medium mb-1">שים לב:</p>
                            <ul className="space-y-1">
                                <li>• חשבון המשתמש יימחק לחלוטין מהמערכת</li>
                                <li>• כל הנתונים הקשורים יוסרו</li>
                                <li>• פעולה זו אינה ניתנת לביטול</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                        ביטול
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onConfirm(notifyUser)}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                        ) : (
                            <FaTrash className="ml-2" />
                        )}
                        דחה בקשה
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Role Selection Modal Component (unchanged, for brevity)
const RoleSelectionModal = ({ user, onConfirm, onCancel, isProcessing }) => {
    const [selectedRole, setSelectedRole] = useState(user.role || 'participant');
    const [mentorId, setMentorId] = useState('');
    const [mentorsList, setMentorsList] = useState([]);

    const roles = [
        { value: 'admin', label: 'מנהל', description: 'גישה מלאה לכל המערכת', color: 'bg-purple-100 text-purple-800' },
        { value: 'mentor', label: 'מנטור', description: 'הדרכה וליווי משתתפים', color: 'bg-blue-100 text-blue-800' },
        { value: 'participant', label: 'משתתף', description: 'משתתף בתוכניות', color: 'bg-yellow-100 text-yellow-800' },
    ];

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                const mentors = usersSnap.docs
                    .filter(doc => doc.data().role === 'mentor' && doc.data().is_active)
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().displayName || doc.data().username || 'מנטור'
                    }));
                setMentorsList(mentors);
            } catch (error) {
                console.error('Error fetching mentors:', error);
            }
        };

        if (selectedRole === 'participant') {
            fetchMentors();
        }
    }, [selectedRole]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
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
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        בחירת תפקיד עבור {user.displayName}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`;
                            }}
                        />
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{user.displayName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        בחר תפקיד:
                    </label>
                    {roles.map((role) => (
                        <motion.label
                            key={role.value}
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedRole === role.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                            }`}
                        >
                            <input
                                type="radio"
                                name="role"
                                value={role.value}
                                checked={selectedRole === role.value}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="sr-only"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-slate-800 dark:text-white">
                                        {role.label}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${role.color}`}>
                                        {role.label}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {role.description}
                                </p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ml-3 ${
                                selectedRole === role.value
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-slate-300 dark:border-slate-500'
                            }`}>
                                {selectedRole === role.value && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                        </motion.label>
                    ))}
                </div>

                {selectedRole === 'participant' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                            שייך למנטור:
                        </label>
                        <select
                            value={mentorId}
                            onChange={(e) => setMentorId(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">בחר מנטור (אופציונלי)</option>
                            {mentorsList.map(mentor => (
                                <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                            ))}
                        </select>
                        {mentorsList.length === 0 && selectedRole === 'participant' && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                אין מנטורים זמינים במערכת
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                        ביטול
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onConfirm(selectedRole, mentorId)}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                        ) : (
                            <FaCheck className="ml-2" />
                        )}
                        אשר בקשה
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Main Modal Component
const PendingUsersModal = ({ isOpen, onClose }) => {
    const { user } = useUser();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [processingUserId, setProcessingUserId] = useState(null);
    const [roleSelectionUser, setRoleSelectionUser] = useState(null);
    const [rejectionUser, setRejectionUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadPendingUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        filterAndSortUsers();
    }, [pendingUsers, searchTerm, sortBy]);

    const loadPendingUsers = async () => {
        try {
            setIsLoading(true);
            const usersSnap = await getDocs(collection(db, 'users'));
            const pendingUsersData = await Promise.all(
                usersSnap.docs
                    .filter(doc => !doc.data().is_active &&  doc.data().is_email_verified)
                    .map(async (userDoc) => {
                        const userData = userDoc.data();
                        // Assuming profile data is still needed from 'profiles' collection if it exists
                        const profileSnap = await getDoc(doc(db, 'profiles', userDoc.id));
                        const profileData = profileSnap.exists() ? profileSnap.data() : {};

                        return {
                            id: userDoc.id,
                            ...userData,
                            ...profileData, // Include existing profile data if any
                            displayName: profileData.displayName || userData.username || 'משתמש לא מזוהה',
                            photoURL: profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'User')}&background=random`,
                            createdAt: userData.createdAt?.toDate?.() || new Date(),
                            role: userData.role || 'participant',
                            // --- NEW FIELDS FETCHED HERE ---
                            howDidYouHear: userData.howDidYouHear || 'לא הוזן',
                            commitmentLevel: userData.commitmentLevel || 'לא הוזן',
                            artisticAffinity: userData.artisticAffinity || 'לא הוזן',
                            goalAsVolunteer: userData.goalAsVolunteer || 'לא הוזן',
                            artLeadershipConnection: userData.artLeadershipConnection || 'לא הוזן',
                            skillsResources: userData.skillsResources || [],
                            financialSupport: userData.financialSupport || 'לא הוזן',
                            preferredActivityArea: userData.preferredActivityArea || 'לא הוזן',
                            // --- END NEW FIELDS ---
                        };
                    })
            );
            setPendingUsers(pendingUsersData);
        } catch (error) {
            console.error('Error loading pending users:', error);
            toast.error('שגיאה בטעינת בקשות הצטרפות');
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortUsers = () => {
    if (!searchTerm.trim()) {
        let sorted = [...pendingUsers];
        switch (sortBy) {
            case 'name':
                sorted = sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
                break;
            case 'email':
                sorted = sorted.sort((a, b) => a.email.localeCompare(b.email));
                break;
            case 'role':
                sorted = sorted.sort((a, b) => a.role.localeCompare(b.role));
                break;
            case 'date':
            default:
                sorted = sorted.sort((a, b) => b.createdAt - a.createdAt);
                break;
        }
        setFilteredUsers(sorted);
        return;
    }

    let filtered = pendingUsers.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
        case 'name':
            filtered = filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
            break;
        case 'email':
            filtered = filtered.sort((a, b) => a.email.localeCompare(b.email));
            break;
        case 'role':
            filtered = filtered.sort((a, b) => a.role.localeCompare(b.role));
            break;
        case 'date':
        default:
            filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
            break;
    }

    setFilteredUsers(filtered);
};


    const handleAcceptUser = (userToAccept) => {
        setRoleSelectionUser(userToAccept);
    };

    const handleConfirmAccept = async (selectedRole, mentorId) => {
        if (!roleSelectionUser) return;

        try {
            setProcessingUserId(roleSelectionUser.id);

            const userRef = doc(db, 'users', roleSelectionUser.id);
            const updateData = {
                is_active: true,
                role: selectedRole,
                updatedAt: serverTimestamp()
            };

            if (selectedRole === 'participant') {
                updateData.associatedMentor = mentorId || null;
            }

            await updateDoc(userRef, updateData);

            const profileRef = doc(db, 'profiles', roleSelectionUser.id);
            const profileSnap = await getDoc(profileRef);
            if (!profileSnap.exists()) {
                // If profile doesn't exist, create it with user data and new questionnaire data
                await setDoc(profileRef, {
                    associated_id: roleSelectionUser.id,
                    displayName: roleSelectionUser.displayName || "",
                    username: roleSelectionUser.username || "",
                    bio: "", // Bio is not collected at signup, so it's empty
                    location: roleSelectionUser.location || "",
                    followersCount: 0,
                    followingCount: 0,
                    postsCount: 0,
                    createdAt: serverTimestamp(),
                    photoURL: roleSelectionUser.photoURL || "",
                    role: selectedRole,
                    ...(selectedRole === "participant" && { associatedMentor: mentorId || null }),
                    // --- NEW FIELDS ADDED TO PROFILE ON CREATION ---
                    howDidYouHear: roleSelectionUser.howDidYouHear || 'לא הוזן',
                    commitmentLevel: roleSelectionUser.commitmentLevel || 'לא הוזן',
                    artisticAffinity: roleSelectionUser.artisticAffinity || 'לא הוזן',
                    goalAsVolunteer: roleSelectionUser.goalAsVolunteer || 'לא הוזן',
                    artLeadershipConnection: roleSelectionUser.artLeadershipConnection || 'לא הוזן',
                    skillsResources: roleSelectionUser.skillsResources || [],
                    financialSupport: roleSelectionUser.financialSupport || 'לא הוזן',
                    preferredActivityArea: roleSelectionUser.preferredActivityArea || 'לא הוזן',
                    // --- END NEW FIELDS ---
                });
            } else {
                // If profile exists, update its role and mentor, no need to touch other questionnaire data unless explicitly desired
                const profileUpdateData = {
                    role: selectedRole,
                    updatedAt: serverTimestamp(),
                };
                if (selectedRole === 'participant') {
                    profileUpdateData.associatedMentor = mentorId || null;
                }
                await updateDoc(profileRef, profileUpdateData);
            }

            const mentorText = mentorId ? ' עם מנטור מוקצה' : '';
            toast.success(`הבקשה של ${roleSelectionUser.displayName} אושרה בהצלחה כ${getRoleDisplay(selectedRole)}${mentorText}`);
            setRoleSelectionUser(null);
            await loadPendingUsers();
        } catch (error) {
            console.error('Error accepting user:', error);
            toast.error('שגיאה באישור הבקשה. אנא נסה שוב.');
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleRejectUser = (userToReject) => {
        setRejectionUser(userToReject);
    };

    const handleConfirmReject = async (notifyUser) => {
        if (!rejectionUser) return;

        try {
            setProcessingUserId(rejectionUser.id);

            await deleteDoc(doc(db, 'users', rejectionUser.id));

            // Optionally, delete the corresponding profile document if it exists
            const profileRef = doc(db, 'profiles', rejectionUser.id);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
                await deleteDoc(profileRef);
            }

            setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== rejectionUser.id));

            toast.success(`הבקשה של ${rejectionUser.displayName} נדחתה`);
            setRejectionUser(null);

        } catch (error) {
            console.error('Error rejecting user:', error);
            toast.error('שגיאה בדחיית הבקשה');
        } finally {
            setProcessingUserId(null);
        }
    };

    const getRoleDisplay = (role) => {
        const roleMap = {
            'admin': 'מנהל',
            'mentor': 'מנטור',
            'participant': 'משתתף',
        };
        return roleMap[role] || role;
    };

    function InfoItem({ label, value }) {
  return (
    <div>
      <h4 className="font-semibold mb-1">{label}</h4>
      <p className="text-sm truncate">{value || "לא סופק"}</p>
    </div>
  );
}


    const getRoleColor = (role) => {
        const colorMap = {
            'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            'mentor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'participant': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        };
        return colorMap[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (!isOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl p-6 max-h-full overflow-hidden flex flex-col"
                    dir="rtl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                                <FaUserClock className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    בקשות הצטרפות ממתינות
                                </h2>
                                {!isLoading && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {filteredUsers.length} בקשות ממתינות לטיפול
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="סגור חלון"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                id="search-input"
                                name="search"
                                placeholder="חפש לפי שם, אימייל, טלפון או מיקום..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            >
                                <option value="date">מיון לפי תאריך</option>
                                <option value="name">מיון לפי שם</option>
                                <option value="email">מיון לפי אימייל</option>
                                <option value="role">מיון לפי תפקיד</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-400">טוען בקשות הצטרפות...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-20">
                                <FaUsers className="mx-auto text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                                    {searchTerm ? 'לא נמצאו תוצאות' : 'אין בקשות הצטרפות ממתינות'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {searchTerm ? 'נסה לשנות את מונחי החיפוש' : 'כל הבקשות טופלו'}
                                </p>
                            </div>
                        ) : (
                           <div className="overflow-y-auto max-h-full p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
  <div className="space-y-8 p-2">
     {filteredUsers.map((user) => {
      const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`;
      const displayName = user.displayName || "לא ידוע";

      return (
        <div
          key={user.id}
          className="flex flex-col lg:flex-row items-start bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          {/* User Photo */}
          <img
            src={photoURL}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
            }}
          />

          {/* User Info */}
          <div className="flex flex-col flex-1 ml-0 lg:ml-6 mt-4 lg:mt-0 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-200 truncate">
                {displayName}
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap bg-indigo-200 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100`}
              >
                {getRoleDisplay(user.role)}
              </span>
            </div>

            {/* Contact Info */}
            <div className="mt-2 space-y-1 text-sm text-indigo-700 dark:text-indigo-300">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-indigo-500" />
                <span className="truncate">{user.email || "לא סופק"}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-green-500" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-purple-500" />
                <span>הצטרף: {user.createdAt ? formatDate(user.createdAt) : "לא ידוע"}</span>
              </div>
            </div>

            {/* Questionnaire Info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-800 dark:text-indigo-300">
              <InfoItem label="כיצד הגיעו לעמותה" value={user.howDidYouHear} />
              <InfoItem label="רמת מחויבות" value={user.commitmentLevel} />
              <InfoItem label="זיקה לאמנות" value={user.artisticAffinity} />
              <InfoItem label="מטרה כמתנדב" value={user.goalAsVolunteer} />
              <InfoItem label="קשר אמנות-מנהיגות" value={user.artLeadershipConnection} />
              <InfoItem
                label="כישורים / משאבים"
                value={
                  Array.isArray(user.skillsResources) && user.skillsResources.length > 0
                    ? user.skillsResources.join(", ")
                    : "לא הוזן"
                }
              />
              <InfoItem label="תמיכה כספית" value={user.financialSupport} />
              <InfoItem label="תחום פעילות מועדף" value={user.preferredActivityArea} />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col gap-3 w-full sm:w-48">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAcceptUser(user)}
              disabled={processingUserId === user.id}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {processingUserId === user.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <FaCheck />
                  <span>אשר</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRejectUser(user)}
              disabled={processingUserId === user.id}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {processingUserId === user.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <FaTimes />
                  <span>דחה</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      );
    })}
  </div>
</div>

                        )}
                    </div>

                    {/* Footer */}
                    {!isLoading && filteredUsers.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <FaBell className="text-blue-500" />
                                    <span>
                                        סה"כ {filteredUsers.length} בקשות ממתינות לטיפול
                                    </span>
                                </div>
                                <div className="text-xs">
                                    עדכון אחרון: {new Date().toLocaleTimeString('he-IL')}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Role Selection Modal */}
            <AnimatePresence>
                {roleSelectionUser && (
                    <RoleSelectionModal
                        user={roleSelectionUser}
                        onConfirm={handleConfirmAccept}
                        onCancel={() => setRoleSelectionUser(null)}
                        isProcessing={processingUserId === roleSelectionUser.id}
                    />
                )}
            </AnimatePresence>

            {/* Rejection Confirmation Modal */}
            <AnimatePresence>
                {rejectionUser && (
                    <RejectionConfirmationModal
                        user={rejectionUser}
                        onConfirm={handleConfirmReject}
                        onCancel={() => setRejectionUser(null)}
                        isProcessing={processingUserId === rejectionUser.id}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default PendingUsersModal;