//createPost.jsx
import React, { useState, useRef } from 'react';
import { FaVideo, FaPhotoVideo, FaRegNewspaper } from 'react-icons/fa';
import { containsBadWord } from './utils/containsBadWord';
import EmojiPickerPopover from './EmojiPickerPopover';
import { Smile } from 'lucide-react';
import ElementalLoader from '/src/theme/ElementalLoader.jsx';

const CreatePost = ({ addPost, profilePic, element }) => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef();
  const [warning, setWarning] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef();
  const [loading, setLoading] = useState(false);

  const pickMedia = (type, accept) => {
    setMediaType(type);
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const onFileChange = e => {
    const f = e.target.files[0];
    if (f) {
      setMediaFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const startBlog = () => {
    setMediaType('blog');
    setMediaFile(null);
    setPreviewUrl(null);
  };

  const cancelPost = () => {
    setText('');
    setMediaFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!text.trim() && !mediaFile) return;

    if (containsBadWord(text)) {
      setWarning('הפוסט מכיל מילים לא ראויות!');
      setTimeout(() => setWarning(''), 3500);
      return;
    }
    setLoading(true); // show loader
    try {
      await addPost({ text: text.trim(), mediaType, mediaFile });
      cancelPost();
      setWarning('');
    } finally {
      setLoading(false); // hide loader
    }
  };

  const insertEmoji = (emojiObject) => {
    const sym = emojiObject.emoji;
    const textarea = document.querySelector('#createpost-textarea');
    if (!textarea) return;
    const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
    setText(prev => prev.slice(0, start) + sym + prev.slice(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + sym.length, start + sym.length);
    }, 0);
  };

  const openEmojiPicker = () => {
    setShowEmoji(true);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
          <ElementalLoader element={element} />
        </div>
      )}
      {warning && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 400,
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: '14px 22px',
            fontWeight: 500,
            textAlign: 'center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
            fontSize: '1rem',
            pointerEvents: 'none'
          }}
        >
          {warning}
        </div>
      )}
      <div className="mb-10 flex justify-center px-4" dir="rtl">
        <div className={`w-full max-w-4xl bg-white rounded-2xl p-4 space-y-4 border border-${element}-accent`}>
          <form onSubmit={handleSubmit}>
            {/* Avatar + Textarea */}
            <div className="flex items-start gap-4">
              <img
                src={profilePic}
                alt="Profile"
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-${element}-accent ring-offset-1`}
              />
              <textarea
                id="createpost-textarea"
                className={`flex-1 bg-${element}-soft rounded-xl px-4 py-2 text-sm text-${element}-dark resize-none focus:outline-none focus:ring-2 focus:ring-${element}-accent transition ${mediaType === 'blog' ? 'h-40' : 'h-24'}`}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={mediaType === 'blog' ? 'כתוב כאן את הבלוג שלך...' : 'מה שלומך היום?'}
                dir="rtl"
              />
              <button
                type="button"
                ref={emojiBtnRef}
                onClick={openEmojiPicker}
                className={`
                hidden ml-2 px-2 py-2 
                rounded-md 
                bg-${element}-soft 
                text-${element} 
                hover:bg-${element}-accent 
                hover:text-white 
                transition-colors 
                md:flex items-center emoji-picker-btn
              `}
                aria-label="הוסף אימוג׳י"
              >
                <Smile size={18} />
              </button>
              <EmojiPickerPopover
                anchorRef={emojiBtnRef}
                open={showEmoji}
                onClose={() => setShowEmoji(false)}
                onEmojiClick={emojiObject => {
                  insertEmoji(emojiObject);
                }}
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileChange}
            />

            {/* Media & Blog Buttons */}
            <div className="flex flex-wrap gap-4 justify-between pt-3">
              <button
                type="button"
                onClick={() => pickMedia('video', 'video/*')}
                className={`flex items-center gap-2 flex-1 justify-center rounded-lg px-4 py-2 transition bg-${element} text-white border border-${element} hover:shadow-lg hover:opacity-90`}
              >
                <FaVideo className="h-5 w-5" /> וידאו
              </button>

              <button
                type="button"
                onClick={() => pickMedia('photo', 'image/*')}
                className={`flex items-center gap-2 flex-1 justify-center rounded-lg px-4 py-2 transition bg-${element} text-white border border-${element} hover:shadow-lg hover:opacity-90`}
              >
                <FaPhotoVideo className="h-5 w-5" /> תמונה
              </button>

              <button
                type="button"
                onClick={startBlog}
                className={`flex items-center gap-2 flex-1 justify-center rounded-lg px-4 py-2 transition bg-${element} text-white border border-${element} hover:shadow-lg hover:opacity-90`}
              >
                <FaRegNewspaper className="h-5 w-5" /> בלוג
              </button>
            </div>

            {/* Media Preview */}
            {previewUrl && (
              <div className="mt-2 flex justify-center">
                {mediaType === 'photo' ? (
                  <img src={previewUrl} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
                ) : (
                  <video src={previewUrl} controls className="max-w-xs rounded-lg shadow-md" />
                )}
              </div>
            )}

            {/* Submit + Cancel Buttons */}
            <div className="flex justify-end mt-1">
              <div
                className={`flex gap-3 transition-all duration-500 ${text.trim() || mediaFile ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
              >
                <button
                  type="button"
                  onClick={cancelPost}
                  className={`bg-${element}-soft text-${element}-accent font-semibold rounded-full px-6 py-2 text-sm hover:bg-${element}-accent hover:text-white transition`}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className={`bg-${element} text-white font-semibold rounded-full px-6 py-2 text-sm hover:bg-${element}-accent transition`}
                >
                  פוסט
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePost;