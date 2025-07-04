// Organize imports
import { useCallback, useState, useRef, useEffect } from "react";
import ChatHeader from './components/ChatHeader';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';
import MessageLoadingState from './components/MessageLoadingState';
import { useChatScroll } from './hooks/useChatScroll';
import { useEmojiPicker } from './hooks/useEmojiPicker';
import ChatInfoSidebar from './ChatIntoSidebar';
import { doc, collection, serverTimestamp, getDoc, setDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useNavigate } from "react-router-dom";
import SystemInquiries from './components/SystemInquiries';
import { color } from "framer-motion";
import getDirection from './utils/identifyLang';

/**
 * ChatArea is the main chat window, displaying messages and input.
 */
export default function ChatArea({
  selectedConversation,
  currentUser,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isLoadingMessages,
  getChatPartner,
  file,
  preview,
  isUploading,
  uploadProgress,
  handleFileChange,
  removeFile,
  elementColors,
  userAvatars,
  conversations,
  setSelectedConversation,
  setMobilePanel,
  showSystemCalls = false,
  onHideSystemCalls = () => {},
  selectedInquiry = null,
  setSelectedInquiry = () => {},
  isLoadingInquiries = false,
  onShowSystemCalls = () => {},
  setNotification,
  mobilePanel,
  ...props
}) {
  // All hooks must be called before any return!
  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    let prevOverflow;
    if (window.innerWidth < 768) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
    // Always return a cleanup function
    return () => {};
  }, []);

  const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef } = useEmojiPicker();
  const { messagesEndRef, messagesContainerRef } = useChatScroll(messages, selectedConversation);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const sendButtonRef = useRef(null);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [liveGroupAvatarURL, setLiveGroupAvatarURL] = useState(null);
  const {
    isRecording,
    audioURL,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();
  const navigate = useNavigate();
  const [isCreatingMentorChat, setIsCreatingMentorChat] = useState(false);
  const [systemCallsView, setSystemCallsView] = useState('list'); // 'list', 'create', 'details'
  const [showCreateInquiryDialog, setShowCreateInquiryDialog] = useState(false);

  // Show scroll-to-bottom button if user scrolls up too far
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollToBottom(distanceFromBottom > 200);
    };
    container.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messagesContainerRef, selectedConversation]);

  // Real-time listener for group avatarURL
  useEffect(() => {
    let unsubscribe;
    if (selectedConversation && selectedConversation.type === 'group' && selectedConversation.id) {
      (async () => {
        const { onSnapshot } = await import('firebase/firestore');
        const groupRef = doc(db, 'conversations', selectedConversation.id);
        unsubscribe = onSnapshot(groupRef, (docSnap) => {
          if (docSnap.exists()) {
            setLiveGroupAvatarURL(docSnap.data().avatarURL || null);
          }
        });
      })();
    } else {
      setLiveGroupAvatarURL(null);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversation && selectedConversation.id, selectedConversation && selectedConversation.type]);

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  // Add emoji to message
  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Handle media load (e.g., images)
  const handleMediaLoad = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (isNearBottom) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesContainerRef, messagesEndRef]);

  // Helper to get avatar for direct chat
  const getDirectAvatar = () => {
    if (selectedConversation.type === 'direct') {
      return selectedConversation.partnerProfilePic || null;
    }
    return undefined;
  };

  // Handler to navigate participant to their mentor chat (create if not exists)
  const handleGoToMentorChat = async () => {
    if (!currentUser?.mentorName || !currentUser?.uid) {
      if (setNotification) {
        setNotification({ message: "לא מוגדר שם מנחה בפרופיל שלך. פנה למנהל המערכת.", type: 'warning', elementColors: elementColors });
        setTimeout(() => setNotification(null), 3500);
      }
      return;
    }
    // Find mentor by username (mentorName)
    let mentorUid = null;
    let mentorUsername = null;
    try {
      const usersRef = collection(db, "users");
      // Normalize the mentor name to handle Hebrew characters properly
      const normalizedMentorName = currentUser.mentorName.trim();
      
      // Search for mentor by username or display name
      const q = query(
        usersRef,
        where("role", "==", "mentor"),
        where("username", "in", [normalizedMentorName, currentUser.mentorName])
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const mentorDoc = snapshot.docs[0];
        mentorUid = mentorDoc.id;
        mentorUsername = mentorDoc.data().username;
      } else {
        // If not found by username, try searching by display name
        const displayNameQuery = query(
          usersRef,
          where("role", "==", "mentor"),
          where("displayName", "==", normalizedMentorName)
        );
        const displayNameSnapshot = await getDocs(displayNameQuery);
        
        if (!displayNameSnapshot.empty) {
          const mentorDoc = displayNameSnapshot.docs[0];
          mentorUid = mentorDoc.id;
          mentorUsername = mentorDoc.data().username;
        } else {
          if (setNotification) {
            setNotification({ message: "לא נמצא משתמש מנחה עם שם זה. פנה למנהל המערכת.", type: 'error', elementColors: elementColors });
            setTimeout(() => setNotification(null), 3500);
          }
          return;
        }
      }
    } catch (err) {
      //console.error("Error finding mentor:", err);
      if (setNotification) {
        setNotification({ message: "שגיאה בחיפוש מנחה. נסה שוב.", type: 'error', elementColors: elementColors });
        setTimeout(() => setNotification(null), 3500);
      }
      return;
    }
    // Find direct conversation with mentor
    const mentorConversation = conversations?.find(
      (conv) =>
        conv.type === "direct" &&
        Array.isArray(conv.participants) &&
        conv.participants.includes(currentUser.uid) &&
        conv.participants.includes(mentorUid)
    );
    if (mentorConversation) {
      setSelectedConversation(mentorConversation);
      navigate(`/chat/${mentorConversation.id}`);
      return;
    }
    // If not found, create it
    setIsCreatingMentorChat(true);
    try {
      const participants = [currentUser.uid, mentorUid].sort();
      const participantNames = [currentUser.username, mentorUsername];
      const unread = {};
      participants.forEach(uid => { unread[uid] = 0; });
      // Create conversation
      const convoRef = doc(collection(db, "conversations"));
      const convoData = {
        participants,
        participantNames,
        type: "direct",
        lastMessage: "",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
        unread,
      };
      await setDoc(convoRef, convoData);
      // Fetch the new conversation
      const newConvo = await getDoc(convoRef);
      if (newConvo.exists()) {
        setSelectedConversation({ id: newConvo.id, ...newConvo.data() });
        navigate(`/chat/${newConvo.id}`);
      } else {
        if (setNotification) {
          setNotification({ message: "שגיאה ביצירת צ'אט עם המנחה. נסה שוב.", type: 'error', elementColors: elementColors });
          setTimeout(() => setNotification(null), 3500);
        }
      }
    } catch (err) {
      if (setNotification) {
        setNotification({ message: "שגיאה ביצירת צ'אט עם המנחה. נסה שוב.", type: 'error', elementColors: elementColors });
        setTimeout(() => setNotification(null), 3500);
      }
    } finally {
      setIsCreatingMentorChat(false);
    }
  };

  // Filter out personal system messages not meant for this user
  const filteredMessages = messages.filter(msg => {
    if (msg.type === 'system') {
      if (msg.systemSubtype === 'personal') {
        return msg.targetUid === currentUser.uid;
      }
      if (msg.systemSubtype === 'group') {
        // Don't show group system messages about the current user to the current user
        if (
          msg.text &&
          (
            msg.text.includes(`הוסיף את ${currentUser.username}`) ||
            msg.text.includes(`הסיר את ${currentUser.username}`) ||
            msg.text.includes(`${currentUser.username} עזב/ה את הקבוצה`)
          )
        ) {
          return false;
        }
      }
    }
    return true;
  });

  // Only show back button on mobile
  const handleBack = () => {
    if (window.innerWidth < 768 && setMobilePanel) setMobilePanel('conversations');
  };

  // Reset systemCallsView when entering/exiting system calls
  useEffect(() => {
    if (showSystemCalls) {
      setSystemCallsView('list');
    }
  }, [showSystemCalls]);

  // Modal overlay for SystemInquiries
  const renderSystemInquiriesModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <SystemInquiries
          onClose={() => {
            setShowCreateInquiryDialog(false);
            setMobilePanel('inquiries list');
            navigate('/chat/inquiry');
          }}
          elementColors={elementColors}
          currentUser={currentUser}
          setSelectedInquiry={(inquiry) => {
            setSelectedInquiry(inquiry);
            if (inquiry) {
              setMobilePanel('selected inquiry');
              navigate(`/chat/inquiry/${inquiry.id}`);
            }
          }}
          isLoadingInquiries={isLoadingInquiries}
          onShowSystemCalls={() => {
            setMobilePanel('inquiries list');
            onShowSystemCalls();
          }}
          setNotification={setNotification}
        />
      </div>
    )
  }

  const urlParams = new URLSearchParams(window.location.search);
  const recipient_id = urlParams.get('recipient');

  if (showCreateInquiryDialog || recipient_id === 'new') {
    return renderSystemInquiriesModal();
  }

  if (showSystemCalls) {


    if (selectedInquiry) {
      return (
        <div 
          className={`flex-1 flex flex-col min-h-full h-full w-full p-0 pb-10 md:pb-0 ${mobilePanel === 'selected inquiry' ? 'block' : 'hidden md:block'}`}
          dir="rtl"
        >
          <div className="flex flex-col h-full w-full items-center justify-center bg-gray-50">
            <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl border flex-1 flex flex-col m-0 overflow-hidden" 
                 style={{ borderColor: elementColors.primary, minHeight: '90vh' }}>
              
              {/* Header - Gmail style */}
              <div className="flex items-start justify-between p-6 border-b" 
                   style={{ borderColor: elementColors.primary }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
                      style={{ 
                        color: elementColors.primary, 
                        backgroundColor: elementColors.background, 
                        borderColor: elementColors.primary 
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" style={{ color: elementColors.primary, strokeWidth: 2 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-4a2 2 0 01-2 2H10a2 2 0 01-2-2H4" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold truncate pr-2" style={{ color: elementColors.primary }}>
                      {selectedInquiry.subject}
                    </h1>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600" style={{ backgroundColor: elementColors.background }}>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 ml-1">מאת:</span>
                      <span className="truncate max-w-[180px]">{selectedInquiry.senderName || selectedInquiry.sender}</span>
                      {selectedInquiry.senderRole === 'admin' && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                          מנהל
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{selectedInquiry.createdAt?.toDate ? selectedInquiry.createdAt.toDate().toLocaleString() : ''}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full"
                  onClick={() => {
                    setSelectedInquiry(null);
                    if (window.innerWidth < 768) {
                      setMobilePanel('inquiries list');
                      navigate('/chat/inquiry');
                    }
                  }}
                  aria-label="סגור"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Body Content */}
              <div className="flex-1 flex flex-col px-6 py-6 md:px-10 md:py-8 overflow-y-auto">
                <div
                  className="text-gray-800 whitespace-pre-line text-base leading-relaxed mb-8 font-normal rounded-lg bg-scroll overflow-auto max-h-96"
                  style={{ backgroundColor: elementColors.background }}
                  dir={getDirection(selectedInquiry.content)}
                >
                  {selectedInquiry.content}
                </div>
                
                {/* Attachment - Gmail style */}
                {selectedInquiry.fileUrl && (
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 w-full max-w-md">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.486 8.486l6.586-6.586" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <a
                        href={selectedInquiry.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm truncate block"
                      >
                        {selectedInquiry.fileName || 'קובץ מצורף'}
                      </a>
                      <span className="text-xs text-gray-500">
                        {Math.round((selectedInquiry.fileSize || 0) / 1024)} KB
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="mt-auto pt-6 border-t" style={{ borderColor: elementColors.primary }}>
                  <div className="flex justify-between items-center">
                    <div></div> {/* Spacer */}
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-full p-4 sm:p-6 ${mobilePanel === 'inquiries list' ? 'block' : 'hidden md:block'}`} dir="rtl">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-4 sm:p-8 flex flex-col items-center justify-center text-center" style={{ border: `2px solid ${elementColors.primary}` }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: elementColors.primary }}>בחר פנייה כדי להציג את פרטיה</h2>
          <button
            className="text-white px-4 py-2 rounded-md hover:scale-105 transition-all duration-300 font-bold text-base"
            style={{ backgroundColor: elementColors.primary }}
            onClick={() => {
              setMobilePanel('new inquiry');
              setShowCreateInquiryDialog(true);
            }}
          >
            צור פנייה חדשה ל{currentUser.role !== 'admin' ? 'מנהל/ת' : 'מנחה או לילד'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col bg-white h-full max-h-full transition-all duration-500 ease-in-out' dir="rtl" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
      {selectedConversation ? (
        <>
          <ChatHeader
            chatTitle={getChatPartner(
              selectedConversation.participants,
              selectedConversation.type,
              selectedConversation.element,
              currentUser,
              undefined,
              selectedConversation.type === 'group' ? selectedConversation.groupName : undefined,
              selectedConversation.participantNames,
              selectedConversation.communityType,
              selectedConversation.mentorName
            )}
            type={selectedConversation.type}
            icon={selectedConversation.type === 'community' ? elementColors.icon : undefined}
            avatar={
              selectedConversation.type === 'group'
                ? liveGroupAvatarURL || selectedConversation.avatarURL || undefined
                : selectedConversation.type === 'direct'
                  ? getDirectAvatar()
                  : undefined
            }
            onInfoClick={() => setShowInfoSidebar(true)}
            mentorName={selectedConversation.mentorName || currentUser.mentorName}
            currentUser={currentUser}
            participantNames={selectedConversation.participantNames}
            communityType={selectedConversation.communityType}
            element={selectedConversation.element}
            onBack={window.innerWidth < 768 ? handleBack : undefined}
            conversation={selectedConversation}
          />
          <ChatInfoSidebar
            open={showInfoSidebar}
            onClose={() => setShowInfoSidebar(false)}
            conversation={selectedConversation}
            currentUser={currentUser}
            messages={messages}
            elementColors={elementColors}
            setSelectedConversation={setSelectedConversation}
            partnerProfilePic={getDirectAvatar()}
            mentorName={currentUser.mentorName}
          />
          <div className="flex flex-col flex-1 min-h-0 max-h-full overflow-y-auto transition-all duration-500 ease-in-out" style={{ height: '100%', maxHeight: '100%' }}>
            <div
              className="flex-1 overflow-y-auto pb-10 transition-all duration-500 ease-in-out"
              style={{ backgroundColor: elementColors.background, height: '100%', maxHeight: '100vh', overflowY: 'auto' }}
              ref={messagesContainerRef}
            >
              {isLoadingMessages ? (
                <div className="space-y-4">
                  <MessageLoadingState type="text" isOwnMessage={false} elementColors={elementColors} />
                  <MessageLoadingState type="image" isOwnMessage={true} elementColors={elementColors} />
                  <MessageLoadingState type="text" isOwnMessage={false} elementColors={elementColors} />
                </div>
              ) : isSendingImage ? (
                <>
                  {filteredMessages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      currentUser={currentUser}
                      avatarUrl={userAvatars[msg.sender]}
                      selectedConversation={selectedConversation}
                      getChatPartner={getChatPartner}
                      elementColors={elementColors}
                      handleMediaLoad={handleMediaLoad}
                    />
                  ))}
                  <MessageLoadingState type="image" isOwnMessage={true} elementColors={elementColors} />
                </>
              ) : filteredMessages.length === 0 && currentUser.role !== 'admin' ? (
                <div className="text-center text-gray-500 py-8">אין הודעות עדיין. התחל את השיחה!</div>
              ) : (
                <>
                  {filteredMessages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      currentUser={currentUser}
                      avatarUrl={userAvatars[msg.sender]}
                      selectedConversation={selectedConversation}
                      getChatPartner={getChatPartner}
                      elementColors={elementColors}
                      handleMediaLoad={handleMediaLoad}
                    />
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
            {(currentUser.role !== 'admin' || (selectedConversation.communityType === 'all_mentors_with_admin' && currentUser.role === 'admin')) && (
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={async () => {
                  if (audioBlob && !isRecording) {
                    try {
                      const voiceFile = new File([audioBlob], `voice_${Date.now()}.webm`, { 
                        type: 'audio/webm',
                        lastModified: Date.now()
                      });
                      await sendMessage({ 
                        fileOverride: voiceFile,
                        mediaTypeOverride: 'audio',
                        durationOverride: Math.round(recordingTime)
                      });
                      resetRecording();
                      if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                      }
                      return;
                    } catch (error) {
                      console.error("Error sending voice message:", error);
                      if (setNotification) {
                        setNotification({ message: "Failed to send voice message. Please try again.", type: 'error', elementColors: elementColors });
                        setTimeout(() => setNotification(null), 3500);
                      }
                      return;
                    }
                  }
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
                    if (setNotification) {
                      setNotification({ message: "שגיאה בשליחת הודעה. נסה שוב.", type: 'error', elementColors: elementColors });
                      setTimeout(() => setNotification(null), 3500);
                    }
                    setIsSendingImage(false);
                  }
                }}
                file={file}
                preview={preview}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                handleFileChange={handleFileChange}
                removeFile={removeFile}
                elementColors={elementColors}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onEmojiClick={onEmojiClick}
                emojiPickerRef={emojiPickerRef}
                sendButtonRef={sendButtonRef}
                isRecording={isRecording}
                recordingTime={recordingTime}
                startRecording={startRecording}
                stopRecording={stopRecording}
                audioURL={audioURL}
                audioBlob={audioBlob}
                resetRecording={resetRecording}
              />
            )}
          </div>
          {showScrollToBottom && (
            <button
              onClick={handleScrollToBottom}
              className="fixed bottom-24 left-8 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
              style={{ color: elementColors.primary }}
              aria-label="גלול למטה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75L12 20.25M12 20.25L4.5 12.75M12 20.25V3.75" />
              </svg>
            </button>
          )}
        </>
      ) : (
        (currentUser.role === 'participant' || currentUser.role === 'mentor') ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-full p-6" dir="rtl">
            <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 flex flex-col items-center justify-center text-center" style={{ border: `2px solid ${elementColors.primary}` }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: elementColors.primary }}>בחר צ'אט או התחל שיחה חדשה</h2>
              <p className="text-gray-500 mb-4">בחר צ'אט מהרשימה או לחץ על הכפתור כדי להתחיל שיחה חדשה.</p>
              {currentUser?.role === "participant" ? (
                <button
                  className="text-white px-4 py-2 rounded-md hover:scale-105 transition-all duration-300 font-bold text-base"
                  style={{ backgroundColor: elementColors.primary }}
                  onClick={handleGoToMentorChat}
                  disabled={isCreatingMentorChat}
                >
                  {isCreatingMentorChat ? "פותח צ'אט..." : "תרגיש חופשי לדבר עם מנחה שלך"}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-full p-6" dir="rtl">
            <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 flex flex-col items-center justify-center text-center" style={{ border: `2px solid ${elementColors.primary}` }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: elementColors.primary }}>בחר צ'אט כדי להציג את פרטיו</h2>
              <p className="text-gray-500">אנא בחר צ'אט מהתפריט כדי לראות את כל הפרטים כאן.</p>
            </div>
          </div>
        )
      )}
      <style>{`
        .message-content {
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        .emoji-text {
          font-size: 1rem;
          line-height: 1.5;
        }
        .emoji-text img.emoji {
          display: inline-block;
          width: 1.4em;
          height: 1.4em;
          vertical-align: -0.15em;
          margin: 0 0.1em;
        }
      `}</style>
    </div>
  );
}