import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firbaseConfig.ts';
import { onAuthStateChanged } from 'firebase/auth';
//import { getUserProfile, getUserPosts } from '../config/firbaseConfig.ts';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/createpost';
import PostList from '../components/social/Postlist';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';
import { Button } from '../components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Fetch user data and posts when signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser); // Set the user state

        // Fetch user profile and posts
        const userProfile = await getUserProfile(authUser.uid);
        const userPosts = await getUserPosts(authUser.uid);
        
        console.log('User Profile:', userProfile);
        console.log('User Posts:', userPosts);

        // Set posts data
        setPosts(userPosts);
      } else {
        setUser(null);
        navigate('/login'); // Redirect to login page if not signed in
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  const addPost = (postData) => {
    const newPost = {
      text: postData.text,
      author: {
        name: user.displayName || 'Current User',
        avatar: '/try.webp',
      },
      media: postData.media || null,
      id: Date.now(),
      likes: 0,
      comments: 0,
      authorId: user.uid, // Store the user UID with the post
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
