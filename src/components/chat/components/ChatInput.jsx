import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import getDirection from '../utils/identifyLang';

/**
 * ChatInput handles message input, emoji picker, and file upload.
 */
const ChatInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  file,
  preview,
  isUploading,
  uploadProgress,
  handleFileChange,
  removeFile,
  elementColors,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  emojiPickerRef
}) => (
  <div className="p-4 border-t border-gray-200 bg-white">
    {/* Image Preview */}
    {preview && (
      <div className="relative mb-3 border rounded p-2 bg-gray-50">
        <img src={preview.url} alt="תצוגה מקדימה" className="max-h-40 rounded" />
        <div className="text-sm text-gray-600 mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
        <button
          onClick={removeFile}
          className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
      </div>
    )}

    {/* Input Row */}
    <div className="flex items-center gap-2">
      {/* Emoji Picker */}
      <div className="relative" ref={emojiPickerRef}>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-500 hover:text-blue-500 transition-colors p-2"
          title="הוסף אימוג'י (Ctrl/Cmd + E)"
        >
          <span className="text-xl">😊</span>
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <div className="shadow-lg rounded-lg bg-white">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                searchPlaceholder="חפש אימוג'י..."
                width={300}
                height={400}
              />
            </div>
          </div>
        )}
      </div>

      {/* File Upload */}
      <label className="cursor-pointer text-gray-500 hover:text-blue-500">
        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </label>

      {/* Text Input */}
      <input
        type="text"
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring break-words break-all"
        style={{ borderColor: 'rgb(209, 213, 219)' }}
        placeholder={file ? "הוסף כיתוב (אופציונלי)" : "הקלד הודעה..."}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        dir={getDirection(newMessage)}
      />

      {/* Send Button */}
      <button
        className="text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
        style={{ backgroundColor: elementColors.primary }}
        onClick={handleSendMessage}
        disabled={(!newMessage.trim() && !file) || isUploading}
      >
        {isUploading ? (
          <span className="animate-pulse">מעלה... {Math.round(uploadProgress)}%</span>
        ) : "שלח"}
      </button>
    </div>
  </div>
);

export default ChatInput; 