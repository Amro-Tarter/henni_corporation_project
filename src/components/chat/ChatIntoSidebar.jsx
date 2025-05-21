import React, { useState, useEffect } from 'react';
import { doc, getDoc, query, getDocs, collection, where, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { ELEMENT_COLORS } from './utils/ELEMENT_COLORS';
import { useNavigate } from "react-router-dom";

export default function ChatInfoSidebar({ open, onClose, conversation, currentUser, messages, elementColors, setSelectedConversation }) {
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
  // Local optimistic state for participants
  const [localParticipants, setLocalParticipants] = useState(conversation.participants || []);
  // Group avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [liveAvatarURL, setLiveAvatarURL] = useState(null);
  const [userAvatars, setUserAvatars] = useState({});
  const [usernamesLoading, setUsernamesLoading] = useState(false);

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
        setUsernamesLoading(true);
        Promise.all(
          memberUids.map(uid =>
            getDoc(doc(db, 'profiles', uid)).then(docSnap =>
              [uid, docSnap.exists() ? docSnap.data().username : uid]
            )
          )
        ).then(entries => setUsernames(Object.fromEntries(entries)));
        setUsernamesLoading(false);
      }
    }
  }, [open, conversation.participants]);

  useEffect(() => {
    if (open && conversation.type === 'group') {
      const memberUids = conversation.participants || [];
      if (memberUids.length > 0) {
        setUsernamesLoading(true);
        Promise.all(
          memberUids.map(uid =>
            getDoc(doc(db, 'profiles', uid)).then(docSnap => [
              uid,
              docSnap.exists() ? docSnap.data().username : uid,
              docSnap.exists() ? docSnap.data().element : null,
              docSnap.exists() ? docSnap.data().photoURL : null
            ])
          )
        ).then(entries => {
          setUsernames(Object.fromEntries(entries.map(([uid, username]) => [uid, username])));
          setUserElements(Object.fromEntries(entries.map(([uid, _, element]) => [uid, element])));
          setUserAvatars(Object.fromEntries(entries.map(([uid, _, __, photoURL]) => [uid, photoURL])));
          setUsernamesLoading(false);
        });
      }
    }
  }, [open, conversation, conversation.participants]);

  // Sync localParticipants to conversation.participants when it changes
  useEffect(() => {
    setLocalParticipants(conversation.participants || []);
  }, [conversation.participants]);

  // Real-time listener for group avatar
  useEffect(() => {
    if (open && conversation.type === 'group' && conversation.id) {
      const groupRef = doc(db, 'conversations', conversation.id);
      const unsubscribe = (async () => {
        const { onSnapshot } = await import('firebase/firestore');
        return onSnapshot(groupRef, (docSnap) => {
          if (docSnap.exists()) {
            setLiveAvatarURL(docSnap.data().avatarURL || null);
          }
        });
      })();
      return () => {
        Promise.resolve(unsubscribe).then(unsub => typeof unsub === 'function' && unsub());
      };
    }
  }, [open, conversation.type, conversation.id]);

  const handleAnimationEnd = () => {
    if (!open) setIsMounted(false);
  };

  const handleOpenDirectChat = async (partnerUid) => {
    // 1. Check if a direct conversation exists between currentUser.uid and partnerUid
    // 2. If exists, get its ID; if not, create it and get its ID
    // 3. Select the conversation using setSelectedConversation
    const participants = [currentUser.uid, partnerUid].sort();
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid),
      where("type", "==", "direct")
    );
    const convSnapshot = await getDocs(q);
    let conversationId = null;
    let conversationData = null;
    convSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.participants.includes(partnerUid)) {
        conversationId = docSnap.id;
        conversationData = { id: docSnap.id, ...data };
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
      // Fetch the new conversation data
      const newDoc = await getDoc(convoRef);
      conversationData = { id: newDoc.id, ...newDoc.data() };
      
      // Fetch partner's username and profile pic
      const userDocRef = doc(db, "users", partnerUid);
      const partnerDoc = await getDoc(userDocRef);
      let partnerProfilePic = null;
      try {
        const profileDocRef = doc(db, "profiles", partnerUid);
        const profileDoc = await getDoc(profileDocRef);
        if (profileDoc.exists()) {
          partnerProfilePic = profileDoc.data().photoURL || null;
        }
      } catch (e) {
        partnerProfilePic = null;
      }
      
      // Update conversation with participant names
      await updateDoc(convoRef, {
        participantNames: [
          currentUser.username,
          partnerDoc.exists() ? partnerDoc.data().username : "Unknown"
        ]
      });
      
      // Update the conversation data with the additional info
      conversationData = {
        ...conversationData,
        participantNames: [
          currentUser.username,
          partnerDoc.exists() ? partnerDoc.data().username : "Unknown"
        ],
        partnerProfilePic
      };
    }
    
    // Close the sidebar and navigate to the conversation
    onClose();
    setSelectedConversation(conversationData);
  };

  // Handler for group avatar upload
  const handleGroupAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      // Upload to Firebase Storage
      const storage = (await import('firebase/storage')).getStorage();
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      const groupRef = ref(storage, `group_avatars/${conversation.id}.jpg`);
      await uploadBytesResumable(groupRef, file);
      const url = await getDownloadURL(groupRef);
      // Update Firestore
      await updateDoc(doc(db, 'conversations', conversation.id), { avatarURL: url });
      setAvatarPreview(null);
    } catch (e) {
      alert('שגיאה בהעלאת תמונת קבוצה');
    }
    setIsUploadingAvatar(false);
  };

  // Handler to delete all messages in a direct conversation
  const handleDeleteAllMessages = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את כל ההודעות בצ׳אט זה? פעולה זו אינה הפיכה!')) return;
    try {
      const messagesRef = collection(db, 'conversations', conversation.id, 'messages');
      const snapshot = await getDocs(messagesRef);
      const batchSize = 500;
      let batch = [];
      for (const docSnap of snapshot.docs) {
        batch.push(docSnap.ref);
        if (batch.length === batchSize) {
          await Promise.all(batch.map(ref => deleteDoc(ref)));
          batch = [];
        }
      }
      if (batch.length > 0) {
        await Promise.all(batch.map(ref => deleteDoc(ref)));
      }
      // Reset lastMessage and lastUpdated in the conversation document
      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessage: null,
        lastUpdated: serverTimestamp(),
      });
      window.toast && window.toast.success && window.toast.success('כל ההודעות נמחקו בהצלחה!');
      alert('כל ההודעות נמחקו בהצלחה!');
    } catch (e) {
      alert('שגיאה במחיקת הודעות: ' + e.message);
    }
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
          shadow-2xl z-40 flex flex-col p-6 pt-16 border-r overflow-y-auto
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
            {usernamesLoading
              ? memberUids.map(uid => (
                  <div key={uid} className="flex items-center gap-2 justify-between w-full animate-pulse">
                    <div className="flex-1 min-w-0">
                      <div
                        className="px-3 py-1 rounded-full bg-gray-200 text-sm text-left truncate"
                        style={{ width: '120px', display: 'inline-block', minHeight: 20 }}
                      >
                        &nbsp;
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-gray-200 block" />
                    </div>
                  </div>
                ))
              : memberUids.map(uid => (
                  <div key={uid} className="flex items-center gap-2 justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <div
                        className="px-3 py-1 rounded-full transition text-sm text-left truncate"
                        style={{ backgroundColor: elementColors.primary, color: elementColors.light, width: '120px', display: 'inline-block' }}
                      >
                        {usernames[uid] || ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {userElements && userElements[uid] && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                          {ELEMENT_COLORS[userElements[uid]]?.icon}
                          {userElements[uid]}
                        </span>
                      )}
                      {uid !== currentUser.uid && (
                        <>
                          <a
                            href={`/profile/${usernames[uid]}`}
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
                        </>
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

  // GROUP CHAT INFO
  if (conversation.type === 'group') {
    const groupName = conversation.name || 'קבוצת צ׳אט';
    const memberUids = localParticipants;
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
        if (localParticipants.includes(user.id)) {
          setIsAdding(false);
          return;
        }
        await updateDoc(groupRef, {
          participants: arrayUnion(user.id),
          participantNames: arrayUnion(user.username)
        });
        setLocalParticipants(prev => [...prev, user.id]);
        setUsernames(prev => ({ ...prev, [user.id]: user.username }));
        await addDoc(collection(db, "conversations", conversation.id, "messages"), {
          text: `${currentUser.username} הוסיף את ${user.username} לקבוצה`,
          type: "system",
          createdAt: serverTimestamp(),
        });
        // System message for the added user
        await addDoc(collection(db, "conversations", conversation.id, "messages"), {
          text: `${currentUser.username} הוסיף אותך לקבוצה (${groupName})`,
          type: "system",
          createdAt: serverTimestamp(),
        });
        // Update unread for all participants except the actor
        const groupSnap = await getDoc(groupRef);
        const groupData = groupSnap.data();
        const unreadUpdate = {};
        (groupData.participants || []).forEach(uid => {
          if (uid !== currentUser.uid) {
            unreadUpdate[`unread.${uid}`] = (groupData.unread?.[uid] || 0) + 1;
          }
        });
        await updateDoc(groupRef, unreadUpdate);
        setAddUserSearch("");
        setAddUserResults([]);
        window.toast && window.toast.success && window.toast.success(`המשתמש ${user.username} נוסף בהצלחה!`);
      } catch (e) {
        alert("שגיאה בהוספת משתמש: " + e.message);
      }
      setIsAdding(false);
    };

    // Kick member handler with confirmation
    const handleKickMember = async (uid) => {
      if (uid === adminUid) return;
      const username = usernames[uid] || uid;
      if (!window.confirm(`האם אתה בטוח שברצונך להסיר את ${username} מהקבוצה?`)) return;
      try {
        const groupRef = doc(db, "conversations", conversation.id);
        const userDoc = await getDoc(doc(db, "users", uid));
        const latestUsername = userDoc.exists() ? userDoc.data().username : username;
        // System message for the kicked user (before removal)
        await addDoc(collection(db, "conversations", conversation.id, "messages"), {
          text: `${currentUser.username} הסיר אותך מהקבוצה (${groupName})`,
          type: "system",
          createdAt: serverTimestamp(),
        });
        // Set unread for the kicked user for their personal message (before removal)
        const kickedUserUnread = {};
        kickedUserUnread[`unread.${uid}`] = 1;
        await updateDoc(groupRef, kickedUserUnread);
        // Now remove the user from participants and participantNames
        await updateDoc(groupRef, {
          participants: arrayRemove(uid),
          participantNames: arrayRemove(latestUsername)
        });
        setLocalParticipants(prev => prev.filter(id => id !== uid));
        setUsernames(prev => {
          const copy = { ...prev };
          delete copy[uid];
          return copy;
        });
        await addDoc(collection(db, "conversations", conversation.id, "messages"), {
          text: `${currentUser.username} הסיר את ${latestUsername} מהקבוצה`,
          type: "system",
          createdAt: serverTimestamp(),
        });
        // Update unread for all remaining participants except the actor
        const groupSnap = await getDoc(groupRef);
        const groupData = groupSnap.data();
        const unreadUpdate = {};
        (groupData.participants || []).forEach(uid2 => {
          if (uid2 !== currentUser.uid) {
            unreadUpdate[`unread.${uid2}`] = (groupData.unread?.[uid2] || 0) + 1;
          }
        });
        await updateDoc(groupRef, unreadUpdate);
        window.toast && window.toast.success && window.toast.success(`המשתמש ${latestUsername} הוסר בהצלחה!`);
      } catch (e) {
        alert("שגיאה בהרחקת משתמש: " + e.message);
      }
    };

    // Leave group handler for non-admins
    const handleLeaveGroup = async () => {
      if (!window.confirm('האם אתה בטוח שברצונך לעזוב את הקבוצה?')) return;
      try {
        const groupRef = doc(db, "conversations", conversation.id);
        // Remove user from participants and participantNames
        await updateDoc(groupRef, {
          participants: arrayRemove(currentUser.uid),
          participantNames: arrayRemove(currentUser.username)
        });
        setLocalParticipants(prev => prev.filter(id => id !== currentUser.uid));
        setUsernames(prev => {
          const copy = { ...prev };
          delete copy[currentUser.uid];
          return copy;
        });
        await addDoc(collection(db, "conversations", conversation.id, "messages"), {
          text: `${currentUser.username} עזב/ה את הקבוצה`,
          type: "system",
          createdAt: serverTimestamp(),
        });
        // Update unread for all remaining participants except the actor
        const groupSnap = await getDoc(groupRef);
        const groupData = groupSnap.data();
        const unreadUpdate = {};
        (groupData.participants || []).forEach(uid => {
          if (uid !== currentUser.uid) {
            unreadUpdate[`unread.${uid}`] = (groupData.unread?.[uid] || 0) + 1;
          }
        });
        await updateDoc(groupRef, unreadUpdate);
        window.toast && window.toast.success && window.toast.success('עזבת את הקבוצה בהצלחה!');
        // Optionally close sidebar or redirect
        onClose && onClose();
        setSelectedConversation && setSelectedConversation(null);
      } catch (e) {
        alert("שגיאה בעזיבת קבוצה: " + e.message);
      }
    };

    return (
      <div
        className={`fixed left-0 top-16 mt-0.5 bottom-0
          w-80 max-w-full sm:w-96 sm:max-w-md
          shadow-2xl z-40 flex flex-col p-6 pt-16 border-r overflow-y-auto
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
          aria-label="סגור סיידבר"
        >
          ✕
        </button>
        {/* Group Avatar and Name (for group chats) */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={avatarPreview || liveAvatarURL || conversation.avatarURL || '/default_group_avatar.jpg'}
              alt={conversation.groupName || 'קבוצה'}
              className="w-20 h-20 rounded-full object-cover border-4 mb-2"
              style={{ borderColor: elementColors.primary, backgroundColor: elementColors.light }}
            />
            {/* Only admin can change group avatar */}
            {currentUser.uid === conversation.admin && (
              <label className="absolute bottom-0 right-0 bg-white bg-opacity-80 rounded-full p-1 cursor-pointer shadow hover:bg-opacity-100 transition" title="שנה תמונת קבוצה">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGroupAvatarChange}
                  disabled={isUploadingAvatar}
                />
                {isUploadingAvatar ? (
                  <span className="w-6 h-6 flex items-center justify-center animate-spin">🔄</span>
                ) : (
                  <span className="w-6 h-6 flex items-center justify-center">📷</span>
                )}
              </label>
            )}
          </div>
          <div className="font-semibold text-gray-800 text-lg mb-2" style={{ color: elementColors.primary }}>{conversation.groupName}</div>
        </div>
        <div className="text-gray-500 text-sm -mt-6 mb-4 text-center">מספר חברים: {memberUids.length}</div>
        {/* Admin badge */}
        <div className="mb-3 text-xs text-gray-500 text-center">מנהל: {usernames[adminUid] || adminUid} <span className="ml-1 px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded-full">Admin</span></div>
        {/* Add member UI (admin only) */}
        {isAdmin && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">הוסף חבר:</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                value={addUserSearch}
                onChange={async (e) => {
                  setAddUserSearch(e.target.value);
                  if (!e.target.value.trim()) {
                    setAddUserResults([]);
                    return;
                  }
                  const q = query(
                    collection(db, "users"),
                    where("username", ">=", e.target.value),
                    where("username", "<=", e.target.value + "\uf8ff"),
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
                aria-label="חפש משתמשים להוספה"
                disabled={isAdding}
              />
              {isAdding && (
                <div className="absolute left-2 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                </div>
              )}
              {addUserResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto transition-all">
                  {addUserResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-primary-100 cursor-pointer text-right flex items-center gap-2 transition-all"
                      onClick={() => handleAddMember(user)}
                      tabIndex={0}
                      aria-label={`הוסף את ${user.username}`}
                    >
                      {user.photoURL && (
                        <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-primary-200" />
                      )}
                      <span className="font-medium">{user.username}</span>
                      <span className="ml-auto text-primary-500 font-bold text-lg">+</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Members List */}
        <div className="mb-8">
          <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-lg">👥</span> חברי הקבוצה
          </div>
          <div className="flex flex-col gap-3 max-h-56 overflow-y-auto transition-all">
            {usernamesLoading
              ? memberUids.map(uid => (
                  <div key={uid} className="flex items-center gap-3 bg-white rounded-lg shadow p-2 transition-all border border-gray-100 animate-pulse">
                    <span className="w-9 h-9 rounded-full bg-gray-200 block" style={{ minWidth: 36 }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate flex items-center gap-1">
                        <span className="w-20 h-4 rounded bg-gray-200 block" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-200 mt-0.5">
                        <span className="w-10 h-3 rounded bg-gray-200 block" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-gray-200 block" />
                    </div>
                  </div>
                ))
              : memberUids.map(uid => (
                  <div key={uid} className="flex items-center gap-3 bg-white rounded-lg shadow p-2 transition-all border border-gray-100 hover:shadow-md">
                    <img
                      src={userAvatars[uid] || '/default_user_pic.jpg'}
                      alt={usernames[uid] || ''}
                      className="w-9 h-9 rounded-full object-cover border border-primary-100 bg-gray-100"
                      style={{ minWidth: 36 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate flex items-center gap-1">
                        {usernames[uid] || ''}
                        {uid === currentUser.uid && <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">אתה</span>}
                        {uid === adminUid && <span className="ml-1 px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded-full text-xs">מנהל</span>}
                      </div>
                      {userElements && userElements[uid] && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          {ELEMENT_COLORS[userElements[uid]]?.icon}
                          {userElements[uid]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {uid !== currentUser.uid && (
                        <>
                          <button
                            className="p-1 rounded-full hover:bg-gray-200 transition"
                            title="מעבר לפרופיל"
                            aria-label="מעבר לפרופיל"
                            onClick={() => window.open(`/profile/${usernames[uid]}`, '_blank')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" />
                            </svg>
                          </button>
                          <button
                            className="p-1 rounded-full hover:bg-green-100 transition text-green-600"
                            title="פתח צ'אט"
                            aria-label="פתח צ'אט"
                            onClick={() => handleOpenDirectChat(uid)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 15.75a6.375 6.375 0 100-12.75 6.375 6.375 0 000 12.75zM15.75 15.75v-1.125a3.375 3.375 0 00-3.375-3.375H8.625a3.375 3.375 0 00-3.375 3.375V15.75" />
                            </svg>
                          </button>
                        </>
                      )}
                      {isAdmin && uid !== adminUid && (
                        <button
                          className="p-1 rounded-full hover:bg-red-100 transition text-red-600"
                          title="הסר מהקבוצה"
                          aria-label={`הסר את ${usernames[uid] || ''} מהקבוצה`}
                          onClick={() => handleKickMember(uid)}
                          disabled={isAdding}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            {memberUids.length === 0 && (
              <div className="text-gray-400 text-center py-4">אין חברים בקבוצה.</div>
            )}
          </div>
        </div>
        {/* Leave Group Button for non-admins */}
        {!isAdmin && (
          <div className="mb-6 flex justify-center">
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition font-bold"
              onClick={handleLeaveGroup}
              disabled={isAdding}
            >
              עזוב קבוצה
            </button>
          </div>
        )}
        {/* Images Gallery */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-lg">🖼️</span> תמונות שנשלחו
          </div>
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
  const partnerName = conversation.participantNames.find((name) => name !== currentUser.username) || 'Unknown';
  const partnerProfilePic = conversation.partnerProfilePic;
  const mentorName = currentUser.mentorName;

  // All images sent in the conversation
  const images = messages.filter(m => m.mediaType === 'image' && m.mediaURL);
  const imagesToShow = showAllImages ? images : images.slice(0, 6);

  return (
    <div 
      className={`fixed left-0 top-16 mt-0.5 bottom-0
        w-80 max-w-full sm:w-96 sm:max-w-md
        shadow-2xl z-40 flex flex-col p-6 pt-16 border-r overflow-y-auto
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
          href={`/profile/${partnerName}`}
          className="px-4 py-1 rounded transition"
          style={{ backgroundColor: elementColors.primary, color: elementColors.light }}
        >
          מעבר לפרופיל
        </a>
        <div className="text-gray-500 mt-1 text-sm">סוג האלמנט: {partnerElement || '...'} {ELEMENT_COLORS[partnerElement]?.icon}</div>
        {partnerName === mentorName && (
          <div className="text-gray-500 mt-1 text-sm">מנטור שלך</div>
        )}
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