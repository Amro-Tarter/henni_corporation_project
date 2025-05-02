import React from 'react';
import { MapPin } from 'lucide-react';

const ProfileInfo = ({
  profilePic,
  username,
  location,
  bio,
  postsCount,
  followersCount,
  followingCount
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center md:items-start w-full max-w-3xl mx-auto gap-6">

      {/* Profile Picture */}
      <div className="flex-shrink-0">
        <img
          src={profilePic}
          alt="Profile"
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900">{username}</h2>
            <div className="h-1 w-12 bg-orange-500 rounded mt-1"></div>
          </div>
          <button className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition">
            ערוך פרופיל
          </button>
        </div>

        {/* Location & Bio */}
        <div className="mt-3 space-y-2">
          <p className="flex items-center text-gray-500 text-sm">
            <MapPin className="ml-1 h-4 w-4" /> {location}
          </p>
          <p className="text-gray-700 text-sm leading-normal">{bio}</p>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 text-center bg-orange-50 rounded-lg p-3 gap-4">
          <div>
            <p className="text-xl font-bold text-gray-900">{postsCount}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{followersCount}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>

        {/* Follow Button */}
        <div className="mt-4 flex justify-center">
          <button className="w-full max-w-xs px-5 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition">
            לעקוב
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProfileInfo;
