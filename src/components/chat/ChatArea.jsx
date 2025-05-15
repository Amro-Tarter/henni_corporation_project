// Organize imports
import { useCallback, useState, useRef } from "react";
import ChatHeader from './ChatHeader';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import MessageLoadingState from './MessageLoadingState';
import { useChatScroll } from './hooks/useChatScroll';
import { useEmojiPicker } from './hooks/useEmojiPicker';
import BubbleAnimation from './animations/BubbleAnimation';
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
  elementColors
}) {
  const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef } = useEmojiPicker();
  const { messagesEndRef, messagesContainerRef } = useChatScroll(messages, selectedConversation);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const sendButtonRef = useRef(null);

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
    setShowBubble(true);
  };

  const handleBubbleEnd = async () => {
    await sendMessage();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    setShowBubble(false);
    setIsSendingImage(false);
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
              selectedConversation.element
            )}
            type={selectedConversation.type}
            icon={selectedConversation.type === 'community' ? elementColors.icon : undefined}
            avatar={selectedConversation.type === 'direct' ? selectedConversation.partnerProfilePic : undefined}
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
          />
        </>
      ) : (
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