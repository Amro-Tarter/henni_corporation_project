import React from 'react';

const MessageItem = ({
  message,
  currentUser,
  selectedConversation,
  getChatPartner,
  elementColors,
  handleMediaLoad
}) => {
  if (!message) return null;

  const isOwn = message.sender === currentUser.uid;
  const isSystem = message.type === 'system';

  // Time formatting function
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "עכשיו";
    
    const dateObj = timestamp?.toDate?.() || timestamp;
    const messageDate = new Date(dateObj);
    const now = new Date();
    
    const diffSeconds = Math.round((now - messageDate) / 1000);
    if (diffSeconds < 60) return "עכשיו";

    return messageDate.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formattedTime = formatMessageTime(message.createdAt);

  return (
    <div className={`flex flex-col ${isOwn ? 'items-start' : 'items-end'} mx-4 my-1`}>
      {isSystem ? (
        <div 
          className="mx-auto px-4 py-2 my-3 text-sm italic rounded-full backdrop-blur-sm"
          style={{
            backgroundColor: `${elementColors.light}80`,
            color: elementColors.darkHover
          }}
        >
          {message.text}
        </div>
      ) : (
        <>
          {!isOwn && (
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold" 
                 style={{ color: elementColors.darkHover }}>
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: elementColors.primary }}
              ></span>
              {selectedConversation.type === "community"
                ? message.senderName
                : getChatPartner(selectedConversation.participants)}
            </div>
          )}
          
          <div 
            className={`relative group max-w-[85%] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
              shadow-lg hover:-translate-y-0.5 hover:shadow-xl rounded-2xl
              ${isOwn ? 'text-white' : 'text-gray-900'}`}
            style={{
              background: isOwn 
                ? elementColors.primary
                : elementColors.light,
              border: `1px solid ${isOwn ? elementColors.primary : elementColors.light}`
            }}
          >
            {message.mediaURL && message.mediaType === 'image' && (
              <img
                src={message.mediaURL}
                alt="תמונה"
                className="max-w-[280px] max-h-[200px] mb-3 rounded-xl shadow-lg object-cover transition-transform hover:scale-102 cursor-zoom-in"
                style={{ border: `1px solid ${elementColors.light}` }}
                onLoad={handleMediaLoad}
              />
            )}
            
            <div className="relative px-4 py-3 pr-12 text-base break-words break-all text-wrap">
              {message.text}
              
              <div className={`absolute bottom-2 ${
                isOwn ? 'right-3' : 'left-3'
              } flex items-center gap-1 text-xs font-mono ${
                isOwn ? 'text-white/80' : 'text-gray-600'
              }`}>
                <span>⌚</span>
                {formattedTime}
              </div>
            </div>

            {!isOwn && (
              <div 
                className="absolute -top-2 -left-2 w-6 h-6 rounded-full shadow-sm flex items-center justify-center text-xs"
                style={{
                  backgroundColor: `${elementColors.light}E6`,
                  backdropFilter: 'blur(4px)',
                  color: elementColors.primary
                }}
              >
                💬
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessageItem;