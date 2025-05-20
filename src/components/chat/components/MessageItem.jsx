import React, { useEffect, useState } from 'react';
import getDirection from '../utils/identifyLang';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp&f=y';

// Format seconds as mm:ss
const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.round(s%60)).padStart(2,'0')}`;
const zoomLinkRegex = /(https?:\/\/(?:[\w-]+\.)?zoom\.us\/(?:j|my)\/[\w-]+(?:\?pwd=[\w-]+)?)/g;

// Function to identify and format links and Zoom links in the message
const formatMessageText = (text, elementColors, isOwn) => {
  if (!text) return '';

  // Regex to match all URLs
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?=\s|$)/g;
  // Regex to match Zoom meeting links
  const zoomLinkRegex = /https?:\/\/(?:[\w-]+\.)?zoom\.us\/(?:j|my)\/[\w-]+(?:\?pwd=[\w-]+)?/;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0];
    if (zoomLinkRegex.test(url)) {
      // Zoom meeting button
      parts.push(
        <a
          key={url + match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={isOwn ? {
            backgroundColor: elementColors.light,
            color: elementColors.primary,
            borderRadius: '0.75rem',
            padding: '0.375rem 0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500,
            margin: '0 0.25rem',
            transition: 'background 0.2s',
          } : {
            backgroundColor: elementColors.primary,
            color: elementColors.light,
            borderRadius: '0.75rem',
            padding: '0.375rem 0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500,
            margin: '0 0.25rem',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = elementColors.hover}
          onMouseOut={e => e.currentTarget.style.backgroundColor = isOwn ? elementColors.light : elementColors.primary}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOwn ? elementColors.primary : elementColors.light} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          הצטרף לפגישה
        </a>
      );
    } else {
      // Regular link
      parts.push(
        <a
          key={url + match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={isOwn ? {
            color: elementColors.light,
            textDecoration: 'underline',
            margin: '0 0.25rem',
            transition: 'color 0.2s',
          } : {
            color: elementColors.primary,
            textDecoration: 'underline',
            margin: '0 0.25rem',
            transition: 'color 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.color = elementColors.hover}
          onMouseOut={e => e.currentTarget.style.color = isOwn ? elementColors.light : elementColors.primary}
        >
          {url}
        </a>
      );
    }
    lastIndex = match.index + url.length;
  }
  // Push any remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

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
            {formatMessageText(message.text, elementColors, isOwn)}
          </div>
          <div className="text-xs mt-1 text-gray-400" style={{ fontSize: '0.75rem' }}>
            {formattedTime}
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

          {/* Audio Message */}
          {message.mediaURL && message.mediaType === 'audio' && (
            <div
              className={`relative flex items-center gap-3 px-3 py-2 rounded-2xl shadow-lg transition-all duration-300 max-w-full w-80
                ${isOwn ? 'hover:-translate-y-1' : 'hover:-translate-y-1'}
                before:content-[''] before:absolute before:w-3 before:h-3 before:rotate-45
                ${isOwn ? 'before:-right-1.5' : 'before:-left-1.5'} before:bottom-3`}
              style={{
                background: isOwn
                  ? `linear-gradient(135deg, ${elementColors.primary} 60%, ${elementColors.hover} 100%)`
                  : `linear-gradient(135deg, ${elementColors.light} 60%, #f0f4fa 100%)`,
                border: `2px solid ${isOwn ? elementColors.hover : `${elementColors.light}80`}`,
                boxShadow: `0 4px 20px ${elementColors.light}30`,
                alignItems: 'center',
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
            >
              {/* Audio icon */}
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/70 shadow -mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6V9a6 6 0 10-12 0v3a6 6 0 006 6zm0 0v2m0 0h3m-3 0H9" />
                </svg>
              </span>
              <audio
                src={message.mediaURL}
                controls
                controlsList="nodownload noplaybackrate notime "
                className="flex-1 min-w-0"
                style={{ background: 'transparent', borderRadius: 8, outline: 'none' }}
              />
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
                  ? `linear-gradient(135deg, ${elementColors.primary} 60%, ${elementColors.hover} 100%)`
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
              <div className={`relative ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {formatMessageText(message.text, elementColors, isOwn)}
              </div>
            </div>
          )}


          {/* Timestamp and Duration on the same line, different sides */}
          {message.duration > 0 ? (
            <div className="flex items-center justify-between mt-1 w-full">
              <div
                className={`text-xs text-center px-2 py-1 rounded-full backdrop-blur-sm ${isOwn ? 'order-1' : 'order-2'}`}
                style={{
                  color: elementColors.darkHover,
                  backgroundColor: `${elementColors.darkHover}20`,
                  minWidth: 70
                }}
              >
                {formattedTime}
              </div>
              <div className={`text-xs text-white font-semibold px-3 py-1 rounded-full shadow backdrop-blur-sm ${isOwn ? 'order-2' : 'order-1'}`}
                style={{ letterSpacing: 1, backgroundColor: elementColors.darkHover, minWidth: 70 }}
                aria-label={'total audio duration'}
              >
                {`⏱ ${formatTime(message.duration)}`}
              </div>
            </div>
          ) : (
            <div className={`flex items-center mt-1 w-full ${isOwn ? 'justify-start' : 'justify-end'}`}> 
              <div
                className="text-xs text-center px-2 py-1 rounded-full backdrop-blur-sm"
                style={{
                  color: elementColors.darkHover,
                  backgroundColor: `${elementColors.darkHover}20`,
                  minWidth: 70
                }}
              >
                {formattedTime}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;