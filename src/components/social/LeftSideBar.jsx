// LeftSideBar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { MapPin, MessageSquare } from 'lucide-react';
import AirIcon from '@mui/icons-material/Air';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
// Element icons
const ELEMENT_ICONS = {
  fire: <WhatshotRoundedIcon style={{color: '#fca5a1'}} />,
  water: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} />,
  earth: <SpaRoundedIcon style={{color: '#4ade80'}} />,
  air: <AirIcon style={{ color: '#87ceeb' }} />,
  metal: <ConstructionTwoToneIcon style={{color: '#4b5563'}} />,
};
const ELEMENT_NAMES = {
  fire: 'אש',
  water: 'מים',
  earth: 'אדמה',
  air: 'אוויר',
  metal: 'מתכת',
};

// --- Small reusable components ---

function UserCard({ user, element, onClick, onFollowToggle, viewerProfile }) {
  return (
    <motion.div
      key={user.id}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center justify-between p-2 bg-white hover:bg-${element}-soft rounded-lg shadow-sm`}
    >
      <div
        className="flex items-center gap-3 cursor-pointer flex-grow overflow-hidden"
        onClick={onClick}
        dir="rtl"
      >
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
        />
        <div className="text-right overflow-hidden flex flex-col">
          <p
            className="font-semibold text-gray-800 text-sm truncate max-w-[110px]"
            title={user.username}
            dir="rtl"
          >
            {user.username}
          </p>
          {user.location && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 font-normal truncate max-w-[110px]" dir="rtl">
              <MapPin className="w-3 h-3 text-gray-400" />
              {user.location}
            </span>
          )}
        </div>
      </div>
      {viewerProfile && viewerProfile.uid !== user.id && onFollowToggle && (
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
  );
}

function ChatListItem({ chat, label, onClick, element }) {
  return (
    <motion.div
      key={chat.id}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.13 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-${element}-soft mb-2 border border-${element}-accent`}
      onClick={onClick}
    >
      <span className="font-semibold text-sm">{label}</span>
    </motion.div>
  );
}

function getSectionTitle({ viewerProfile, profileUser, isOwnProfile }) {
  if (viewerProfile && viewerProfile.role === 'admin') return 'משתמשים באתר';
  if (profileUser && profileUser.role === 'mentor') {
    if (viewerProfile && profileUser.uid === viewerProfile.uid) return 'הסטודנטים שלך';
    return `הסטודנטים של ${profileUser.username || 'המשתמש הזה'}`;
  }
  if (!profileUser) return 'עוד מהאלמנט';
  if (isOwnProfile) return 'עוד מהאלמנט שלך';
  return `עוד מהאלמנט של ${profileUser.username || 'המשתמש הזה'}`;
}

// --- Main component ---

const LeftSidebar = ({ element, viewerElement, viewerProfile, profileUser, onFollowToggle }) => {
  const navigate = useNavigate();

  // State
  const [communityChat, setCommunityChat] = useState(null);
  const [mentorChats, setMentorChats] = useState([]);
  const [students, setStudents] = useState([]);
  const [adminRandomUsers, setAdminRandomUsers] = useState([]);
  const [sameElementUsers, setSameElementUsers] = useState([]);
  const [mentorCommunityChat, setMentorCommunityChat] = useState(null);
  const [privateMentorChat, setPrivateMentorChat] = useState(null);

  // --- Users section logic ---
  useEffect(() => {
    // Admin: fetch 5 random profiles (not self/staff)
    if (viewerProfile && viewerProfile.role === 'admin') {
      (async () => {
        const profilesSnap = await getDocs(collection(db, 'profiles'));
        let allProfiles = profilesSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(
            p => p.associated_id !== viewerProfile.uid &&
              p.associated_id !== (profileUser && profileUser.uid) &&
              p.role !== 'staff'
          );
        allProfiles = allProfiles.sort(() => Math.random() - 0.5).slice(0, 5);
        setAdminRandomUsers(allProfiles);
      })();
    } else {
      setAdminRandomUsers([]);
    }
  }, [viewerProfile]);

  useEffect(() => {
    // Mentor: fetch up to 5 student profiles
    if (
      viewerProfile &&
      viewerProfile.role === 'mentor' &&
      Array.isArray(viewerProfile.participants) &&
      viewerProfile.participants.length > 0
    ) {
      (async () => {
        const ids = viewerProfile.participants.slice(0, 5);
        const studentsProfiles = await Promise.all(
          ids.map(async (uid) => {
            const profileSnap = await getDocs(query(collection(db, 'profiles'), where('associated_id', '==', uid)));
            if (!profileSnap.empty) {
              return { id: profileSnap.docs[0].id, ...profileSnap.docs[0].data() };
            }
            return null;
          })
        );
        setStudents(studentsProfiles.filter(Boolean));
      })();
    } else {
      setStudents([]);
    }
  }, [viewerProfile]);

  useEffect(() => {
    // Participant: fetch up to 5 participants from same element (not self)
    if (
      viewerProfile &&
      viewerProfile.role === 'participant' &&
      viewerProfile.element &&
      viewerProfile.uid
    ) {
      (async () => {
        const othersQuery = query(
          collection(db, 'profiles'),
          where('element', '==', viewerProfile.element)
        );
        const othersSnap = await getDocs(othersQuery);
        const others = othersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.associated_id !== viewerProfile.uid && u.associated_id !== (profileUser && profileUser.uid) && u.role === 'participant');
        const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 5);
        setSameElementUsers(shuffled);
      })();
    } else {
      setSameElementUsers([]);
    }
  }, [viewerProfile]);

  // --- Chats logic ---

  // Element community chat
  useEffect(() => {
    if (!viewerElement) return;
    (async () => {
      const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'community'),
        where('element', '==', viewerElement)
      );
      const snap = await getDocs(q);
      if (!snap.empty) setCommunityChat({ id: snap.docs[0].id, ...snap.docs[0].data() });
    })();
  }, [viewerElement]);

  // Mentor-specific chats (for mentor & admin)
  useEffect(() => {
    if (!viewerProfile || (viewerProfile.role !== 'mentor' && viewerProfile.role !== 'admin')) {
      setMentorChats([]);
      return;
    }
    (async () => {
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
      const q3 = viewerProfile.role === 'mentor'
        ? query(
          collection(db, 'conversations'),
          where('communityType', '==', 'mentor_community'),
          where('mentorId', '==', viewerProfile.uid)
        )
        : null;
      // Fetch all in parallel
      const [snap1, snap2, snap3] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
        q3 ? getDocs(q3) : Promise.resolve({ empty: true, forEach: () => { }, docs: [] })
      ]);
      // Collect all mentor chats
      const chats = [];
      snap1.forEach(doc => chats.push({ id: doc.id, ...doc.data(), label: 'כל המנחים והאדמין' }));
      snap2.forEach(doc => chats.push({ id: doc.id, ...doc.data(), label: 'כל המנחים' }));
      snap3.forEach && snap3.forEach(doc => chats.push({ id: doc.id, ...doc.data(), label: 'הקהילה שלך' }));

      setMentorChats(chats);
    })();
  }, [viewerProfile]);

  // Participant: fetch mentor community chat & private chat with mentor
  useEffect(() => {
    if (!viewerProfile || viewerProfile.role !== 'participant' || !viewerProfile.mentorId) {
      setMentorCommunityChat(null);
      setPrivateMentorChat(null);
      return;
    }
    // Mentor community chat
    (async () => {
      const q = query(
        collection(db, 'conversations'),
        where('communityType', '==', 'mentor_community'),
        where('mentorId', '==', viewerProfile.mentorId)
      );
      const snap = await getDocs(q);
      setMentorCommunityChat(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    })();
    // Private chat with mentor
    (async () => {
      const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', viewerProfile.uid)
      );
      const snap = await getDocs(q);
      // Filter for a chat that includes both the student and their mentor
      const chat = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(chat =>
          Array.isArray(chat.participants) &&
          chat.participants.includes(viewerProfile.mentorId)
        );
      setPrivateMentorChat(chat || null);
    })();
  }, [viewerProfile]);

  // Helper: are we viewing our own profile?
  const isOwnProfile =
    viewerProfile && profileUser &&
    String(viewerProfile.uid) === String(profileUser.uid);

  // Section title
  const elementSectionTitle = getSectionTitle({ viewerProfile, profileUser, isOwnProfile });

  // Which users to show in the top section?
  let usersToShow = [];
  if (viewerProfile?.role === 'admin') usersToShow = adminRandomUsers;
  else if (viewerProfile?.role === 'mentor') usersToShow = students;
  else if (viewerProfile?.role === 'participant') usersToShow = sameElementUsers;

  return (
    <div className="w-90 h-[calc(100vh-56.8px)] bg-white shadow-lg overflow-y-auto">
      <div className="p-6">
        {/* Section Title */}
        <div className="mb-4 text-right flex items-center justify-between">
          <div>
            <p className={`text-${element} text-xl mb-1 flex items-center gap-2`}>
              {elementSectionTitle}
              <span className="text-lg">{ELEMENT_ICONS[element]}</span>
            </p>
            <div className={`w-12 h-0.5 bg-${element} rounded-full ml-auto`} />
          </div>
        </div>
        {/* User list */}
        {usersToShow && usersToShow.length > 0 ? (
          <div className="space-y-1">
            {usersToShow.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                element={element}
                onClick={() => navigate(`/profile/${user.username}`)}
                onFollowToggle={onFollowToggle}
                viewerProfile={viewerProfile}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">
            {viewerProfile?.role === 'mentor'
              ? 'לא נמצאו סטודנטים משויכים למנחה זה'
              : viewerProfile?.role === 'participant'
                ? 'לא נמצאו משתמשים מאותו אלמנט'
                : 'לא נמצאו משתמשים'}
          </p>
        )}

        {/* Chats Section Title */}
        <div className="mt-8 mb-2 text-right">
          <p className={`text-${element} text-xl mb-1 flex items-center gap-2`}>
            צ'אטים
            <MessageSquare className={`w-5 h-5 text-${element}`} />
          </p>
          <div className={`w-12 h-0.5 bg-${element} rounded-full ml-auto`} />
        </div>
        {/* Chats (role-based) */}
        {/* Participant */}
        {viewerProfile?.role === 'participant' && (
          <>
            {/* Element community chat */}
            {communityChat && (
              <ChatListItem
                chat={communityChat}
                label={
                  <>
                    צ'אט קהילתי
                    <span className="text-lg mr-2">{ELEMENT_ICONS[viewerElement]}</span>
                  </>
                }
                onClick={() => setTimeout(() => navigate(`/chat/${communityChat.id}`), 300)}
                element={element}
              />
            )}
            {/* Mentor community chat */}
            {mentorCommunityChat && (
              <ChatListItem
                chat={mentorCommunityChat}
                label="צ'אט קבוצתי של המנחה"
                onClick={() => setTimeout(() => navigate(`/chat/${mentorCommunityChat.id}`), 300)}
                element={element}
              />
            )}
            {/* Private chat with mentor */}
            {privateMentorChat && (
              <ChatListItem
                chat={privateMentorChat}
                label="צ'אט פרטי עם המנחה"
                onClick={() => setTimeout(() => navigate(`/chat/${privateMentorChat.id}`), 300)}
                element={element}
              />
            )}
          </>
        )}

        {/* Mentor */}
        {viewerProfile?.role === 'mentor' && (
          mentorChats.length > 0 && (
            <div className="space-y-2">
              {mentorChats.map(chat => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  label={chat.label}
                  onClick={() => setTimeout(() => navigate(`/chat/${chat.id}`), 300)}
                  element={element}
                />
              ))}
            </div>
          )
        )}

        {/* Admin */}
        {viewerProfile?.role === 'admin' && mentorChats.length > 0 && (
          <div className="space-y-2">
            {mentorChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                label={chat.label}
                onClick={() => setTimeout(() => navigate(`/chat/${chat.id}`), 300)}
                element={element}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
