import React, { useState } from 'react';
import Navbar from '../components/Navbar';  // Import Navbar
import ProfileInfo from '../components/profileInfo';  // Import ProfileInfo component
import './profilePage.css';     // Import ProfilePage CSS

const ProfilePage = () => {
  const [profilePic, setProfilePic] = useState('/assets/default_user_pic.jpg'); // Correct path for assets
  const [username, setUsername] = useState("Mohamad Dweik");
  const [location, setLocation] = useState("Jerusalem");
  const [bio, setBio] = useState("Software engineer, tech enthusiast, love bitches.");

  // Stats for posts, followers, and following
  const [postsCount, setPostsCount] = useState(10);
  const [followersCount, setFollowersCount] = useState(150);
  const [followingCount, setFollowingCount] = useState(100);

  return (
    <div className="profile-page">
      <Navbar />  {/* Navbar at the top */}
      
      <div className="profile-container">
        {/* ProfileInfo contains both profile info and stats */}
        <ProfileInfo 
          profilePic={profilePic} 
          username={username} 
          location={location} 
          bio={bio}
          postsCount={postsCount} 
          followersCount={followersCount} 
          followingCount={followingCount}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
