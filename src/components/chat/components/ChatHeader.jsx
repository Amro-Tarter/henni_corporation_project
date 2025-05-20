import React from 'react';

/**
 * ChatHeader displays the name of the chat partner or community.
 */
const ChatHeader = ({ chatTitle, avatar, icon, type, onInfoClick, mentorName, currentUser }) => {
  const handleVideoCall = () => {
    // Open Zoom meeting link in a new tab
    window.open('https://zoom.us/start', '_blank');
  };

  return (
    <div className="p-4 z-30 shadow-xl mt-16 border-gray-200 text-right flex items-center gap-3 relative">
      {type === 'community' ? (
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">{icon}</span>
      ) : avatar ? (
        <img src={avatar} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
      ) : (
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">👤</span>
      )}
      <h3 className="font-bold text-lg text-gray-900">{chatTitle}</h3>
      {chatTitle === mentorName && (
        <div className="text-gray-500 mt-1 text-sm">מנטור שלך</div>
      )}
      {currentUser.role === 'mentor' && (
        <button
          onClick={handleVideoCall}
          className="ml-2 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="התחל שיחת וידאו"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </button>
      )}
      <button
        onClick={onInfoClick}
        className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 absolute left-4 top-1/2 -translate-y-1/2"
        aria-label="פרטי צ'אט"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    </div>
  );
};

export default ChatHeader; 