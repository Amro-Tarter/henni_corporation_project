import React, { useEffect, useState } from 'react';
import getDirection from '../utils/identifyLang';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp&f=y';

const MessageItem = ({
  message,
  currentUser,
  avatarUrl,
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
  const [showFullImage, setShowFullImage] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    if (!showFullImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowFullImage(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullImage]);

  // Avatar logic
  let avatarSrc = DEFAULT_AVATAR;
  if (avatarUrl) {
    avatarSrc = avatarUrl;
  } else if (!isOwn && selectedConversation.type === 'direct') {
    avatarSrc = selectedConversation.partnerProfilePic || DEFAULT_AVATAR;
  }

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
          src={avatarSrc}
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

          {/* Image Message (separate div) */}
          {message.mediaURL && message.mediaType === 'image' && (
            <div className="relative mb-2 overflow-hidden rounded-xl flex justify-center">
              <img
                src={message.mediaURL}
                alt="תמונה"
                className="max-w-[240px] max-h-[180px] object-cover shadow-inner cursor-pointer"
                style={{
                  border: `4px solid ${elementColors.primary}90`,
                  aspectRatio: '16/9'
                }}
                onClick={() => setShowFullImage(true)}
                onLoad={handleMediaLoad}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Fullscreen Overlay */}
          {showFullImage && (
            <div
              onClick={() => setShowFullImage(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
            >
              {/* Close Button */}
              <button
                onClick={e => { e.stopPropagation(); setShowFullImage(false); }}
                className="absolute top-4 left-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 z-60"
                style={{fontSize: 24, lineHeight: 1}}
                aria-label="סגור"
              >
                ×
              </button>
              {/* Download Button */}
              <a
                href={message.mediaURL}
                download={message.fileName || 'image'}
                onClick={e => e.stopPropagation()}
                className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 z-60"
                title="הורד תמונה"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
              </a>
              <img
                src={message.mediaURL}
                alt="תמונה בגודל מלא"
                className="max-w-full max-h-full object-contain"
              />
              {/* Filename */}
              {message.fileName && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white bg-black/60 rounded px-3 py-1 text-sm select-all">
                  {message.fileName}
                </div>
              )}
            </div>
          )}

          {/* Text Message Bubble (only if text exists) */}
          {message.text && (
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
              <span className={`relative ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {message.text}
              </span>
            </div>
          )}

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