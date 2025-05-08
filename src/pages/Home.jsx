import React, { useState } from 'react';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/createpost';
import PostList from '../components/social/Postlist';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';
import { Button } from '../components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([
    {
      text: 'Hello world!',
      author: { name: 'Admin', avatar: '/default-avatar.png' },
      id: 1,
    },
    {
      text: 'My first post!',
      author: { name: 'User1', avatar: '/default-avatar.png' },
      id: 2,
    },
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  const addPost = (postData) => {
    const newPost = {
      text: postData.text,
      author: {
        name: 'Current User',
        avatar: '/try.webp',
      },
      media: postData.media || null,
      id: Date.now(),
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex min-h-screen bg-[#FDF0DC]">
      {/* Toggle Button for Right Sidebar */}
      <Button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`fixed top-16 right-4 z-50 h-12 w-12 rounded-full bg-white text-gray-900 shadow-md transition-transform duration-300 ${
          isSidebarOpen ? 'rotate-180' : 'rotate-0'
        }`}
      >
        {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </Button>

      {/* Left Sidebar */}
      <div className="fixed left-0 h-full z-10">
        {isLeftSidebarOpen && <LeftSidebar />}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isLeftSidebarOpen ? 'ml-64' : 'ml-0'
        } ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}
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
        <RightSidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Home;