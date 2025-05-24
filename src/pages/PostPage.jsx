import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, increment, where, getDocs, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../config/firbaseConfig';
import { useUser } from '../hooks/useUser';
import Navbar from '../components/social/Navbar';
import Post from '../components/social/Post';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useUser();
  const [post, setPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);

  // Fetch the post data
  useEffect(() => {
    if (!postId) return;

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
  }, [postId]);

  // Set up comment listener
  useEffect(() => {
    if (!postId) return;

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
  }, [postId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar element={profile?.element} />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען פוסט...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar element={profile?.element} />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
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
  );
};

export default PostPage;