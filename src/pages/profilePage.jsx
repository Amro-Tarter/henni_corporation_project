//profilepage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import ElementalLoader from '../theme/ElementalLoader';
import { useParams } from 'react-router-dom';
import { LightbulbIcon } from 'lucide-react';

import {
  doc,
  getDoc,
  collection,
  collectionGroup,
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
  onSnapshot,  // updates the app if the data changes in DB
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db } from '../config/firbaseConfig.ts';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/social/Navbar.jsx';
import LeftSidebar from '../components/social/LeftSideBar';
import RightSidebar from '../components/social/Rightsidebar.jsx';
import ProfileInfo from '../components/social/profileInfo.jsx';
import CreatePost from '../components/social/createpost';
import Post from '../components/social/Post.jsx';
import CreateProject from '../components/social/CreateProject';
import Project from '../components/social/Project.jsx';

const ProfilePage = () => {
  const { username } = useParams(); // reads the username from the URL
  const [uid, setUid] = useState(null);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [viewerProfile, setViewerProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postComments, setPostComments] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectComments, setProjectComments] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [authorProfilesCache, setAuthorProfilesCache] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('posts'); // 'posts' or 'projects'
  const navigate = useNavigate();
  const viewerId = viewerProfile?.uid;
  const tabsRef = useRef(null);

  // find the UID by username
  useEffect(() => {
    let retryTimeout;
    async function loadUIDByUsername(retryCount = 0) {
      setLoading(true);
      try {
        const q = query(collection(db, 'profiles'), where('username', '==', username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUid(snapshot.docs[0].id);
        } else if (retryCount < 3) {
          // Retry up to 3 times after a short delay
          retryTimeout = setTimeout(() => loadUIDByUsername(retryCount + 1), 400);
        } else {
          console.warn('Username not found:', username);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch UID:', err);
        setLoading(false);
      }
    }

    if (username) loadUIDByUsername();

    return () => clearTimeout(retryTimeout); //cancel the retry timeout so it doesn’t run unnecessarily
  }, [username]);

  // Fetch viewer profile (the logged-in user)
  useEffect(() => {
    const fetchViewerProfile = async () => {
      const auth = getAuth();
      const viewerUid = auth.currentUser?.uid;
      if (!viewerUid) return;

      try {
        // Fetch profile
        const profileSnap = await getDoc(doc(db, 'profiles', viewerUid));
        let viewerProfileData = { uid: viewerUid, ...(profileSnap.exists() ? profileSnap.data() : {}) };

        // Fetch user doc to get role, element, participants
        const userSnap = await getDoc(doc(db, 'users', viewerUid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          viewerProfileData = {
            ...viewerProfileData,
            ...userData, // ⬅️ Merge everything from users, including `participants`
          };
        }

        setViewerProfile(viewerProfileData);
      } catch (error) {
        console.error('Error fetching viewer profile:', error);
      }
    };

    fetchViewerProfile();
  }, []);

  // Fetch profile, posts and projects
  useEffect(() => {
    if (!uid || !viewerId) return;

    const loadData = async () => {
      // Profile
      const profRef = doc(db, 'profiles', uid);
      const profSnap = await getDoc(profRef);

      let profileData = profSnap.exists() ? profSnap.data() : null;

      // Fetch element from 'users'
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        profileData = {
          ...profileData,
          role: userData.role || profileData.role,
          element: userData.element || profileData.element, // <-- optional merge
        };
      }
      if (profileData) setProfile({ ...profileData, uid });

      else console.warn('No profile for', uid);

      // Posts
      const postsCol = collection(db, 'posts');
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
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(viewerProfile.uid), //Adds a liked: true/false field if the viewer has liked it
        };
      });
      if (JSON.stringify(loaded) !== JSON.stringify(posts)) { // compare two arrays
        // Only update if the posts have changed
        setPosts(loaded);
      }

      // Projects (same as posts)
      const projectsCol = collection(db, 'personal_projects');
      const projectsQuery = query(
        projectsCol,
        where('authorId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const projectsSnap = await getDocs(projectsQuery);
      const loadedProjects = projectsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(viewerProfile.uid),
        };
      });
      if (JSON.stringify(loadedProjects) !== JSON.stringify(projects)) {
        setProjects(loadedProjects);
      }
      setLoading(false);
    }
    loadData();
  }, [uid, viewerProfile]);

  // Check if the viewer is following this profile
  useEffect(() => {
    if (profile && viewerProfile && profile.uid !== viewerProfile.uid) {
      setIsFollowing(profile.followers?.includes(viewerProfile.uid));
    }
  }, [profile, viewerProfile]);

  // Fetch all users
  useEffect(() => {
    async function loadUsers() {
      const snap = await getDocs(collection(db, 'profiles'));
      setAllUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    loadUsers();
  }, []);

  // Set up comment listeners for each post
  useEffect(() => {
    if (!posts.length) return;

    // store cleanup functions from onSnapShot
    const unsubscribes = {};

    // Set up a listener for each post's comments
    posts.forEach(post => {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = [];
        const topLevelComments = []; // Comments without parent
        const commentReplies = {}; // Group replies by parent ID

        // collect the comments
        snapshot.forEach(doc => {
          const commentData = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || null,
          };

          fetchedComments.push(commentData);

          // Organize comments into parent + replies
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

        // combine them together
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

  // comments for project (same as posts)
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
          replies: (commentReplies[comment.id] || []).sort((a, b) => a.timestamp - b.timestamp),
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

  // Fetch author profiles for posts, projects and comments
  const getAuthorProfile = useCallback(async (uid) => {
    if (!uid) return null;
    if (authorProfilesCache[uid]) return authorProfilesCache[uid];

    try {
      const snap = await getDoc(doc(db, 'profiles', uid));
      if (snap.exists()) {
        const profile = snap.data();
        setAuthorProfilesCache(prev => ({ ...prev, [uid]: profile }));
        return profile;
      }
    } catch (err) {
      console.error('Failed to load profile for', uid, err);
    }

    return null;
  }, [authorProfilesCache]);

  // Upload media and return its URL
  const uploadMediaAndGetURL = async (file, path) => {
    if (!file) return '';
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}.${ext}`;
    const storage = getStorage();
    const ref = storageRef(storage, `${path}/${name}`);
    await uploadBytes(ref, file);
    return await getDownloadURL(ref);
  };

  // Toggle follow/unfollow action
  const handleFollowToggle = async (targetUserId) => {
    const myUid = viewerProfile?.uid;
    if (!myUid || myUid === targetUserId) return;

    const isFollowing = viewerProfile.following?.includes(targetUserId);
    const myRef = doc(db, 'profiles', myUid);
    const targetRef = doc(db, 'profiles', targetUserId);

    try {
      // Update Firestore
      await updateDoc(myRef, {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId),
        followingCount: increment(isFollowing ? -1 : 1),
      });

      await updateDoc(targetRef, {
        followers: isFollowing ? arrayRemove(myUid) : arrayUnion(myUid),
        followersCount: increment(isFollowing ? -1 : 1),
      });

      // Update viewerProfile state
      setViewerProfile(prev => ({
        ...prev,
        following: isFollowing
          ? prev.following.filter(uid => uid !== targetUserId)
          : [...(prev.following || []), targetUserId],
      }));

      // If viewing this profile, update its followersCount too
      if (profile?.uid === targetUserId) {
        setProfile(prev => ({
          ...prev,
          followersCount: prev.followersCount + (isFollowing ? -1 : 1),
        }));
      }

    } catch (error) {
      console.error('Follow action failed:', error);
    }
  };

  // Update profile field
  // NOTE: username/location updates are handled in Settings page only.
  const updateField = async (field, value) => {
    const profileRef = doc(db, 'profiles', uid);
    const userRef = doc(db, 'users', uid);

    if (field === 'username') {
      // Prevent empty or whitespace-only username
      if (!value.trim()) {
        alert('שם המשתמש לא יכול להיות ריק או להכיל רק רווחים.');
        return;
      }
      // Check if username exists
      const q = query(collection(db, 'profiles'), where('username', '==', value));
      const snap = await getDocs(q);
      const taken = snap.docs.some(doc => doc.id !== uid);
      if (taken) {
        alert('שם המשתמש הזה כבר תפוס. אנא בחר שם אחר.');
        return;
      }
      // Use a batch to update both collections
      const batch = writeBatch(db);
      batch.update(profileRef, { username: value, updatedAt: serverTimestamp() });
      batch.update(userRef, { username: value });
      await batch.commit();
      setProfile(prev => ({ ...prev, [field]: value }));
      navigate(`/profile/${value}`, { replace: true });
      return;
    }
    else if (field === 'location') {
      const batch = writeBatch(db);
      batch.update(profileRef, { location: value, updatedAt: serverTimestamp() });
      batch.update(userRef, { location: value });
      await batch.commit();
    } else {
      await updateDoc(profileRef, { [field]: value, updatedAt: serverTimestamp() });
    }
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Upload profile picture
  const updateProfilePic = async file => {
    const storage = getStorage();
    const ref = storageRef(storage, `profiles/${uid}/profile.jpg`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    await updateField('photoURL', url);
  };

  // Upload background picture
  const updateBackgroundPic = async file => {
    const storage = getStorage();
    const ref = storageRef(storage, `profiles/${uid}/background.jpg`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    await updateField('backgroundURL', url);
  };

  // Create a new post
  const createPost = async ({ text, mediaType, mediaFile }) => {
    const mediaUrl = await uploadMediaAndGetURL(mediaFile, `posts/${uid}`);
    const newPost = {
      authorId: uid,
      authorName: profile.username,
      authorPhotoURL: profile.photoURL,
      content: text || '',
      mediaUrl,
      mediaType,
      likedBy: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const postRef = await addDoc(collection(db, 'posts'), newPost);
    setPosts(prev => [{ id: postRef.id, ...newPost, liked: false }, ...prev]);
    await updateDoc(doc(db, 'profiles', uid), {
      postsCount: increment(1)
    });
    setProfile(prev => ({
      ...prev,
      postsCount: (prev.postsCount || 0) + 1
    }));

  };

  // Delete a post
  const handleDelete = async id => {
    await deleteDoc(doc(db, 'posts', id));
    setPosts(prev => prev.filter(p => p.id !== id));
    await updateDoc(doc(db, 'profiles', uid), {
      postsCount: increment(-1)
    });
    setProfile(prev => ({
      ...prev,
      postsCount: Math.max((prev.postsCount || 1) - 1, 0)
    }));
  };

  // Update a post
  const handleUpdate = async (id, { content, mediaFile }) => {
    const mediaUrl = mediaFile ? await uploadMediaAndGetURL(mediaFile, `posts/${uid}`) : null;
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
      likedBy: liked ? arrayUnion(viewerProfile.uid) : arrayRemove(viewerProfile.uid)
    });
    setPosts(prev => prev.map(p =>
      p.id === id ? {
        ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked, likedBy: liked
          ? [...(p.likedBy || []), viewerProfile.uid]
          : (p.likedBy || []).filter(uid => uid !== viewerProfile.uid)
      } : p
    ));
  };

  // Add a new comment to a post
  const addComment = async (postId, content, parentId = null) => {
    if (!content.trim()) return;

    try {
      const commentData = {
        authorId: viewerProfile?.uid,
        content: content.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        edited: false,
      };

      // Add parentId if this is a reply
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

      // Update the commentsCount in the local state
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Create a new project
  const createProject = async ({ title, description, mediaFile, mediaType, collaborators }) => {
    const mediaUrl = await uploadMediaAndGetURL(mediaFile, `personal_projects/${uid}`);
    const newProject = {
      authorId: uid,
      title: title.trim(),
      description: description.trim(),
      mediaUrl,
      mediaType,
      collaborators,
      likedBy: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const projectRef = await addDoc(collection(db, 'personal_projects'), newProject);
    setProjects(prev => [{ id: projectRef.id, ...newProject, liked: false }, ...prev]);
    await updateDoc(doc(db, 'profiles', uid), {
      postsCount: increment(1)
    })
    setProfile(prev => ({
      ...prev,
      postsCount: (prev.postsCount || 0) + 1,
    }));
  };

  // Delete a project
  const handleProjectDelete = async id => {
    await deleteDoc(doc(db, 'personal_projects', id));
    setProjects(prev => prev.filter(p => p.id !== id));
    await updateDoc(doc(db, 'profiles', uid), {
      postsCount: increment(-1),
    });
    setProfile(prev => ({
      ...prev,
      postsCount: Math.max((prev.postsCount || 1) - 1, 0),
    }));
  };

  // Update a project
  const handleProjectUpdate = async (id, { title, description, collaborators, mediaFile }) => {
    const mediaUrl = mediaFile ? await uploadMediaAndGetURL(mediaFile, `personal_projects/${uid}`) : null;
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

  // Like a project once per user
  const handleProjectLike = async (id, liked) => {
    const projectRef = doc(db, 'personal_projects', id);
    await updateDoc(projectRef, {
      likesCount: liked ? increment(1) : increment(-1),
      likedBy: liked ? arrayUnion(viewerProfile.uid) : arrayRemove(viewerProfile.uid)
    });
    setProjects(prev => prev.map(p =>
      p.id === id ? {
        ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked,
        likedBy: liked
          ? [...(p.likedBy || []), viewerProfile.uid]
          : (p.likedBy || []).filter(uid => uid !== viewerProfile.uid)
      } : p
    ));
  };

  // Add a new comment to a project
  const addProjectComment = async (projectId, content, parentId = null) => {
    if (!content.trim()) return;
    try {
      const commentData = {
        authorId: viewerProfile?.uid,
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
      console.error('Error adding comment:', error);
    }
  };

  // Edit an existing project comment
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
      console.error('Error editing comment:', error);
    }
  };

  // Delete a comment in a project
  const deleteProjectComment = async (projectId, commentId, isReply = false, parentId = null) => {
    try {
      // Delete the comment document
      await deleteDoc(doc(db, 'personal_projects', projectId, 'comments', commentId));
      if (!isReply) {
        // If it's a top-level comment, delete all replies
        const repliesQuery = query(
          collection(db, 'personal_projects', projectId, 'comments'),
          where('parentId', '==', commentId)
        );
        const repliesSnapshot = await getDocs(repliesQuery);

        // Batch delete replies
        const batch = writeBatch(db);
        repliesSnapshot.docs.forEach(replyDoc => {
          batch.delete(doc(db, 'personal_projects', projectId, 'comments', replyDoc.id));
        });
        await batch.commit();

        // Decrement the project's comment count for the parent and all replies
        const projectRef = doc(db, 'personal_projects', projectId);
        await updateDoc(projectRef, {
          commentsCount: increment(-(repliesSnapshot.size + 1))
        });

        // Update local project state (if you keep commentsCount in UI state)
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, commentsCount: p.commentsCount - (repliesSnapshot.size + 1) } : p
        ));
      } else {
        // Just decrement by 1 for a reply
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

  const getUserProfile = getAuthorProfile; // just for naming

  // Edit an existing comment
  const editComment = async (postId, commentId, newContent) => {
    if (!newContent.trim()) return;

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newContent.trim(),
        edited: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  // Delete a comment
  const deleteComment = async (postId, commentId, isReply = false, parentId = null) => {
    try {
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

  const isPrivilegedRole = ['mentor', 'admin'].includes(profile?.role);
  const element = isPrivilegedRole || !profile?.element ? 'red' : profile.element;
  const isViewerPrivileged = ['mentor', 'admin'].includes(viewerProfile?.role);
  const viewerElement = isViewerPrivileged || !viewerProfile?.element ? 'red' : viewerProfile?.element;

  if (loading) {
    return (
      <ThemeProvider element={profile?.element}>
        <ElementalLoader />
      </ThemeProvider>
    );
  }

  if (!profile) {
    navigate('/notfound', { replace: true });
    return null;
  }

  return (
    <ThemeProvider element={element}>
      <div dir="rtl" className="min-h-screen flex flex-col bg-gray-100">
        <Navbar element={element} />
        <div className="flex flex-1 pt-[56.8px]">
          <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 w-[290px] border-r border-gray-200 z-20">
            <LeftSidebar
              element={element}
              viewerElement={viewerElement}
              viewerProfile={viewerProfile}
              profileUser={profile}
              onFollowToggle={handleFollowToggle}
            />
          </aside>

          <main
            className={`
            flex-1 pt-2 sm:pb-6 pb-20 transition-all duration-500 ease-in-out
            px-2 sm:px-0
            lg:ml-[290px] ${isRightOpen ? 'lg:mr-64' : 'lg:mr-16'}
          `}
          >
            {/* Profile Info */}
            <div className="w-full mx-auto">
              <ProfileInfo
                isOwner={uid === getAuth().currentUser?.uid}
                isFollowing={isFollowing}
                uid={uid}
                profilePic={profile.photoURL}
                backgroundPic={profile.backgroundURL}
                username={profile.username}
                location={profile.location}
                bio={profile.bio}
                element={element}
                role={profile.role}
                postsCount={profile.postsCount}
                followersCount={profile.followersCount}
                followingCount={profile.followingCount}
                onUpdateProfilePic={updateProfilePic}
                onUpdateBackgroundPic={updateBackgroundPic}
                onFollowToggle={handleFollowToggle}
              />
            </div>

            {/* Sliding Tabs */}
            <div ref={tabsRef} className="flex flex-col items-center mb-5 mt-5 w-full">
              <div className={`bg-${element}-post p-2 rounded-2xl shadow-md relative flex items-center justify-center gap-3 w-full max-w-md mx-auto overflow-hidden`}>
                <div
                  className={`absolute bottom-[10px] h-[2px] bg-${element} transition-all duration-300 ease-in-out`}
                  style={{
                    left: '0',
                    width: '47%',
                    transform: activeProfileTab === 'posts' ? 'translateX(113%)' : 'translateX(3%)'
                  }}
                />
                {/* Posts Button */}
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProfileTab('posts');
                      setTimeout(() => {
                        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 50); // small delay ensures render
                    }}
                    className={`relative w-full px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-300
                      ${activeProfileTab === 'posts'
                        ? `text-${element} font-bold`
                        : 'text-element-text'
                      }
                      hover:bg-element-hover/10
                      focus:outline-none
                      group
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {/* Posts Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${activeProfileTab === 'posts' ? `text-${element}` : 'opacity-70 group-hover:opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className={`text-sm sm:text-base transition-colors duration-300 ${activeProfileTab === 'posts' ? `text-${element}` : 'group-hover:text-element-accent'}`}>
                        פוסטים
                      </span>
                    </div>
                  </button>
                </div>
                {/* Divider */}
                <div className="h-8 w-px bg-element-border/30 self-center"></div>
                {/* Projects Button */}
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProfileTab('projects');
                      setTimeout(() => {
                        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 50);
                    }}
                    className={`relative w-full px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-300
                      ${activeProfileTab === 'projects'
                        ? `text-${element} font-bold`
                        : 'text-element-text'
                      }
                      hover:bg-element-hover/10
                      focus:outline-none
                      group
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LightbulbIcon
                        size={20}
                        className={`${activeProfileTab === 'projects' ? `text-${element}` : 'opacity-70 group-hover:opacity-100'}`}
                      />
                      <span className={`text-sm sm:text-base transition-colors duration-300 ${activeProfileTab === 'projects' ? `text-${element}` : 'group-hover:text-element-accent'}`}>
                        פרויקטים
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Show create form only under the right section */}
            <section className="space-y-6 w-full">
              {activeProfileTab === 'posts' && uid === getAuth().currentUser?.uid && (
                <CreatePost
                  element={element}
                  addPost={createPost}
                  profilePic={profile.photoURL}
                  className="mb-3 w-full"
                />
              )}
              {activeProfileTab === 'posts' && (
                posts.length > 0 ? (
                  posts.map(p => (
                    <Post
                      key={p.id}
                      element={element}
                      post={p}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                      onLike={handleLike}
                      comments={postComments[p.id] || []}
                      currentUser={{
                        uid: viewerProfile?.uid,
                        photoURL: viewerProfile?.photoURL || '',
                        username: viewerProfile?.username || '',
                        role: viewerProfile?.role || '',
                      }}
                      onAddComment={addComment}
                      onEditComment={editComment}
                      onDeleteComment={deleteComment}
                      isOwner={uid === getAuth().currentUser?.uid}
                      getAuthorProfile={getAuthorProfile}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-10">לא נמצאו פוסטים.</div>
                )
              )}

              {activeProfileTab === 'projects' && uid === getAuth().currentUser?.uid && (
                <CreateProject
                  element={element}
                  profilePic={profile.photoURL}
                  allUsers={allUsers}
                  onCreateProject={createProject}
                  className="mb-3 w-full"
                />
              )}
              {activeProfileTab === 'projects' && (
                projects.length > 0 ? (
                  projects.map(project => (
                    <Project
                      key={project.id}
                      project={project}
                      element={element}
                      onDelete={handleProjectDelete}
                      onUpdate={handleProjectUpdate}
                      onLike={handleProjectLike}
                      comments={projectComments[project.id] || []}
                      currentUser={{
                        uid: viewerProfile?.uid,
                        photoURL: viewerProfile?.photoURL || '',
                        username: viewerProfile?.username || '',
                        role: viewerProfile?.role || '',
                      }}
                      onAddComment={addProjectComment}
                      onEditComment={editProjectComment}
                      onDeleteComment={deleteProjectComment}
                      isOwner={uid === getAuth().currentUser?.uid}
                      getUserProfile={getUserProfile}
                      allUsers={allUsers}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-10">לא נמצאו פרויקטים</div>
                )
              )}
            </section>
          </main>
          <RightSidebar element={element} onExpandChange={setIsRightOpen} />

        </div >
      </div >
    </ThemeProvider >
  );
};

export default ProfilePage;