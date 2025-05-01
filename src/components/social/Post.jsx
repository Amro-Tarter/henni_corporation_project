import React from 'react';

const Post = ({ text, author }) => {
  return (
    <div className="bg-white p-4 shadow-md mb-4">
      <h3 className="font-bold">{author}</h3>
      <p>{text}</p>
    </div>
  );
};

export default Post;
