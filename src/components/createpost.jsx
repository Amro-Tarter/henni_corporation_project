import React, { useState } from 'react';
import { FaVideo, FaPhotoVideo, FaSmile } from 'react-icons/fa';

const CreatePost = ({ addPost }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addPost(text);
      setText('');
    }
  };

  return (
    <div className="w-full flex justify-center bg-[#FDF0DC] min-h-screen pt-20">
      <div className="bg-white w-[500px] rounded-xl p-4 shadow-md" dir="rtl">
        {/* Header with profile and text input */}
        <div className="flex flex-row-reverse items-start gap-2 mb-4">
          <img
            src="https://via.placeholder.com/40"
            alt="פרופיל"
            className="w-10 h-10 rounded-full object-cover"
          />
          <textarea
            className="flex-grow border-none bg-[#f0f2f5] rounded-2xl px-4 py-2 text-sm resize-none h-5 focus:outline-none focus:bg-[#e4e6eb]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="על מה אתה חושב...?"
            rows="3"
          />
        </div>

        {/* Facebook-style action buttons */}
        <div className="flex justify-between mb-3">
          <button className="flex items-center gap-2 bg-[#D94C1A] text-white rounded-md px-3 py-2 text-sm hover:bg-[#e4e6eb] hover:text-black transition">
            <FaVideo color="red" /> שידור חי
          </button>
          <button className="flex items-center gap-2 bg-[#D94C1A] text-white rounded-md px-3 py-2 text-sm hover:bg-[#e4e6eb] hover:text-black transition">
            <FaPhotoVideo color="green" /> תמונה/וידאו
          </button>
          <button className="flex items-center gap-2 bg-[#D94C1A] text-white rounded-md px-3 py-2 text-sm hover:bg-[#e4e6eb] hover:text-black transition">
            <FaSmile color="orange" /> תחושה/פעילות
          </button>
        </div>

        {/* Submit post */}
        <form onSubmit={handleSubmit} className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-[#1877f2] text-white font-bold rounded-md px-5 py-2 text-base transition disabled:bg-[#b8d2f1] disabled:cursor-not-allowed hover:enabled:bg-[#166fe5]"
          >
            פרסם
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
