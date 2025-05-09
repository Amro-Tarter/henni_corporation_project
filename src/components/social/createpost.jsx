import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaPhotoVideo, FaSmile, FaTimes, FaRegNewspaper } from 'react-icons/fa';

const CreatePost = ({ addPost, profilePic = '/try.webp' }) => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const contentEditableRef = useRef(null);
  const fileInputRef = useRef(null);

  const pickMedia = (type, accept) => {
    setMediaType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const startBlog = () => {
    setMediaType('blog');
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setMediaFile(file);

    const reader = new FileReader();
    reader.onload = (event) => setMediaPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() || mediaFile) {
      await addPost({ text: text.trim(), mediaType, mediaFile });
      setText('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      if (contentEditableRef.current) contentEditableRef.current.textContent = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInput = (e) => {
    setText(e.currentTarget.textContent || '');
  };

  useEffect(() => {
    const el = contentEditableRef.current;
    if (!el) return;

    const handleFocus = () => {
      if (el.textContent === 'מה שלומך היום?') el.textContent = '';
    };

    const handleBlur = () => {
      if (el.textContent === '') el.textContent = 'מה שלומך היום?';
    };

    if (text === '') el.textContent = 'מה שלומך היום?';

    el.addEventListener('focus', handleFocus);
    el.addEventListener('blur', handleBlur);

    return () => {
      el.removeEventListener('focus', handleFocus);
      el.removeEventListener('blur', handleBlur);
    };
  }, [text]);

  return (
    <div className="mb-10 flex justify-center px-4 sm:px-6 md:px-8 pt-10" dir="rtl">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 space-y-4 border border-orange-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={profilePic}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
            />
            <div
              ref={contentEditableRef}
              className={`flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 h-24 focus:outline-none focus:ring-2 focus:ring-orange-300 transition overflow-y-auto`}
              onInput={handleInput}
              contentEditable
              suppressContentEditableWarning
            />
          </div>

          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              {mediaFile?.type?.startsWith('image/') ? (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-96 object-contain" />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-96" />
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

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-4 justify-between">
            <button
              type="button"
              onClick={() => pickMedia('video', 'video/*')}
              className="flex items-center gap-2 flex-1 justify-center bg-orange-50 text-orange-600 rounded-lg px-4 py-2 hover:bg-orange-100 transition"
            >
              <FaVideo className="h-5 w-5" /> וידאו
            </button>

            <button
              type="button"
              onClick={() => pickMedia('photo', 'image/*')}
              className="flex items-center gap-2 flex-1 justify-center bg-orange-50 text-orange-600 rounded-lg px-4 py-2 hover:bg-orange-100 transition"
            >
              <FaPhotoVideo className="h-5 w-5" /> תמונה
            </button>

            <button
              type="button"
              onClick={startBlog}
              className={`flex items-center gap-2 flex-1 justify-center rounded-lg px-4 py-2 transition ${
                mediaType === 'blog'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              <FaRegNewspaper className="h-5 w-5" /> בלוג
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim() && !mediaFile}
              className="bg-orange-500 text-white font-semibold rounded-full px-6 py-2 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-orange-600 transition"
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
