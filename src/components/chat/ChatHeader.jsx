import React from 'react';

/**
 * ChatHeader displays the name of the chat partner or community.
 */
const ChatHeader = ({ chatTitle }) => (
  <div className="p-4 z-50 shadow-xl mt-16 border-gray-200 text-right">
    <h3 className="font-bold text-lg text-gray-900">{chatTitle}</h3>
  </div>
);

export default ChatHeader; 