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
  getDoc
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
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  // Add this in chatApp.jsx
  const ELEMENT_COLORS = {
    fire: {
      primary: '#ff8c00',
      hover: '#e67e00',
      light: '#fff5e6'
    },
    earth: {
      primary: '#a52a2a',
      hover: '#8b2323',
      light: '#f5e6d3'
    },
    metal: {
      primary: '#5d5d5d',
      hover: '#444444',
      light: '#f0f0f0'
    },
    water: {
      primary: '#87ceeb',
      hover: '#6db7d5',
      light: '#e6f4ff'
    },
    air: {
      primary: '#228b22',
      hover: '#1c711c',
      light: '#e6f4e6'
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


  // Add effect to listen for typing status
  useEffect(() => {
    if (!selectedConversation?.id || !currentUser?.uid) return;

    const convoRef = doc(db, "conversations", selectedConversation.id);
    const unsubscribe = onSnapshot(convoRef, (docSnap) => {
      const data = docSnap.data();
      const typingStatus = data?.typing || {};
      const partnerUid = selectedConversation.participants.find(p => p !== currentUser.uid);
      setIsPartnerTyping(typingStatus[partnerUid] || false);
    });

    return () => unsubscribe();
  }, [selectedConversation, currentUser.uid]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {          
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setCurrentUser({
            uid: user.uid,
            username: userDoc.data().username,
            element: userDoc.data().element
          });
          
          setAuthInitialized(true);
        } catch (error) {
          console.error("Error loading user:", error);
        }
      } else {
        // Handle anonymous users or redirect to login
        setAuthInitialized(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const getChatPartner = useCallback((participants) => {
    if (!participants || !currentUser.uid) return "Unknown";
    const partnerUid = participants.find((p) => p !== currentUser.uid);
    const conversation = conversations.find(conv => 
      conv.participants.includes(partnerUid)
    );
    return conversation?.participantNames?.find(name => name !== currentUser.username) || "Unknown";
  }, [currentUser.uid, currentUser.username, conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.participantNames?.some(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [conversations, searchQuery]);


  // Load conversations
  useEffect(() => {
    if (!currentUser.uid) return;
  
    setIsLoadingConversations(true);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("lastUpdated", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promises = snapshot.docs.map(async (conversationDoc) => {
        const data = conversationDoc.data();
        const partnerUid = data.participants.find(p => p !== currentUser.uid);
        const partnerDoc = await getDoc(doc(db, "users", partnerUid));
        
        return {
          id: conversationDoc.id,
          ...data,
          participantNames: [
            currentUser.username,
            partnerDoc.exists() ? partnerDoc.data().username : 'Unknown'
          ],
          lastUpdated: data.lastUpdated?.toDate(),
          createdAt: data.createdAt?.toDate()
        };
      });
  
      Promise.all(promises)
        .then(convs => {
          setConversations(convs);
          setIsLoadingConversations(false);
        })
        .catch(error => {
          console.error("Error loading conversations:", error);
          setIsLoadingConversations(false);
        });
    });
  
    return () => unsubscribe();
  }, [currentUser.uid, currentUser.username]);


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


  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1024;
          const maxHeight = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            },
            'image/jpeg',
            0.7 // Quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type and size
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      alert('Only image and video files allowed');
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
    } else {
      // For videos, just set the file and preview
      setFile(selectedFile);
      setPreview({
        url: URL.createObjectURL(selectedFile),
        type: 'video'
      });
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
  
    setIsSending(true);
    
    try {
      let messageData = {
        sender: currentUser.uid, // Store UID instead of username
        senderName: currentUser.username, // Optional: store username for easy display
        createdAt: serverTimestamp(),
      };

      if (file) {
        setIsUploading(true);
        
        const storageRef = ref(
          storage,
          `messages/${selectedConversation.id}/${Date.now()}_${file.name}`
        );

        // FIX: Changed to use string value for uploadedBy instead of object
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: currentUser.uid // Use string UID instead of the entire object
          }
        });

        // Track upload progress
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
        messageData.text = newMessage;
      }

      // Use batched writes for atomic updates
      const batch = writeBatch(db);
      
      // Add message
      const messagesRef = collection(db, "conversations", selectedConversation.id, "messages");
      const newMessageRef = doc(messagesRef);
      batch.set(newMessageRef, messageData);
      
      // Update conversation
      const conversationRef = doc(db, "conversations", selectedConversation.id);
      batch.update(conversationRef, {
        lastMessage: file ? (file.type.startsWith('image/') ? 'Sent an image' : 'Sent a voice message') : newMessage,
        lastUpdated: serverTimestamp(),
      });

      await batch.commit();
      await updateDoc(doc(db, "conversations", selectedConversation.id), {
        [`typing.${currentUser.uid}`]: false
      });

      setNewMessage("");
      setFile(null);
      setPreview(null);
      setUploadProgress(0);
      removeAudio();

    } catch (error) {
      console.error("Error sending message:", error);
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
        type: "direct",
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

  return (
    <div id='messenger' className="flex h-screen bg-white">
      <Navbar />
      <Sidebar 
        elementColors={ELEMENT_COLORS[currentUser.element]}
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
                className="px-4 py-2 bg-[#ff8c00] text-white rounded disabled:opacity-50"
                onClick={createNewConversation}
                disabled={!partnerName.trim()}
              >
                צור
              </button>
              <button
                className="px-4 py-2 border rounded"
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