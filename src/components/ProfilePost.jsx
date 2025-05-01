import React from 'react';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';

const Post = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 max-w-3xl mx-auto">
      {/* Optional: Post Header */}
      <div className="flex items-center px-4 py-3">
        <img
          src={post.userAvatar || '/default_user_pic.jpg'}
          alt={post.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
        />
        <div className="mr-3 text-right">
          <h3 className="text-sm font-semibold text-gray-900">{post.username}</h3>
          <p className="text-xs text-gray-500">{post.timeAgo}</p>
        </div>
      </div>

      {/* Media (adjusts height automatically) */}
      {post.mediaType && (
        <div className="w-full bg-gray-100">
          {post.mediaType === 'image' ? (
            <img
              src={post.media}
              alt="Post Media"
              className="w-full h-auto object-contain"
            />
          ) : post.mediaType === 'video' ? (
            <video className="w-full h-auto object-contain" controls>
              <source src={post.media} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      )}

      {/* Description */}
      {post.description && (
        <div className="px-4 py-3">
          <p className="text-gray-700 text-sm leading-relaxed">{post.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-200 flex justify-between text-gray-600 text-sm">
        <button className="flex items-center gap-2 hover:text-indigo-500 transition">
          <FaThumbsUp /> {post.likes}
        </button>
        <button className="flex items-center gap-2 hover:text-indigo-500 transition">
          <FaComment /> {post.comments}
        </button>
        <button className="flex items-center gap-2 hover:text-indigo-500 transition">
          <FaShare /> Share
        </button>
      </div>
    </div>
  );
};

export default Post;