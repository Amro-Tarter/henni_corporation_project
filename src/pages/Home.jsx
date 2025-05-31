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
import CreatePost from '../components/social/createpost';
import PostList from '../components/social/Postlist';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';
import ElementalLoader from '../theme/ElementalLoader';
import Project from '../components/social/Project';

const auth = getAuth();

const Home = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [followingProjects, setFollowingProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [postComments, setPostComments] = useState({});
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const [sameElementUsers, setSameElementUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectComments, setProjectComments] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const fullUser = { uid: authUser.uid, email: authUser.email };
        
        // Fetch user data from users collection to get element
        const userSnap = await getDocs(
          query(collection(db, 'users'), where('associated_id', '==', authUser.uid))
        );

        if (!userSnap.empty) {
          const ud = userSnap.docs[0].data();
          fullUser.username = ud.username || 'משתמש';
          // Get element from users collection
          fullUser.element = ud.element || 'earth';
          // Get role from users collection
          if (ud.role) fullUser.role = ud.role;
        }

        // Fetch profile data from profiles collection
        const profRef = doc(db, 'profiles', authUser.uid);
        const profSnap = await getDoc(profRef);
        if (profSnap.exists()) {
          const profData = profSnap.data();
          fullUser.photoURL = profData.photoURL;
          fullUser.profile = profData;
          fullUser.username = profData.username || fullUser.username;
          fullUser.following = profData.following || [];
          setProfile({ ...profData, element: fullUser.element, role: fullUser.role }); // Add element and role to profile
        } else {
          // If no profile exists, create a minimal profile with element and role from users
          setProfile({ element: fullUser.element, role: fullUser.role });
        }

        setUser(fullUser);
        await Promise.all([
          fetchPosts(authUser.uid),
          fetchFollowingPosts(authUser.uid),
          fetchProjects(authUser.uid),
          fetchAllUsers()
        ]);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
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
        setFollowingProjects([]);
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

      // Fetch following projects
      const projectSnap = await getDocs(
        query(
          collection(db, 'personal_projects'),
          where('authorId', 'in', following),
          orderBy('createdAt', 'desc')
        )
      );
      const loadedProjects = projectSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(userId)
        };
      });
      setFollowingProjects(loadedProjects);
    } catch (err) {
      console.error('Error fetching following posts:', err);
    }
  };

  // Fetch all projects
  const fetchProjects = async (userId) => {
    try {
      const snap = await getDocs(
        query(collection(db, 'personal_projects'), orderBy('createdAt', 'desc'))
      );
      const loaded = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(userId)
        };
      });
      setProjects(loaded);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Fetch all users for collaborators
  const fetchAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'profiles'));
      setAllUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch projects and users on user load
  useEffect(() => {
    if (user?.uid) {
      fetchProjects(user.uid);
      fetchAllUsers();
    }
  }, [user?.uid]);

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
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || null,
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

  // Set up comment listeners for each project
  useEffect(() => {
    if (!projects.length) return;
    const unsubscribes = {};
    projects.forEach(project => {
      const commentsRef = collection(db, 'personal_projects', project.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = [];
        const topLevelComments = [];
        const commentReplies = {};
        snapshot.forEach(doc => {
          const commentData = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || null,
          };
          fetchedComments.push(commentData);
          if (commentData.parentId) {
            if (!commentReplies[commentData.parentId]) {
              commentReplies[commentData.parentId] = [];
            }
            commentReplies[commentData.parentId].push(commentData);
          } else {
            topLevelComments.push(commentData);
          }
        });
        const processedComments = topLevelComments.map(comment => ({
          ...comment,
          replies: (commentReplies[comment.id] || []).sort((a, b) => b.timestamp - a.timestamp),
        }));
        setProjectComments(prev => ({
          ...prev,
          [project.id]: processedComments,
        }));
      });
      unsubscribes[project.id] = unsubscribe;
    });
    return () => {
      Object.values(unsubscribes).forEach(unsubscribe => unsubscribe());
    };
  }, [projects]);

  const addPost = async ({ text, mediaFile, mediaType }) => {
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
      mediaType,
      likedBy: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'posts'), newPost);
    setPosts(prev => [{ id: docRef.id, ...newPost, liked: false }, ...prev]);
    
    // Update the user's profile postsCount
    await updateDoc(doc(db, 'profiles', user.uid), {
      postsCount: increment(1)
    });
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
      // Get the post to check if it belongs to the current user
      const postToDelete = posts.find(p => p.id === postId);
      
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
      
      // Update the post author's profile postsCount (only if it's the current user's post)
      if (postToDelete && postToDelete.authorId === user.uid) {
        await updateDoc(doc(db, 'profiles', user.uid), {
          postsCount: increment(-1)
        });
      }
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
        content: text.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        edited: false,
      };
      // Only add parentId if it's a reply
      if (parentId) {
        commentData.parentId = parentId;
      }
      // Add the comment to Firestore
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, commentData);

      // Update the post's comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

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
        edited: true,
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
      // Get users with the same element from 'users' collection
      const othersQuery = query(
        collection(db, 'users'),
        where('element', '==', profile.element)
      );
      const othersSnap = await getDocs(othersQuery);

      // For each user, fetch their profile to get the photoURL
      const others = await Promise.all(
        othersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== user.uid) // Exclude current user
          .map(async (u) => {
            const profileDoc = await getDoc(doc(db, 'profiles', u.id));
            const profileData = profileDoc.exists() ? profileDoc.data() : {};
            return { ...u, ...profileData };
          })
      );

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

  // Project handlers (like, comment, update, delete)
  const handleProjectLike = async (id, liked) => {
    if (!user) return;
    const projectRef = doc(db, 'personal_projects', id);
    await updateDoc(projectRef, {
      likesCount: liked ? increment(1) : increment(-1),
      likedBy: liked ? arrayUnion(user.uid) : arrayRemove(user.uid)
    });
    setProjects(prev => prev.map(p =>
      p.id === id ? {
        ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked,
        likedBy: liked
          ? [...(p.likedBy || []), user.uid]
          : (p.likedBy || []).filter(uid => uid !== user.uid)
      } : p
    ));
  };

  const handleProjectDelete = async id => {
    await deleteDoc(doc(db, 'personal_projects', id));
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleProjectUpdate = async (id, { title, description, collaborators, mediaFile }) => {
    let mediaUrl;
    if (mediaFile) {
      const fileRef = ref(storage, `personal_projects/${user.uid}/${Date.now()}_${mediaFile.name}`);
      await uploadBytes(fileRef, mediaFile);
      mediaUrl = await getDownloadURL(fileRef);
    }
    const updates = { title, description, collaborators, updatedAt: serverTimestamp() };
    if (mediaUrl) updates.mediaUrl = mediaUrl;
    await updateDoc(doc(db, 'personal_projects', id), updates);
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? {
            ...p,
            title: title !== undefined ? title : p.title,
            description: description !== undefined ? description : p.description,
            collaborators: collaborators !== undefined ? collaborators : p.collaborators,
            mediaUrl: mediaUrl || p.mediaUrl,
          }
          : p
      )
    );
  };

  const addProjectComment = async (projectId, content, parentId = null) => {
    if (!content.trim()) return;
    try {
      const commentData = {
        authorId: user?.uid,
        content: content.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        edited: false,
      };
      if (parentId) commentData.parentId = parentId;
      const commentsRef = collection(db, 'personal_projects', projectId, 'comments');
      await addDoc(commentsRef, commentData);
      const projectRef = doc(db, 'personal_projects', projectId);
      await updateDoc(projectRef, { commentsCount: increment(1) });
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding project comment:', error);
    }
  };

  const editProjectComment = async (projectId, commentId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const commentRef = doc(db, 'personal_projects', projectId, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newContent.trim(),
        edited: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error editing project comment:', error);
    }
  };

  const deleteProjectComment = async (projectId, commentId, isReply = false, parentId = null) => {
    try {
      await deleteDoc(doc(db, 'personal_projects', projectId, 'comments', commentId));
      if (!isReply) {
        const repliesQuery = query(
          collection(db, 'personal_projects', projectId, 'comments'),
          where('parentId', '==', commentId)
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        const batch = writeBatch(db);
        repliesSnapshot.docs.forEach(replyDoc => {
          batch.delete(doc(db, 'personal_projects', projectId, 'comments', replyDoc.id));
        });
        await batch.commit();
        const projectRef = doc(db, 'personal_projects', projectId);
        await updateDoc(projectRef, {
          commentsCount: increment(-(repliesSnapshot.size + 1))
        });
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, commentsCount: p.commentsCount - (repliesSnapshot.size + 1) } : p
        ));
      } else {
        const projectRef = doc(db, 'personal_projects', projectId);
        await updateDoc(projectRef, {
          commentsCount: increment(-1)
        });
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, commentsCount: p.commentsCount - 1 } : p
        ));
      }
    } catch (error) {
      console.error('Error deleting project comment:', error);
    }
  };

  const getUserProfile = async (uid) => {
    try {
      const profileRef = doc(db, 'profiles', uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        return { uid: profileSnap.id, ...profileSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  if (!profile) return (
    <ThemeProvider element="earth">
      <ElementalLoader />
    </ThemeProvider>
  );

  if (isLoading) {
    return (
      <ThemeProvider element={profile.element}>
        <ElementalLoader />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider element={profile.element}>
      <div className="flex min-h-screen bg-element-base">
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 w-64 border-r border-gray-200">
          <LeftSidebar 
            element={profile.element}
            viewerElement={user?.element}
            users={sameElementUsers}
            viewerProfile={user}
            profileUser={profile}
            onFollowToggle={handleFollowToggle}
          />
        </aside>

        <div className={`flex-1 transition-all duration-300 lg:ml-64 ${isRightSidebarExpanded ? 'lg:mr-64' : 'lg:mr-16'}`}>
          <Navbar
            element={profile.element}
            isLeftSidebarOpen={isLeftSidebarOpen}
            setIsLeftSidebarOpen={setIsLeftSidebarOpen}
            className="shadow-lg bg-element-navbar"
          />
          
          <div className={`mt-12 px-2 sm:px-4 flex justify-center transition-all duration-300 ${
            isLeftSidebarOpen ? 'lg:pl-50' : 'lg:pl-0'
          } ${
            isRightSidebarExpanded ? 'lg:pr-50' : 'lg:pr-0'
          }`}>
            <div className="w-full max-w-4xl space-y-4 sm:space-y-6 mx-auto px-2 sm:px-4 lg:px-8 mb-16 lg:mb-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <ElementalLoader />
                </div>
              ) : (
                <>
                  {/* CreatePost */}
                  <div className='pt-12'>
                    <CreatePost
                      addPost={addPost}
                      profilePic={profile.photoURL || '/default-avatar.png'}
                      element={profile.element}
                      className="shadow-md bg-element-post rounded-xl p-3 sm:p-4 w-full"
                    />
                  </div>
                  {/* Creative Tab Navigation */}
                  <div className="flex flex-col items-center mb-6 sm:mb-8 w-full">
                    <div className="bg-element-post p-2 rounded-2xl shadow-md relative flex items-center justify-center gap-3 w-full max-w-md mx-auto overflow-hidden">
                      {/* Sliding Underline */}
                      <div 
                        className={`absolute bottom-[10px] h-[2px] bg-${profile.element} transition-all duration-300 ease-in-out`}
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
                              ? `text-${profile.element} font-bold`
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
                                  ? `text-${profile.element}` 
                                  : `opacity-70 group-hover:opacity-100 group-hover:text-${profile.element}`
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
                                ? `text-${profile.element}` 
                                : `group-hover:text-${profile.element}`
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
                              ? `text-${profile.element} font-bold`
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
                                  ? `text-${profile.element}` 
                                  : `opacity-70 group-hover:opacity-100 group-hover:text-${profile.element}`
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
                                ? `text-${profile.element}` 
                                : `group-hover:text-${profile.element}`
                            }`}>עוקב אחרי</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Posts Count Indicator */}
                    <div className="mt-4 flex gap-4 sm:gap-8 text-sm text-element-text opacity-75 flex-wrap justify-center">
                      <span className={`flex items-center gap-1 transition-all duration-300 ${
                        activeTab === 'all' ? `text-${profile.element} font-semibold` : ''
                      }`}>
                        <span className="font-medium">{posts.length + projects.length}</span> פוסטים כלליים
                      </span>
                      <span className={`flex items-center gap-1 transition-all duration-300 ${
                        activeTab === 'following' ? `text-${profile.element} font-semibold` : ''
                      }`}>
                        <span className="font-medium">{followingPosts.length + followingProjects.length}</span> פוסטים מעוקבים
                      </span>
                    </div>
                  </div>
                  
                  {/* Posts Container with consistent margins */}
                  <div className="w-full space-y-4">
                    {/* --- Projects Section --- */}
                    {projects.length > 0 && (
                      <div className="mb-10">
                        <h2 className={`text-2xl font-bold mb-4 text-${profile.element}`}>פרויקטים</h2>
                        <div className="space-y-8">
                          {projects.map(project => (
                            <Project
                              key={project.id}
                              project={project}
                              element={profile.element}
                              onDelete={handleProjectDelete}
                              onUpdate={handleProjectUpdate}
                              onLike={handleProjectLike}
                              comments={projectComments[project.id] || []}
                              currentUser={user}
                              onAddComment={addProjectComment}
                              onEditComment={editProjectComment}
                              onDeleteComment={deleteProjectComment}
                              isOwner={project.authorId === user?.uid}
                              getUserProfile={getUserProfile}
                              allUsers={allUsers}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* --- End Projects Section --- */}
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
                        isLoading={isLoading}
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
                        isLoading={isLoading}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar with adjusted margin - only render on desktop */}
        <div className="hidden lg:block">
          <div className={`fixed right-0 top-6 h-[calc(100vh-1.5rem)] shadow-2xl transition-all duration-300 ${
            isRightSidebarExpanded ? 'w-64' : 'w-16'
          } lg:shadow-lg`}>
            <RightSidebar 
              element={profile.element} 
              className="h-full" 
              onExpandChange={handleRightSidebarExpandChange}
            />
          </div>
        </div>
        {/* Always render Rightsidebar for mobile bottom bar, but do not pass onExpandChange */}
        <div className="lg:hidden">
          <RightSidebar 
            element={profile.element} 
          />
        </div>
      </div>

      {/* Add keyframe animation for the background pulse */}
      <style jsx='true'>{`
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