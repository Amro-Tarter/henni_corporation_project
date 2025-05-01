import React, { useState } from 'react';
import { FaVideo, FaPhotoVideo, FaSmile } from 'react-icons/fa';

const CreatePost = ({ addPost }) => {
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
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 space-y-4" dir="rtl">
        {/* Header with avatar and textarea */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <img
              src="/default_user_pic.jpg"
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <textarea
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 resize-none h-24 focus:outline-none focus:bg-gray-200 transition"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>

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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim()}
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
