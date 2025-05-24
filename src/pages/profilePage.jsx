//profilepage.jsx
import React, { useState, useEffect } from 'react';
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
  onSnapshot,
}
 from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db } from '../config/firbaseConfig.ts';
import { useNavigate } from 'react-router-dom';

import Navbar       from '../components/social/Navbar.jsx';
import LeftSidebar  from '../components/social/LeftSideBar';
import RightSidebar from '../components/social/Rightsidebar.jsx';
import ProfileInfo  from '../components/social/profileInfo.jsx';
import CreatePost   from '../components/social/createpost';
import Post  from '../components/social/Post.jsx';
import CreateProject from '../components/social/CreateProject';
import Project from '../components/social/Project.jsx';

const ProfilePage = () => {
  const { username } = useParams();
  const [uid, setUid] = useState(null);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [viewerProfile, setViewerProfile] = useState(null);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [postComments, setPostComments] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectComments, setProjectComments] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [sameElementUsers, setSameElementUsers] = useState([]);
  const [authorProfilesCache, setAuthorProfilesCache] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('posts'); // 'posts' or 'projects'
  const navigate = useNavigate();


  // In your useEffect that fetches the profile by username
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

    return () => clearTimeout(retryTimeout);
  }, [username]);


useEffect(() => {
  const fetchViewerProfile = async () => {
    const auth = getAuth();
    const viewerUid = auth.currentUser?.uid;
    if (!viewerUid) return;

    try {
      const snap = await getDoc(doc(db, 'profiles', viewerUid));
      if (snap.exists()) {
        setViewerProfile({ uid: viewerUid, ...snap.data() });
      }
    } catch (error) {
      console.error('Error fetching viewer profile:', error);
    }
  };

  fetchViewerProfile();
}, []);

  // Fetch profile and posts
  useEffect(() => {
    if (!uid || !viewerProfile?.uid) return;

    async function loadData() {
      // Profile
      const profRef  = doc(db, 'profiles', uid);
      const profSnap = await getDoc(profRef);

      let profileData = profSnap.exists() ? profSnap.data() : null;

      // Fetch element from 'users'
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        // If there's an element in users, override/add it
        if (userData.element) {
          profileData = { ...profileData, element: userData.element };
        }
        if (userData.role) {
          profileData = { ...profileData, role: userData.role };
        }
      }

      if (profileData) setProfile(profileData);
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
          liked: Array.isArray(data.likedBy) && data.likedBy.includes(viewerProfile.uid),
        };
      });
      setPosts(loaded);

      // Projects
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
      setProjects(loadedProjects);
      setLoading(false);
      }
    loadData();
  }, [uid, viewerProfile]);


  useEffect(() => {
    if (profile && viewerProfile && profile.uid !== viewerProfile.uid) {
      setIsFollowing(profile.followers?.includes(viewerProfile.uid));
    }
  }, [profile, viewerProfile]);

  // Fetch users with the same element
  useEffect(() => {
    const fetchSimilarElementUsers = async () => {
      if (!profile?.element || !uid) return;

      const othersQuery = query(
        collection(db, 'profiles'),
        where('element', '==', profile.element)
      );
      const othersSnap = await getDocs(othersQuery);

      const others = othersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== uid); // Exclude current user

      const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 5);
      setSameElementUsers(shuffled);
    };

    fetchSimilarElementUsers();
  }, [profile?.element, uid]);

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

  const getAuthorProfile = async (uid) => {
    if (!uid) return null;

    if (authorProfilesCache && authorProfilesCache[uid]) {
      return authorProfilesCache[uid];
    }

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
  };

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

      // ✅ If viewing this profile, update its followersCount too
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
  const updateField = async (field, value) => {
    const profileRef = doc(db, 'profiles', uid);
    const userRef    = doc(db, 'users', uid);

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

      const batch = writeBatch(db);
      batch.update(profileRef, { username: value, updatedAt: serverTimestamp() });
      batch.update(userRef,    { username: value });
      await batch.commit();
      setProfile(prev => ({ ...prev, [field]: value }));
      navigate(`/profile/${value}`, { replace: true });
      return;
    } 
      else if (field === 'location') {
        const batch = writeBatch(db);
        batch.update(profileRef, { location: value, updatedAt: serverTimestamp() });
        batch.update(userRef,    { location: value });
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
  const createPost = async ({ text, mediaType, mediaFile }) => {
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
      mediaType,
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
      likedBy: liked ? arrayUnion(viewerProfile.uid) : arrayRemove(viewerProfile.uid)
    });
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked,likedBy: liked
              ? [...(p.likedBy || []), viewerProfile.uid]
              : (p.likedBy || []).filter(uid => uid !== viewerProfile.uid)  } : p
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

  const createProject = async ({ title, description, mediaFile, mediaType, collaborators }) => {
    let mediaUrl = '';
    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop();
      const name = `${Date.now()}.${ext}`;
      const storage = getStorage();
      const ref = storageRef(storage, `personal_projects/${uid}/${name}`);
      await uploadBytes(ref, mediaFile);
      mediaUrl = await getDownloadURL(ref);
    }
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
  };

  const handleProjectDelete = async id => {
    await deleteDoc(doc(db, 'personal_projects', id));
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleProjectUpdate = async (id, { title, description, collaborators, mediaFile }) => {
    let mediaUrl;
    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop();
      const name = `${Date.now()}.${ext}`;
      const storage = getStorage();
      const ref = storageRef(storage, `personal_projects/${uid}/${name}`);
      await uploadBytes(ref, mediaFile);
      mediaUrl = await getDownloadURL(ref);
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

  const handleProjectLike = async (id, liked) => {
    const projectRef = doc(db, 'personal_projects', id);
    await updateDoc(projectRef, {
      likesCount: liked ? increment(1) : increment(-1),
      likedBy: liked ? arrayUnion(viewerProfile.uid) : arrayRemove(viewerProfile.uid)
    });
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, likesCount: p.likesCount + (liked ? 1 : -1), liked,
        likedBy: liked
          ? [...(p.likedBy || []), viewerProfile.uid]
          : (p.likedBy || []).filter(uid => uid !== viewerProfile.uid)
      } : p
    ));
  };

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

  const deleteProjectComment = async (projectId, commentId, isReply = false, parentId = null) => {
    try {
      await deleteDoc(doc(db, 'personal_projects', projectId, 'comments', commentId));
      // Similar logic as for posts if you support nested replies
      // ... (see above for posts)
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, commentsCount: Math.max((p.commentsCount || 1) - 1, 0) } : p
      ));
    } catch (error) {
      console.error('Error deleting comment:', error);
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
        <Navbar element={profile.element} />
        <div className="flex flex-1 pt-[56.8px]">
          <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 w-64 border-r border-gray-200">
            <LeftSidebar
              element={profile.element}
              users={sameElementUsers}
              viewerProfile={viewerProfile}
              onFollowToggle={handleFollowToggle}
            />
          </aside>

          <main
            className={`
              flex-1 pt-2 space-y-12 pb-4 transition-all duration-500 ease-in-out
              lg:ml-64 ${isRightOpen ? 'lg:mr-64' : 'lg:mr-16'}`}
          >
            {/* Profile Info */}
            <ProfileInfo
              isOwner={uid === getAuth().currentUser?.uid}
              isFollowing={isFollowing}
              uid={uid}
              profilePic={profile.photoURL}
              backgroundPic={profile.backgroundURL}
              username={profile.username}
              location={profile.location}
              bio={profile.bio}
              element={profile.element}
              role={profile.role}
              postsCount={profile.postsCount}
              followersCount={profile.followersCount}
              followingCount={profile.followingCount}
              onUpdateField={updateField}
              onUpdateProfilePic={updateProfilePic}
              onUpdateBackgroundPic={updateBackgroundPic}
              onFollowToggle={handleFollowToggle}
            />

            {/* Sliding Tabs */}
            <div className="flex flex-col items-center mb-8 w-full">
              <div className={`bg-${profile.element}-post p-2 rounded-2xl shadow-md relative flex items-center justify-center gap-3 w-full max-w-md mx-auto overflow-hidden`}>
                <div
                  className={`absolute bottom-[10px] h-[2px] bg-${profile.element} transition-all duration-300 ease-in-out`}
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
                    onClick={() => setActiveProfileTab('posts')}
                    className={`relative w-full px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-300
                      ${activeProfileTab === 'posts'
                        ? `text-${profile.element} font-bold`
                        : 'text-element-text'
                      }
                      hover:bg-element-hover/10
                      focus:outline-none
                      group
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {/* Posts Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${activeProfileTab === 'posts' ? `text-${profile.element}` : 'opacity-70 group-hover:opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className={`text-sm sm:text-base transition-colors duration-300 ${activeProfileTab === 'posts' ? `text-${profile.element}` : 'group-hover:text-element-accent'}`}>
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
                    onClick={() => setActiveProfileTab('projects')}
                    className={`relative w-full px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-300
                      ${activeProfileTab === 'projects'
                        ? `text-${profile.element} font-bold`
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
                        className={`${activeProfileTab === 'projects' ? `text-${profile.element}` : 'opacity-70 group-hover:opacity-100'}`}
                      />
                      <span className={`text-sm sm:text-base transition-colors duration-300 ${activeProfileTab === 'projects' ? `text-${profile.element}` : 'group-hover:text-element-accent'}`}>
                        פרויקטים
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Show create form only under the right section */}
            <section className="space-y-6">
              {activeProfileTab === 'posts' && uid === getAuth().currentUser?.uid && (
                <CreatePost
                  element={profile.element}
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
                      element={profile.element}
                      post={p}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                      onLike={handleLike}
                      comments={postComments[p.id] || []}
                      currentUser={{
                        uid: viewerProfile?.uid,
                        photoURL: viewerProfile?.photoURL || '',
                        username: viewerProfile?.username || '',
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
                  element={profile.element}
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
                      element={profile.element}
                      onDelete={handleProjectDelete}
                      onUpdate={handleProjectUpdate}
                      onLike={handleProjectLike}
                      comments={projectComments[project.id] || []}
                      currentUser={{
                        uid: viewerProfile?.uid,
                        photoURL: viewerProfile?.photoURL || '',
                        username: viewerProfile?.username || '',
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
                  <div className="text-center text-gray-400 py-10">אין פרויקטים עדיין.</div>
                )
              )}
            </section>
          </main>

          <aside className="hidden lg:block fixed top-[56.8px] bottom-0 right-0 w-16">
            <RightSidebar
              element={profile.element}
              onExpandChange={setIsRightOpen}
            />
          </aside>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ProfilePage;