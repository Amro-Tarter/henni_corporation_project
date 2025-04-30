import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CreatePost from '../components/createpost';
import PostList from '../components/Postlist';

const Home = () => {
  const [posts, setPosts] = useState([
    { text: "Hello world!", author: "Admin" },
    { text: "My first post!", author: "User1" }
  ]);

  const addPost = (text) => {
    setPosts([{ text, author: "Me" }, ...posts]);
  };

  return (
    <div className="min-h-screen bg-[#FDF0DC]">
      <Navbar />
      <div className="p-4 max-w-2xl mx-auto">
        <CreatePost addPost={addPost} />
        <PostList posts={posts} />
      </div>
    </div>
  );
};

export default Home;
