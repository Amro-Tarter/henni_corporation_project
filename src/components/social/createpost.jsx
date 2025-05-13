import React, { useState, useRef } from 'react';
import { FaVideo, FaPhotoVideo, FaRegNewspaper } from 'react-icons/fa';

const CreatePost = ({ addPost, profilePic, element }) => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef();

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
    if (text.trim() || mediaFile) {
      await addPost({ text: text.trim(), mediaType, mediaFile });
      cancelPost();
    }
  };

  return (
    <div className="mb-10 flex justify-center px-4 pt-10" dir="rtl">
      <div className={`w-full max-w-4xl bg-white rounded-2xl p-6 space-y-4 border border-${element}-accent`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar + Textarea */}
          <div className="flex items-start gap-4">
            <img
              src={profilePic}
              alt="Profile"
              className={`w-12 h-12 rounded-full object-cover ring-2 ring-${element}-accent ring-offset-1`}
            />
            <textarea
              className={`flex-1 bg-${element}-soft rounded-xl px-4 py-3 text-sm text-${element}-dark resize-none focus:outline-none focus:ring-2 focus:ring-${element}-accent transition ${mediaType === 'blog' ? 'h-40' : 'h-24'}`}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={mediaType === 'blog' ? 'כתוב כאן את הבלוג שלך...' : 'מה שלומך היום?'}
              dir="rtl"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onFileChange}
          />

          {/* Media & Blog Buttons */}
          <div className="flex flex-wrap gap-4 justify-between">
            <button
              type="button"
              onClick={() => pickMedia('video', 'video/*')}
              className={`flex items-center gap-2 flex-1 justify-center bg-${element}-soft text-${element} rounded-lg px-4 py-2 hover:bg-${element}-accent transition`}
            >
              <FaVideo className="h-5 w-5" /> וידאו
            </button>

            <button
              type="button"
              onClick={() => pickMedia('photo', 'image/*')}
              className={`flex items-center gap-2 flex-1 justify-center bg-${element}-soft text-${element} rounded-lg px-4 py-2 hover:bg-${element}-accent transition`}
            >
              <FaPhotoVideo className="h-5 w-5" /> תמונה
            </button>

            <button
              type="button"
              onClick={startBlog}
              className={`flex items-center gap-2 flex-1 justify-center rounded-lg px-4 py-2 transition ${
                mediaType === 'blog'
                  ? `bg-${element}-accent text-white`
                  : `bg-${element}-soft text-${element} hover:bg-${element}-accent`
              }`}
            >
              <FaRegNewspaper className="h-5 w-5" /> בלוג
            </button>
          </div>

          {/* Media Preview */}
          {previewUrl && (
            <div className="mt-4 flex justify-center">
              {mediaType === 'photo' ? (
                <img src={previewUrl} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
              ) : (
                <video src={previewUrl} controls className="max-w-xs rounded-lg shadow-md" />
              )}
            </div>
          )}

          {/* Submit + Cancel Buttons */}
          <div className="flex justify-end">
            <div
              className={`flex gap-3 transition-all duration-500 ${
                text.trim() || mediaFile ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
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
  );
};

export default CreatePost;
