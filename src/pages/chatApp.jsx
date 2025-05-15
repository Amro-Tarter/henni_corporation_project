import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { 
  collection, 
  doc, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  where, 
  getDocs, 
  writeBatch,
  setDoc,
  getDoc,
  arrayUnion,
  limit
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL, getStorage, ref as storageRef } from "firebase/storage";
import { auth, db, storage } from "../config/firbaseConfig";
import ConversationList from "../components/chat/ConversationList";
import ChatArea from "../components/chat/ChatArea";
import Navbar from '../components/social/Navbar';
import Sidebar from "../components/chat/sidebar";
import ElementalLoader from '../theme/ElementalLoader';
import { getChatPartner } from "../components/chat/utils/chatHelpers";
import { useFileUpload } from "../components/chat/hooks/useFileUpload";
import { ELEMENT_COLORS } from '../components/chat/utils/ELEMENT_COLORS';
import { useParams, useNavigate } from "react-router-dom";

export default function ChatApp() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  // --- State ---
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState({ uid: null, username: '', element: '' });
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAvatars, setUserAvatars] = useState({});
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupUserSearch, setGroupUserSearch] = useState("");
  const [groupUserResults, setGroupUserResults] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  // File upload state/logic (moved to hook)
  const {
    file,
    preview,
    handleFileChange,
    removeFile
  } = useFileUpload();


  // --- User Search (for new chat dialog) ---
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const q = query(
        collection(db, "users"),
        where("username", ">=", searchTerm.toLowerCase()),
        where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .filter(doc => doc.id !== currentUser.uid)
        .map(doc => ({
          id: doc.id,
          username: doc.data().username,
          photoURL: doc.data().photoURL
        }));
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePartnerSearch = (value) => {
    setPartnerName(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  // --- Auth and User Initialization ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userElement = userDoc.data().element;
          const userData = {
            uid: user.uid,
            username: userDoc.data().username,
            element: userElement
          };
          setCurrentUser(userData);
          // Ensure user is in their community
          const community = await handleCommunityChatMembership(user.uid, userElement);
          if (community) setSelectedConversation(false);
          setAuthInitialized(true);
        } catch (error) {
          console.error("Error loading user:", error);
        }
      } else {
        setAuthInitialized(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Conversation Filtering ---
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    if (activeTab === "private") {
      filtered = filtered.filter(conv => conv.type === "direct");
    } else if (activeTab === "group") {
      filtered = filtered.filter(conv => conv.type === "group");
    } else if (activeTab === "community") {
      filtered = filtered.filter(conv =>
        conv.type === "community" &&
        conv.element === currentUser.element?.toLowerCase()
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.participantNames?.some(name =>
          name !== currentUser.username &&
          name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    return filtered;
  }, [conversations, searchQuery, activeTab, currentUser.element]);

  // --- Load Conversations ---
  useEffect(() => {
    if (!currentUser.uid) return;
    setIsLoadingConversations(true);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("lastUpdated", "desc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const validConversations = [];
      for (const conversationDoc of snapshot.docs) {
        try {
          const data = conversationDoc.data();
          const base = {
            id: conversationDoc.id,
            ...data,
            lastUpdated: data.lastUpdated?.toDate(),
            createdAt: data.createdAt?.toDate()
          };
          if (data.type === "community") {
            validConversations.push({
              ...base,
              participantNames: [`${data.element} Community`]
            });
            continue;
          }
          if (data.type === "direct") {
            const partnerUid = data.participants?.find(p => p !== currentUser.uid);
            if (!partnerUid) continue;
            // Fetch partner's username from users, and photoURL from profiles
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
            validConversations.push({
              ...base,
              participantNames: [
                currentUser.username,
                partnerDoc.exists() ? partnerDoc.data().username : "Unknown"
              ],
              partnerProfilePic
            });
            continue;
          }
          if (data.type === "group") {
            validConversations.push({
              ...base,
              participantNames: data.participantNames,
              groupName: data.name,
              admin: data.admin
            });
            continue;
          }
          // Add other types here
        } catch (error) {
          console.error("Error processing conversation:", error);
        }
      }
      setConversations(validConversations);
      setIsLoadingConversations(false);
    });
    return () => unsubscribe();
  }, [currentUser.uid]);

  // Utility to fetch a user's profile picture (Firestore, then Storage fallback)
  async function fetchUserAvatar(uid) {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', uid));
      let photoURL = null;
      if (profileDoc.exists()) {
        photoURL = profileDoc.data().photoURL || null;
      }
      if (!photoURL) {
        try {
          const storage = getStorage();
          const ref = storageRef(storage, `profiles/${uid}/profile.jpg`);
          photoURL = await getDownloadURL(ref);
        } catch (e) {
          photoURL = null;
        }
      }
      return photoURL;
    } catch (e) {
      return null;
    }
  }

  // --- Load Messages for Selected Conversation ---
  useEffect(() => {
    if (!selectedConversation) return;
    setIsLoadingMessages(true);
    const q = query(
      collection(db, "conversations", selectedConversation.id, "messages"),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        duration: doc.data().duration || 0,
        createdAt: doc.data().createdAt?.toDate() 
      }));
      setMessages(msgs);
      setIsLoadingMessages(false);

      // Build a set of unique sender UIDs (including currentUser)
      const senderUids = new Set(msgs.map(m => m.sender));
      senderUids.add(currentUser.uid);
      // For direct chats, add partner UID
      if (selectedConversation.type === 'direct') {
        const partnerUid = selectedConversation.participants.find(p => p !== currentUser.uid);
        if (partnerUid) senderUids.add(partnerUid);
      }
      // Fetch avatars for all senders
      const avatarEntries = await Promise.all(
        Array.from(senderUids).map(async uid => [uid, await fetchUserAvatar(uid)])
      );
      setUserAvatars(Object.fromEntries(avatarEntries));
    });
    return () => unsubscribe();
  }, [selectedConversation?.id, currentUser.uid]);

  // --- Send Message (handles text and file/image) ---
  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !selectedConversation || isSending || isUploading) {
      return;
    }
    const messageToSend = newMessage;
    setNewMessage("");
    removeFile();
    setUploadProgress(0);
    setIsSending(true);
    try {
      let messageData = {
        sender: currentUser.uid,
        senderName: currentUser.username,
        createdAt: serverTimestamp(),
      };
      if (file) {
        setIsUploading(true);
        const storageRef = ref(
          storage,
          `messages/${selectedConversation.id}/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: { uploadedBy: currentUser.uid }
        });
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            setUploadProgress(0);
            throw error;
          }
        );
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        messageData = {
          ...messageData,
          mediaURL: downloadURL,
          mediaType: file.type.startsWith('image/') ? 'image' : 'unknown',
          fileName: file.name,
          fileSize: file.size
        };
      } else {
        messageData.text = messageToSend;
      }
      // Optimistic update (optional)
      const tempMessageId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempMessageId,
        ...messageData,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, optimisticMessage]);
      // Batched writes
      const batch = writeBatch(db);
      const messagesRef = collection(db, "conversations", selectedConversation.id, "messages");
      const newMessageRef = doc(messagesRef);
      batch.set(newMessageRef, messageData);
      const conversationRef = doc(db, "conversations", selectedConversation.id);
      batch.update(conversationRef, {
        lastMessage: file ? (file.type.startsWith('image/') ? 'Sent an image' : 'Sent a voice message') : messageToSend,
        lastUpdated: serverTimestamp(),
      });
      await batch.commit();
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageToSend);
      alert(`Message failed: ${error.message}`);
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  // --- Create New Conversation ---
  const createNewConversation = async () => {
    const partnerUsername = partnerName.trim();
    if (!partnerUsername) return;
    try {
      const usersRef = collection(db, "users");
      const userQuery = query(
        usersRef, 
        where("username", "==", partnerUsername)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        alert("User does not exist");
        return;
      }
      const partner = userSnapshot.docs[0];
      const partnerUid = partner.id;
      if (partnerUid === currentUser.uid) {
        alert("You cannot message yourself");
        return;
      }
      const participants = [currentUser.uid, partnerUid].sort();
      const existingConversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", currentUser.uid),
        where("type", "==", "direct")
      );
      const convSnapshot = await getDocs(existingConversationsQuery);
      const existingConversation = convSnapshot.docs.find(doc => {
        const convParticipants = doc.data().participants;
        return convParticipants.includes(partnerUid);
      });
      if (existingConversation) {
        setSelectedConversation({
          id: existingConversation.id,
          ...existingConversation.data(),
          lastUpdated: existingConversation.data().lastUpdated?.toDate(),
          createdAt: existingConversation.data().createdAt?.toDate()
        });
        setShowNewChatDialog(false);
        setPartnerName("");
        return;
      }
      const batch = writeBatch(db);
      const convoRef = doc(collection(db, "conversations"));
      const convoData = {
        participants: participants,
        participantNames: [currentUser.username, partner.data().username],
        type: "direct",
        lastMessage: "",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      batch.set(convoRef, convoData);
      await batch.commit();
      const newConvo = await getDoc(convoRef);
      setSelectedConversation({ 
        id: newConvo.id,
        ...newConvo.data(),
        lastUpdated: newConvo.data().lastUpdated?.toDate(),
        createdAt: newConvo.data().createdAt?.toDate()
      });
      setShowNewChatDialog(false);
      setPartnerName("");
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert(`Error creating conversation: ${error.message}`);
    }
  };

  // --- Community Chat Membership ---
  const handleCommunityChatMembership = async (userId, userElement) => {
    try {
      const normalizedElement = userElement.toLowerCase();
      const userDoc = await getDoc(doc(db, "users", userId));
      const username = userDoc.data().username;
      // 1. Find all community conversations the user is currently in
      const allCommunitiesQuery = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("participants", "array-contains", userId)
      );
      const allCommunitiesSnapshot = await getDocs(allCommunitiesQuery);
      // 2. Remove user from all communities except the new one
      for (const communityDoc of allCommunitiesSnapshot.docs) {
        const data = communityDoc.data();
        if (data.element !== normalizedElement) {
          await updateDoc(communityDoc.ref, {
            participants: data.participants.filter((id) => id !== userId),
            participantNames: data.participantNames.filter((name) => name !== username),
            lastMessage: `${username} left the community`
          });
          await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
            text: `${username} left the community`,
            type: "system",
            createdAt: serverTimestamp(),
          });
        }
      }
      // 3. Find or create the new community for the user's current element
      const q = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("element", "==", normalizedElement)
      );
      const querySnapshot = await getDocs(q);
      let communityDoc;
      if (querySnapshot.empty) {
        // No community exists for this element → create it
        const newCommunityRef = doc(collection(db, "conversations"));
        await setDoc(newCommunityRef, {
          participants: [userId],
          participantNames: [username],
          type: "community",
          element: normalizedElement,
          lastMessage: "Community created!",
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "conversations", newCommunityRef.id, "messages"), {
          text: "Community created! Welcome!",
          type: "system",
          createdAt: serverTimestamp(),
        });
        communityDoc = await getDoc(newCommunityRef);
      } else {
        // A community already exists — use the first one
        communityDoc = querySnapshot.docs[0];
        const data = communityDoc.data();
        if (!data.participants.includes(userId)) {
          await updateDoc(communityDoc.ref, {
            participants: arrayUnion(userId),
            participantNames: arrayUnion(username),
            lastMessage: `${username} joined the community`
          });
          await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
            text: `${username} joined the community`,
            type: "system",
            createdAt: serverTimestamp(),
          });
        }
      }
      return {
        id: communityDoc.id,
        ...communityDoc.data(),
        lastUpdated: communityDoc.data().lastUpdated?.toDate(),
        createdAt: communityDoc.data().createdAt?.toDate(),
      };
    } catch (error) {
      console.error("Error handling community chat:", error);
    }
  };

  // Load conversation by chatId from URL
  useEffect(() => {
    if (!chatId || !currentUser.uid) return;
    const fetchConversation = async () => {
      const convoDoc = await getDoc(doc(db, "conversations", chatId));
      if (convoDoc.exists()) {
        setSelectedConversation({
          id: convoDoc.id,
          ...convoDoc.data(),
          lastUpdated: convoDoc.data().lastUpdated?.toDate(),
          createdAt: convoDoc.data().createdAt?.toDate()
        });
      } else {
        setSelectedConversation(null);
      }
    };
    fetchConversation();
  }, [chatId, currentUser.uid]);

  // When a conversation is selected, navigate to /chat/:chatId
  const handleSelectConversation = (conv) => {
    if (!conv) {
      setSelectedConversation(null);
      navigate(`/chat`);
      return;
    }
    setSelectedConversation(conv);
    navigate(`/chat/${conv.id}`);
  };

  if (!authInitialized) {
    return <ElementalLoader />;
  }

  const elementColors = ELEMENT_COLORS[currentUser.element];
  const userElement = currentUser.element;


  return (
    <div id='messenger' className="flex h-screen">
      <Navbar element={userElement}/>
      <Sidebar 
        elementColors={elementColors}
        userElement={userElement}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      <ConversationList
        currentUser={currentUser}
        conversations={conversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={handleSelectConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredConversations={filteredConversations}
        isLoadingConversations={isLoadingConversations}
        setShowNewChatDialog={setShowNewChatDialog}
        setShowNewGroupDialog={setShowNewGroupDialog}
        getChatPartner={(participants, type, element, _unused, _unused2, groupName) => getChatPartner(participants, type, element, currentUser, conversations, groupName)}
        elementColorsMap={ELEMENT_COLORS}
        activeTab={activeTab}
      />
      <ChatArea
        selectedConversation={selectedConversation}
        currentUser={currentUser}  // FIXED: correct prop name
        messages={messages}  // FIXED: missing value for messages prop
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isSending={isSending}
        isLoadingMessages={isLoadingMessages}
        setShowNewChatDialog={setShowNewChatDialog}
        getChatPartner={(participants, type, element, _unused, _unused2, groupName) => getChatPartner(participants, type, element, currentUser, conversations, groupName)}
        file={file}
        preview={preview}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        elementColors={elementColors}
        userAvatars={userAvatars}
        activeTab={activeTab}
        setShowNewGroupDialog={setShowNewGroupDialog}
        conversations={conversations}
      />
      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 text-right relative" dir="rtl">
            <h3 className="text-lg font-bold mb-4">צ'אט חדש</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">שם השותף:</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded text-right"
                  value={partnerName}
                  onChange={(e) => handlePartnerSearch(e.target.value)}
                  placeholder="הזן שם"
                />
                {isSearching && (
                  <div className="absolute left-2 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-right flex items-center gap-2"
                        onClick={() => {
                          setPartnerName(user.username);
                          setSelectedUser(user);
                          setSearchResults([]);
                        }}
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
            </div>
            <div className="flex gap-2">
              <button
                className='px-4 py-2 text-white rounded-lg hover:scale-105 disabled:opacity-50'
                onClick={createNewConversation}
                disabled={!selectedUser}
                style={{ 
                  backgroundColor: elementColors.primary
                }}
              >
                צור
              </button>
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-200"
                onClick={() => {
                  setShowNewChatDialog(false);
                  setSearchResults([]);
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
      {showNewGroupDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 text-right relative" dir="rtl">
            <h3 className="text-lg font-bold mb-4">קבוצה חדשה</h3>
            <div className="mb-4">
              
              <label className="block text-sm font-medium mb-2">שם הקבוצה:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-right mb-2"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="הזן שם קבוצה"
              />
              <label className="block text-sm font-medium mb-2 mt-2">הוסף חברים:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-right"
                value={groupUserSearch}
                onChange={async (e) => {
                  setGroupUserSearch(e.target.value);
                  if (!e.target.value.trim()) {
                    setGroupUserResults([]);
                    return;
                  }
                  setIsSearching(true);
                  const q = query(
                    collection(db, "users"),
                    where("username", ">=", e.target.value.toLowerCase()),
                    where("username", "<=", e.target.value.toLowerCase() + "\uf8ff"),
                    limit(5)
                  );
                  const snapshot = await getDocs(q);
                  const results = snapshot.docs
                    .filter(doc => doc.id !== currentUser.uid && !selectedGroupUsers.some(u => u.id === doc.id))
                    .map(doc => ({
                      id: doc.id,
                      username: doc.data().username,
                      photoURL: doc.data().photoURL
                    }));
                  setGroupUserResults(results);
                  setIsSearching(false);
                }}
                placeholder="חפש משתמשים"
              />
              {isSearching && (
                <div className="absolute left-2 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
              )}
              {groupUserResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {groupUserResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-right flex items-center gap-2"
                      onClick={() => {
                        setSelectedGroupUsers([...selectedGroupUsers, user]);
                        setGroupUserResults([]);
                        setGroupUserSearch("");
                      }}
                    >
                      {user.photoURL && (
                        <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span>{user.username}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedGroupUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGroupUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full">
                      {user.username}
                      <button className="ml-1 text-red-500" onClick={() => setSelectedGroupUsers(selectedGroupUsers.filter(u => u.id !== user.id))}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className='px-4 py-2 text-white rounded-lg hover:scale-105 disabled:opacity-50'
                onClick={async () => {
                  if (!groupName.trim()) return;
                  try {
                    const batch = writeBatch(db);
                    const groupRef = doc(collection(db, "conversations"));
                    const adminUid = currentUser.uid;
                    const participants = [adminUid, ...selectedGroupUsers.map(u => u.id)];
                    const participantNames = [currentUser.username, ...selectedGroupUsers.map(u => u.username)];
                    const groupData = {
                      type: "group",
                      name: groupName.trim(),
                      admin: adminUid,
                      participants,
                      participantNames,
                      lastMessage: "",
                      lastUpdated: serverTimestamp(),
                      createdAt: serverTimestamp(),
                    };
                    batch.set(groupRef, groupData);
                    await batch.commit();
                    const newGroupDoc = await getDoc(groupRef);
                    setSelectedConversation({
                      id: newGroupDoc.id,
                      ...newGroupDoc.data(),
                      lastUpdated: newGroupDoc.data().lastUpdated?.toDate(),
                      createdAt: newGroupDoc.data().createdAt?.toDate()
                    });
                    setShowNewGroupDialog(false);
                    setGroupName("");
                    setGroupUserSearch("");
                    setGroupUserResults([]);
                    setSelectedGroupUsers([]);
                  } catch (error) {
                    alert("שגיאה ביצירת קבוצה: " + error.message);
                  }
                }}
                disabled={!groupName.trim()}
                style={{ backgroundColor: elementColors.primary }}
              >
                צור קבוצה
              </button>
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-200"
                onClick={() => {
                  setShowNewGroupDialog(false);
                  setGroupName("");
                  setGroupUserSearch("");
                  setGroupUserResults([]);
                  setSelectedGroupUsers([]);
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}