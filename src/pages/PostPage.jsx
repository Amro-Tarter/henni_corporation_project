import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, increment, where, getDocs, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../config/firbaseConfig';
import { ThemeProvider } from '../theme/ThemeProvider';
import Navbar from '../components/social/Navbar';
import Post from '../components/social/Post';
import RightSidebar from '../components/social/Rightsidebar';
import LeftSidebar from '../components/social/LeftSideBar';
import ElementalLoader from '../theme/ElementalLoader';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [post, setPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const [sameElementUsers, setSameElementUsers] = useState([]);

  // User authentication and profile loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
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
          fullUser.following = profData.following || [];
          setProfile(profData);
        }

        setUser(fullUser);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch the post data
  useEffect(() => {
    if (!postId || !user) return;

    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = {
            id: postDoc.id,
            ...postDoc.data(),
            createdAt: postDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: postDoc.data().updatedAt?.toDate() || null,
          };
          setPost(postData);

          // Fetch author profile
          const authorDoc = await getDoc(doc(db, 'profiles', postData.authorId));
          if (authorDoc.exists()) {
            setAuthorProfile({ id: authorDoc.id, ...authorDoc.data() });
          }
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Error loading post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  // Set up comment listener
  useEffect(() => {
    if (!postId || !user) return;

    const commentsRef = collection(db, 'posts', postId, 'comments');
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
        replies: (commentReplies[comment.id] || []).sort(
          (a, b) => a.createdAt - b.createdAt
        )
      }));

      setPostComments(processedComments);
    });

    return () => unsubscribe();
  }, [postId, user]);

  // Post interaction handlers
  const handleLike = async (postId, liked) => {
    if (!user || !postId) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const currentLikedBy = postDoc.data().likedBy || [];
        let newLikedBy;
        let likesCountChange;

        if (liked) {
          newLikedBy = [...currentLikedBy, user.uid];
          likesCountChange = 1;
        } else {
          newLikedBy = currentLikedBy.filter(uid => uid !== user.uid);
          likesCountChange = -1;
        }

        await updateDoc(postRef, {
          likedBy: newLikedBy,
          likesCount: increment(likesCountChange)
        });

        setPost(prev => ({
          ...prev,
          likedBy: newLikedBy,
          likesCount: prev.likesCount + likesCountChange
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleAddComment = async (postId, content, parentId = null) => {
    if (!content.trim() || !user) return;

    try {
      const commentData = {
        authorId: user.uid,
        content: content.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        edited: false,
      };

      if (parentId) {
        commentData.parentId = parentId;
      }

      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, commentData);

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      setPost(prev => ({
        ...prev,
        commentsCount: prev.commentsCount + 1
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    if (!newContent.trim()) return;

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newContent.trim(),
        updatedAt: serverTimestamp(),
        edited: true,
      });
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId, isReply = false, parentId = null) => {
    try {
      if (!window.confirm('האם אתה בטוח שברצונך למחוק את התגובה?')) {
        return;
      }

      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));

      if (!isReply) {
        const repliesQuery = query(
          collection(db, 'posts', postId, 'comments'),
          where('parentId', '==', commentId)
        );
        const repliesSnapshot = await getDocs(repliesQuery);

        const batch = writeBatch(db);
        repliesSnapshot.docs.forEach(replyDoc => {
          batch.delete(doc(db, 'posts', postId, 'comments', replyDoc.id));
        });
        await batch.commit();

        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          commentsCount: increment(-(repliesSnapshot.size + 1))
        });

        setPost(prev => ({
          ...prev,
          commentsCount: prev.commentsCount - (repliesSnapshot.size + 1)
        }));
      } else {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          commentsCount: increment(-1)
        });

        setPost(prev => ({
          ...prev,
          commentsCount: prev.commentsCount - 1
        }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הפוסט?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUpdatePost = async (postId, { content, mediaFile }) => {
    try {
      const updates = { content, updatedAt: serverTimestamp() };

      if (mediaFile) {
        const storage = getStorage();
        const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        updates.mediaUrl = await getDownloadURL(fileRef);
      }

      await updateDoc(doc(db, 'posts', postId), updates);
      setPost(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error updating post:', err);
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

  // Handler for right sidebar expansion state
  const handleRightSidebarExpandChange = (expanded) => {
    setIsRightSidebarExpanded(expanded);
  };

  useEffect(() => {
    if (profile?.element && user?.uid) {
      fetchSameElementUsers();
    }
  }, [profile?.element, user?.uid]);

  if (loading) {
    return (
      <ThemeProvider element={profile?.element || 'earth'}>
        <ElementalLoader />
      </ThemeProvider>
    );
  }

  if (error || !post) {
    return (
      <ThemeProvider element={profile?.element || 'earth'}>
        <div className="min-h-screen bg-element-base">
          <Navbar element={profile?.element} />
          <div className="pt-20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 text-lg">{error || 'פוסט לא נמצא'}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                חזור
              </button>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider element={profile?.element || 'earth'}>
      <div className="flex min-h-screen bg-element-base">
        <aside className="hidden lg:block fixed top-[56.8px] bottom-0 left-0 w-64 border-r border-gray-200">
          <LeftSidebar 
            element={profile?.element}
            users={sameElementUsers}
            viewerProfile={user}
            onFollowToggle={handleFollowToggle}
          />
        </aside>

        <div className={`flex-1 transition-all duration-300 lg:ml-64 ${isRightSidebarExpanded ? 'lg:mr-64' : 'lg:mr-16'}`}>
          <Navbar
            element={profile?.element}
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
              {/* Back Button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>חזור</span>
              </motion.button>

              {/* Post */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Post
                  post={post}
                  element={profile?.element || 'earth'}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                  onLike={handleLike}
                  comments={postComments}
                  currentUser={user}
                  onAddComment={handleAddComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  isOwner={user?.uid === post.authorId}
                  getAuthorProfile={getAuthorProfile}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Sidebar with adjusted margin - only render on desktop */}
        <div className="hidden lg:block">
          <div className={`fixed right-0 top-6 h-[calc(100vh-1.5rem)] shadow-2xl transition-all duration-300 ${
            isRightSidebarExpanded ? 'w-64' : 'w-16'
          } lg:shadow-lg`}>
            <RightSidebar 
              element={profile?.element} 
              className="h-full" 
              onExpandChange={handleRightSidebarExpandChange}
            />
          </div>
        </div>
        {/* Always render Rightsidebar for mobile bottom bar, but do not pass onExpandChange */}
        <div className="lg:hidden">
          <RightSidebar 
            element={profile?.element} 
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default PostPage;