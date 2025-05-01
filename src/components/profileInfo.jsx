import React from 'react';
import { MapPin } from 'lucide-react';

const ProfileInfo = ({ profilePic, username, location, bio, postsCount, followersCount, followingCount }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
      {/* Profile Picture */}
      <div className="flex-shrink-0">
        <img
          src={profilePic}
          alt="Profile"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#D94C1A]"
        />
      </div>

      {/* User Details */}
      <div className="flex-1 space-y-4">
        {/* Name & Action */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{username}</h2>
          <button className="px-4 py-1 bg-[#D94C1A] text-white rounded-full text-sm hover:bg-indigo-600 transition">
          עריכת פרופיל
          </button>
        </div>

        {/* Location */}
        <p className="flex items-center text-gray-500 text-sm">
          <MapPin className="mr-1 h-4 w-4" /> {location}
        </p>

        {/* Bio */}
        <p className="text-gray-700 leading-relaxed">{bio}</p>

        {/* Stats */}
        <div className="mt-4 flex justify-between bg-gray-100 rounded-full p-5 max-w-sm">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{postsCount}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{followersCount}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>
        {/* Follow Action */}
        <div className="mt-4 flex justify-center w-full">
          <button className="w-3/4 sm:w-1/2 md:w-1/3 px-6 py-2 bg-[#D94C1A] text-white rounded-full text-sm hover:bg-indigo-600 transition">
          לעקוב
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
