import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import getDirection from '../utils/identifyLang';
import '../animations/ChatInput.css';
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
  emojiPickerRef,
  sendButtonRef,
  // Voice recording props:
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  audioURL,
  audioBlob,
  resetRecording,
  onSendVoiceMessage,
  isUploadingVoice
}) => {
  const [showFileButton, setShowFileButton] = useState(true);
  const fileButtonRef = useRef(null);

  // Add a placeholder for when input is disabled
  const disabledPlaceholder = "לא ניתן להקליד הודעה בזמן שליחת תמונה";

  // Format seconds as mm:ss
  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.round(s%60)).padStart(2,'0')}`;

  useEffect(() => {
    if (!newMessage || newMessage.trim() === "") {
      setShowFileButton(true);
    } else {
      setShowFileButton(false);
    }
  }, [newMessage]);

  return (
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

      {/* Voice Recording Preview & Controls */}
      {audioURL && !isRecording && (
        <div className="relative mb-3 border rounded p-2 flex flex-col items-end"
         style={{ backgroundColor: elementColors.darkHover }}
         >
          <div className="flex gap-2">
            <button
              className="px-2.5 -z-1 py-1 -mb-3 -ml-1 bg-gray-300 text-gray-800 rounded-full shadow-lg hover:bg-gray-200 hover:z-10"
              onClick={resetRecording}
              aria-label="Close voice recording"
            >
              ✕
            </button>
          </div>
          <audio
            src={audioURL}
            controls
            className="w-full mb-1 opacity-95"
          />
          {/* Show total duration from recordingTime */}
          {recordingTime > 0 && (
            <div className="text-sm ml-2 text-white mt-1">סה"כ משך: {formatTime(recordingTime)}</div>
          )}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {/* File Upload */}
        <div
          ref={fileButtonRef}
          className={`file-upload-anim${showFileButton ? '' : ' file-upload-hide'}`}
        >
          <label className='cursor-pointer text-gray-500 hover:scale-105' style={{color: elementColors.primary, borderColor: elementColors.primary, backgroundColor: elementColors.light}}>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={!!newMessage.trim()} />
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="5" width="20" height="16" rx="2" strokeWidth="2" />
              <path d="M21 19l-5.5-7-4.5 6-3-4-4 5" strokeWidth="2" />
              <circle cx="7.5" cy="9.5" r="1.5" strokeWidth="2" />
            </svg>
          </label>
        </div>

        {/* Voice Recording Button & Controls */}
        {!preview && !file && !newMessage.trim() && !audioURL && (
          <div className="flex items-center">
            {!isRecording && (
              <button
                className="text-gray-500 hover:text-red-600 transition-colors hover:scale-95 hover:bg-gray-100 p-2 rounded-full border border-gray-300 bg-white mr-1"
                style={{ color: elementColors.primary }}
                onClick={startRecording}
                title="הקלט הודעה קולית"
                disabled={isUploading || isUploadingVoice}
              >
                {/* Microphone Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a4 4 0 004-4V7a4 4 0 10-8 0v7a4 4 0 004 4zm0 0v2m0 0h3m-3 0H9" />
                </svg>
              </button>
            )}
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">●</span>
                <span className="text-gray-700 font-mono">{formatTime(recordingTime)}</span>
                <button
                  className="px-2 py-2 text-white rounded-full hover:bg-gray-100"
                  onClick={stopRecording}
                  style={{ backgroundColor: elementColors.backgroundColor }}
                >
                  🟥
                </button>
              </div>
            )}
          </div>
        )}

        {/* Send Button */}
        <button
          className="text-white px-2 py-2 rounded-full transition duration-200 opacity-85 disabled:opacity-50 hover:opacity-100 hover:scale-90"
          style={{ backgroundColor: elementColors.primary }}
          onClick={handleSendMessage}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={(!newMessage.trim() && !file && !audioBlob) || (newMessage.trim() && (file || audioBlob)) || isUploading || isRecording || isUploadingVoice}
          ref={sendButtonRef}
        >
          {isUploading ? (
            <span className="animate-pulse">מעלה... {Math.round(uploadProgress)}%</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.96l15.2-6.53a1 1 0 011.32 1.32l-6.53 15.2a1 1 0 01-1.82.06l-2.1-4.2a1 1 0 00-.45-.45l-4.2-2.1a1 1 0 01.06-1.82z" />
            </svg>
          )}
        </button>

        {/* Input with Emoji Button Inside */}
        {!preview && (
          <div className="relative flex-1" ref={emojiPickerRef}>
            <input
              type="text"
              className="w-full p-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring bg-wat placeholder:text-right"
              style={{ borderColor: 'rgb(209, 213, 219)' }}
              placeholder={"...הקלד הודעה"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              dir={getDirection(newMessage)}
              disabled={isRecording || isUploadingVoice}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors p-1"
              style={{ opacity: 0.5 }}
              title="הוסף אימוג'י (Ctrl/Cmd + E)"
              disabled={isRecording || isUploadingVoice}
            >
              <span className="text-xl">😊</span>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <div className="shadow-lg rounded-lg bg-white">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setNewMessage(prev => prev + emojiObject.emoji);
                    }}
                    searchPlaceholder="חפש אימוג'י..."
                    width={300}
                    height={400}
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 