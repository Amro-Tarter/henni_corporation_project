import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaPhotoVideo, FaSmile, FaTimes } from 'react-icons/fa';

const CreatePost = ({ addPost }) => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);
  const contentEditableRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || media) {
      addPost({
        text: text.trim(),
        media: mediaPreview ? {
          url: mediaPreview,
          type: media.type.startsWith('image/') ? 'image' : 'video'
        } : null
      });
      setText('');
      setMedia(null);
      setMediaPreview(null);
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = '';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInput = (e) => {
    setText(e.currentTarget.textContent || '');
  };

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    // Validate file size (5MB max for example)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setMedia(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle placeholder
  useEffect(() => {
    const el = contentEditableRef.current;
    if (!el) return;

    const handleFocus = () => {
      if (el.textContent === 'What\'s on your mind?') {
        el.textContent = '';
      }
    };

    const handleBlur = () => {
      if (el.textContent === '') {
        el.textContent = 'What\'s on your mind?';
      }
    };

    if (text === '') {
      el.textContent = 'What\'s on your mind?';
    }

    el.addEventListener('focus', handleFocus);
    el.addEventListener('blur', handleBlur);

    return () => {
      el.removeEventListener('focus', handleFocus);
      el.removeEventListener('blur', handleBlur);
    };
  }, [text]);

  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-8 pt-5">
      <div className="mb-10 w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 space-y-4" dir="rtl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <img
              src="/try.webp"
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div
              ref={contentEditableRef}
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-800 h-12 focus:outline-none focus:bg-gray-200 transition flex items-center overflow-y-auto"
              onInput={handleInput}
              contentEditable
              suppressContentEditableWarning
            />
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              {media.type.startsWith('image/') ? (
                <img 
                  src={mediaPreview} 
                  alt="Preview" 
                  className="w-full max-h-96 object-contain"
                />
              ) : (
                <video 
                  src={mediaPreview} 
                  controls 
                  className="w-full max-h-96"
                />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Media Options */}
          <div className="flex flex-wrap gap-4 justify-between">
            <button
              type="button"
              className="flex items-center gap-2 flex-1 sm:flex-auto justify-center bg-red-50 text-red-600 rounded-lg px-4 py-2 hover:bg-red-100 transition"
            >
              <FaVideo className="h-5 w-5" />
              מסך חי
            </button>
            <button
              type="button"
              onClick={handleMediaClick}
              className="flex items-center gap-2 flex-1 sm:flex-auto justify-center bg-green-50 text-green-600 rounded-lg px-4 py-2 hover:bg-green-100 transition"
            >
              <FaPhotoVideo className="h-5 w-5" />
              תמונה/וידאו
            </button>
            <button
              type="button"
              className="flex items-center gap-2 flex-1 sm:flex-auto justify-center bg-yellow-50 text-yellow-600 rounded-lg px-4 py-2 hover:bg-yellow-100 transition"
            >
              <FaSmile className="h-5 w-5" />
              הרגשה/פעילות
            </button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim() && !media}
              className="bg-blue-600 text-white font-semibold rounded-full px-6 py-2 text-sm disabled:bg-blue-200 disabled:cursor-not-allowed hover:enabled:bg-blue-700 transition"
            >
              פוסט
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;