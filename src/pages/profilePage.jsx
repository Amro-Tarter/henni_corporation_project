import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import LeftSidebar from '../components/LeftSideBar';
import RightSidebar from '../components/RightsideBar';
import ProfileInfo from '../components/profileInfo';
import CreatePost from '../components/CreatePost';
import Post from '../components/ProfilePost';

const ProfilePage = () => {
  const [profilePic] = useState('/laith.jpg');
  const [username] = useState('Laith Mimi');
  const [location] = useState('Jerusalem');
  const [bio] = useState('Software engineer, tech enthusiast, love bitches.');
  const [postsCount] = useState(10);
  const [followersCount] = useState(150);
  const [followingCount] = useState(100);

  const posts = [
    {
      id: 1,
      userAvatar: profilePic,
      username: username,
      timeAgo: '2h ago',
      mediaType: 'image',
      media: '/sculpture.jpg',
      description: 'This is a cool post!',
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
      description: 'Check out my latest project!',
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
        {/* Fixed Left Sidebar */}
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 border-r border-gray-200">
          <LeftSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 w-full space-y-12 lg:ml-[16rem] lg:mr-[16rem]">
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

        {/* Fixed Right Sidebar */}
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 right-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
