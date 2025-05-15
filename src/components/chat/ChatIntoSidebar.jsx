import React, { useState, useEffect } from 'react';
import { doc, getDoc, query, getDocs, collection, where, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { ELEMENT_COLORS } from './utils/ELEMENT_COLORS';
import { useNavigate } from "react-router-dom";

export default function ChatInfoSidebar({ open, onClose, conversation, currentUser, messages, elementColors }) {
  const [showAllImages, setShowAllImages] = useState(false);
  const [partnerElement, setPartnerElement] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [usernames, setUsernames] = useState({});
  const [userElements, setUserElements] = useState({});
  const [addUserSearch, setAddUserSearch] = useState("");
  const [addUserResults, setAddUserResults] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setTimeout(() => setShouldShow(true), 10);
    } else {
      setShouldShow(false);
      setShowAllImages(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && conversation.type === 'direct') {
      const partnerUid = conversation.participants.find((p) => p !== currentUser.uid);
      if (partnerUid) {
        getDoc(doc(db, 'users', partnerUid)).then((docSnap) => {
          if (docSnap.exists()) {
            setPartnerElement(docSnap.data().element || 'לא ידוע');
          } else {
            setPartnerElement('לא ידוע');
          }
        });
      }
    }
  }, [open, conversation, currentUser.uid]);

  useEffect(() => {
    if (open && conversation.type === 'community') {
      const memberUids = conversation.participants || [];
      if (memberUids.length > 0) {
        Promise.all(
          memberUids.map(uid =>
            getDoc(doc(db, 'users', uid)).then(docSnap =>
              [uid, docSnap.exists() ? docSnap.data().username : uid]
            )
          )
        ).then(entries => setUsernames(Object.fromEntries(entries)));
      }
    }
  }, [open, conversation.participants]);

  useEffect(() => {
    if (open && conversation.type === 'group') {
      const memberUids = conversation.participants || [];
      if (memberUids.length > 0) {
        Promise.all(
          memberUids.map(uid =>
            getDoc(doc(db, 'users', uid)).then(docSnap => [
              uid,
              docSnap.exists() ? docSnap.data().username : uid,
              docSnap.exists() ? docSnap.data().element : null
            ])
          )
        ).then(entries => {
          setUsernames(Object.fromEntries(entries.map(([uid, username]) => [uid, username])));
          setUserElements(Object.fromEntries(entries.map(([uid, _, element]) => [uid, element])));
        });
      }
    }
  }, [open, conversation, conversation.participants]);

  const handleAnimationEnd = () => {
    if (!open) setIsMounted(false);
  };

  const handleOpenDirectChat = async (partnerUid) => {
    // 1. Check if a direct conversation exists between currentUser.uid and partnerUid
    // 2. If exists, get its ID; if not, create it and get its ID
    // 3. Navigate to /chat/{conversationId}

    // Example Firestore query (pseudo-code, adapt as needed):
    const participants = [currentUser.uid, partnerUid].sort();
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid),
      where("type", "==", "direct")
    );
    const convSnapshot = await getDocs(q);
    let conversationId = null;
    convSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(partnerUid)) {
        conversationId = doc.id;
      }
    });
    if (!conversationId) {
      // Create new conversation
      const convoRef = await addDoc(collection(db, "conversations"), {
        participants,
        type: "direct",
        lastMessage: "",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      conversationId = convoRef.id;
    }
    navigate(`/chat/${conversationId}`);
  };

  if (!isMounted) return null;

  // Only for community chats
  if (conversation.type === 'community') {
    const element = conversation.element;
    const icon = ELEMENT_COLORS[element]?.icon;
    const memberUids = conversation.participants || [];
    const memberNames = conversation.participantNames || [];
    // All images sent in the conversation
    const images = messages.filter(m => m.mediaType === 'image' && m.mediaURL);
    const imagesToShow = showAllImages ? images : images.slice(0, 6);
    return (
      <div
        className={`fixed left-0 top-16 mt-0.5 bottom-0
          w-80 max-w-full sm:w-96 sm:max-w-md
          shadow-2xl z-50 flex flex-col p-6 pt-16 border-r overflow-y-auto
          transition-all duration-300
          ${shouldShow ? 'translate-x-0' : '-translate-x-full'}
          `}
        style={{
          backgroundColor: elementColors.light,
          borderRight: `2px solid ${elementColors.primary}`
        }}
        onTransitionEnd={handleAnimationEnd}
      >
        <button
          className="absolute top-4 left-6 px-3.5 py-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          style={{ color: elementColors.primary }}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
        <div className="font-bold text-lg right-6 px-3.5 py-2 -mt-12" style={{ color: elementColors.primary }}>
          {icon && <span className="text-2xl mr-2">{icon}</span>}
          {element ? `${element} Community` : 'Community'}
        </div>
        <div className="text-gray-500 text-sm mb-4">מספר חברים: {memberUids.length}</div>
        {/* Members List */}
        <div className="mb-6">
          <div className="font-semibold text-gray-700 mb-2">חברי הקהילה</div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {memberUids.map(uid => (
              <div key={uid} className="flex items-center gap-2 justify-between w-full">
                <div className="flex-1 min-w-0">
                  <div
                    className="px-3 py-1 rounded-full transition text-sm text-left truncate"
                    style={{ backgroundColor: elementColors.primary, color: elementColors.light, width: '120px', display: 'inline-block' }}
                  >
                    {usernames[uid] || uid}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {userElements && userElements[uid] && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                      {ELEMENT_COLORS[userElements[uid]]?.icon}
                      {userElements[uid]}
                    </span>
                  )}
                  <a
                    href={`/profile/${uid}`}
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                    title="מעבר לפרופיל"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" />
                    </svg>
                  </a>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                    title="פתח צ'אט"
                    onClick={() => handleOpenDirectChat(uid)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 15.75a6.375 6.375 0 100-12.75 6.375 6.375 0 000 12.75zM15.75 15.75v-1.125a3.375 3.375 0 00-3.375-3.375H8.625a3.375 3.375 0 00-3.375 3.375V15.75" />
                    </svg>
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Images Gallery */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">תמונות שנשלחו</div>
          {images.length === 0 ? (
            <div className="text-gray-400 text-sm">לא נשלחו תמונות בצ'אט זה.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {imagesToShow.map(img => (
                  <a
                    key={img.id}
                    href={img.mediaURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={img.mediaURL}
                      alt="תמונה בצ'אט"
                      className="w-full h-20 object-cover rounded shadow"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
              {images.length > 6 && (
                <button
                  className="mt-2 hover:underline text-sm"
                  onClick={() => setShowAllImages(v => !v)}
                  style={{ color: elementColors.primary }}
                >
                  {showAllImages ? '<< הצג פחות' : 'הצג עוד >>'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // GROUP CHAT INFO
  if (conversation.type === 'group') {
    const groupName = conversation.name || 'קבוצת צ׳אט';
    const memberUids = conversation.participants || [];
    const adminUid = conversation.admin;
    const isAdmin = currentUser.uid === adminUid;
    // All images sent in the conversation
    const images = messages.filter(m => m.mediaType === 'image' && m.mediaURL);
    const imagesToShow = showAllImages ? images : images.slice(0, 6);

    // Add member handler
    const handleAddMember = async (user) => {
      setIsAdding(true);
      try {
        const groupRef = doc(db, "conversations", conversation.id);
        await updateDoc(groupRef, {
          participants: arrayUnion(user.id),
          participantNames: arrayUnion(user.username)
        });
        setAddUserSearch("");
        setAddUserResults([]);
      } catch (e) {
        alert("שגיאה בהוספת משתמש: " + e.message);
      }
      setIsAdding(false);
    };

    // Kick member handler
    const handleKickMember = async (uid) => {
      if (uid === adminUid) return;
      try {
        const groupRef = doc(db, "conversations", conversation.id);
        const username = usernames[uid] || uid;
        await updateDoc(groupRef, {
          participants: arrayRemove(uid),
          participantNames: arrayRemove(username)
        });
      } catch (e) {
        alert("שגיאה בהרחקת משתמש: " + e.message);
      }
    };

    return (
      <div
        className={`fixed left-0 top-16 mt-0.5 bottom-0
          w-80 max-w-full sm:w-96 sm:max-w-md
          shadow-2xl z-50 flex flex-col p-6 pt-16 border-r overflow-y-auto
          transition-all duration-300
          ${shouldShow ? 'translate-x-0' : '-translate-x-full'}
          `}
        style={{
          backgroundColor: elementColors.light,
          borderRight: `2px solid ${elementColors.primary}`
        }}
        onTransitionEnd={handleAnimationEnd}
      >
        <button
          className="absolute top-4 left-6 px-3.5 py-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          style={{ color: elementColors.primary }}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
        <div className="font-bold text-lg right-6 px-3.5 py-2 -mt-12" style={{ color: elementColors.primary }}>
          {groupName}
        </div>
        <div className="text-gray-500 text-sm mb-4">מספר חברים: {memberUids.length}</div>
        {/* Admin badge */}
        <div className="mb-2 text-xs text-gray-500">מנהל: {usernames[adminUid] || adminUid} <span className="ml-1 px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded-full">Admin</span></div>
        {/* Add member UI (admin only) */}
        {isAdmin && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">הוסף חבר:</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-right"
              value={addUserSearch}
              onChange={async (e) => {
                setAddUserSearch(e.target.value);
                if (!e.target.value.trim()) {
                  setAddUserResults([]);
                  return;
                }
                const q = query(
                  collection(db, "users"),
                  where("username", ">=", e.target.value.toLowerCase()),
                  where("username", "<=", e.target.value.toLowerCase() + "\uf8ff"),
                  // Don't show users already in group
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs
                  .filter(doc => doc.id !== adminUid && !memberUids.includes(doc.id))
                  .map(doc => ({
                    id: doc.id,
                    username: doc.data().username,
                    photoURL: doc.data().photoURL
                  }));
                setAddUserResults(results);
              }}
              placeholder="חפש משתמשים"
            />
            {addUserResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {addUserResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-right flex items-center gap-2"
                    onClick={() => handleAddMember(user)}
                  >
                    {user.photoURL && (
                      <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    )}
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Members List */}
        <div className="mb-6">
          <div className="font-semibold text-gray-700 mb-2">חברי הקבוצה</div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {memberUids.map(uid => (
              <div key={uid} className="flex items-center gap-2 justify-between w-full">
                <div className="flex-1 min-w-0">
                  <div
                    className="px-3 py-1 rounded transition text-sm text-left truncate"
                    style={{ backgroundColor: elementColors.primary, color: elementColors.light, width: '120px', display: 'inline-block' }}
                  >
                    {usernames[uid] || uid}
                    {uid === adminUid && <span className="ml-1 text-yellow-300">★</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`/profile/${uid}`}
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                    title="מעבר לפרופיל"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" />
                    </svg>
                  </a>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                    title="פתח צ'אט"
                    onClick={() => handleOpenDirectChat(uid)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 15.75a6.375 6.375 0 100-12.75 6.375 6.375 0 000 12.75zM15.75 15.75v-1.125a3.375 3.375 0 00-3.375-3.375H8.625a3.375 3.375 0 00-3.375 3.375V15.75" />
                    </svg>
                  </button>
                  {/* Kick button (admin only, not for admin) */}
                  {isAdmin && uid !== adminUid && (
                    <button
                      className="p-1 rounded-full hover:bg-red-100 transition text-red-600"
                      title="הסר מהקבוצה"
                      onClick={() => handleKickMember(uid)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Images Gallery */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">תמונות שנשלחו</div>
          {images.length === 0 ? (
            <div className="text-gray-400 text-sm">לא נשלחו תמונות בצ'אט זה.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {imagesToShow.map(img => (
                  <a
                    key={img.id}
                    href={img.mediaURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={img.mediaURL}
                      alt="תמונה בצ'אט"
                      className="w-full h-20 object-cover rounded shadow"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
              {images.length > 6 && (
                <button
                  className="mt-2 hover:underline text-sm"
                  onClick={() => setShowAllImages(v => !v)}
                  style={{ color: elementColors.primary }}
                >
                  {showAllImages ? '<< הצג פחות' : 'הצג עוד >>'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Get partner UID and name
  const partnerUid = conversation.participants.find((p) => p !== currentUser.uid);
  const partnerName = conversation.participantNames.find((name) => name !== currentUser.username) || 'Unknown';
  const partnerProfilePic = conversation.partnerProfilePic;

  // All images sent in the conversation
  const images = messages.filter(m => m.mediaType === 'image' && m.mediaURL);
  const imagesToShow = showAllImages ? images : images.slice(0, 6);

  return (
    <div 
      className={`fixed left-0 top-16 mt-0.5 bottom-0
        w-80 max-w-full sm:w-96 sm:max-w-md
        shadow-2xl z-50 flex flex-col p-6 pt-16 border-r overflow-y-auto
        transition-all duration-300
        ${shouldShow ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
            backgroundColor: 'white',
            borderRight: `2px solid ${elementColors.primary}`
          }}
      onTransitionEnd={handleAnimationEnd}
    >
      <button 
        className="absolute top-4 left-6 px-3.5 py-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
        style={{ color: elementColors.primary }}
        onClick={onClose}
        aria-label="Close sidebar"
      >
        ✕
      </button>
      <div className="font-bold text-lg right-6 px-3.5 py-2 -mt-12" style={{ color: elementColors.primary }}>פרטי צ'אט</div>
      {/* Partner Picture and Name */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={partnerProfilePic || '/default_user_pic.jpg'}
          alt={partnerName}
          className="w-20 h-20 rounded-full object-cover border-4 mb-2"
          style={{ borderColor: elementColors.primary, backgroundColor: elementColors.light }}
        />
        <div className="font-semibold text-gray-800 text-lg mb-2" style={{ color: elementColors.primary }}>{partnerName}</div>
        <a
          href={`/profile/${partnerUid}`}
          className="px-4 py-1 rounded transition"
          style={{ backgroundColor: elementColors.primary, color: elementColors.light }}
        >
          מעבר לפרופיל
        </a>
        <div className="text-gray-500 mt-1 text-sm">סוג האלמנט: {partnerElement || '...'} {ELEMENT_COLORS[partnerElement]?.icon}</div>
      </div>
      {/* Images Gallery */}
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-2">תמונות שנשלחו</div>
        {images.length === 0 ? (
          <div className="text-gray-400 text-sm">לא נשלחו תמונות בצ'אט זה.</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {imagesToShow.map(img => (
                <a
                  key={img.id}
                  href={img.mediaURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={img.mediaURL}
                    alt="תמונה בצ'אט"
                    className="w-full h-20 object-cover rounded shadow"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
            {images.length > 6 && (
              <button
                className="mt-2 hover:underline text-sm"
                onClick={() => setShowAllImages(v => !v)}
                style={{ color: elementColors.primary }}
              >
                {showAllImages ? '<< הצג פחות' : 'הצג עוד >>'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}