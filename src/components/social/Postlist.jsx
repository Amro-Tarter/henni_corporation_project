// components/social/Postlist.jsx
import React from 'react';
import Post from './Post';

const PostList = ({
  posts,
  onLike,
  onDelete,
  onUpdate,
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  element
}) => {
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          element={element}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onLike={onLike}
          comments={comments[post.id] || []}
          currentUser={currentUser}
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default PostList;