import React, { useState, useEffect } from 'react';
import {
  doc, getDoc,
  collection, getDocs, writeBatch,
  query, orderBy, updateDoc, serverTimestamp
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
import Post         from '../components/social/ProfilePost.jsx';

const TEST_UID = '123laith';

const ProfilePage = () => {
  const auth = getAuth();
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [profile,     setProfile]   = useState(null);
  const [posts,       setPosts]     = useState([]);
  const [loading,     setLoading]   = useState(true);

  useEffect(() => {
    async function loadData() {
      const profRef  = doc(db, 'profiles', TEST_UID);
      const profSnap = await getDoc(profRef);
      if (profSnap.exists()) {
        setProfile(profSnap.data());
      } else {
        console.warn('No profile for', TEST_UID);
      }
      const postsCol   = collection(db, 'profiles', TEST_UID, 'posts');
      const postsQuery = query(postsCol, orderBy('createdAt', 'desc'));
      const postsSnap  = await getDocs(postsQuery);
      setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    loadData();
  }, []);

  const updateField = async (field, value) => {
    const profileRef = doc(db, 'profiles', TEST_UID);
    const userRef    = doc(db, 'users',    TEST_UID);
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

  const updateProfilePic = async (file) => {
    const storage = getStorage();
    const fileRef = storageRef(storage, `profiles/${TEST_UID}/profile.jpg`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateField('photoURL', url);
  };

  if (loading) return <div>טוען…</div>;
  if (!profile) return <div>לא נמצא פרופיל עבור UID={TEST_UID}</div>;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-1 pt-[56.8px]">
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 border-r border-gray-200">
          <LeftSidebar />
        </aside>
        <main className={`
            flex-1 p-6 space-y-12 transition-all duration-300 ease-in-out
            lg:ml-[16rem] ${isRightOpen ? 'lg:mr-[16rem]' : 'lg:mr-0'}`
        }>
          <ProfileInfo
            profilePic        = {profile.photoURL}
            username          = {profile.username}
            location          = {profile.location}
            bio               = {profile.bio}
            element           = {profile.element}
            postsCount        = {profile.postsCount}
            followersCount    = {profile.followersCount}
            followingCount    = {profile.followingCount}
            onUpdateField      = {updateField}
            onUpdateProfilePic = {updateProfilePic}
          />
          <CreatePost
            addPost    = {text => console.log('New Post:', text)}
            profilePic = {profile.photoURL}
          />
          <section className="space-y-6">
            {posts.map(p => (
              <Post
                key        = {p.id}
                post       = {p}
                profilePic = {profile.photoURL}
              />
            ))}
          </section>
        </main>
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 right-0">
          <RightSidebar
            isOpen = {isRightOpen}
            toggle = {() => setIsRightOpen(o => !o)}
          />
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;