import React, { useState } from 'react';
import { FaVideo, FaPhotoVideo, FaSmile } from 'react-icons/fa';

const CreatePost = ({ addPost, profilePic }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addPost(text.trim());
      setText('');
    }
  };

  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-8 pt-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 space-y-4 border border-orange-200" dir="rtl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header: Avatar + Textarea */}
          <div className="flex items-start gap-4">
            <img
              src={profilePic}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
            />
            <textarea
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>

          {/* Media Options */}
          <div className="flex flex-wrap gap-4 justify-between">
            <button
              type="button"
              className="flex items-center gap-2 flex-1 sm:flex-auto justify-center bg-orange-50 text-orange-600 rounded-lg px-4 py-2 hover:bg-orange-100 transition"
            >
              <FaVideo className="h-5 w-5" />
              וידאו
            </button>
            <button
              type="button"
              className="flex items-center gap-2 flex-1 sm:flex-auto justify-center bg-orange-50 text-orange-600 rounded-lg px-4 py-2 hover:bg-orange-100 transition"
            >
              <FaPhotoVideo className="h-5 w-5" />
              תמונה
            </button>
            <button
              type="button"
              className="flex items-center gap-2 flex-1 sm:flex-auto justify-center bg-orange-50 text-orange-600 rounded-lg px-4 py-2 hover:bg-orange-100 transition"
            >
              <FaSmile className="h-5 w-5" />
              הרגשה/פעילות
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim()}
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