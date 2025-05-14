// Organize imports
import { useCallback, useState } from "react";
import ChatHeader from './ChatHeader';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import MessageLoadingState from './MessageLoadingState';
import { useChatScroll } from './hooks/useChatScroll';
import { useEmojiPicker } from './hooks/useEmojiPicker';
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

  // Handle sending message (show skeleton only for images)
  const handleSendMessage = async () => {
    let sendingImage = false;
    if (file && file.type && file.type.startsWith('image/')) {
      setIsSendingImage(true);
      sendingImage = true;
    }
    await sendMessage();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    if (sendingImage) setIsSendingImage(false);
  };

  return (
    <div className="flex-1 flex flex-col" dir="rtl">
      {selectedConversation ? (
        <>
          <ChatHeader
            chatTitle={getChatPartner(
              selectedConversation.participants,
              selectedConversation.type,
              selectedConversation.element
            )}
          />
          <div className="flex-1 overflow-y-auto p-4 bg-white" ref={messagesContainerRef}>
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