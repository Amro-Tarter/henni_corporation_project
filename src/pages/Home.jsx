import React, { useState } from 'react';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/createpost';
import PostList from '../components/social/Postlist';
import Sidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';

const Home = () => {
  const [posts, setPosts] = useState([
    { 
      text: "Hello world!", 
      author: { name: "Admin", avatar: "/default-avatar.png" },
      id: 1
    },
    { 
      text: "My first post!", 
      author: { name: "User1", avatar: "/default-avatar.png" },
      id: 2
    }
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  const addPost = (postData) => {
    const newPost = {
      text: postData.text,
      author: {
        name: "Current User", // Replace with actual user data
        avatar: "/try.webp"   // Same as in CreatePost
      },
      media: postData.media || null,
      id: Date.now() // Unique ID for each post
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex min-h-screen bg-[#FDF0DC]">
      {/* Left Sidebar - fixed positioning */}
      <div className="fixed left-0 h-full z-10">
        {isLeftSidebarOpen && <LeftSidebar />}
      </div>

      {/* Main Content Area - with proper margin for both sidebars */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isLeftSidebarOpen ? 'ml-64' : 'ml-0'
        } ${
          isSidebarOpen ? 'mr-64' : 'mr-0'
        }`}
      >
        <Navbar 
          isLeftSidebarOpen={isLeftSidebarOpen}
          setIsLeftSidebarOpen={setIsLeftSidebarOpen}
        />
        <div className="pt-20 px-4 flex justify-center">
          <div className="w-full max-w-2xl">
            <CreatePost addPost={addPost} />
            <PostList posts={posts} />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="fixed right-0 h-full">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>
    </div>
  );
};

export default Home;