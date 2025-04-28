import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow-md mb-4">
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="bg-blue-500 text-white mt-2 px-4 py-2 rounded" type="submit">Post</button>
    </form>
  );
};

export default CreatePost;
