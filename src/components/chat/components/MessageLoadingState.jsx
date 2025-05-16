import React from 'react';

/**
 * MessageLoadingState shows a skeleton loader for messages.
 */
const MessageLoadingState = ({ type, isOwnMessage, elementColors }) => (
  <div className={`mb-4 ${isOwnMessage ? "text-right" : "text-left"}`}>
    <div
      className={`inline-block p-3 rounded-lg max-w-[70%] relative overflow-hidden ${
        isOwnMessage ? "text-white" : "text-gray-800"
      }`}
      style={{
        backgroundColor: isOwnMessage ? elementColors.primary : elementColors.light
      }}
    >
      {/* Loading animation overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 loading-shine"></div>
      {type === 'text' && (
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-current opacity-20 rounded w-24"></div>
          <div className="h-4 bg-current opacity-20 rounded w-32"></div>
        </div>
      )}
      {type === 'audio' && (
        <div className="flex items-center gap-2 min-w-[200px]">
          <div className="w-8 h-8 rounded-full bg-current opacity-20"></div>
          <div className="flex-1">
            <div className="w-full h-4 bg-current opacity-20 rounded"></div>
          </div>
          <div className="w-12 h-4 bg-current opacity-20 rounded"></div>
        </div>
      )}
      {type === 'image' && (
        <div className="flex flex-col gap-2">
          <div className="w-48 h-32 bg-current opacity-20 rounded"></div>
          <div className="h-4 bg-current opacity-20 rounded w-24"></div>
        </div>
      )}
    </div>
    <div className="text-xs text-gray-500 mt-1">
      <div className="h-3 bg-gray-200 rounded w-12 inline-block"></div>
    </div>
    <style>{`
      .loading-shine {
        animation: shine 1.5s infinite;
        transform: skewX(-20deg);
      }
      @keyframes shine {
        0% { transform: translateX(-100%) skewX(-20deg); }
        100% { transform: translateX(200%) skewX(-20deg); }
      }
    `}</style>
  </div>
);

export default MessageLoadingState; 