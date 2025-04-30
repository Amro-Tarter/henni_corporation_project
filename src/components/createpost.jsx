import React, { useState } from 'react';
import { FaVideo, FaPhotoVideo, FaSmile } from 'react-icons/fa';
import './CreatePost.css';

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
    <div className="create-post" dir="rtl">
      {/* Header with profile and text input */}
      <div className="create-post-header">
        <img
          src="https://via.placeholder.com/40"
          alt="פרופיל"
          className="profile-pic"
        />
        <textarea
          className="post-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="על מה אתה חושב...?"
          rows="3"
        />
      </div>

      {/* Facebook-style action buttons */}
      <div className="post-actions">
        <button className="action-button">
          <FaVideo color="red" /> שידור חי
        </button>
        <button className="action-button">
          <FaPhotoVideo color="green" /> תמונה/וידאו
        </button>
        <button className="action-button">
          <FaSmile color="orange" /> תחושה/פעילות
        </button>
      </div>

      {/* Submit post */}
      <form onSubmit={handleSubmit} className="submit-form">
        <button
          className="post-button"
          type="submit"
          disabled={!text.trim()}
        >
          פרסם
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
