// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../config/firbaseConfig.ts';
import { ThemeProvider } from '../theme/ThemeProvider';

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  orderBy,
  serverTimestamp
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

const auth = getAuth();

const Home = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        navigate('/login');
        return;
      }

      const fullUser = { uid: authUser.uid, email: authUser.email };
      const userSnap = await getDocs(
        query(collection(db, 'users'), where('associated_id', '==', authUser.uid))
      );
      if (!userSnap.empty) {
        const ud = userSnap.docs[0].data();
        fullUser.username = ud.username || 'משתמש';
      }

      const profRef = doc(db, 'profiles', authUser.uid);
      const profSnap = await getDoc(profRef);
      if (profSnap.exists()) {
        const profData = profSnap.data();
        fullUser.photoURL = profData.photoURL;
        fullUser.element = profData.element || 'earth';
        fullUser.profile = profData;
        setProfile(profData);
      } else {
        console.warn('No profile for UID:', authUser.uid);
      }

      setUser(fullUser);
      fetchPosts(authUser.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchPosts = async (userId) => {
    try {
      const snap = await getDocs(
        query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      );
      const loaded = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(userId)
        };
      });
      setPosts(loaded);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const addPost = async ({ text, mediaType, mediaFile }) => {
    if (!user) return;

    let mediaUrl = '';
    if (mediaFile) {
      const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${mediaFile.name}`);
      await uploadBytes(fileRef, mediaFile);
      mediaUrl = await getDownloadURL(fileRef);
    }

    const newPost = {
      authorId: user.uid,
      authorName: user.username,
      authorPhotoURL: user.photoURL || '',
      content: text,
      mediaType: mediaType || '',
      mediaUrl,
      likedBy: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'posts'), newPost);
    setPosts(prev => [{ id: docRef.id, ...newPost, liked: false }, ...prev]);
  };

  const handleLike = async (postId, liked) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: liked ? increment(1) : increment(-1),
        likedBy: liked ? arrayUnion(user.uid) : arrayRemove(user.uid)
      });
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  if (!profile) return <div>טוען...</div>;

  return (
    <ThemeProvider element={profile.element}>
      <div className="flex min-h-screen bg-element-base">
        <Button
          onClick={() => setIsSidebarOpen(v => !v)}
          className={`fixed top-16 right-4 z-50 h-12 w-12 rounded-full bg-element-button text-element-button-text shadow-md transition-transform duration-300 ${
            isSidebarOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </Button>

        <div className="fixed left-0 h-full z-10">
          {isLeftSidebarOpen && <LeftSidebar element={profile.element} />}
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isLeftSidebarOpen ? 'ml-80' : 'ml-0'
          } ${isSidebarOpen ? 'mr-80' : 'mr-0'}`}
        >
          <Navbar
            element={profile.element}
            isLeftSidebarOpen={isLeftSidebarOpen}
            setIsLeftSidebarOpen={setIsLeftSidebarOpen}
          />
          <div className="pt-20 px-4 flex justify-center">
            <div className="w-full max-w-4xl">
              <CreatePost
                addPost={addPost}
                profilePic={profile.photoURL || '/default-avatar.png'}
                element={profile.element}
              />
              <PostList
                posts={posts}
                onLike={handleLike}
                currentUserId={user.uid}
                element={profile.element}
              />
            </div>
          </div>
        </div>

        <div className="fixed right-0 h-full">
          <RightSidebar isOpen={isSidebarOpen} element={profile.element} />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;
