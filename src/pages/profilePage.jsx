import React, { useState } from 'react';
import Navbar from '../components/social/Navbar.jsx';
import LeftSidebar from '../components/social/LeftSideBar';
import RightSidebar from '../components/social/Rightsidebar.jsx';
import ProfileInfo from '../components/social/profileInfo.jsx';
import CreatePost from '../components/social/CreatePost';
import Post from '../components/social/ProfilePost.jsx';

const ProfilePage = () => {
  // Controls whether the right sidebar is visible
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Profile data
  const profilePic = '/laith.jpg';
  const username = 'Laith Mimi';
  const location = 'Jerusalem';
  const bio = 'Software engineer, tech enthusiast, love bitches.';
  const postsCount = 10;
  const followersCount = 150;
  const followingCount = 100;

  // Example posts
  const posts = [
    {
      id: 1,
      userAvatar: profilePic,
      username: username,
      timeAgo: '2h ago',
      mediaType: 'image',
      media: '/sculpture.jpg',
      description: 'איזה פיסול מדהים!',
      likes: 120,
      comments: 10,
    },
    {
      id: 2,
      userAvatar: profilePic,
      username: username,
      timeAgo: '1d ago',
      mediaType: 'video',
      media: '/video/background vid.mp4',
      description: 'הנה סרטון מהטיול שלי!',
      likes: 85,
      comments: 14,
    },
  ];

  const addPost = (text) => {
    console.log('New Post:', text);
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-1 pt-[56.8px]">

        {/* Left Sidebar */}
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 border-r border-gray-200">
          <LeftSidebar />
        </aside>

        {/* Main Content: margin adjusts when sidebar toggles */}
        <main
          className={
            `
            flex-1 p-6 space-y-12
            transition-all duration-300 ease-in-out
            lg:ml-[16rem]
            ${isRightOpen ? 'lg:mr-[16rem]' : 'lg:mr-0'}
            `
          }
        >
          <ProfileInfo
            profilePic={profilePic}
            username={username}
            location={location}
            bio={bio}
            postsCount={postsCount}
            followersCount={followersCount}
            followingCount={followingCount}
          />

          <CreatePost addPost={addPost} profilePic={profilePic} />

          <section className="space-y-6">
            {posts.map((post) => (
              <Post key={post.id} post={post} profilePic={profilePic} />
            ))}
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 right-0">
          <RightSidebar
            isOpen={isRightOpen}
            toggle={() => setIsRightOpen((o) => !o)}
          />
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
