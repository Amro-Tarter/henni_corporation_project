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
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/social/Navbar';
import CreatePost from '../components/social/CreatePost';
import PostList from '../components/social/Postlist';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';
import ElementalLoader from '../theme/ElementalLoader';

const auth = getAuth();

const Home = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [postComments, setPostComments] = useState({});
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const [sameElementUsers, setSameElementUsers] = useState([]);
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
        fullUser.username = profData.username || fullUser.username;
        setProfile(profData);
      }

      setUser(fullUser);
      fetchPosts(authUser.uid);
      fetchFollowingPosts(authUser.uid);
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

  const fetchFollowingPosts = async (userId) => {
    try {
      const userProfileRef = doc(db, 'profiles', userId);
      const userProfileSnap = await getDoc(userProfileRef);
      
      if (!userProfileSnap.exists()) return;
      
      const following = userProfileSnap.data().following || [];
      
      if (following.length === 0) {
        setFollowingPosts([]);
        return;
      }

      const snap = await getDocs(
        query(
          collection(db, 'posts'),
          where('authorId', 'in', following),
          orderBy('createdAt', 'desc')
        )
      );

      const loaded = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(userId)
        };
      });
      
      setFollowingPosts(loaded);
    } catch (err) {
      console.error('Error fetching following posts:', err);
    }
  };

  // Set up comment listeners for each post
  useEffect(() => {
    if (!posts.length) return;
    
    // Create an object to store cleanup functions
    const unsubscribes = {};
    
    // Set up a listener for each post's comments
    posts.forEach(post => {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = [];
        const topLevelComments = []; // Comments without parent
        const commentReplies = {}; // Group replies by parent ID
        
        snapshot.forEach(doc => {
          const commentData = {
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().createdAt?.toDate() || new Date()
          };
          
          fetchedComments.push(commentData);
          
          // Organize comments into a hierarchical structure
          if (commentData.parentId) {
            // This is a reply
            if (!commentReplies[commentData.parentId]) {
              commentReplies[commentData.parentId] = [];
            }
            commentReplies[commentData.parentId].push(commentData);
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
              (a, b) => b.timestamp - a.timestamp
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

  const handleAddComment = async (postId, text, parentId = null) => {
    if (!text.trim()) return;
    
    try {
      const commentData = {
        authorId: user?.uid,
        authorName: user?.username,
        authorPhotoURL: user?.photoURL,
        content: text.trim(),
        parentId: parentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        edited: false
      };
      
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

  const handleEditComment = async (postId, commentId, newText) => {
    if (!newText.trim()) return;
    
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newText.trim(),
        updatedAt: serverTimestamp(),
        edited: true
      });
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId, isReply = false, parentId = null) => {
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
          where('parentId', '==', commentId)
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

  const getAuthorProfile = async (authorId) => {
    try {
      const profileRef = doc(db, 'profiles', authorId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        return { id: profileSnap.id, ...profileSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Error fetching author profile:', err);
      return null;
    }
  };

  const fetchSameElementUsers = async () => {
    if (!profile?.element || !user?.uid) return;

    try {
      const othersQuery = query(
        collection(db, 'profiles'),
        where('element', '==', profile.element)
      );
      const othersSnap = await getDocs(othersQuery);

      const others = othersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid); // Exclude current user

      const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 5);
      setSameElementUsers(shuffled);
    } catch (err) {
      console.error('Error fetching same element users:', err);
      setSameElementUsers([]);
    }
  };

  const handleFollowToggle = async (targetUserId) => {
    if (!user) return;

    try {
      const isFollowing = user.following?.includes(targetUserId);
      const batch = writeBatch(db);

      const userRef = doc(db, 'profiles', user.uid);
      batch.update(userRef, {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId),
        followingCount: increment(isFollowing ? -1 : 1)
      });

      const targetRef = doc(db, 'profiles', targetUserId);
      batch.update(targetRef, {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid),
        followersCount: increment(isFollowing ? -1 : 1)
      });

      await batch.commit();

      setUser(prev => ({
        ...prev,
        following: isFollowing
          ? prev.following.filter(id => id !== targetUserId)
          : [...(prev.following || []), targetUserId]
      }));
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  useEffect(() => {
    if (profile?.element && user?.uid) {
      fetchSameElementUsers();
    }
  }, [profile?.element, user?.uid]);

  // Handler for right sidebar expansion state
  const handleRightSidebarExpandChange = (expanded) => {
    setIsRightSidebarExpanded(expanded);
  };

  if (!profile) return (
    <ThemeProvider element="earth">
      <ElementalLoader />
    </ThemeProvider>
  );

  return (
    <ThemeProvider element={profile.element}>
      <div className="flex min-h-screen bg-element-base">
        {/* Left Sidebar with shadow */}
        <div className={`fixed left-0 h-full z-10 shadow-2xl transition-transform duration-300 top-[56.8px] ${
          isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <LeftSidebar 
            element={profile.element}
            users={sameElementUsers}
            viewerProfile={user}
            onFollowToggle={handleFollowToggle}
            className="h-full"
          />
        </div>

        <div className={`flex-1 transition-all duration-300 ${
          isLeftSidebarOpen ? 'ml-64' : 'ml-0'
        } ${
          isRightSidebarExpanded ? 'mr-64' : 'mr-16'
        }`}>
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
            <div className="w-full max-w-4xl space-y-6 mx-auto px-4 sm:px-6 lg:px-8">
              {/* CreatePost */}
              <CreatePost
                addPost={addPost}
                profilePic={profile.photoURL || '/default-avatar.png'}
                element={profile.element}
                className="shadow-md bg-element-post rounded-xl p-4 w-full"
              />

              {/* Creative Tab Navigation */}
              <div className="flex flex-col items-center mb-8 w-full">
                <div className="bg-element-post p-2 rounded-2xl shadow-md relative flex items-center justify-center gap-3 w-full max-w-md mx-auto overflow-hidden">
                  {/* Sliding Underline */}
                  <div 
                    className="absolute bottom-[10px] h-[2px] bg-blue-500 transition-all duration-300 ease-in-out"
                    style={{
                      left: '0',
                      width: '47%',
                      transform: activeTab === 'all' ? 'translateX(113%)' : 'translateX(3%)'
                    }}
                  />
                  
                  {/* All Posts Button */}
                  <div className="flex-1">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`relative w-full px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-300
                        ${activeTab === 'all'
                          ? 'text-blue-500 font-bold'
                          : 'text-element-text'
                        }
                        hover:bg-element-hover/10
                        focus:outline-none
                        group
                        `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`w-5 h-5 transition-colors duration-300 ${
                            activeTab === 'all' 
                              ? 'text-blue-500' 
                              : 'opacity-70 group-hover:opacity-100 group-hover:text-blue-500'
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                          />
                        </svg>
                        <span className={`text-sm sm:text-base transition-colors duration-300 ${
                          activeTab === 'all' 
                            ? 'text-blue-500' 
                            : 'group-hover:text-blue-500'
                        }`}>כל הפוסטים</span>
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-element-border/30 self-center"></div>

                  {/* Following Posts Button */}
                  <div className="flex-1">
                    <button
                      onClick={() => setActiveTab('following')}
                      className={`relative w-full px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-300
                        ${activeTab === 'following'
                          ? 'text-blue-500 font-bold'
                          : 'text-element-text'
                        }
                        hover:bg-element-hover/10
                        focus:outline-none
                        group
                        `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`w-5 h-5 transition-colors duration-300 ${
                            activeTab === 'following' 
                              ? 'text-blue-500' 
                              : 'opacity-70 group-hover:opacity-100 group-hover:text-blue-500'
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                          />
                        </svg>
                        <span className={`text-sm sm:text-base transition-colors duration-300 ${
                          activeTab === 'following' 
                            ? 'text-blue-500' 
                            : 'group-hover:text-blue-500'
                        }`}>עוקב אחרי</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Posts Count Indicator */}
                <div className="mt-4 flex gap-4 sm:gap-8 text-sm text-element-text opacity-75 flex-wrap justify-center">
                  <span className={`flex items-center gap-1 transition-all duration-300 ${
                    activeTab === 'all' ? 'text-element-accent font-semibold' : ''
                  }`}>
                    <span className="font-medium">{posts.length}</span> פוסטים כלליים
                  </span>
                  <span className={`flex items-center gap-1 transition-all duration-300 ${
                    activeTab === 'following' ? 'text-element-accent font-semibold' : ''
                  }`}>
                    <span className="font-medium">{followingPosts.length}</span> פוסטים מעוקבים
                  </span>
                </div>
              </div>
              
              {/* Posts Container with consistent margins */}
              <div className="w-full space-y-4">
                {activeTab === 'all' ? (
                  <PostList
                    posts={posts}
                    onLike={handleLike}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                    comments={postComments}
                    currentUser={user}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    element={profile.element}
                    postClassName="shadow-sm hover:shadow-md transition-shadow bg-element-post rounded-xl p-4 mb-4"
                    getAuthorProfile={getAuthorProfile}
                  />
                ) : (
                  <PostList
                    posts={followingPosts}
                    onLike={handleLike}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                    comments={postComments}
                    currentUser={user}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    element={profile.element}
                    postClassName="shadow-sm hover:shadow-md transition-shadow bg-element-post rounded-xl p-4 mb-4"
                    getAuthorProfile={getAuthorProfile}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar with adjusted margin */}
        <div className={`fixed right-0 h-full shadow-2xl transition-all duration-300 ${
          isRightSidebarExpanded ? 'w-64' : 'w-16'
        }`}>
          <RightSidebar 
            element={profile.element} 
            className="h-full" 
            onExpandChange={handleRightSidebarExpandChange}
          />
        </div>
      </div>

      {/* Add keyframe animation for the background pulse */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          50% {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          }
          100% {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </ThemeProvider>
  );
};

export default Home;