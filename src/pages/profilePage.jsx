import React, { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db } from '../config/firbaseConfig.ts';

import Navbar       from '../components/social/Navbar.jsx';
import LeftSidebar  from '../components/social/LeftSideBar';
import RightSidebar from '../components/social/Rightsidebar.jsx';
import ProfileInfo  from '../components/social/profileInfo.jsx';
import CreatePost   from '../components/social/CreatePost';
import ProfilePost  from '../components/social/ProfilePost.jsx';

const TEST_UID = '123laith';

const ProfilePage = () => {
  const auth = getAuth();
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch profile and posts
  useEffect(() => {
    async function loadData() {
      // Profile
      const profRef  = doc(db, 'profiles', TEST_UID);
      const profSnap = await getDoc(profRef);
      if (profSnap.exists()) setProfile(profSnap.data());
      else console.warn('No profile for', TEST_UID);

      // Posts
      const postsCol   = collection(db, 'posts');
      const postsQuery = query(
        postsCol,
        where('authorId', '==', TEST_UID),
        orderBy('createdAt', 'desc')
      );
      const postsSnap = await getDocs(postsQuery);
      const loaded = postsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(TEST_UID),
        };
      });
      setPosts(loaded);
      setLoading(false);
    }
    loadData();
  }, []);

  // Update profile field
  const updateField = async (field, value) => {
    const profileRef = doc(db, 'profiles', TEST_UID);
    const userRef    = doc(db, 'users', TEST_UID);
    if (field === 'element') {
      const batch = writeBatch(db);
      batch.update(profileRef, { element: value, updatedAt: serverTimestamp() });
      batch.update(userRef,    { element: value });
      await batch.commit();
    } else {
      await updateDoc(profileRef, { [field]: value, updatedAt: serverTimestamp() });
    }
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Upload profile picture
  const updateProfilePic = async file => {
    const storage = getStorage();
    const ref     = storageRef(storage, `profiles/${TEST_UID}/profile.jpg`);
    await uploadBytes(ref, file);
    const url     = await getDownloadURL(ref);
    await updateField('photoURL', url);
  };

  // Upload background picture
  const updateBackgroundPic = async file => {
    const storage = getStorage();
    const ref     = storageRef(storage, `profiles/${TEST_UID}/background.jpg`);
    await uploadBytes(ref, file);
    const url     = await getDownloadURL(ref);
    await updateField('backgroundURL', url);
  };

  // Create a new post
  const createPost = async ({ text, mediaFile }) => {
    let mediaUrl = '';
    if (mediaFile) {
      const ext     = mediaFile.name.split('.').pop();
      const name    = `${Date.now()}.${ext}`;
      const storage = getStorage();
      const ref     = storageRef(storage, `posts/${TEST_UID}/${name}`);
      await uploadBytes(ref, mediaFile);
      mediaUrl = await getDownloadURL(ref);
    }
    const newPost = {
      authorId:       TEST_UID,
      authorName:     profile.username,
      authorPhotoURL: profile.photoURL,
      content:        text || '',
      mediaUrl,
      likedBy:        [],
      likesCount:     0,
      commentsCount:  0,
      createdAt:      serverTimestamp(),
      updatedAt:      serverTimestamp(),
    };
    const postRef = await addDoc(collection(db, 'posts'), newPost);
    setPosts(prev => [{ id: postRef.id, ...newPost, liked: false }, ...prev]);
  };

  // Delete a post
  const handleDelete = async id => {
    await deleteDoc(doc(db, 'posts', id));
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // Update a post
  const handleUpdate = async (id, { content, mediaFile }) => {
    let mediaUrl;
    if (mediaFile) {
      const ext     = mediaFile.name.split('.').pop();
      const name    = `${Date.now()}.${ext}`;
      const storage = getStorage();
      const ref     = storageRef(storage, `posts/${TEST_UID}/${name}`);
      await uploadBytes(ref, mediaFile);
      mediaUrl = await getDownloadURL(ref);
    }
    const updates = { content, updatedAt: serverTimestamp() };
    if (mediaUrl) updates.mediaUrl = mediaUrl;
    await updateDoc(doc(db, 'posts', id), updates);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, content, mediaUrl: mediaUrl || p.mediaUrl } : p));
  };

  // Like a post once per user
  const handleLike = async (id, liked) => {
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, {
      likesCount: liked ? increment(1) : increment(-1),
      likedBy: liked ? arrayUnion(TEST_UID) : arrayRemove(TEST_UID)
    });
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked } : p
    ));
  };

  if (loading) return <div>טוען…</div>;
  if (!profile) return <div>לא נמצא פרופיל עבור UID={TEST_UID}</div>;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-1 pt-[56.8px]">
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 w-64 border-r border-gray-200">
          <LeftSidebar />
        </aside>

        <main className={`
            flex-1 pt-4 space-y-12 transition-all duration-300 ease-in-out
            lg:ml-64 ${isRightOpen ? 'lg:mr-64' : 'lg:mr-0'}`}
        >
          <ProfileInfo
            profilePic={profile.photoURL}
            backgroundPic={profile.backgroundURL}
            username={profile.username}
            location={profile.location}
            bio={profile.bio}
            element={profile.element}
            postsCount={profile.postsCount}
            followersCount={profile.followersCount}
            followingCount={profile.followingCount}
            onUpdateField={updateField}
            onUpdateProfilePic={updateProfilePic}
            onUpdateBackgroundPic={updateBackgroundPic}
          />

          <CreatePost addPost={createPost} profilePic={profile.photoURL} />

          <section className="space-y-6">
            {posts.map(p => (
              <ProfilePost
                key={p.id}
                post={p}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onLike={handleLike}
              />
            ))}
          </section>
        </main>

        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 right-0 w-64">
          <RightSidebar
            isOpen={isRightOpen}
            toggle={() => setIsRightOpen(o => !o)}
          />
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
