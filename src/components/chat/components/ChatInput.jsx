import React, { useEffect, useRef, useState, memo } from 'react';
import EmojiPicker from 'emoji-picker-react';
import getDirection from '../utils/identifyLang';
import '../animations/ChatInput.css';
/**
 * ChatInput handles message input, emoji picker, and file upload.
 */
const ChatInput = memo(({
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
  const inputRef = useRef(null);

  // Add a placeholder for when input is disabled
  const disabledPlaceholder = "לא ניתן להקליד הודעה בזמן שליחת תמונה";

  // Memoize expensive calculations
  const formatTime = React.useCallback((s) => 
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.round(s%60)).padStart(2,'0')}`, 
    []
  );

  // Optimize file button visibility
  useEffect(() => {
    const hasMessage = newMessage.trim() !== "";
    if (!hasMessage !== showFileButton) {
      setShowFileButton(!hasMessage);
    }
  }, [newMessage]);

  // Optimize send handler with debounce
  const handleSend = React.useCallback((e) => {
    if (e) e.preventDefault();
    
    // Don't send if recording or uploading voice
    if (isRecording || isUploadingVoice) {
      return;
    }

    handleSendMessage();
  }, [isRecording, isUploadingVoice, handleSendMessage]);

  // Optimize input handler
  const handleInputChange = React.useCallback((e) => {
    setNewMessage(e.target.value);
  }, [setNewMessage]);

  // Optimize emoji handler
  const handleEmojiSelect = React.useCallback((emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  }, [setNewMessage]);

  return (
    <div className="p-2 border-t border-gray-200 bg-white bottom-0 left-0 w-full relative">
      {/* Image Preview */}
      {preview && (
        <div className="relative mb-2 sm:mb-3 border rounded p-2 bg-gray-50 overflow-x-auto max-w-full">
          <img src={preview.url} alt="תצוגה מקדימה" className="max-h-24 sm:max-h-32 rounded mx-auto" />
          <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate max-w-[80vw]">{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            aria-label="הסר קובץ"
          >
            ×
          </button>
        </div>
      )}

      {/* Voice Recording Preview & Controls */}
      {audioURL && !isRecording && (
        <div className="relative mb-2 sm:mb-3 border rounded p-2 flex flex-col items-end bg-gray-50 max-w-full">
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
          {recordingTime > 0 && (
            <div className="text-xs sm:text-sm ml-2 text-white mt-1">סה'כ משך: {formatTime(recordingTime)}</div>
          )}
        </div>
      )}

      {/* Input Row */}
      <form onSubmit={handleSend} className="flex flex-row flex-wrap items-center gap-x-2 gap-y-2 w-full">
        {/* File Upload */}
        <div
          ref={fileButtonRef}
          className={`file-upload-anim${showFileButton ? '' : ' file-upload-hide'} flex-shrink-0 w-auto`}
        >
          <label className='cursor-pointer text-gray-500 hover:scale-105 flex items-center justify-center w-auto' style={{color: elementColors.primary, borderColor: elementColors.primary, backgroundColor: elementColors.light}}>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={!!newMessage.trim()} />
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="5" width="20" height="16" rx="2" strokeWidth="2" />
              <path d="M21 19l-5.5-7-4.5 6-3-4-4 5" strokeWidth="2" />
              <circle cx="7.5" cy="9.5" r="1.5" strokeWidth="2" />
            </svg>
          </label>
        </div>

        {/* Voice Recording Button & Controls */}
        {!preview && !file && !newMessage.trim() && !audioURL && (
          <div className="flex items-center flex-shrink-0 w-auto justify-center">
            {!isRecording && (
              <button
                type="button"
                className="text-gray-500 hover:text-red-600 transition-colors hover:scale-95 hover:bg-gray-100 p-2 rounded-full border border-gray-300 bg-white w-12 h-12 flex items-center justify-center"
                style={{ color: elementColors.primary }}
                onClick={startRecording}
                title="הקלט הודעה קולית"
                disabled={isUploading || isUploadingVoice}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a4 4 0 004-4V7a4 4 0 10-8 0v7a4 4 0 004 4zm0 0v2m0 0h3m-3 0H9" />
                </svg>
              </button>
            )}
            {isRecording && (
              <div className="flex items-center gap-2 w-auto justify-center">
                <span className="text-red-600 font-bold">●</span>
                <span className="text-gray-700 font-mono text-xs sm:text-sm">{formatTime(recordingTime)}</span>
                <button
                  type="button"
                  className="px-2 py-2 text-white rounded-full hover:bg-gray-100 w-10 h-10 flex items-center justify-center"
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
          type="submit"
          className="text-white px-2 py-2 rounded-full transition duration-200 opacity-85 disabled:opacity-50 hover:opacity-100 hover:scale-90 min-w-[48px] min-h-[48px] flex-shrink-0 w-auto"
          style={{ backgroundColor: elementColors.primary }}
          ref={sendButtonRef}
          onClick={handleSend}
          aria-label="שלח הודעה"
          disabled={
            isRecording || 
            isUploadingVoice || 
            ((!newMessage.trim() && !file && !audioBlob) || 
             (newMessage.trim() && (file || audioBlob)) || 
             isUploading)
          }
        >
          {isUploading ? (
            <span className="animate-pulse">מעלה... {Math.round(uploadProgress)}%</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.96l15.2-6.53a1 1 0 011.32 1.32l-6.53 15.2a1 1 0 01-1.82.06l-2.1-4.2a1 1 0 00-.45-.45l-4.2-2.1a1 1 0 01.06-1.82z" />
            </svg>
          )}
        </button>

        {/* Input with Emoji Button Inside */}
        {!preview && (
          <div className="relative flex-1 min-w-0 w-full" ref={emojiPickerRef}>
            <input
              ref={inputRef}
              type="text"
              className="w-full p-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring bg-white placeholder:text-right text-xs sm:text-sm min-h-[40px]"
              style={{ borderColor: 'rgb(209, 213, 219)' }}
              placeholder={isRecording || isUploadingVoice ? disabledPlaceholder : "...הקלד הודעה"}
              value={newMessage}
              onChange={handleInputChange}
              dir={getDirection(newMessage)}
              disabled={isRecording || isUploadingVoice}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors p-1 w-8 h-8 flex items-center justify-center"
              style={{ opacity: 0.5 }}
              title="הוסף אימוג'י (Ctrl/Cmd + E)"
              disabled={isRecording || isUploadingVoice}
            >
              <span className="text-xl">😊</span>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50 max-w-[90vw]">
                <div className="shadow-lg rounded-lg bg-white">
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    searchPlaceholder="חפש אימוג'י..."
                    width={260}
                    height={320}
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        
      </form>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput; 