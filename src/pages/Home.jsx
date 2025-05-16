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
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/CreatePost';
import PostList from '../components/social/Postlist';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';

const auth = getAuth();

const Home = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
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
      fetchAllComments(loaded);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchAllComments = async (posts) => {
    const commentsData = {};
    for (const post of posts) {
      const commentsSnap = await getDocs(
        query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt'))
      );
      commentsData[post.id] = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    setComments(commentsData);
  };

  const addPost = async ({ text, mediaFile }) => {
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

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleUpdatePost = async (postId, { content, mediaFile }) => {
    try {
      const updates = { content, updatedAt: serverTimestamp() };

      if (mediaFile) {
        const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        updates.mediaUrl = await getDownloadURL(fileRef);
      }

      await updateDoc(doc(db, 'posts', postId), updates);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, ...updates } : p
        )
      );
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const handleAddComment = async (postId, text, parentId) => {
    try {
      const commentRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
        authorId: user.uid,
        authorName: user.username,
        authorPhotoURL: user.photoURL,
        content: text,
        parentId: parentId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1)
      });

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { id: commentRef.id, ...commentRef.data() }]
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleEditComment = async (postId, commentId, newText) => {
    try {
      await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
        content: newText,
        updatedAt: serverTimestamp()
      });

      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(c =>
          c.id === commentId ? { ...c, content: newText } : c
        )
      }));
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(-1)
      });

      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Handler for right sidebar expansion state
  const handleRightSidebarExpandChange = (expanded) => {
    setIsRightSidebarExpanded(expanded);
  };

  if (!profile) return <div className="text-element-text p-4">טוען...</div>;

  return (
    <ThemeProvider element={profile.element}>
      <div className="flex min-h-screen bg-element-base">
        {/* Left Sidebar with shadow */}
        <div className={`fixed left-0 h-full z-10 shadow-2xl transition-transform duration-300 ${
          isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <LeftSidebar element={profile.element} className="h-full" />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isLeftSidebarOpen ? 'ml-64' : 'ml-0'
          } ${
            isRightSidebarExpanded ? 'mr-64' : 'mr-16'
          }`}
        >
          {/* Navbar with bottom shadow */}
          <Navbar
            element={profile.element}
            isLeftSidebarOpen={isLeftSidebarOpen}
            setIsLeftSidebarOpen={setIsLeftSidebarOpen}
            className="shadow-lg bg-element-navbar"
          />
          
          <div className={`pt-20 px-4 flex justify-center transition-all duration-300 ${
            isLeftSidebarOpen ? 'pl-50' : 'pl-0'
          } ${
            isRightSidebarExpanded ? 'pr-50' : 'pr-0'
          }`}>
            <div className="w-full max-w-4xl space-y-6">
              {/* CreatePost with shadow */}
              <CreatePost
                addPost={addPost}
                profilePic={profile.photoURL || '/default-avatar.png'}
                element={profile.element}
                className="shadow-md bg-element-post rounded-xl p-4"
              />
              
              {/* PostList with shadow-based spacing */}
              <PostList
                posts={posts}
                onLike={handleLike}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
                comments={comments}
                currentUser={user}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                element={profile.element}
                postClassName="shadow-sm hover:shadow-md transition-shadow bg-element-post rounded-xl p-4 mb-4"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar with shadow */}
        <div className="fixed right-0 h-full shadow-2xl">
          <RightSidebar 
            element={profile.element} 
            className="h-full" 
            onExpandChange={handleRightSidebarExpandChange}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;