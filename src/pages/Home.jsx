import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../config/firbaseConfig.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { ThemeProvider } from '../theme/ThemeProvider';
import {
  collection, query, where, getDocs, addDoc,
  doc, updateDoc, increment, arrayUnion,
  arrayRemove, orderBy, serverTimestamp
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL
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

        const userSnapshot = await getDocs(query(
          collection(db, 'users'),
          where('associated_id', '==', authUser.uid)
        ));

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          fullUser.username = userData.username || 'משתמש';

          const profileSnapshot = await getDocs(query(
            collection(db, 'profiles'),
            where('username', '==', userData.username)
          ));

          if (!profileSnapshot.empty) {
            const profileData = profileSnapshot.docs[0].data();
            fullUser.photoURL = profileData.photoURL;
            fullUser.element = profileData.element || 'earth';
          }
        }

        setUser(fullUser);
        fetchPosts(fullUser.uid);
      } else {
        setUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchPosts = async (userId) => {
    try {
      const postsSnap = await getDocs(query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      ));

      const loadedPosts = postsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(userId),
        };
      });

      setPosts(loadedPosts);
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

    setPosts(prev => [
      { id: docRef.id, ...newPost, liked: false },
      ...prev
    ]);
  };

  const handleLike = async (id, liked) => {
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        likesCount: increment(liked ? 1 : -1),
        likedBy: liked ? arrayUnion(user.uid) : arrayRemove(user.uid)
      });

      setPosts(prev => prev.map(p =>
        p.id === id ? {
          ...p,
          likesCount: p.likesCount + (liked ? 1 : -1),
          liked
        } : p
      ));
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  return (
    <ThemeProvider element={user?.element || 'earth'}>
      <div className="flex min-h-screen bg-element-base">
        <Button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className={`fixed top-16 right-4 z-50 h-12 w-12 rounded-full bg-element-button text-element-button-text shadow-md transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </Button>

        <div className="fixed left-0 h-full z-10">
          {isLeftSidebarOpen && <LeftSidebar element={user?.element} />}
        </div>

        <div className={`flex-1 transition-all duration-300 ${isLeftSidebarOpen ? 'ml-80' : 'ml-0'} ${isSidebarOpen ? 'mr-80' : 'mr-0'}`}>
          <Navbar
            element={user?.element}
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
              <PostList
                posts={posts}
                onLike={handleLike}
                currentUserId={user?.uid}
                element={user?.element}
              />
            </div>
          </div>
        </div>

        <div className="fixed right-0 h-full">
          <RightSidebar isOpen={isSidebarOpen} element={user?.element} />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;
