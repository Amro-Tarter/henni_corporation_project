import React, { useEffect, useState } from 'react';
import getDirection from './utils/identifyLang';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp&f=y';

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

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!message.sender) return;
      try {
        const storage = getStorage();
        const avatarRef = ref(storage, `profiles/${message.sender}.jpg`);
        const url = await getDownloadURL(avatarRef);
        setAvatarUrl(url);
      } catch (err) {
        setAvatarUrl(DEFAULT_AVATAR);
      }
    };
    fetchAvatar();
  }, [message.sender]);

  if (isSystem) {
    return (
      <div className="flex w-full justify-center my-2">
        <div className="flex flex-col items-center max-w-[60vw]">
          <div
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 italic text-center shadow-sm"
            style={{ fontSize: '1rem', lineHeight: 1.5 }}
          >
            {message.text}
          </div>
          <div className="text-xs mt-1 text-gray-400" style={{ fontSize: '0.75rem' }}>
            {formatMessageTime(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'} w-full px-4 py-2 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start gap-1 max-w-[85%]`}>
        {/* Avatar (always visible but positioned differently) */}
        <img
          src={avatarUrl}
          alt="avatar"
          className={`w-8 h-8 rounded-full object-cover border-2 shadow-sm transition-transform ${
            isOwn ? 'ml-2 order-2' : 'mr-2 order-1'
          }`}
          style={{
            borderColor: isOwn ? elementColors.primary : elementColors.light,
            backgroundColor: elementColors.light
          }}
        />

        {/* Message Content Container */}
        <div className={`flex flex-col text-wrap ${isOwn ? 'items-start' : 'items-end'} flex-1 max-w-[33vw]`}>
          {/* Sender Name */}
          {!isOwn && selectedConversation.type !== 'direct' && (
            <div className="text-xs font-medium mb-1 px-2 py-1 rounded-full"
                 style={{ 
                   backgroundColor: `${elementColors.light}80`,
                   color: elementColors.darkHover
                 }}>
              {message.senderName || getChatPartner(selectedConversation.participants)}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-lg transition-all duration-300 break-words whitespace-pre-line max-w-full
              ${isOwn ? 'hover:-translate-y-1' : 'hover:-translate-y-1'}
              before:content-[''] before:absolute before:w-3 before:h-3 before:rotate-45
              ${isOwn ? 'before:-right-1.5' : 'before:-left-1.5'} before:bottom-3`}
            style={{
              background: isOwn 
                ? `linear-gradient(135deg, ${elementColors.primary}, ${elementColors.hover})`
                : elementColors.light,
              border: `1px solid ${isOwn ? elementColors.hover : `${elementColors.light}80`}`,
              boxShadow: `0 4px 20px ${elementColors.light}30`,
              // Bubble pointer
              ...(isOwn ? {
                before: {
                  backgroundColor: elementColors.primary,
                  right: '-0.35rem'
                }
              } : {
                before: {
                  backgroundColor: elementColors.light,
                  left: '-0.35rem'
                }
              })
            }}
            dir={getDirection(message.text)}
          >
            {message.mediaURL && message.mediaType === 'image' && (
              <div className="relative mb-2 overflow-hidden rounded-xl">
                <img
                  src={message.mediaURL}
                  alt="תמונה"
                  className="max-w-[240px] max-h-[180px] object-cover shadow-inner"
                  style={{ 
                    border: `1px solid ${elementColors.light}80`,
                    aspectRatio: '16/9'
                  }}
                  onLoad={handleMediaLoad}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            )}

            <span className={`relative ${isOwn ? 'text-white' : 'text-gray-800'}`}>
              {message.text}
            </span>
          </div>

          {/* Timestamp */}
          <div
            className={`text-xs mt-1 px-2 py-1 rounded-full backdrop-blur-sm ${
              isOwn ? 'text-right' : 'text-left'
            }`}
            style={{
              color:  elementColors.darkHover,
              backgroundColor:
                `${elementColors.darkHover}20` 
            }}
          >
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;