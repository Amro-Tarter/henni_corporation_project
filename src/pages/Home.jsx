import React, { useState, useEffect } from 'react';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/createpost';
import PostList from '../components/social/Postlist';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSidebar';
import { Button } from '../components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Function to generate a pool of posts with real images and videos
const generatePostPool = () => {
  const pool = [
    {
      text: 'Amazing sunset in Bali!',
      author: { name: 'User1', avatar: '/default-avatar.png' },
      id: Date.now(),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      media: '/wall.jpg', // Real image URL
      mediaType: 'image', // Indicates this is an image
    },
    {
      text: 'Beautiful nature in the mountains.',
      author: { name: 'User2', avatar: '/default-avatar.png' },
      id: Date.now() + 1,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      media: '/video/background vid.mp4', // Real video URL
      mediaType: 'video', // Indicates this is a video
    },
    // Add more posts with real URLs
    {
      text: 'Look at this amazing beach view!',
      author: { name: 'User3', avatar: '/default-avatar.png' },
      id: Date.now() + 2,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      media: '/sculpture.jpg', // Another real image URL
      mediaType: 'image',
    },
    {
      text: 'Check out this funny video!',
      author: { name: 'User4', avatar: '/default-avatar.png' },
      id: Date.now() + 3,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      media: '/video/101064-video-720.mp4', // Another real video URL
      mediaType: 'video',
    },
    // Add more posts as needed
  ];
  return pool;
};

// Function to randomly select a subset of posts
const getRandomPosts = (pool, count = 10) => {
  // Shuffle the pool and select the first `count` posts
  const shuffledPool = pool.sort(() => Math.random() - 0.5);
  return shuffledPool.slice(0, count);
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  // Create a pool of posts and select random posts on component mount
  useEffect(() => {
    const pool = generatePostPool();
    const randomPosts = getRandomPosts(pool); // Get a random subset of posts
    setPosts(randomPosts); // Set the random posts to be displayed
  }, []);

  const addPost = (postData) => {
    const newPost = {
      text: postData.text,
      author: {
        name: 'Current User',
        avatar: '/try.webp',
      },
      media: postData.media || null,
      id: Date.now(),
      likes: 0,
      comments: 0,
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
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
          isLeftSidebarOpen ? 'ml-80' : 'ml-0'
        } ${isSidebarOpen ? 'mr-80' : 'mr-0'}`}
      >
        <Navbar
          isLeftSidebarOpen={isLeftSidebarOpen}
          setIsLeftSidebarOpen={setIsLeftSidebarOpen}
        />
        <div className="pt-20 px-4 flex justify-center">
          <div className="w-full max-w-4xl">
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
