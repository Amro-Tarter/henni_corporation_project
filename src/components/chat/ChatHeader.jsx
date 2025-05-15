import React from 'react';

/**
 * ChatHeader displays the name of the chat partner or community.
 */
const ChatHeader = ({ chatTitle, avatar, icon, type }) => (
  <div className="p-4 z-50 shadow-xl mt-16 border-gray-200 text-right flex items-center gap-3">
    {type === 'community' ? (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">{icon}</span>
    ) : avatar ? (
      <img src={avatar} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
    ) : (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">👤</span>
    )}
    <h3 className="font-bold text-lg text-gray-900">{chatTitle}</h3>
  </div>
);

export default ChatHeader; 