import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import ElementalLoader from '../theme/ElementalLoader';

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
  arrayRemove,
  onSnapshot,
  limit
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
import CreatePost   from '../components/social/createpost';
import ProfilePost  from '../components/social/ProfilePost.jsx';

const ProfilePage = () => {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [postComments, setPostComments] = useState({}); // Store comments by post ID

  // Fetch profile and posts
  useEffect(() => {
    if (!uid) return;

    async function loadData() {
      // Profile
      const profRef  = doc(db, 'profiles', uid);
      const profSnap = await getDoc(profRef);
      if (profSnap.exists()) setProfile(profSnap.data());
      else console.warn('No profile for', uid);

      // Posts
      const postsCol   = collection(db, 'posts');
      const postsQuery = query(
        postsCol,
        where('authorId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const postsSnap = await getDocs(postsQuery);
      const loaded = postsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(uid),
        };
      });
      setPosts(loaded);
      setLoading(false);
    }
    loadData();
  }, []);

  // Set up comment listeners for each post
  useEffect(() => {
    if (!posts.length) return;
    
    // Create an object to store cleanup functions
    const unsubscribes = {};
    
    // Set up a listener for each post's comments
    posts.forEach(post => {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = [];
        const topLevelComments = []; // Comments without parent
        const commentReplies = {}; // Group replies by parent ID
        
        snapshot.forEach(doc => {
          const commentData = {
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          };
          
          fetchedComments.push(commentData);
          
          // Organize comments into a hierarchical structure
          if (commentData.parentCommentId) {
            // This is a reply
            if (!commentReplies[commentData.parentCommentId]) {
              commentReplies[commentData.parentCommentId] = [];
            }
            commentReplies[commentData.parentCommentId].push(commentData);
          } else {
            // This is a top-level comment
            topLevelComments.push(commentData);
          }
        });
        
        // Process comments to add their replies
        const processedComments = topLevelComments.map(comment => {
          return {
            ...comment,
            replies: (commentReplies[comment.id] || []).sort(
              (a, b) => a.timestamp - b.timestamp
            )
          };
        });
        
        // Update the comments state for this post
        setPostComments(prev => ({
          ...prev,
          [post.id]: processedComments
        }));
      });
      
      unsubscribes[post.id] = unsubscribe;
    });
    
    // Clean up listeners when component unmounts
    return () => {
      Object.values(unsubscribes).forEach(unsubscribe => unsubscribe());
    };
  }, [posts]);

  // Update profile field
  const updateField = async (field, value) => {
    const profileRef = doc(db, 'profiles', uid);
    const userRef    = doc(db, 'users', uid);
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
    const ref     = storageRef(storage, `profiles/${uid}/profile.jpg`);
    await uploadBytes(ref, file);
    const url     = await getDownloadURL(ref);
    await updateField('photoURL', url);
  };

  // Upload background picture
  const updateBackgroundPic = async file => {
    const storage = getStorage();
    const ref     = storageRef(storage, `profiles/${uid}/background.jpg`);
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
      const ref     = storageRef(storage, `posts/${uid}/${name}`);
      await uploadBytes(ref, mediaFile);
      mediaUrl = await getDownloadURL(ref);
    }
    const newPost = {
      authorId:       uid,
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
    await updateDoc(doc(db, 'profiles', uid), {
      postsCount: increment(1)
    });
  };

  // Delete a post
  const handleDelete = async id => {
    await deleteDoc(doc(db, 'posts', id));
    setPosts(prev => prev.filter(p => p.id !== id));
    await updateDoc(doc(db, 'profiles', uid), {
      postsCount: increment(-1)
    });
  };

  // Update a post
  const handleUpdate = async (id, { content, mediaFile }) => {
    let mediaUrl;
    if (mediaFile) {
      const ext     = mediaFile.name.split('.').pop();
      const name    = `${Date.now()}.${ext}`;
      const storage = getStorage();
      const ref     = storageRef(storage, `posts/${uid}/${name}`);
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
      likedBy: liked ? arrayUnion(uid) : arrayRemove(uid)
    });
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked } : p
    ));
  };

  // COMMENT SYSTEM FUNCTIONS

  // Add a new comment to a post
  const addComment = async (postId, text, parentCommentId = null) => {
    if (!text.trim()) return;
    
    try {
      const commentData = {
        authorId: uid,
        authorPhotoURL: profile.photoURL,
        username: profile.username,
        text: text.trim(),
        timestamp: serverTimestamp(),
        edited: false,
      };
      
      // Add parentCommentId if this is a reply
      if (parentCommentId) {
        commentData.parentCommentId = parentCommentId;
      }
      
      // Add the comment to Firestore
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, commentData);
      
      // Update the post's comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });
      
      // Update the commentsCount in the local state
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Edit an existing comment
  const editComment = async (postId, commentId, newText) => {
    if (!newText.trim()) return;
    
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        text: newText.trim(),
        edited: true,
        timestamp: serverTimestamp() // Update timestamp when edited
      });
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  // Delete a comment
  const deleteComment = async (postId, commentId, isReply = false, parentCommentId = null) => {
    try {
      // Confirm deletion
      if (!window.confirm('האם אתה בטוח שברצונך למחוק את התגובה?')) {
        return;
      }
      
      // Delete the comment document
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      
      // If it's a top-level comment, also find and delete all its replies
      if (!isReply) {
        // Get all replies to this comment
        const repliesQuery = query(
          collection(db, 'posts', postId, 'comments'),
          where('parentCommentId', '==', commentId)
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        
        // Delete each reply
        const batch = writeBatch(db);
        repliesSnapshot.docs.forEach(replyDoc => {
          batch.delete(doc(db, 'posts', postId, 'comments', replyDoc.id));
        });
        await batch.commit();
        
        // Decrement the post's comment count for the parent and all replies
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          commentsCount: increment(-(repliesSnapshot.size + 1))
        });
        
        // Update local post state
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, commentsCount: p.commentsCount - (repliesSnapshot.size + 1) } : p
        ));
      } else {
        // Just decrement by 1 for a reply
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          commentsCount: increment(-1)
        });
        
        // Update local post state
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p
        ));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    // you can pass the current element if your loader adapts to it:
    return (
      <ThemeProvider element={profile?.element}>
        <ElementalLoader />
      </ThemeProvider>
    );
  }
  if (!profile) return <div>לא נמצא פרופיל עבור UID={uid}</div>;


  return (
    <ThemeProvider element={profile.element}>
    <div dir="rtl" className="min-h-screen flex flex-col bg-white">
      <Navbar element={profile.element}/>
      <div className="flex flex-1 pt-[56.8px]">
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 w-64 border-r border-gray-200">
          <LeftSidebar element={profile.element}/>
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

          <CreatePost element={profile.element} addPost={createPost} profilePic={profile.photoURL} />

          <section className="space-y-6">
            {posts.map(p => (
              <ProfilePost
                key={p.id}
                element={profile.element}
                post={p}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onLike={handleLike}
                comments={postComments[p.id] || []}
                currentUser={{
                  uid,
                  photoURL: profile.photoURL,
                  username: profile.username
                }}
                onAddComment={addComment}
                onEditComment={editComment}
                onDeleteComment={deleteComment}
              />
            ))}
          </section>
        </main>

        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 right-0 w-64">
          <RightSidebar
            element={profile.element}
            isOpen={isRightOpen}
            toggle={() => setIsRightOpen(o => !o)}
          />
        </aside>
      </div>
    </div>
    </ThemeProvider>
  );
};

export default ProfilePage;