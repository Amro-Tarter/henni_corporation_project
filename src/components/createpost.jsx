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
    <div className="create-post">
      {/* Header with profile and text input */}
      <div className="create-post-header">
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="profile-pic"
        />
        <textarea
          className="post-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind...?"
          rows="3"
        />
      </div>

      {/* Facebook-style action buttons */}
      <div className="post-actions">
        <button className="action-button">
          <FaVideo color="red" /> Live video
        </button>
        <button className="action-button">
          <FaPhotoVideo color="green" /> Photo/video
        </button>
        <button className="action-button">
          <FaSmile color="orange" /> Feeling/activity
        </button>
      </div>

      {/* Submit post */}
      <form onSubmit={handleSubmit} className="submit-form">
        
      </form>
    </div>
  );
};

export default CreatePost;