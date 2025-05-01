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
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Header with profile and text input */}
      <div className="flex items-start space-x-4">
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <textarea
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind...?"
          rows="3"
        />
      </div>

      {/* Facebook-style action buttons */}
      <div className="flex justify-between mt-4">
        <button className="flex items-center space-x-2 text-red-500 hover:bg-red-100 px-4 py-2 rounded-lg">
          <FaVideo />
          <span>Live video</span>
        </button>
        <button className="flex items-center space-x-2 text-green-500 hover:bg-green-100 px-4 py-2 rounded-lg">
          <FaPhotoVideo />
          <span>Photo/video</span>
        </button>
        <button className="flex items-center space-x-2 text-orange-500 hover:bg-orange-100 px-4 py-2 rounded-lg">
          <FaSmile />
          <span>Feeling/activity</span>
        </button>
      </div>

      {/* Submit post */}
      <form onSubmit={handleSubmit} className="mt-4">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
