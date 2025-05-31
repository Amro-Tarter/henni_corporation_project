// LeftSideBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig'
import { MapPin, MessageSquare} from 'lucide-react';

const ELEMENT_ICONS = {
  fire: '🔥',
  water: '💧',
  earth: '🌱',
  air: '💨',
  metal: '⚙️',
};

const ELEMENT_NAMES = {
  fire: 'אש',
  water: 'מים',
  earth: 'אדמה',
  air: 'אוויר',
  metal: 'מתכת',
};

const LeftSidebar = ({ element, viewerElement, users = [], viewerProfile, profileUser, onFollowToggle }) => {
  const navigate = useNavigate();
  const [communityChat, setCommunityChat] = useState(null);
  const [mentorChats, setMentorChats] = useState([]);
  const [enrichedUsers, setEnrichedUsers] = useState([]);

  // Fetch community chat
  useEffect(() => {
    if (!viewerElement) return;
    const fetchCommunityChat = async () => {
      const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'community'),
        where('element', '==', viewerElement)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setCommunityChat({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    };
    fetchCommunityChat();
  }, [viewerElement]);

  // Enrich users with their complete profile data
  useEffect(() => {
    const enrichUsers = async () => {
      if (!users.length) return;

      const enrichedData = await Promise.all(users.map(async (user) => {
        try {
          // Fetch user doc for role and element
          const userDoc = await getDoc(doc(db, 'users', user.id));
          const userData = userDoc.exists() ? userDoc.data() : {};

          // Fetch profile for additional data
          const profileDoc = await getDoc(doc(db, 'profiles', user.id));
          const profileData = profileDoc.exists() ? profileDoc.data() : {};

          return {
            ...user,
            ...profileData,
            role: userData.role,
            element: userData.element,
          };
        } catch (error) {
          console.error('Error enriching user data:', error);
          return user;
        }
      }));

      setEnrichedUsers(enrichedData);
    };

    enrichUsers();
  }, [users]);

  // Mentor-specific chats fetch
  useEffect(() => {
    const fetchMentorChats = async () => {
      if (!viewerProfile || viewerProfile.role !== 'mentor') {
        setMentorChats([]);
        return;
      }

      const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'mentor_chat'),
        where('mentorId', '==', viewerProfile.uid)
      );
      const snap = await getDocs(q);
      setMentorChats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchMentorChats();
  }, [viewerProfile]);

  const elementSectionTitle = viewerProfile?.uid === profileUser?.uid
    ? 'משתמשים מהיסוד שלך'
    : `משתמשי ${ELEMENT_NAMES[element] || 'אדמה'}`;

  return (
    <div className="w-64 h-[calc(100vh-56.8px)] bg-white shadow-lg overflow-y-auto">
      <div className="p-6">
        <div className="mb-4 text-right flex items-center justify-between">
          <div>
            <h2 className={`text-${element} text-lg mb-1 flex items-center gap-2`}>
              {elementSectionTitle}
              <span className="text-lg">{ELEMENT_ICONS[element]}</span>
            </h2>
            <div className={`w-12 h-0.5 bg-${element} rounded-full ml-auto`} />
          </div>
        </div>

        {enrichedUsers && enrichedUsers.length > 0 ? (
          <div className="space-y-1">
            {enrichedUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between p-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-grow overflow-hidden"
                  onClick={() => navigate(`/profile/${user.username}`)}
                >
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                  />
                  <div className="text-right overflow-hidden flex flex-col">
                    <h3
                      className="font-semibold text-gray-800 text-sm truncate max-w-[110px]"
                      title={user.username}
                      dir="rtl"
                    >
                      {user.username}
                    </h3>
                    {user.location && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-normal truncate max-w-[110px]" dir="rtl">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {user.location}
                      </span>
                    )}
                  </div>
                </div>

                {viewerProfile?.uid !== user.id && (
                  <button
                    onClick={() => onFollowToggle(user.id)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors shrink-0
                      ${viewerProfile?.following?.includes(user.id)
                        ? `bg-${element} text-white hover:bg-${element}-dark`
                        : `text-${element} border border-${element} hover:bg-${element}-soft`
                      }`}
                  >
                    {viewerProfile?.following?.includes(user.id) ? 'עוקב' : 'עקוב'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            לא נמצאו משתמשים מהיסוד הזה
          </div>
        )}

        {/* Chats Section Title */}
        <div className="mt-8 mb-2 text-right">
          <h2 className={`text-${element} text-lg mb-1 flex items-center gap-2`}>
            צ'אטים
            <MessageSquare className={`w-5 h-5 text-${element}`} />
          </h2>
          <div className={`w-10 h-0.5 bg-${element} rounded-full ml-auto`} />
        </div>
        {/* Main community chat */}
        {communityChat && (
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-${element}-soft mb-2 border border-${element}-accent`}
            onClick={() => setTimeout(() => navigate(`/chat/${communityChat.id}`), 300)}
          >
            <span className={`font-semibold text-sm`}>
              צ'אט קהילתי
              <span className="text-lg">{ELEMENT_ICONS[viewerElement]}</span>
            </span>
          </motion.div>
        )}
        {/* Mentor chats */}
        {mentorChats.length > 0 && (
          <div className="space-y-2">
            {mentorChats.map(chat => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.13 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-${element}-soft mb-2 border border-${element}-accent`}
                onClick={() => setTimeout(() => navigate(`/chat/${chat.id}`), 300)}
              >
                <span className="font-semibold text-sm">
                  {chat.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
