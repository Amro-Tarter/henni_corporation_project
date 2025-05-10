import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../config/firbaseConfig.ts';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/CreatePost';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        let fullUser = { ...authUser };
  
        const userQuery = query(
          collection(db, 'users'),
          where('associated_id', '==', authUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          fullUser = {
            ...fullUser,
            username: userData.username || 'משתמש',  // Ensure username is set here
          };
  
          const profileQuery = query(
            collection(db, 'profiles'),
            where('username', '==', userData.username)
          );
          const profileSnapshot = await getDocs(profileQuery);
  
          if (!profileSnapshot.empty) {
            const profileData = profileSnapshot.docs[0].data();
            fullUser = {
              ...fullUser,
              photoURL: profileData.photoURL,
              element: profileData.element,
            };
          }
        }
  
        setUser(fullUser); // Make sure to set user with the username here
      } else {
        setUser(null);
        navigate('/login');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  
  const addPost = async ({ text, mediaType, mediaFile }) => {
    try {
      if (!user) return;
  
      let mediaUrl = '';
      if (mediaFile) {
        const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        mediaUrl = await getDownloadURL(fileRef);
      }
  
      // Ensure that user.username is correctly assigned
      const authorName = user.username || 'משתמש'; // Default value
  
      const post = {
        authorId: user.uid,
        authorName, // Assign correct name
        authorPhotoURL: user.photoURL || '',
        content: text,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        mediaType: mediaType || '',
        mediaUrl,
      };
  
      const docRef = await addDoc(collection(db, 'posts'), post);
  
      setPosts((prevPosts) => [
        {
          ...post,
          id: docRef.id,
        },
        ...prevPosts,
      ]);
    } catch (err) {
      console.error('Failed to add post:', err);
    }
  };
  

  return (
    <div className="flex min-h-screen bg-[#FDF0DC]">
      <Button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`fixed top-16 right-4 z-50 h-12 w-12 rounded-full bg-white text-gray-900 shadow-md transition-transform duration-300 ${
          isSidebarOpen ? 'rotate-180' : 'rotate-0'
        }`}
      >
        {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </Button>

      <div className="fixed left-0 h-full z-10">
        {isLeftSidebarOpen && <LeftSidebar />}
      </div>

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
            {user && (
              <CreatePost
                addPost={addPost}
                profilePic={user.photoURL || '/default-avatar.png'}
                element={user.element || 'earth'}
              />
            )}
            <PostList posts={posts} />
          </div>
        </div>
      </div>

      <div className="fixed right-0 h-full">
        <RightSidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Home;
