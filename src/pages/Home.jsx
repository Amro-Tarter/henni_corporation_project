import React, { useState } from 'react';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/createpost';
import PostList from '../components/social/Postlist';
import Sidebar from '../components/social/RightSidebar';


const Home = () => {
  const [posts, setPosts] = useState([
    { text: "Hello world!", author: "Admin" },
    { text: "My first post!", author: "User1" }
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const addPost = (text) => {
    setPosts([{ text, author: "Me" }, ...posts]);
  };

  return (
    <div className="flex min-h-screen bg-[#FDF0DC]">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'mr-64' : 'mr-0'
        }`}
      >
        <Navbar />
        <div className="pt-20 px-4 flex justify-center">
          <div className="w-full max-w-2xl">
            <CreatePost addPost={addPost} />
            <PostList posts={posts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;