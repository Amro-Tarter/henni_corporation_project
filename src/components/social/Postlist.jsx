import React from 'react';
import Post from './Post';

const PostList = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post, idx) => (
        <Post 
          key={idx} 
          text={post.text} 
          author={post.author || { name: 'Anonymous', avatar: '' }}
          media={post.media}
        />
      ))}
    </div>
  );
};

export default PostList;