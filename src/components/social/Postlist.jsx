// PostList.js
import React from 'react';
import Post from './Post';

const PostList = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post, idx) => (
        <Post 
          key={post.id || idx} 
          post={{
            username: post.author?.name || 'Anonymous',
            timeAgo: 'Just now',
            media: post.media,
            mediaType: post.media?.endsWith('.mp4') ? 'video' : post.media ? 'image' : null,
            description: post.text,
            likes: post.likes || 0,
            comments: post.comments || 0,
          }}
          profilePic={post.author?.avatar || '/default-avatar.png'}
        />
      ))}
    </div>
  );
};

export default PostList;
