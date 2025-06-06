// components/social/Postlist.jsx
import React, { memo } from 'react';
import Post from './Post';
import Project from './Project';

const PostList = memo(({
  posts,
  onLike,
  onDelete,
  onUpdate,
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  element,
  getAuthorProfile,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(item => {
        // If item has a 'title', treat as project; else as post
        if (item.title) {
          return (
            <Project
              key={item.id}
              project={item}
              element={element}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onLike={onLike}
              comments={comments[item.id] || []}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              isOwner={item.authorId === currentUser?.uid}
              getUserProfile={getAuthorProfile}
              allUsers={currentUser?.allUsers || []}
            />
          );
        } else {
          return (
            <Post
              key={item.id}
              post={item}
              element={element}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onLike={onLike}
              comments={comments[item.id] || []}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              isOwner={item.authorId === currentUser?.uid}
              getAuthorProfile={getAuthorProfile}
            />
          );
        }
      })}
    </div>
  );
});

export default PostList;