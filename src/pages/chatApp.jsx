import { useEffect, useState, useMemo, useCallback } from "react";
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
  arrayUnion
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../config/firbaseConfig";
import ConversationList from "../components/chatComponents/ConversationList";
import ChatArea from "../components/chatComponents/ChatArea";
import Navbar from '../components/social/Navbar';
import Sidebar from "../components/chatComponents/sidebar";

export default function ChatApp() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState({ uid: null, username: '' });
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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Add this in chatApp.jsx
const ELEMENT_COLORS = {
  fire: {
    primary: '#ff4500',  // Bright red-orange for fire
    hover: '#e63e00',
    light: '#fff0e6',
    darkHover: '#b33000'  // Darker shade for fire
  },
  earth: {
    primary: '#8b4513',  // Brown for earth
    hover: '#723a0f',
    light: '#f5ede6',
    darkHover: '#5e2f0d'  // Darker shade for earth
  },
  metal: {
    primary: '#c0c0c0',  // Silver/metallic for metal
    hover: '#a8a8a8',
    light: '#f5f5f5',
    darkHover: '#808080'  // Darker shade for metal
  },
  water: {
    primary: '#1e90ff',  // Deep blue for water
    hover: '#187bdb',
    light: '#e6f2ff',
    darkHover: '#0066cc'  // Darker shade for water
  },
  tree: {
    primary: '#228B22',  // Forest green for tree
    hover: '#1e7a1e',
    light: '#e6f9e6',
    darkHover: '#145214'  // Darker forest green
  }
};


  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const audioChunks = [];
      recorder.ondataavailable = (e) => audioChunks.push(e.data);
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setAudioURL("");
  };


    // Add this function inside the ChatApp component
    const handleCommunityChatMembership = async (userId, userElement) => {
      try {
        const q = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("element", "==", userElement)
        );
        
        const querySnapshot = await getDocs(q);
        const userDoc = await getDoc(doc(db, "users", userId));
        const username = userDoc.data().username;
        
        if (querySnapshot.empty) {
          // Create new community chat with welcome message
          const convoRef = doc(collection(db, "conversations"));
          await setDoc(convoRef, {
            participants: [userId],
            participantNames: [username],
            type: "community",
            element: userElement,
            lastMessage: "Community created!",
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
          });
    
          // Add system message
          const messagesRef = collection(db, "conversations", convoRef.id, "messages");
          await addDoc(messagesRef, {
            text: "Community created! Welcome!",
            type: "system",
            createdAt: serverTimestamp()
          });
        } else {
          const convoDoc = querySnapshot.docs[0];
          if (!convoDoc.data().participants.includes(userId)) {
            // Add user to community
            await updateDoc(convoDoc.ref, {
              participants: arrayUnion(userId),
              participantNames: arrayUnion(username)
            });
    
            // Add join notification
            const messagesRef = collection(db, "conversations", convoDoc.id, "messages");
            await addDoc(messagesRef, {
              text: `${username} joined the community`,
              type: "system",
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error("Error handling community chat:", error);
      }
    };
    
  // Update the auth useEffect to call this function
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {          
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userElement = userDoc.data().element;
          
          setCurrentUser({
            uid: user.uid,
            username: userDoc.data().username,
            element: userElement
          });
          
          // Add user to their element's community chat
          await handleCommunityChatMembership(user.uid, userElement);
          
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

  const getChatPartner = useCallback((participants, conversationType, element) => {
    if (conversationType === "community") {
      return `${element} Community`;
    }
    
    if (!participants || !currentUser.uid) return "Unknown";
    const partnerUid = participants.find((p) => p !== currentUser.uid);
    const conversation = conversations.find(conv => 
      conv.participants.includes(partnerUid)
    );
    
    return conversation?.participantNames?.find(name => name !== currentUser.username) || "Unknown";
  }, [currentUser.uid, currentUser.username, conversations]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Apply tab filter
    if (activeTab === "private") {
      filtered = filtered.filter(conv => conv.type === "direct");
    } else if (activeTab === "groups") {
      filtered = filtered.filter(conv => conv.type === "group");
    } else if (activeTab === "community") {
      filtered = filtered.filter(conv => 
        conv.type === "community" && 
        conv.element === currentUser.element
      );
    }
  
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.participantNames?.some(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  
    return filtered;
  }, [conversations, searchQuery, activeTab, currentUser.element]);


  // Load conversations
// chatApp.jsx - Key Optimizations
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
          
          // Base conversation data
          const base = {
            id: conversationDoc.id,
            ...data,
            lastUpdated: data.lastUpdated?.toDate(),
            createdAt: data.createdAt?.toDate()
          };

          // Community Chat
          if (data.type === "community") {
            validConversations.push({
              ...base,
              participantNames: [`${data.element} Community`]
            });
            continue;
          }

          // Direct Message
          if (data.type === "direct") {
            const partnerUid = data.participants?.find(p => p !== currentUser.uid);
            if (!partnerUid) continue;

            const userDocRef = doc(db, "users", partnerUid);
            const partnerDoc = await getDoc(userDocRef);
            
            validConversations.push({
              ...base,
              participantNames: [
                currentUser.username,
                partnerDoc.exists() ? partnerDoc.data().username : "Unknown"
              ]
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


  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    setIsLoadingMessages(true);
    const q = query(
      collection(db, "conversations", selectedConversation.id, "messages"),
      orderBy("createdAt")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() 
      }));
      setMessages(msgs);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversation?.id]);


// Enhanced image compression
  const compressImage = async (file) => {
    const MAX_DIMENSION = 800;
    const QUALITY = 0.6;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(blob => {
          resolve(new File([blob], file.name, {
            type: 'image/webp', // Better compression
            lastModified: Date.now()
          }));
        }, 'image/webp', QUALITY);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type and size
    if (!selectedFile.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }

    // Limit file size (10MB for images, 50MB for videos)
    const maxSize = selectedFile.type.startsWith('image/') ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(`File too large. Max ${maxSize/(1024*1024)}MB allowed`);
      return;
    }

    // For images, compress before showing preview
    if (selectedFile.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(selectedFile);
        setFile(compressedFile);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview({
            url: e.target.result,
            type: 'image'
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Image compression failed:", error);
        // Fallback to original if compression fails
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview({
            url: e.target.result,
            type: 'image'
          });
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const removeFile = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !file && !audioBlob) || !selectedConversation || isSending || isUploading) {
      return;
    }
  
    // Immediately clear the input and reset state for better UX
    const messageToSend = newMessage;
    setNewMessage("");
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    removeAudio();
  
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
          customMetadata: {
            uploadedBy: currentUser.uid
          }
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
      } else if (audioBlob) {
        const storageRef = ref(
          storage,
          `audio_messages/${selectedConversation.id}/${Date.now()}.webm`
        );
  
        const uploadTask = uploadBytesResumable(storageRef, audioBlob, {
          contentType: 'audio/webm',
          customMetadata: { uploadedBy: currentUser.uid }
        });
  
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  
        messageData = {
          ...messageData,
          audioURL: downloadURL,
          type: 'audio'
        };
      } else {
        messageData.text = messageToSend;
      }
  
      // Optimistic update - add the message to local state immediately
      const tempMessageId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempMessageId,
        ...messageData,
        createdAt: new Date() // Use local timestamp temporarily
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
  
      // Use batched writes for atomic updates
      const batch = writeBatch(db);
      
      // Add message
      const messagesRef = collection(db, "conversations", selectedConversation.id, "messages");
      const newMessageRef = doc(messagesRef);
      batch.set(newMessageRef, messageData);
      
      // Update conversation
      const conversationRef = doc(db, "conversations", selectedConversation.id);
      batch.update(conversationRef, {
        lastMessage: file ? (file.type.startsWith('image/') ? 'Sent an image' : 'Sent a voice message') : messageToSend,
        lastUpdated: serverTimestamp(),
      });
  
      await batch.commit();
      await updateDoc(doc(db, "conversations", selectedConversation.id), {
        [`typing.${currentUser.uid}`]: false
      });
  
      // Remove the temporary message and let Firestore update handle the real one
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
  
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert optimistic updates on error
      setNewMessage(messageToSend);
      if (file) {
        setFile(file);
        setPreview(preview);
      }
      if (audioBlob) {
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);
      }
      alert(`Message failed: ${error.message}`);
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };


  const createNewConversation = async () => {
    const partnerUsername = partnerName.trim();
    if (!partnerUsername) return;

    try {
      // Case-insensitive search using usernameLower
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

      // Create sorted participants array for consistent queries
      const participants = [currentUser.uid, partnerUid].sort();

      // FIX: Changed array equality query to use array-contains for both participants
      // First check if a conversation already exists with both participants
      const existingConversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", currentUser.uid)
      );

      const convSnapshot = await getDocs(existingConversationsQuery);
      
      // Manually filter for conversations that contain both participants
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

      // Create new conversation with sorted participants
      const batch = writeBatch(db);
      const convoRef = doc(collection(db, "conversations"));
      const convoData = {
        participants: participants,
        participantNames: [currentUser.username, partner.data().username],
        type: "direct", // This indicates it's a private chat
        lastMessage: "",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      batch.set(convoRef, convoData);
      await batch.commit();

      // Refresh conversation data from server
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

  if (!authInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading chat...</div>;
  }
  
  const elementColors = ELEMENT_COLORS[currentUser.element];
  const userElement = currentUser.element


  return (
    <div id='messenger' className="flex h-screen bg-white">
      <Navbar />
      <Sidebar 
        elementColors={ELEMENT_COLORS[currentUser.element]}
        userElement={userElement}
        onTabChange={setActiveTab}
      />
      <ConversationList
        currentUser={currentUser}
        conversations={conversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredConversations={filteredConversations}
        isLoadingConversations={isLoadingConversations}
        setShowNewChatDialog={setShowNewChatDialog}
        getChatPartner={getChatPartner}
        elementColors={ELEMENT_COLORS[currentUser.element]}
        activeTab={activeTab}
      />

      <ChatArea
        selectedConversation={selectedConversation}
        currentUser={currentUser}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isSending={isSending}
        isLoadingMessages={isLoadingMessages}
        setShowNewChatDialog={setShowNewChatDialog}
        getChatPartner={getChatPartner}
        file={file}
        preview={preview}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        audioBlob={audioBlob}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        audioURL={audioURL}
        removeAudio={removeAudio}
        elementColors={ELEMENT_COLORS[currentUser.element]}
      />

      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 text-right" dir="rtl">
            <h3 className="text-lg font-bold mb-4">צ'אט חדש</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">שם השותף:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-right"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="הזן שם"
              />
            </div>
            <div className="flex gap-2">
              <button
                className='px-4 py-2 text-white rounded disabled:opacity-50'
                onClick={createNewConversation}
                disabled={!partnerName.trim()}
                style={{ 
                  backgroundColor: elementColors.primary,
                  ':hover': {
                    backgroundColor: elementColors.hover
                  }
                }}
              >
                צור
              </button>
              <button
                className="px-4 py-2 border rounded hover:bg-gray-200"
                onClick={() => setShowNewChatDialog(false)}
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