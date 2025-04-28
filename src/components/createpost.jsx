import React, { useState } from 'react';
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
      {/* Header with profile pic and input */}
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
          placeholder="What's on your mind?"
          rows="3"
        />
      </div>

      {/* Horizontal line */}
      <hr className="divider" />

      {/* Action buttons (like Facebook) */}
      <div className="post-actions">
        <button type="button" className="action-button">
          📷 Photo/Video
        </button>
        <button type="button" className="action-button">
          🏷️ Tag Friends
        </button>
        <button type="button" className="action-button">
          😀 Feeling/Activity
        </button>
      </div>

      {/* Submit button */}
      <form onSubmit={handleSubmit} className="submit-form">
        <button 
          type="submit" 
          className="post-button"
          disabled={!text.trim()}
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
