// ChatArea.jsx
import { useRef, useEffect } from "react";

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
  isRecording,
  startRecording,
  stopRecording,
  audioURL,
  removeAudio,
  elementColors
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasSetTypingRef = useRef(false);

  const scrollToBottom = (behavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Position scroll at the latest messages but not at the very bottom
  const scrollToLatestMessages = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      // Set scroll position to show the latest messages
      // but leave space at the bottom (about 150px or as needed)
      container.scrollTop = container.scrollHeight - container.clientHeight - 20;
    }
  };

  // Initial load - position at latest messages but don't scroll to bottom
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    // When conversation changes or messages load, position at latest messages
    if (messages.length > 0) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        scrollToLatestMessages();
      }, 50);
    }
    
    const container = messagesContainerRef.current;
    
    resizeObserverRef.current = new ResizeObserver(() => {
      // Only auto-scroll when user is already near bottom
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (isNearBottom) {
        scrollToBottom("auto");
      }
    });

    resizeObserverRef.current.observe(container);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [messages, selectedConversation?.id]);

  const handleMediaLoad = () => {
    const container = messagesContainerRef.current;
    if (container) {
      // Only auto-scroll if user was already near the bottom
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (isNearBottom) scrollToBottom("smooth");
    }
  };

  // Function to handle sending a message and scroll to bottom afterward
  const handleSendMessage = () => {
    sendMessage();
    // Give a moment for the message to be added to the UI
    setTimeout(() => {
      scrollToBottom("smooth");
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col" dir="rtl">
      {selectedConversation ? (
        <>
          <div className="p-4 border-b mt-16 border-gray-200 text-right">
            <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">
              {getChatPartner(selectedConversation.participants, selectedConversation.type, selectedConversation.element)}
            </h3>
            </div>
          </div>
  
          <div
            className="flex-1 overflow-y-auto p-4 bg-white"
            ref={messagesContainerRef}
          >
            {isLoadingMessages ? (
              <div className="text-center text-gray-500 py-8">טוען הודעות...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                אין הודעות עדיין. התחל את השיחה!
              </div>
            ) : (
              messages.map((msg) => (
                msg.type === 'system' ? (
                  <div key={msg.id} className="my-2 text-center">
                    <div className="text-sm text-gray-500 italic">
                      {msg.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {msg.createdAt?.toLocaleTimeString('he-IL')}
                    </div>
                  </div>
                ) : (
                <div
                  key={msg.id}
                  className={`mb-4 ${msg.sender === currentUser.uid ? "text-right" : "text-left"}`}
                >
                  {msg.sender !== currentUser.uid && (
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {getChatPartner(selectedConversation.participants)}
                    </div>
                  )}
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[70%] ${
                      msg.sender === currentUser.uid
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                    style={{
                      backgroundColor: msg.sender === currentUser.uid ? elementColors.primary : elementColors.light
                    }}
                  >
                    {msg.mediaURL && msg.mediaType === 'image' && (
                      <img
                        src={msg.mediaURL}
                        alt="Shared content"
                        className="max-h-60 mb-2 rounded"
                        onLoad={handleMediaLoad}
                      />
                    )}
                    {msg.audioURL && (
                      <audio controls className="mb-2" onLoadedData={handleMediaLoad}>
                        <source src={msg.audioURL} type="audio/webm" />
                        הדפדפן שלך אינו תומך בנגן אודיו.
                      </audio>
                    )}
                    {msg.text}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${msg.sender === currentUser.uid ? "text-right" : "text-left"}`}>
                    {msg.createdAt?.toLocaleTimeString('he-IL') || "עכשיו"}
                  </div>
                </div>)
              ))
            )}
            
            <div ref={messagesEndRef} />
          </div>
  
          <div className="p-4 border-t border-gray-200 bg-white">
            {preview && (
              <div className="relative mb-2">
                <img src={preview.url} alt="תצוגה מקדימה" className="max-h-40 rounded" />
                <button
                  onClick={removeFile}
                  className="absolute top-1 right-1 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700"
                >
                  ×
                </button>
              </div>
            )}
  
            {/* Audio preview */}
            {audioURL && (
              <div className="relative mb-2">
                <audio 
                  controls 
                  className="w-full rounded"
                  style={{ background: elementColors.primary }}
                >
                  <source src={audioURL} type="audio/webm" />
                  הדפדפן שלך אינו תומך בנגן אודיו.
                </audio>
                <button
                  onClick={removeAudio}
                  className="absolute top-1 right-1 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700"
                >
                  ×
                </button>
              </div>
            )}
  
            <div className="flex items-center gap-2">
              {/* File Upload Button */}
              <label className="cursor-pointer p-2 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </label>
  
              {/* Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isRecording 
                    ? "text-white" 
                    : "text-gray-500 hover:text-blue-500"
                }`}
                style={{
                  backgroundColor: isRecording ? elementColors.primary : 'transparent',
                }}
                title={isRecording ? "עצור הקלטה" : "הקלט הודעה קולית"}
              >
                {isRecording ? (
                  <svg className="h-6 w-6" fill="white" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 7a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 2h2v2h-2v-2z"/>
                  </svg>
                )}
              </button>
  
              {/* Text Input */}
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 text-right"
                style={{ 
                  borderColor: 'rgb(209, 213, 219)',
                  focus: { 
                    borderColor: elementColors.primary,
                    ringColor: elementColors.primary 
                  }
                }}
                placeholder={file ? "הוסף כיתוב (אופציונלי)" : "הקלד הודעה..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
  
              {/* Send Button */}
              <button
                className="text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors duration-200 hover:bg-opacity-90"
                style={{ 
                  backgroundColor: elementColors.primary,
                  ':hover': {
                    backgroundColor: elementColors.hover
                  }
                }}
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && !file && !audioURL) || isSending || isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-pulse">מעלה...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </>
                ) : isSending ? (
                  "שולח..."
                ) : (
                  "שלח"
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white text-right">
          <div className="text-center text-gray-500">
            <p className="text-lg">בחר צ'אט או צור חדש כדי להתחיל</p>
            <button
              onClick={() => setShowNewChatDialog(true)}
              className="mt-4 text-white px-4 py-2 rounded-lg duration-200"
              style={{ 
                backgroundColor: elementColors.primary
              }}
            >
              צ'אט חדש
            </button>
          </div>
        </div>
      )}
    </div>
  );
}