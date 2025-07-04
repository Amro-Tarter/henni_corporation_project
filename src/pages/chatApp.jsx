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
  getDoc,
  deleteDoc,
  increment
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL, ref as storageRef } from "firebase/storage";
import { auth, db, storage } from "../config/firbaseConfig";
import ConversationList from "../components/chat/ConversationList";
import ChatArea from "../components/chat/ChatArea";
import Navbar from '../components/social/Navbar';
import ElementalLoader from '../theme/ElementalLoader';
import { getChatPartner } from "../components/chat/utils/chatHelpers";
import { useFileUpload } from "../components/chat/hooks/useFileUpload";
import { ELEMENT_COLORS } from '../components/chat/utils/ELEMENT_COLORS';
import { useParams, useNavigate } from "react-router-dom";
import { badWords } from "../components/chat/utils/badWords";
import { ThemeProvider } from '../theme/ThemeProvider.jsx'; // Use correct path
import notificationSound from '@/assets/notification.mp3';
import inquiryNotificationSound from '@/assets/inquirySound.mp3';
import innerNoteSound from '@/assets/innerNoteSound.mp3';
import { handleMentorCommunityMembership } from "../components/chat/utils/handleMentorCommunityMembership";
import { handleElementCommunityChatMembership } from "../components/chat/utils/handleElementCommunityMembership";
import Rightsidebar from "../components/social/Rightsidebar";

// Notification component
function Notification({ message, type, onClose, actions, duration = 3000, elementColors }) {
  const [visible, setVisible] = useState(true);
  const fadeDuration = 1000; // ms

  useEffect(() => {
      const audio = new window.Audio(innerNoteSound);
      audio.play();
  }, []);

  useEffect(() => {
    if (duration) {
      
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose();
        }, fadeDuration);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Determine colors
  let bgColor, borderColor, textColor, hoverColor;
  if (type === 'error') {
    bgColor = 'bg-red-50';
    borderColor = 'border border-red-200';
    textColor = 'text-red-800';
    hoverColor = 'hover:bg-red-200';
  } else if (type === 'success') {
    bgColor = 'bg-green-50';
    borderColor = 'border border-green-200';
    textColor = 'text-green-800';
    hoverColor = 'hover:bg-green-200';
  } else {
    // Use elementColors for info/default
    bgColor = elementColors?.light ? '' : 'bg-blue-50';
    borderColor = elementColors?.light ? '' : 'border border-blue-200';
    textColor = elementColors?.primary ? '' : 'text-blue-800';
    hoverColor = elementColors?.hover ? '' : 'hover:bg-blue-200';
  }

  // Inline style for element colors (info/default)
  const infoStyle = type === 'error' || type === 'success' ? {} : {
    backgroundColor: elementColors?.light || undefined,
    border: elementColors?.primary ? `1px solid ${elementColors.primary}33` : undefined,
  };
  const infoTextStyle = type === 'error' || type === 'success' ? {} : {
    color: elementColors?.primary || undefined,
  };
  const infoHoverStyle = type === 'error' || type === 'success' ? {} : {
    backgroundColor: elementColors?.hover || undefined,
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
        onClose();
    }, fadeDuration);
};

return (
  <div
    className={
        `fixed top-6 left-1/2 z-50 w-full max-w-md px-4 sm:px-0 mt-10 flex justify-center transition-opacity duration-1000` +
        (visible ? ' opacity-100' : ' opacity-0')
    }
    style={{ transform: 'translateX(-50%)' }}
  >
    <div
      className={`rounded-lg shadow-lg p-4 animate-fade-in flex items-center justify-between gap-4 ${bgColor} ${borderColor}`}
      style={infoStyle}
    >
      <div className="flex items-center gap-3 flex-1">
        {type === 'error' && (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === 'success' && (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <p className={`text-sm font-medium ${textColor}`} style={infoTextStyle}>
          {message}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
        <button
          onClick={handleClose}
          className={`p-1 rounded-full hover:bg-opacity-20 ${hoverColor}`}
          style={infoHoverStyle}
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  );
}

export default function ChatApp() {
  const { chatId, inquiryId } = useParams();
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
  const [mobilePanel, setMobilePanel] = useState('conversations'); // 'conversations' | 'chat' | 'inquiries list' | 'selected inquiry' | 'new inquiry'
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [showSystemCalls, setShowSystemCalls] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type, actions }
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingDirectChat, setIsCreatingDirectChat] = useState(false);
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
                 doc.data().role !== 'admin' &&
                 doc.data().role !== 'staff' &&
                 doc.data().is_active;
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
          let userElement = userDoc.data().element;
          const userRole = userDoc.data().role;
          const associated_id = userDoc.data().associated_id;
          const mentorsID = userDoc.data().mentors;
          let mentorName = null;
          if (Array.isArray(mentorsID) && mentorsID.length > 0 && mentorsID[0]) {
            const mentorDoc = await getDoc(doc(db, "users", mentorsID[0]));
            mentorName = mentorDoc.exists() ? mentorDoc.data().username : null;
          }
          const userData = {
            uid: user.uid,
            username: userDoc.data().username,
            element: userElement || "admin_mentor",
            role: userRole,
            associated_id,
            mentorName: mentorName,
            is_active: userDoc.data().is_active,
          };
          setCurrentUser(userData);

          if (userRole === 'admin' || userRole === 'mentor') {
            userElement = 'admin_mentor';
          }
          // Ensure user is in their element community
          await handleElementCommunityChatMembership(user.uid, userElement);
          // Ensure mentor community logic
          await handleMentorCommunityMembership(user.uid, userRole, userDoc.data().mentorName, userDoc.data().username);
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

  // --- Automatic Community Management: Keep all communities in sync with users collection ---
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), async (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      for (const user of users) {
        if (!user.is_active) {
          continue;
        }
        // Element community
        if (user.element) {
          await handleElementCommunityChatMembership(user.id, user.element);
        }
        // Mentor/admin communities
        await handleMentorCommunityMembership(
          user.id,
          user.role,
          user.mentorName,
          user.username
        );
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
      // Show all community types relevant to the user
      filtered = filtered.filter(conv =>
        conv.type === "community" &&
        (
          (!conv.communityType || conv.communityType === "element") ||
          conv.communityType === "mentor_community" ||
          conv.communityType === "all_mentors" ||
          conv.communityType === "all_mentors_with_admin"
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
    if (currentUser.role === 'admin') {
      // admin: get all conversations
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
              displayName: data.mentorName ? `קהילה של ${data.mentorName}` : 'קהילת מנחה',
            });
            continue;
          } else if (data.type === "community" && (!data.communityType || data.communityType === "element")) {
            validConversations.push({
              ...base,
              participantNames: [`${data.element} קהילה`],
              communityType: data.communityType,
              displayName: data.element ? `קהילת ${ELEMENT_COLORS[data.element]?.label}` : 'קהילה',
            });
            continue;
          } else if (data.type === "community" && data.communityType === "all_mentors") {
            validConversations.push({
              ...base,
              participantNames: data.participantNames,
              communityType: data.communityType,
              displayName: 'קהילת כל המנחים',
            });
            continue;
          } else if (data.type === "community" && data.communityType === "all_mentors_with_admin") {
            validConversations.push({
              ...base,
              participantNames: data.participantNames,
              communityType: data.communityType,
              displayName: 'קהילת מנחים ומנהלים',
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
    if (!uid) {
      return 'https://www.gravatar.com/avatar/?d=mp&f=y';
    }
    try {
      // Check if we already have it cached
      if (userAvatars[uid]) {
        return userAvatars[uid];
      }

      // Try to get from profiles collection first
      const profileDoc = await getDoc(doc(db, 'profiles', uid));
      let photoURL = null;
      if (profileDoc.exists()) {
        photoURL = profileDoc.data().photoURL || 'https://www.gravatar.com/avatar/?d=mp&f=y';
      }

      // Cache the result
      setUserAvatars(prev => ({
        ...prev,
        [uid]: photoURL || 'https://www.gravatar.com/avatar/?d=mp&f=y'
      }));

      return photoURL || 'https://www.gravatar.com/avatar/?d=mp&f=y';
    } catch (e) {
      console.error("Error fetching avatar:", e);
      return 'https://www.gravatar.com/avatar/?d=mp&f=y';
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
      setIsLoadingMessages(false);
      // Build a set of unique sender UIDs (including currentUser)
      const senderUids = new Set(msgs.map(m => m.sender).filter(Boolean));
      if (currentUser.uid) senderUids.add(currentUser.uid);
      // Add all participants for group/community chats
      if (selectedConversation.participants) {
        selectedConversation.participants.filter(Boolean).forEach(uid => senderUids.add(uid));
      }
      // Fetch avatars for all senders and participants
      const avatarEntries = await Promise.all(
        Array.from(senderUids)
          .filter(Boolean)
          .map(async uid => [uid, await fetchUserAvatar(uid)])
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
        setNotification({ message: 'ההודעה שלך מכילה מילים אסורות. אנא נסח מחדש.', type: 'error', elementColors: elementColors });
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
      setNotification({ message: `שליחת ההודעה נכשלה: ${error.message}`, type: 'error', elementColors: elementColors });
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
      (messageData.mediaType === 'audio' ? 'שלח הודעת קול' : 
       messageData.mediaType === 'image' ? 'שלח תמונה' : 'שלח קובץ') : 
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
        setNotification({ message: 'המשתמש לא קיים', type: 'error', elementColors: elementColors });
        return;
      }
      const partner = userSnapshot.docs[0];
      const partnerUid = partner.id;
      if (partnerUid === currentUser.uid) {
        setNotification({ message: 'לא ניתן לשלוח הודעה לעצמך', type: 'error', elementColors: elementColors });
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
      setNotification({ message: `שגיאה ביצירת שיחה: ${error.message}`, type: 'error', elementColors: elementColors });
    }
  };

  // When a conversation is selected, always use the full object from conversations array
  const handleSelectConversation = (conv) => {
    if (showSystemCalls) return;
    if (!conv) {
      setSelectedConversationId(null);
      navigate(`/chat`);
      if (typeof window !== 'undefined' && window.innerWidth < 768) setMobilePanel('conversations');
      return;
    }
    const convId = conv.id || conv;
    setSelectedConversationId(convId);
    navigate(`/chat/${convId}`);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setMobilePanel('chat');
    // --- Reset unread count for current user and update lastRead timestamp ---
    const conversationRef = doc(db, "conversations", convId);
    updateDoc(conversationRef, {
      [`unread.${currentUser.uid}`]: 0,
      [`lastRead.${currentUser.uid}`]: serverTimestamp()
    });
    // Mark this conversation as updated
    const lastReadKey = `${convId}_${currentUser.uid}`;
    setLastReadUpdated(prev => ({
      ...prev,
      [lastReadKey]: true
    }));
  };

  // Effect: update selectedConversation when selectedConversationId or conversations changes
  useEffect(() => {
    if (!selectedConversationId || !conversations.length) {
      setSelectedConversation(null);
      return;
    }
    const found = conversations.find(c => c.id === selectedConversationId);
    if (found) {
      setSelectedConversation(found);
    } else {
      // Optionally fetch from Firestore if not found (rare)
      const fetchAndSet = async () => {
        if (showSystemCalls) return;
        try {
          const conversationRef = doc(db, "conversations", selectedConversationId);
          const conversationDoc = await getDoc(conversationRef);
          if (conversationDoc.exists()) {
            const data = conversationDoc.data();
            if (data.participants && data.participants.includes(currentUser.uid)) {
              const conversationData = {
                id: selectedConversationId,
                ...data,
                lastUpdated: data.lastUpdated?.toDate(),
                createdAt: data.createdAt?.toDate()
              };
              setSelectedConversation(conversationData);
            } else {
              setSelectedConversation(null);
              setSelectedConversationId(null);
              navigate('/chat');
            }
          } else {
            setSelectedConversation(null);
            setSelectedConversationId(null);
            navigate('/chat');
          }
        } catch (error) {
          setSelectedConversation(null);
          setSelectedConversationId(null);
          navigate('/chat');
        }
      };
      fetchAndSet();
    }
  }, [selectedConversationId, conversations, currentUser.uid, navigate]);

  // Refactor: Only update selectedConversationId when chatId changes
  useEffect(() => {
    if (showSystemCalls) return;
    if (!currentUser.uid || isLoadingConversations) return;
    if (chatId) {
      setSelectedConversationId(chatId);
    } else {
      setSelectedConversationId(null);
    }
  }, [chatId, currentUser.uid, isLoadingConversations, navigate]);

  // On mobile, if chat is closed, go back to conversations
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && selectedConversation === null) {
      setMobilePanel('conversations');
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768 && selectedInquiry !== null) {
      setMobilePanel('inquiry');
    }
  }, [selectedConversation]);

  // When conversations update, if there's a pending selection, select it
  useEffect(() => {
    if (pendingSelectedConversationId && conversations.length > 0) {
      const found = conversations.find(c => c.id === pendingSelectedConversationId);
      if (found) {
        setSelectedConversationId(found.id);
        setPendingSelectedConversationId(null);
        navigate(`/chat/${found.id}`);
      }
    }
  }, [pendingSelectedConversationId, conversations, navigate]);

  // Reset to /chat if no conversation is selected (e.g., after reload)
  useEffect(() => {
    // Only auto-redirect to main chat if no chatId in URL and nothing is selected
    if (!chatId && window.location.pathname.startsWith('/chat') && selectedConversation === null && !window.location.pathname.startsWith('/chat/inquiry')) {
      navigate('/chat');
    }
    // Don't auto-redirect away if chatId exists, allow time to fetch & select conversation
  }, [chatId, selectedConversation, navigate]);

  // TEMP: Admin-only delete all conversations button
  async function delete_all_conversations() {
    setNotification({
      message: "האם אתה בטוח שברצונך למחוק את כל הצ'אטים? פעולה זו אינה הפיכה!",
      type: 'warning',
      actions: [
        <button
          key="yes"
          className="px-3 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700"
          onClick={async () => {
            setNotification(null);
            const conversationsSnapshot = await getDocs(collection(db, "conversations"));
            for (const conversationDoc of conversationsSnapshot.docs) {
              const messagesSnapshot = await getDocs(collection(db, "conversations", conversationDoc.id, "messages"));
              for (const messageDoc of messagesSnapshot.docs) {
                await deleteDoc(doc(db, "conversations", conversationDoc.id, "messages", messageDoc.id));
              }
              await deleteDoc(doc(db, "conversations", conversationDoc.id));
            }
            setNotification({ message: "כל הצ'אטים נמחקו בהצלחה!", type: 'success', elementColors: elementColors });
          }}
        >כן</button>,
        <button
          key="no"
          className="px-3 py-1 rounded bg-gray-300 text-gray-800 font-bold hover:bg-gray-400"
          onClick={() => setNotification(null)}
        >לא</button>
      ]
    });
  }

  async function delete_all_inquiries() {
    setNotification({
      message: "האם אתה בטוח שברצונך למחוק את כל הפניות? פעולה זו אינה הפיכה!",
      type: 'warning',
      actions: [
        <button
          key="yes"
          className="px-3 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700"
          onClick={async () => {
            setNotification(null);
            const inquiriesSnapshot = await getDocs(collection(db, "system_of_inquiries"));
            for (const inquiryDoc of inquiriesSnapshot.docs) {
              await deleteDoc(doc(db, "system_of_inquiries", inquiryDoc.id));
            }
            setNotification({ message: "כל הפניות נמחקו בהצלחה!", type: 'success', elementColors: elementColors });
          }}
        >כן</button>,
        <button
          key="no"
          className="px-3 py-1 rounded bg-gray-300 text-gray-800 font-bold hover:bg-gray-400"
          onClick={() => setNotification(null)}
        >לא</button>
      ]
    });
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

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'system_of_inquiries'),
      where('recipient', '==', currentUser.uid)
    );

    // Listen for new inquiries
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          // Play notification sound
          const audio = new window.Audio(inquiryNotificationSound);
          audio.play();
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  // Auto-close chat if user is removed from a group they are viewing
  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation.type === 'group' &&
      Array.isArray(selectedConversation.participants) &&
      !selectedConversation.participants.includes(currentUser.uid)
      && currentUser.role !== 'admin' // Only auto-close for non-admin
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
          setSelectedConversationId(null);
          setSelectedConversation(null);
          navigate('/chat');
        }, 2500);
        return () => clearTimeout(timeout);
      } else {
        // No personal message, close immediately
        setSelectedConversationId(null);
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

  // Always fetch the list when showSystemCalls is true and user is loaded
  useEffect(() => {
    if (showSystemCalls && currentUser.uid) {
      setIsLoadingInquiries(true);
      const fetchInquiries = async () => {
        try {
          let q = query(
            collection(db, 'system_of_inquiries'),
            where('recipient', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          let snapshot;
          let usedFallback = false;
          try {
            snapshot = await getDocs(q);
          } catch (err) {
            q = query(
              collection(db, 'system_of_inquiries'),
              where('recipient', '==', currentUser.uid)
            );
            snapshot = await getDocs(q);
            usedFallback = true;
          }
          let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (usedFallback) {
            docs = docs.sort((a, b) => {
              if (!a.createdAt && !b.createdAt) return 0;
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              return b.createdAt.toDate() - a.createdAt.toDate();
            });
          }
          setInquiries(docs);
        } catch (err) {
          setInquiries([]);
        } finally {
          setIsLoadingInquiries(false);
        }
      };
      fetchInquiries();
    }
  }, [showSystemCalls, currentUser.uid]);

  // When inquiryId changes, set selectedInquiry from the list if possible, otherwise fetch
  useEffect(() => {
    if (inquiryId) {
      setShowSystemCalls(true);
      setIsLoadingInquiries(true);
      const found = inquiries.find(i => i.id === inquiryId);
      if (found) {
        setSelectedInquiry(found);
        setIsLoadingInquiries(false);
      } else {
        const fetchInquiry = async () => {
          try {
            const inquiryDoc = await getDoc(doc(db, 'system_of_inquiries', inquiryId));
            if (inquiryDoc.exists()) {
              const fetched = { id: inquiryDoc.id, ...inquiryDoc.data() };
              setSelectedInquiry(fetched);
              setInquiries(prev => {
                if (!prev.some(i => i.id === fetched.id)) {
                  return [...prev, fetched];
                }
                return prev;
              });
            } else {
              setSelectedInquiry(null);
            }
          } catch (err) {
            setSelectedInquiry(null);
          } finally {
            setIsLoadingInquiries(false);
          }
        };
        fetchInquiry();
      }
    }
  }, [inquiryId, inquiries]);

  // Add new useEffect for navigation
  useEffect(() => {
    if (selectedInquiry) {
      navigate(`/chat/inquiry/${selectedInquiry.id}`);
    } else if (showSystemCalls) {
      navigate('/chat/inquiry');
    } 
  }, [selectedInquiry, showSystemCalls, navigate]);

  if (!authInitialized) {
    return <ElementalLoader />;
  }

  const elementColors = ELEMENT_COLORS[currentUser.element];
  const userElement = currentUser.element; 


  return (
    <ThemeProvider element={currentUser.role === 'admin' || currentUser.role === 'mentor' ? 'red' : userElement}>
      {/* Notification */}
      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}

      {/* Main Content (disabled when dialog is open) */}
      <div
        id="main-content"
        className={showNewChatDialog || showNewGroupDialog ? "pointer-events-none select-none opacity-50" : ""}
        aria-hidden={showNewChatDialog || showNewGroupDialog ? "true" : "false"}
      >
        <Navbar element={userElement} className="hidden md:block"/>
        <Rightsidebar element={currentUser.role === 'admin' || currentUser.role === 'mentor' ? 'red' : userElement} onExpandChange={setIsRightOpen}/>
        <div className={`h-[calc(100vh-4rem)] w-full flex flex-row overflow-hidden bg-gray-50 mt-16`}>

          {/* {currentUser.role === 'admin' && (
            <div className="flex flex-row gap-2 right-50 fixed justify-center items-center z-50 bg-white">
              <button
                onClick={delete_all_conversations}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition font-bold"
              >
                מחק את כל הצ'אטים (אדמין)
              </button>
              <button
                onClick={delete_all_inquiries}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition font-bold"
              >
                מחק את כל הפניות (אדמין)
              </button>
            </div>
          )} */}

        
        
          {/* Main Panels */}
          {/* Conversation List Panel */}
          <div
            className={`flex-1 md:max-w-xs md:block ${mobilePanel === 'conversations' || mobilePanel === 'inquiries list' ? 'block' : 'hidden'} md:block h-full duration-500 ease-in-out ${isRightOpen ? 'lg:mr-64' : 'lg:mr-16'} transition-all`}
            style={{ minWidth: 0 }}
          >
            <ConversationList
              currentUser={currentUser}
              conversations={conversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={handleSelectConversation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredConversations={showSystemCalls ? conversations.filter(c => c.type === 'system_call') : filteredConversations}
              isLoadingConversations={isLoadingConversations}
              setShowNewChatDialog={currentUser.role === 'admin' ? undefined : setShowNewChatDialog}
              setShowNewGroupDialog={currentUser.role === 'admin' ? undefined : setShowNewGroupDialog}
              getChatPartner={(participants, type, element, _unused, _unused2, groupName) => getChatPartner(participants, type, element, currentUser, conversations, groupName)}
              elementColorsMap={ELEMENT_COLORS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showSystemCalls={showSystemCalls}
              onShowSystemCalls={() => setShowSystemCalls(true)}
              onHideSystemCalls={() => {
                setShowSystemCalls(false);
                setSelectedInquiry(null);
                navigate('/chat');
              }}
              selectedInquiry={selectedInquiry}
              setSelectedInquiry={inq => {
                setSelectedInquiry(inq);
                if (inq) navigate(`/chat/inquiry/${inq.id}`);
                else navigate('/chat');
              }}
              inquiries={inquiries}
              isLoadingInquiries={isLoadingInquiries}
              allConversations={conversations}
              mobilePanel={mobilePanel}
              setMobilePanel={setMobilePanel}
              setNotification={setNotification}
            />
          </div>
          {/* Chat Area Panel */}
          <div
            className={`flex-1 md:block ${mobilePanel === 'chat' || mobilePanel === 'selected inquiry' || mobilePanel === 'new inquiry' ? 'block' : 'hidden'} h-full transition-all duration-500 ease-in-out`}
            style={{ minWidth: 0 }}
          >
            
            <div className={`flex-1 flex flex-col h-full`}>
              <ChatArea 
                selectedConversation={selectedConversation}
                currentUser={currentUser}
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={sendMessage}
                isSending={isSending}
                isLoadingMessages={isLoadingMessages}
                setShowNewChatDialog={currentUser.role === 'admin' ? undefined : setShowNewChatDialog}
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
                setShowNewGroupDialog={currentUser.role === 'admin' ? undefined : setShowNewGroupDialog}
                conversations={conversations}
                setSelectedConversation={handleSelectConversation}
                showSystemCalls={showSystemCalls}
                mobilePanel={mobilePanel}
                setMobilePanel={setMobilePanel}
                onHideSystemCalls={() => {
                  setShowSystemCalls(false);
                  setSelectedInquiry(null);
                  navigate('/chat');
                }}
                selectedInquiry={selectedInquiry}
                setSelectedInquiry={inq => {
                  setSelectedInquiry(inq);
                  if (inq) navigate(`/chat/inquiry/${inq.id}`);
                  else navigate('/chat');
                }}
                isLoadingInquiries={isLoadingInquiries}
                setNotification={setNotification}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs (always enabled) */}
      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                onClick={async () => {
                  if (isCreatingDirectChat) return;
                  setIsCreatingDirectChat(true);
                  await createNewConversation();
                  setIsCreatingDirectChat(false);
                }}
                disabled={!selectedUser || isCreatingDirectChat}
                style={{ 
                  backgroundColor: elementColors.primary
                }}
              >
                {isCreatingDirectChat ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    יוצר...
                  </span>
                ) : (
                  'צור'
                )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                             doc.data().role !== 'admin' &&
                             doc.data().role !== 'staff' &&
                             doc.data().is_active;
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
                  if (!groupName.trim() || isCreatingGroup) return;
                  setIsCreatingGroup(true);
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
                    setIsCreatingGroup(false);
                  } catch (error) {
                    setNotification({ message: "שגיאה ביצירת קבוצה: " + error.message, type: 'error', elementColors: elementColors });
                    setIsCreatingGroup(false);
                  }
                }}
                disabled={!groupName.trim() || isCreatingGroup}
                style={{ backgroundColor: elementColors.primary }}
              >
                {isCreatingGroup ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    יוצר...
                  </span>
                ) : (
                  'צור קבוצה'
                )}
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
    </ThemeProvider>
)}


