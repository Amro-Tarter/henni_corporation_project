import React from 'react';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';

const Post = ({ post, profilePic }) => (
  <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden mb-6 max-w-3xl mx-auto" dir="rtl">
    {/* Header */}
    <div className="flex items-center px-4 py-3">
      <img
        src={profilePic}
        alt={post.username}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-orange-500"
      />
      <div className="flex flex-col mr-3 text-right">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{post.username}</h3>
        <p className="text-xs sm:text-sm text-gray-500">{post.timeAgo}</p>
      </div>
    </div>

   {/* Description */}
   {post.description && (
      <div className="px-4 py-3">
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{post.description}</p>
      </div>
    )}

    {/* Media */}
    {post.mediaType && (
      <div className="w-full bg-gray-100 overflow-hidden h-[600px]">
        {post.mediaType === 'image' ? (
          <img
            src={post.media}
            alt="Post Media"
            className="w-full h-full object-cover"
          />
        ) : (
          <video className="w-full h-full object-cover" controls>
            <source src={post.media} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    )}

    {/* Actions */}
    <div className="px-4 py-2 border-t border-orange-200  gap-8 flex text-base">
      <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
        <FaThumbsUp className="text-l" />
        <span className="text-lg">{post.likes}</span>
      </button>
      <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
        <FaComment className="text-l" />
        <span className="text-lg">{post.comments}</span>
      </button>
      <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
        <FaShare className="text-l" />
        <span className="text-lg">Share</span>
      </button>
    </div>
  </div>
);

export default Post;