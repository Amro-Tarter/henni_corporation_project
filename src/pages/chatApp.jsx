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
  limit,
  deleteDoc,
  increment
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
import { badWords } from "../components/chat/utils/badWords";
import { ThemeProvider } from '../theme/ThemeProvider.jsx'; // Use correct path
import notificationSound from '../assets/notification.mp3';

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
  const [lastReadUpdated, setLastReadUpdated] = useState({});
  const searchTimeoutRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAvatars, setUserAvatars] = useState({});
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupUserSearch, setGroupUserSearch] = useState("");
  const [groupUserResults, setGroupUserResults] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [pendingSelectedConversationId, setPendingSelectedConversationId] = useState(null);
  const [groupAvatarFile, setGroupAvatarFile] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState(null);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const messagesEndRef = useRef(null);

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
      // Get all users and filter client-side for better search
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const results = snapshot.docs
        .filter(doc => {
          const username = doc.data().username || '';
          return doc.id !== currentUser.uid && 
                 username.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  doc.data().role !== 'staff'; // Exclude staff users
        })
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
          const userRole = userDoc.data().role;
          const associated_id = userDoc.data().associated_id;
          const userData = {
            uid: user.uid,
            username: userDoc.data().username,
            element: userElement || "staff",
            role: userRole,
            associated_id,
            mentorName: userDoc.data().mentorName,
          };
          setCurrentUser(userData);
          // Ensure user is in their element community
          const community = await handleCommunityChatMembership(user.uid, userElement);
          // Ensure mentor community logic
          await handleMentorCommunityMembership(user.uid, userRole, userDoc.data().mentorName, userDoc.data().username);
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
    if (currentUser.role === 'staff') {
      // Staff sees all conversations
      return conversations;
    }
    let filtered = conversations;
    if (activeTab === "private") {
      filtered = filtered.filter(conv => conv.type === "direct");
    } else if (activeTab === "group") {
      filtered = filtered.filter(conv => conv.type === "group");
    } else if (activeTab === "community") {
      // Show both element and mentor communities, but can be grouped in UI
      filtered = filtered.filter(conv =>
        conv.type === "community" &&
        (
          (!conv.communityType || conv.communityType === "element") ||
          conv.communityType === "mentor_community"
        )
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
  }, [conversations, searchQuery, activeTab, currentUser.element, currentUser.role]);

  // --- Load Conversations ---
  useEffect(() => {
    if (!currentUser.uid) return;
    setIsLoadingConversations(true);
    let q;
    if (currentUser.role === 'staff') {
      // Staff: get all conversations
      q = query(
        collection(db, "conversations"),
        orderBy("lastUpdated", "desc")
      );
    } else {
      // Regular users: only their conversations
      q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", currentUser.uid),
        orderBy("lastUpdated", "desc")
      );
    }
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
          if (data.type === "community" && data.communityType === "mentor_community") {
            validConversations.push({
              ...base,
              mentorName: data.mentorName,
              participantNames: data.participantNames,
              participants: data.participants,
              communityType: data.communityType,
              displayName: data.mentorName ? `קהילה של ${data.mentorName}` : 'קהילת מנטור',
            });
            continue;
          } else if (data.type === "community" && (!data.communityType || data.communityType === "element")) {
            validConversations.push({
              ...base,
              participantNames: [`${data.element} Community`],
              communityType: data.communityType,
              displayName: data.element ? `${data.element} Community` : 'Community',
            });
            continue;
          }
          if (data.type === "direct") {
            // Use existing participantNames and fetch profile pic
            const partnerUid = data.participants.find(uid => uid !== currentUser.uid);
            let partnerProfilePic = null;
            
            try {
              const profileDoc = await getDoc(doc(db, 'profiles', partnerUid));
              if (profileDoc.exists()) {
                partnerProfilePic = profileDoc.data().photoURL || null;
              }
            } catch (e) {
              console.error('Error fetching partner profile:', e);
            }
            
            if (data.participantNames?.length === 2) {
              validConversations.push({
                ...base,
                participantNames: data.participantNames,
                partnerProfilePic
              });
              continue;
            }

            // If participantNames not available, fetch user data and update
            try {
              const participants = await Promise.all(
                data.participants.map(async uid => {
                  const userDoc = await getDoc(doc(db, "users", uid));
                  return userDoc.data()?.username || uid;
                })
              );

              // Update conversation with participant names
              await updateDoc(doc(db, "conversations", data.id), {
                participantNames: participants
              });

              validConversations.push({
                ...base,
                participantNames: participants
              });
            } catch (error) {
              console.error("Error fetching participant names:", error);
              // Fallback to using UIDs if fetch fails
              validConversations.push({
                ...base,
                participantNames: data.participants
              });
            }
            continue;
          }
          if (data.type === "group") {
            validConversations.push({
              ...base,
              participantNames: data.participantNames,
              groupName: data.name,
              admin: data.admin,
              avatarURL: data.avatarURL || null
            });
            continue;
          }
          if (data.type === "mentor_community") {
            validConversations.push({
              ...base,
              mentorName: data.mentorName,
              participantNames: data.participantNames,
              participants: data.participants,
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
  // Utility to fetch a user's profile picture with caching and loaders
  async function fetchUserAvatar(uid) {
    try {
      // Check if we already have it cached
      if (userAvatars[uid]) {
        return userAvatars[uid];
      }

      // Try to get from profiles collection first
      const profileDoc = await getDoc(doc(db, 'profiles', uid));
      let photoURL = null;
      if (profileDoc.exists()) {
        photoURL = profileDoc.data().photoURL || null;
      }

      // Cache the result
      setUserAvatars(prev => ({
        ...prev,
        [uid]: photoURL || '/default_user_pic.jpg'
      }));

      return photoURL || '/default_user_pic.jpg';
    } catch (e) {
      console.error("Error fetching avatar:", e);
      return '/default_user_pic.jpg';
    }
  }

  // --- Load Messages for Selected Conversation ---
  useEffect(() => {
    if (!selectedConversation || !selectedConversation.id) return;
    setIsLoadingMessages(true);
    
    // Create a query to get messages for the selected conversation
    const q = query(
      collection(db, "conversations", selectedConversation.id, "messages"),
      orderBy("createdAt")
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Map the message documents to message objects with formatted dates
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        duration: doc.data().duration || 0,
        createdAt: doc.data().createdAt?.toDate() 
      }));
      
      setMessages(msgs);
      setIsLoadingMessages(false);      // Build a set of unique sender UIDs (including currentUser)
      const senderUids = new Set(msgs.map(m => m.sender));
      senderUids.add(currentUser.uid);
      
      // Add all participants for group/community chats
      if (selectedConversation.participants) {
        selectedConversation.participants.forEach(uid => senderUids.add(uid));
      }
      
      // Fetch avatars for all senders and participants
      const avatarEntries = await Promise.all(
        Array.from(senderUids).map(async uid => [uid, await fetchUserAvatar(uid)])
      );
      
      // Update avatar cache
      const newAvatars = Object.fromEntries(avatarEntries);
      setUserAvatars(prev => ({
        ...prev,
        ...newAvatars
      }));
    });
    
    return () => unsubscribe();
  }, [selectedConversation?.id, currentUser.uid]);

  // --- Send Message (handles text and file/image/voice) ---
  const sendMessage = async (opts = {}) => {
    if (currentUser.role === 'staff') return; // Staff cannot send
    // Support: opts.fileOverride, opts.mediaTypeOverride
    const fileToSend = opts.fileOverride || file;
    const mediaTypeOverride = opts.mediaTypeOverride;
    
    // Modified condition to allow voice messages
    if ((!newMessage.trim() && !fileToSend && !opts.fileOverride) || !selectedConversation || isSending) {
      return;
    }

    // Clear input and file immediately for fast UX
    const messageToSend = newMessage;
    setNewMessage("");
    removeFile();
    setUploadProgress(0);

    // Bad words filter (only for text messages)
    if (!fileToSend && messageToSend.trim()) {
      const lowerMsg = messageToSend.toLowerCase();
      if (badWords.some(word => word && lowerMsg.includes(word.toLowerCase()))) {
        alert('ההודעה שלך מכילה מילים אסורות. אנא נסח מחדש.');
        return;
      }
    }

    // Create optimistic message immediately
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      sender: currentUser.uid,
      senderName: currentUser.username,
      text: !fileToSend ? messageToSend : '',
      createdAt: new Date(),
      ...(opts.durationOverride && { duration: opts.durationOverride })
    };

    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      let messageData = {
        sender: currentUser.uid,
        senderName: currentUser.username,
        createdAt: serverTimestamp(),
        ...(opts.durationOverride && { duration: opts.durationOverride })
      };

      // Handle file upload if present
      if (fileToSend) {
        setIsUploading(true);
        const storageRef = ref(
          storage,
          `messages/${selectedConversation.id}/${Date.now()}_${fileToSend.name}`
        );
        
        const uploadTask = uploadBytesResumable(storageRef, fileToSend);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          null,
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            messageData = {
              ...messageData,
              mediaURL: downloadURL,
              mediaType: mediaTypeOverride || (fileToSend.type.startsWith('image/') ? 'image' : fileToSend.type.startsWith('audio/') ? 'audio' : 'unknown'),
              fileName: fileToSend.name,
              fileSize: fileToSend.size
            };
            
            await finalizeMessageSend(messageData, optimisticId);
            setIsUploading(false);
          }
        );
      } else {
        messageData.text = messageToSend;
        await finalizeMessageSend(messageData, optimisticId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
      alert(`Message failed: ${error.message}`);
    }
  };

  // Helper function to finalize message sending
  const finalizeMessageSend = async (messageData, optimisticId) => {
    const conversationRef = doc(db, "conversations", selectedConversation.id);
    const messagesRef = collection(conversationRef, "messages");

    // Send the message first
    const messageRef = await addDoc(messagesRef, messageData);

    // Update conversation metadata separately
    const lastMessageText = messageData.mediaType ? 
      (messageData.mediaType === 'audio' ? 'Sent a voice message' : 
       messageData.mediaType === 'image' ? 'Sent an image' : 'Sent a file') : 
      messageData.text;

    const unreadUpdate = {};
    selectedConversation.participants.forEach(uid => {
      if (uid !== currentUser.uid) {
        unreadUpdate[`unread.${uid}`] = increment(1);
      }
    });

    await updateDoc(conversationRef, {
      lastMessage: lastMessageText,
      lastUpdated: serverTimestamp(),
      ...unreadUpdate
    });

    // Remove optimistic message and set final message
    setMessages(prev => prev.map(msg => 
      msg.id === optimisticId ? { ...messageData, id: messageRef.id } : msg
    ));
    
    setIsSending(false);
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
      const unread = {};
      participants.forEach(uid => {
        unread[uid] = 0;
      });
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
        setPendingSelectedConversationId(existingConversation.id);
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
        unread,
      };
      batch.set(convoRef, convoData);
      await batch.commit();
      const newConvo = await getDoc(convoRef);
      setPendingSelectedConversationId(newConvo.id);
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
      const normalizedElement = userElement;
      const userDoc = await getDoc(doc(db, "users", userId));
      const username = userDoc.data().username;
      const userRole = userDoc.data().role;
      if (userRole === 'staff') {
        // Staff members do not join community chats
        return null;
      }
      // 1. Find all element community conversations the user is currently in
      const allCommunitiesQuery = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("participants", "array-contains", userId),
        where("communityType", "in", [null, "element"])
      );
      const allCommunitiesSnapshot = await getDocs(allCommunitiesQuery);
      // 2. Remove user from all element communities except the new one
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
      // 3. Find or create the new element community for the user's current element
      const q = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("element", "==", normalizedElement),
        where("communityType", "in", [null, "element"])
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
          communityType: "element",
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

  // --- Mentor Community Chat Membership ---
  const handleMentorCommunityMembership = async (userId, userRole, mentorName, username) => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (userRole === 'mentor') {
        // 1. Ensure mentor_community exists for this mentor
        let mentorCommunityDoc = null;
        const mentorCommunityQuery = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("communityType", "==", "mentor_community"),
          where("mentorId", "==", userId)
        );
        const mentorCommunitySnapshot = await getDocs(mentorCommunityQuery);
        // Find all participants (mentees) for this mentor
        const myParticipants = allUsers.filter(u => u.role === 'participant' && u.mentorName === username);
        const participantIds = myParticipants.map(u => u.id);
        const participantNames = myParticipants.map(u => u.username);
        const allIds = [userId, ...participantIds];
        const allNames = [username, ...participantNames];
        // Build unread object for all participants
        const unread = {};
        allIds.forEach(uid => { unread[uid] = 0; });
        if (mentorCommunitySnapshot.empty) {
          // Create new mentor community with mentor and all participants
          const newCommunityRef = doc(collection(db, "conversations"));
          await setDoc(newCommunityRef, {
            type: "community",
            communityType: "mentor_community",
            mentorId: userId,
            mentorName: username,
            participants: allIds,
            participantNames: allNames,
            unread,
            lastMessage: "Mentor community created!",
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
          });
          mentorCommunityDoc = await getDoc(newCommunityRef);
        } else {
          mentorCommunityDoc = mentorCommunitySnapshot.docs[0];
          const currentData = mentorCommunityDoc.data();
          const currentIds = currentData.participants || [];
          const currentNames = currentData.participantNames || [];
          // Add missing participants
          const newIds = allIds;
          const newNames = allNames;
          // Merge unread, add 0 for any new participants
          const newUnread = { ...currentData.unread };
          newIds.forEach(uid => { if (!(uid in newUnread)) newUnread[uid] = 0; });
          // Remove unread for users no longer in the community
          Object.keys(newUnread).forEach(uid => { if (!newIds.includes(uid)) delete newUnread[uid]; });
          if (
            newIds.length !== currentIds.length ||
            newNames.length !== currentNames.length ||
            !newIds.every(id => currentIds.includes(id))
          ) {
            await updateDoc(mentorCommunityDoc.ref, {
              participants: newIds,
              participantNames: newNames,
              unread: newUnread,
              lastMessage: "Mentor community updated!",
              lastUpdated: serverTimestamp(),
            });
          }
        }
      } else if (userRole === 'participant' && mentorName) {
        // 1. Find the mentor user
        const mentor = allUsers.find(u => u.role === 'mentor' && u.username === mentorName);
        if (!mentor) return;
        // 2. Find mentor's community (create if not exists)
        let mentorCommunityDoc = null;
        const mentorCommunityQuery = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("communityType", "==", "mentor_community"),
          where("mentorId", "==", mentor.id)
        );
        const mentorCommunitySnapshot = await getDocs(mentorCommunityQuery);
        if (mentorCommunitySnapshot.empty) {
          // Create new mentor community with mentor and this participant
          const newCommunityRef = doc(collection(db, "conversations"));
          const unread = {};
          [mentor.id, userId].forEach(uid => { unread[uid] = 0; });
          await setDoc(newCommunityRef, {
            type: "community",
            communityType: "mentor_community",
            mentorId: mentor.id,
            mentorName: mentor.username,
            participants: [mentor.id, userId],
            participantNames: [mentor.username, username],
            unread,
            lastMessage: "Mentor community created!",
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
          });
          mentorCommunityDoc = await getDoc(newCommunityRef);
        } else {
          mentorCommunityDoc = mentorCommunitySnapshot.docs[0];
          // Add participant if not already in
          const data = mentorCommunityDoc.data();
          if (!data.participants.includes(userId)) {
            const newIds = [...data.participants, userId];
            const newNames = [...data.participantNames, username];
            const newUnread = { ...data.unread };
            if (!(userId in newUnread)) newUnread[userId] = 0;
            await updateDoc(mentorCommunityDoc.ref, {
              participants: newIds,
              participantNames: newNames,
              unread: newUnread,
              lastMessage: `${username} joined the mentor community`,
              lastUpdated: serverTimestamp(),
            });
          }
        }
        // 3. Remove participant from any other mentor_community chats
        const allMentorCommunitiesQuery = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("communityType", "==", "mentor_community"),
          where("participants", "array-contains", userId)
        );
        const allMentorCommunitiesSnapshot = await getDocs(allMentorCommunitiesQuery);
        for (const communityDoc of allMentorCommunitiesSnapshot.docs) {
          const data = communityDoc.data();
          if (data.mentorId !== mentor.id) {
            const newIds = data.participants.filter((id) => id !== userId);
            const newNames = data.participantNames.filter((name) => name !== username);
            const newUnread = { ...data.unread };
            delete newUnread[userId];
            await updateDoc(communityDoc.ref, {
              participants: newIds,
              participantNames: newNames,
              unread: newUnread,
              lastMessage: `${username} left the mentor community`,
              lastUpdated: serverTimestamp(),
            });
            await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
              text: `${username} left the mentor community`,
              type: "system",
              createdAt: serverTimestamp(),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error handling mentor community chat:", error);
    }
  };

  // Add useEffect to handle initial conversation selection based on chatId URL parameter
  useEffect(() => {
    if (!currentUser.uid) return; // Skip if user not logged in
    
    if (chatId) {
      const conversation = conversations.find(c => c.id === chatId);
      
      // Check if we've already updated this conversation's lastRead timestamp
      const lastReadKey = `${chatId}_${currentUser.uid}`;
      const alreadyUpdated = lastReadUpdated[lastReadKey];
      
      if (conversation) {
        // Found conversation in current state
        setSelectedConversation(conversation);
        
        // Only update lastRead if we haven't already done so
        if (!alreadyUpdated) {
          const conversationRef = doc(db, "conversations", conversation.id);
          updateDoc(conversationRef, {
            [`unread.${currentUser.uid}`]: 0,
            [`lastRead.${currentUser.uid}`]: serverTimestamp()
          });
          
          // Mark this conversation as updated
          setLastReadUpdated(prev => ({
            ...prev,
            [lastReadKey]: true
          }));
        }
      } else {
        // If conversation not found in current state, fetch it directly
        const fetchConversation = async () => {
          try {
            const conversationRef = doc(db, "conversations", chatId);
            const conversationDoc = await getDoc(conversationRef);
            
            if (conversationDoc.exists()) {
              const data = conversationDoc.data();
              // Check if user is a participant in this conversation
              if (data.participants && data.participants.includes(currentUser.uid)) {
                // Create conversation object with necessary data
                const conversationData = {
                  id: chatId,
                  ...data,
                  lastUpdated: data.lastUpdated?.toDate(),
                  createdAt: data.createdAt?.toDate()
                };
                
                // For direct chats, get partner info
                if (data.type === "direct") {
                  const partnerUid = data.participants.find(p => p !== currentUser.uid);
                  if (partnerUid) {
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
                    
                    conversationData.participantNames = [
                      currentUser.username,
                      partnerDoc.exists() ? partnerDoc.data().username : "Unknown"
                    ];
                    conversationData.partnerProfilePic = partnerProfilePic;
                  }
                }
                // For group chats, get additional info
                else if (data.type === "group") {
                  conversationData.groupName = data.name || data.groupName;
                  conversationData.avatarURL = data.avatarURL;
                  conversationData.participantNames = data.participantNames || [];
                  conversationData.admin = data.admin;
                }
                
                setSelectedConversation(conversationData);
                
                // Only update lastRead if we haven't already done so
                if (!alreadyUpdated) {
                  // Reset unread count and update lastRead timestamp
                  updateDoc(conversationRef, {
                    [`unread.${currentUser.uid}`]: 0,
                    [`lastRead.${currentUser.uid}`]: serverTimestamp()
                  });
                  
                  // Mark this conversation as updated
                  setLastReadUpdated(prev => ({
                    ...prev,
                    [lastReadKey]: true
                  }));
                }
              } else {
                // User is not a participant, redirect to main chat page
                navigate('/chat');
              }
            } else {
              // Conversation doesn't exist, redirect to main chat page
              navigate('/chat');
            }
          } catch (error) {
            console.error("Error fetching conversation:", error);
            navigate('/chat');
          }
        };
        
        fetchConversation();
      }
    }
  }, [chatId, conversations, currentUser.uid, navigate, currentUser.username]);

  // When a conversation is selected, always use the full object from conversations array
  const handleSelectConversation = (conv) => {
    if (!conv) {
      setSelectedConversation(null);
      navigate(`/chat`);
      return;
    }
    // If conv is an ID, or partial, find the full object
    const convId = conv.id || conv;
    const fullConv = conversations.find(c => c.id === convId);
    
    if (fullConv) {
      // Create a lastRead key to track updates
      const lastReadKey = `${fullConv.id}_${currentUser.uid}`;
      
      setSelectedConversation(fullConv);
      navigate(`/chat/${fullConv.id}`);
      
      // --- Reset unread count for current user and update lastRead timestamp ---
      const conversationRef = doc(db, "conversations", fullConv.id);
      updateDoc(conversationRef, {
        [`unread.${currentUser.uid}`]: 0,
        [`lastRead.${currentUser.uid}`]: serverTimestamp()
      });
      
      // Mark this conversation as updated
      setLastReadUpdated(prev => ({
        ...prev,
        [lastReadKey]: true
      }));
    } else {
      // fallback: set as is
      setSelectedConversation(conv);
      navigate(`/chat/${convId}`);
    }
  };

  // When conversations update, if there's a pending selection, select it
  useEffect(() => {
    if (pendingSelectedConversationId && conversations.length > 0) {
      const found = conversations.find(c => c.id === pendingSelectedConversationId);
      if (found) {
        setSelectedConversation(found);
        setPendingSelectedConversationId(null);
        navigate(`/chat/${found.id}`);
      }
    }
  }, [pendingSelectedConversationId, conversations, navigate]);

  // Reset to /chat if no conversation is selected (e.g., after reload)
  useEffect(() => {
    // Only auto-redirect to main chat if no chatId in URL and nothing is selected
    if (!chatId && selectedConversation === null) {
      navigate('/chat');
    }
    // Don't auto-redirect away if chatId exists, allow time to fetch & select conversation
  }, [chatId, selectedConversation, navigate]);

  // TEMP: Admin-only delete all conversations button
  async function handleDeleteAllConversations() {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את כל הצ'אטים? פעולה זו אינה הפיכה!")) return;
    const conversationsSnapshot = await getDocs(collection(db, "conversations"));
    for (const conversationDoc of conversationsSnapshot.docs) {
      // Delete all messages in subcollection
      const messagesSnapshot = await getDocs(collection(db, "conversations", conversationDoc.id, "messages"));
      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(doc(db, "conversations", conversationDoc.id, "messages", messageDoc.id));
      }
      // Delete the conversation itself
      await deleteDoc(doc(db, "conversations", conversationDoc.id));
    }
    window.toast && window.toast.success && window.toast.success("כל הצ'אטים נמחקו בהצלחה!");
    alert("כל הצ'אטים נמחקו בהצלחה!");
  }

  // --- Notification Sound on New Message ---
  useEffect(() => {
    if (!currentUser.uid) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        if (change.type === "modified" && data.lastMessage && data.lastUpdated) {
          // If this conversation is not currently open, and unread for this user increased
          if (!selectedConversation || change.doc.id !== selectedConversation.id) {
            const prevUnread = conversations.find(c => c.id === change.doc.id)?.unread?.[currentUser.uid] || 0;
            const newUnread = data.unread?.[currentUser.uid] || 0;
            if (newUnread > prevUnread) {
              // Play notification sound
              const audio = new window.Audio(notificationSound);
              audio.play();
            }
          }
        }
      });
    });
    return () => unsubscribe();
  }, [currentUser.uid, selectedConversation, conversations]);

  // Handle sending message
  const handleSendMessage = async () => {
    // Handle voice message
    if (audioBlob && !isRecording) {
      try {
        const voiceFile = new File([audioBlob], `voice_${Date.now()}.webm`, { 
          type: 'audio/webm',
          lastModified: Date.now()
        });
        
        await sendMessage({ 
          fileOverride: voiceFile,
          mediaTypeOverride: 'audio',
          durationOverride: Math.round(recordingTime) // Ensure it's a rounded number
        });
        
        resetRecording();
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        return;
      } catch (error) {
        console.error("Error sending voice message:", error);
        alert("Failed to send voice message. Please try again.");
        return;
      }
    }

    // Handle regular messages and images
    try {
      if (file && file.type && file.type.startsWith('image/')) {
        setIsSendingImage(true);
      }
      await sendMessage();
      setIsSendingImage(false);
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsSendingImage(false);
    }
  };

  // Auto-close chat if user is removed from a group they are viewing
  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation.type === 'group' &&
      Array.isArray(selectedConversation.participants) &&
      !selectedConversation.participants.includes(currentUser.uid)
      && currentUser.role !== 'staff' // Only auto-close for non-staff
    ) {
      // Check for a personal removal message
      const lastPersonalRemovalMsg = messages
        .slice()
        .reverse()
        .find(
          msg =>
            msg.type === 'system' &&
            msg.systemSubtype === 'personal' &&
            msg.targetUid === currentUser.uid &&
            msg.text &&
            msg.text.includes('הסיר אותך מהקבוצה')
        );
      if (lastPersonalRemovalMsg) {
        // Wait 2.5 seconds before closing the chat
        const timeout = setTimeout(() => {
          setSelectedConversation(null);
          navigate('/chat');
        }, 2500);
        return () => clearTimeout(timeout);
      } else {
        // No personal message, close immediately
        setSelectedConversation(null);
        navigate('/chat');
      }
    }
  }, [selectedConversation, currentUser.uid, navigate, messages]);

  // Real-time listener for selected conversation to detect removal from group
  useEffect(() => {
    if (!selectedConversation?.id) return;
    const conversationRef = doc(db, "conversations", selectedConversation.id);
    const unsubscribe = onSnapshot(conversationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedConversation(prev => ({
          ...prev,
          ...data,
          lastUpdated: data.lastUpdated?.toDate?.() || prev.lastUpdated,
          createdAt: data.createdAt?.toDate?.() || prev.createdAt,
        }));
      }
    });
    return () => unsubscribe();
  }, [selectedConversation?.id]);

  if (!authInitialized) {
    return <ElementalLoader />;
  }

  const elementColors = ELEMENT_COLORS[currentUser.element];
  const userElement = currentUser.element;


  return (
    <div id='messenger' className="flex h-screen">
      {/* TEMP: Admin-only delete all conversations button 
      <button
          onClick={handleDeleteAllConversations}
          className="fixed self-center justify-center z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition font-bold"
        >
          מחק את כל הצ'אטים (אדמין)
        </button>
        */} 

      <ThemeProvider element={userElement}>
        <Navbar element={userElement}/>
      </ThemeProvider>
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
        setShowNewChatDialog={currentUser.role === 'staff' ? undefined : setShowNewChatDialog}
        setShowNewGroupDialog={currentUser.role === 'staff' ? undefined : setShowNewGroupDialog}
        getChatPartner={(participants, type, element, _unused, _unused2, groupName) => getChatPartner(participants, type, element, currentUser, conversations, groupName)}
        elementColorsMap={ELEMENT_COLORS}
        activeTab={activeTab}
      />
      <ChatArea
        selectedConversation={selectedConversation}
        currentUser={currentUser}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={currentUser.role === 'staff' ? () => {} : setNewMessage}
        sendMessage={sendMessage}
        isSending={isSending}
        isLoadingMessages={isLoadingMessages}
        setShowNewChatDialog={currentUser.role === 'staff' ? undefined : setShowNewChatDialog}
        getChatPartner={(participants, type, element, _unused, _unused2, groupName) => getChatPartner(participants, type, element, currentUser, conversations, groupName)}
        file={file}
        preview={preview}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        handleFileChange={currentUser.role === 'staff' ? () => {} : handleFileChange}
        removeFile={currentUser.role === 'staff' ? () => {} : removeFile}
        elementColors={elementColors}
        userAvatars={userAvatars}
        activeTab={activeTab}
        setShowNewGroupDialog={currentUser.role === 'staff' ? undefined : setShowNewGroupDialog}
        conversations={conversations}
        setSelectedConversation={handleSelectConversation}
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
              {/* Group avatar upload */}
              <label className="block text-sm font-medium mb-2 mt-2">תמונת קבוצה (אופציונלי):</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded text-right mb-2"
                onChange={e => {
                  const file = e.target.files[0];
                  setGroupAvatarFile(file || null);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setGroupAvatarPreview(ev.target.result);
                    reader.readAsDataURL(file);
                  } else {
                    setGroupAvatarPreview(null);
                  }
                }}
              />
              {groupAvatarPreview && (
                <div className="mb-2 flex justify-center"><img src={groupAvatarPreview} alt="Group Preview" className="w-20 h-20 object-cover rounded-full border" /></div>
              )}
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
                  // Get all users and filter client-side for better search
                  const usersRef = collection(db, "users");
                  const snapshot = await getDocs(usersRef);
                  const results = snapshot.docs
                    .filter(doc => {
                      const username = doc.data().username || '';
                      return doc.id !== currentUser.uid && 
                             !selectedGroupUsers.some(u => u.id === doc.id) &&
                             username.toLowerCase().includes(e.target.value.toLowerCase()) &&
                             doc.data().role !== 'staff'; // Exclude staff users
                    })
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
                    let avatarURL = null;
                    if (groupAvatarFile) {
                      // Upload avatar to Storage
                      const avatarRef = storageRef(storage, `group_avatars/${groupRef.id}.jpg`);
                      await uploadBytesResumable(avatarRef, groupAvatarFile);
                      avatarURL = await getDownloadURL(avatarRef);
                      await updateDoc(groupRef, { avatarURL });
                    }
                    const newGroupDoc = await getDoc(groupRef);
                    setPendingSelectedConversationId(newGroupDoc.id);
                    setShowNewGroupDialog(false);
                    setGroupName("");
                    setGroupUserSearch("");
                    setGroupUserResults([]);
                    setSelectedGroupUsers([]);
                    setGroupAvatarFile(null);
                    setGroupAvatarPreview(null);
                    // Send personal system message to each added user (except admin) about group creation
                    for (const user of selectedGroupUsers) {
                      await addDoc(collection(db, "conversations", groupRef.id, "messages"), {
                        text: `${currentUser.username} יצר את הקבוצה (${groupName.trim()}) והוסיפך אליה`,
                        type: "system",
                        systemSubtype: "personal",
                        createdAt: serverTimestamp(),
                        targetUid: user.id
                      });
                      // Increment unread count for the added user
                      await updateDoc(groupRef, {
                        [`unread.${user.id}`]: 1
                      });
                    }
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
                  setGroupAvatarFile(null);
                  setGroupAvatarPreview(null);
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