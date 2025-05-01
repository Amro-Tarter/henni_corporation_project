import React from 'react';
import Post from './Post';

const PostList = ({ posts }) => {
  return (
    <div>
      {posts.map((post, idx) => (
        <Post key={idx} text={post.text} author={post.author} />
      ))}
    </div>
  );
};

export default PostList;
