import React from 'react';
import './profileInfo.css';

const ProfileInfo = ({ profilePic, username, location, bio, postsCount, followersCount, followingCount }) => {
  return (
    <div className="profile-info-container">
      {/* Left Section: Stats */}
      <div className="stats-container">
        <div className="stat">
          <h3>{postsCount}</h3>
          <p>Posts</p>
        </div>
        <div className="stat">
          <h3>{followersCount}</h3>
          <p>Followers</p>
        </div>
        <div className="stat">
          <h3>{followingCount}</h3>
          <p>Following</p>
        </div>
      </div>

      {/* Follow button outside the stats container */}
      <button className="follow-button">Follow</button>

      {/* Right Section: Profile Info */}
      <div className="profile-info">
        <div className="profile-pic-wrapper">
          <img
            src={profilePic || '/assets/default_user_pic.jpg'}
            alt="Profile"
            className="profile-pic"
          />
        </div>
        <div className="profile-details">
          <h2 className="username">{username}</h2>
          <p className="location">{location}</p>
          <p className="bio">{bio}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
