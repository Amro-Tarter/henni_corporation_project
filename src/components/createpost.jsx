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
    <div className="mb-10 flex justify-center items-start bg-[#FDF0DC] pt-20 px-4 sm:px-6 md:px-8">
      <div className="bg-white  w-[800px] rounded-xl p-4 shadow-md" dir="rtl">
        {/* Header with profile and text input */}
        <div className="flex flex-row-reverse items-start gap-2 mb-4">
          <img
            src="/try.webp"
            alt="פרופיל"
            className="w-10 h-10 rounded-full object-cover"
          />
          <textarea
            className="flex-grow border-none bg-[#f0f2f5] rounded-2xl px-4 py-2 text-sm resize-none h-9 focus:outline-none focus:bg-[#e4e6eb]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="על מה אתה חושב...?"
            rows="3"
          />
        </div>

        {/* Facebook-style action buttons */}
        <div className="flex justify-between gap-2 flex-wrap sm:flex-nowrap mb-3">
          <button className="flex items-center gap-2 bg-[#D94C1A] text-white rounded-md px-3 py-2 text-sm hover:bg-[#e4e6eb] hover:text-black transition w-full sm:w-auto justify-center sm:justify-start">
            <FaVideo color="red" /> שידור חי
          </button>
          <button className="flex items-center gap-2 bg-[#D94C1A] text-white rounded-md px-3 py-2 text-sm hover:bg-[#e4e6eb] hover:text-black transition w-full sm:w-auto justify-center sm:justify-start">
            <FaPhotoVideo color="green" /> תמונה/וידאו
          </button>
          <button className="flex items-center gap-2 bg-[#D94C1A] text-white rounded-md px-3 py-2 text-sm hover:bg-[#e4e6eb] hover:text-black transition w-full sm:w-auto justify-center sm:justify-start">
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
