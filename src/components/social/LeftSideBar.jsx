// LeftSideBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { meta } from '@eslint/js';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

  // Mentor-specific chats fetch
  useEffect(() => {
    const fetchMentorChats = async () => {
      if (!viewerProfile || viewerProfile.role !== 'mentor') {
        setMentorChats([]);
        return;
      }

      // 1. all_mentors_with_admin
      const q1 = query(
        collection(db, 'conversations'),
        where('communityType', '==', 'all_mentors_with_admin')
      );
      // 2. all_mentors
      const q2 = query(
        collection(db, 'conversations'),
        where('communityType', '==', 'all_mentors')
      );
      // 3. mentor_community (filtered by mentorId)
      const q3 = query(
        collection(db, 'conversations'),
        where('communityType', '==', 'mentor_community'),
        where('mentorId', '==', viewerProfile.uid)
      );
      // Fetch all in parallel
      const [snap1, snap2, snap3] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
        getDocs(q3)
      ]);
      // Collect all mentor chats
      const chats = [];
      snap1.forEach(doc => chats.push({ id: doc.id, ...doc.data(), label: 'כל המנטורים והאדמין' }));
      snap2.forEach(doc => chats.push({ id: doc.id, ...doc.data(), label: 'כל המנטורים' }));
      snap3.forEach(doc => chats.push({ id: doc.id, ...doc.data(), label: 'הקהילה שלך' }));

      setMentorChats(chats);
    };

    fetchMentorChats();
  }, [viewerProfile]);

  const isOwnProfile =
    viewerProfile && profileUser &&
    String(viewerProfile.uid) === String(profileUser.uid);

  let elementSectionTitle = '';
  if (!profileUser) {
    elementSectionTitle = 'עוד מהאלמנט';
  } else if (isOwnProfile) {
    elementSectionTitle = 'עוד מהאלמנט שלך';
  } else {
    // Show username, fallback to 'המשתמש הזה'
    elementSectionTitle = `עוד מהאלמנט של ${profileUser.username || 'המשתמש הזה'}`;
  }

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

        {users && users.length > 0 ? (
          <div className="space-y-1"> {/* Reduced spacing */}
            {users.map((user) => (
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

                {viewerProfile && viewerProfile.uid !== user.id && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onFollowToggle(user.id)}
                    className={`ml-auto mr-1 shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${(viewerProfile.following || []).includes(user.id)
                      ? `bg-${element} text-white hover:bg-${element}-dark`
                      : `border border-${element} text-${element} hover:bg-${element}-soft`
                      }`}
                  >
                    {(viewerProfile.following || []).includes(user.id) ? 'עוקב' : 'עקוב'}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">
            לא נמצאו משתמשים מאותו היסוד
          </p>
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
