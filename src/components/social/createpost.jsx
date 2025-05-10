import React, { useState, useRef } from 'react';
import { FaVideo, FaPhotoVideo, FaRegNewspaper } from 'react-icons/fa';

const CreatePost = ({ addPost, profilePic, element }) => {
  const [text, setText]           = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const fileInputRef              = useRef();

  // Handle picking video/photo via hidden file input
  const pickMedia = (type, accept) => {
    setMediaType(type);
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const onFileChange = e => {
    const f = e.target.files[0];
    if (f) setMediaFile(f);
  };

  const startBlog = () => {
    setMediaType('blog');
    setMediaFile(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (text.trim() || mediaFile) {
      await addPost({ text: text.trim(), mediaType, mediaFile });
      setText('');
      setMediaFile(null);
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex justify-center px-4 pt-10" dir="rtl">
      <div
        className={`
          w-full max-w-4xl
          bg-white rounded-2xl p-6 space-y-4
          border border-${element}-accent
        `}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar + Textarea */}
          <div className="flex items-start gap-4">
            <img
              src={profilePic}
              alt="Profile"
              className={`
                w-12 h-12 rounded-full object-cover
                ring-2 ring-${element}-accent ring-offset-1
              `}
            />
            <textarea
              className={`
                flex-1 bg-${element}-soft rounded-xl
                px-4 py-3 text-sm text-${element}-dark
                resize-none focus:outline-none
                focus:ring-2 focus:ring-${element}-accent
                transition
                ${mediaType === 'blog' ? 'h-40' : 'h-24'}
              `}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={
                mediaType === 'blog'
                  ? 'כתוב כאן את הבלוג שלך...'
                  : 'מה שלומך היום?'
              }
              dir="rtl"
            />
          </div>

          {/* Hidden file input for photo/video */}
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
              className={`
                flex items-center gap-2 flex-1 justify-center
                bg-${element}-soft text-${element}
                rounded-lg px-4 py-2
                hover:bg-${element}-accent transition
              `}
            >
              <FaVideo className="h-5 w-5" /> וידאו
            </button>

            <button
              type="button"
              onClick={() => pickMedia('photo', 'image/*')}
              className={`
                flex items-center gap-2 flex-1 justify-center
                bg-${element}-soft text-${element}
                rounded-lg px-4 py-2
                hover:bg-${element}-accent transition
              `}
            >
              <FaPhotoVideo className="h-5 w-5" /> תמונה
            </button>

            <button
              type="button"
              onClick={startBlog}
              className={`
                flex items-center gap-2 flex-1 justify-center
                rounded-lg px-4 py-2 transition
                ${mediaType === 'blog'
                  ? `bg-${element}-accent text-white`
                  : `bg-${element}-soft text-${element} hover:bg-${element}-accent`
                }
              `}
            >
              <FaRegNewspaper className="h-5 w-5" /> בלוג
            </button>
          </div>

          {/* Preview selected media file */}
          {mediaFile && (
            <div className={`mt-2 text-right text-sm text-${element}-dark`}>
              📎 {mediaFile.name}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim() && !mediaFile}
              className={`
                bg-${element} text-white font-semibold
                rounded-full px-6 py-2 text-sm
                disabled:bg-${element}-soft disabled:cursor-not-allowed
                hover:bg-${element}-accent transition
              `}
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