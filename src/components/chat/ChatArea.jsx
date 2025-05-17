// Organize imports
import { useCallback, useState, useRef, useEffect } from "react";
import ChatHeader from './components/ChatHeader';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';
import MessageLoadingState from './components/MessageLoadingState';
import { useChatScroll } from './hooks/useChatScroll';
import { useEmojiPicker } from './hooks/useEmojiPicker';
import BubbleAnimation from './animations/BubbleAnimation';
import ChatInfoSidebar from './ChatIntoSidebar';
import { doc } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';

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
  isSending,
  isLoadingMessages,
  setShowNewChatDialog,
  getChatPartner,
  file,
  preview,
  isUploading,
  uploadProgress,
  handleFileChange,
  removeFile,
  elementColors,
  userAvatars,
  activeTab,
  setShowNewGroupDialog,
  conversations,
  setSelectedConversation
}) {
  const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef } = useEmojiPicker();
  const { messagesEndRef, messagesContainerRef } = useChatScroll(messages, selectedConversation);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
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

  // Handle sending message (show bubble animation before sending)
  const handleSendMessage = async () => {
    let sendingImage = false;
    if (file && file.type && file.type.startsWith('image/')) {
      setIsSendingImage(true);
      sendingImage = true;
    }
    // If a voice recording is ready, send it
    if (audioBlob && !isRecording) {
      setShowBubble(true);
      await sendMessage({ fileOverride: new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' }), mediaTypeOverride: 'audio', durationOverride: recordingTime });
      resetRecording();
      setShowBubble(false);
      return;
    }
    setShowBubble(true);
  };

  const handleBubbleEnd = async () => {
    await sendMessage();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    setShowBubble(false);
    setIsSendingImage(false);
  };

  // Helper to get avatar for direct chat
  const getDirectAvatar = () => {
    if (selectedConversation.type === 'direct') {
      return selectedConversation.partnerProfilePic || null;
    }
    return undefined;
  };

  return (
    <div className='flex-1 flex flex-col relative' dir="rtl">
      {showBubble && (
        <BubbleAnimation onAnimationEnd={handleBubbleEnd} elementColors={elementColors} sendButtonRef={sendButtonRef} icon={elementColors.icon} />
      )}
      {selectedConversation ? (
        <>
          <ChatHeader
            chatTitle={getChatPartner(
              selectedConversation.participants,
              selectedConversation.type,
              selectedConversation.element,
              currentUser,
              undefined,
              selectedConversation.type === 'group' ? selectedConversation.groupName : undefined
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
          />
          <ChatInfoSidebar
            open={showInfoSidebar}
            onClose={() => setShowInfoSidebar(false)}
            conversation={selectedConversation}
            currentUser={currentUser}
            messages={messages}
            elementColors={elementColors}
            setSelectedConversation={setSelectedConversation}
          />
          <div className="flex-1 overflow-y-auto p-4 bg-white"  style={{backgroundColor: elementColors.background}} ref={messagesContainerRef}>
            {isLoadingMessages ? (
              <div className="space-y-4">
                <MessageLoadingState type="text" isOwnMessage={false} elementColors={elementColors} />
                <MessageLoadingState type="image" isOwnMessage={true} elementColors={elementColors} />
                <MessageLoadingState type="text" isOwnMessage={false} elementColors={elementColors} />
              </div>
            ) : isSendingImage ? (
              <>
                {messages.map((msg) => (
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
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">אין הודעות עדיין. התחל את השיחה!</div>
            ) : (
              <>
                {messages.map((msg) => (
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
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
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
            // Voice recording props
            isRecording={isRecording}
            recordingTime={recordingTime}
            startRecording={startRecording}
            stopRecording={stopRecording}
            audioURL={audioURL}
            audioBlob={audioBlob}
            resetRecording={resetRecording}
          />
        </>
      ) : (
        activeTab === "direct" ? (
          <div className="flex-1 flex items-center justify-center bg-white text-right">
            <div className="text-center text-gray-500">
              <p className="text-lg">בחר צ'אט או צור חדש כדי להתחיל</p>
              <button
                onClick={() => setShowNewChatDialog(true)}
                className="mt-4 text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: elementColors.primary }}
              >
                צ'אט חדש
              </button>
            </div>
          </div>
        ) : activeTab === "group" ? (
          <div className="flex-1 flex items-center justify-center bg-white text-right">
            <div className="text-center text-gray-500">
              <p className="text-lg">בחר קבוצה או צור חדשה</p>
              <button
                onClick={() => setShowNewGroupDialog(true)}
                className="mt-4 text-white px-4 py-2 rounded-lg"
                style={{ backgroundColor: elementColors.primary }}
              >
                קבוצה חדשה
              </button>
            </div>
          </div>
        ) : activeTab === "community" ? (
          <div className="flex-1 flex items-center justify-center bg-white text-right">
            <div className="text-center text-gray-500">
              <p className="text-lg">בחר קהילה או צור חדשה</p>
            </div>
          </div>
        ) : <div className="flex-1 flex items-center justify-center bg-white text-right">
          <div className="text-center text-gray-500">
            <p className="text-lg">בחר  </p>
          </div>
        </div>
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