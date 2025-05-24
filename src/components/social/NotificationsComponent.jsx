import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { X, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, onSnapshot, orderBy, updateDoc, limit, arrayUnion, collectionGroup } from 'firebase/firestore';
import { auth, db } from '../../config/firbaseConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { onAuthStateChanged } from 'firebase/auth';

// Create the context
const NotificationsContext = createContext();

// Custom hook to use the notifications context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

// Provider component
export const NotificationsProvider = ({ children }) => {
  console.log('NotificationsProvider mounted');
  const [notifications, setNotifications] = useState([]);
  const [profilePictures, setProfilePictures] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [postUnreadCount, setPostUnreadCount] = useState(0);
  const [commentUnreadCount, setCommentUnreadCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickedNotifications, setClickedNotifications] = useState({});
  const [seenPosts, setSeenPosts] = useState(new Set());
  const [seenPostsLoaded, setSeenPostsLoaded] = useState(false);
  const [seenComments, setSeenComments] = useState(new Set());
  const [seenCommentsLoaded, setSeenCommentsLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState(new Set());
  const [userCommentedPosts, setUserCommentedPosts] = useState(new Set());
  const notificationRef = useRef(null);
  const seenPostsRef = useRef(new Set());
  const seenCommentsRef = useRef(new Set());
  const navigate = useNavigate();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile to get following list
  useEffect(() => {
    console.log('useEffect: getUserProfile, user:', user);
    if (!user) return;

    const getUserProfile = async () => {
      try {
        const profileDoc = await getDoc(firestoreDoc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    getUserProfile();
  }, [user]);

  // On mount, fetch seenPostNotifications from Firestore
  useEffect(() => {
    console.log('useEffect: fetchSeenPosts, user:', user);
    if (!user) return;
    
    const fetchSeenPosts = async () => {
      try {
        const profileDoc = await getDoc(firestoreDoc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          const seenArr = Array.isArray(data.seenPostNotifications) ? data.seenPostNotifications : [];
          seenPostsRef.current = new Set(seenArr);
          setSeenPosts(new Set(seenArr));
        }
      } catch (err) {
        console.error('Error loading seen post notifications:', err);
      } finally {
        setSeenPostsLoaded(true);
      }
    };
    
    fetchSeenPosts();
  }, [user]);

  // Fetch user's posts and posts they've commented on
  useEffect(() => {
    console.log('useEffect: getUserPostsAndComments, user:', user);
    if (!user) return;

    const fetchUserPostsAndComments = async () => {
      try {
        // Get user's own posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('authorId', '==', user.uid)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const userPostIds = new Set(postsSnapshot.docs.map(doc => doc.id));
        setUserPosts(userPostIds);

        // Get posts where user has commented
        const commentsQuery = query(
          collectionGroup(db, 'comments'),
          where('authorId', '==', user.uid)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const commentedPostIds = new Set();
        commentsSnapshot.docs.forEach(doc => {
          // Extract post ID from the comment's path
          const pathParts = doc.ref.path.split('/');
          const postId = pathParts[pathParts.length - 3]; // posts/{postId}/comments/{commentId}
          commentedPostIds.add(postId);
        });
        setUserCommentedPosts(commentedPostIds);

        console.log('User posts:', userPostIds.size, 'User commented posts:', commentedPostIds.size);
      } catch (error) {
        console.error('Error fetching user posts and comments:', error);
      }
    };

    fetchUserPostsAndComments();
  }, [user]);

  // Fetch seen comment notifications
  useEffect(() => {
    console.log('useEffect: fetchSeenComments, user:', user);
    if (!user) return;
    
    const fetchSeenComments = async () => {
      try {
        const profileDoc = await getDoc(firestoreDoc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          const seenArr = Array.isArray(data.seenCommentNotifications) ? data.seenCommentNotifications : [];
          seenCommentsRef.current = new Set(seenArr);
          setSeenComments(new Set(seenArr));
        }
      } catch (err) {
        console.error('Error loading seen comment notifications:', err);
      } finally {
        setSeenCommentsLoaded(true);
      }
    };
    
    fetchSeenComments();
  }, [user]);

  // Listen for conversations/messages
  useEffect(() => {
    console.log('useEffect: conversations/messages, user:', user);
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      try {
        console.log('🔔 onSnapshot: conversations, docs:', snapshot.docs.length);
        const notificationList = [];
        let totalUnread = 0;
        let messageUnread = 0;

        for (const conversationDoc of snapshot.docs) {
          const conversation = conversationDoc.data();
          console.log('📝 Processing conversation:', conversationDoc.id, {
            type: conversation.type,
            unread: conversation.unread,
            userUnreadCount: conversation.unread?.[user.uid]
          });
          
          // Keep handling unread messages from all conversation types (direct, group, community)
          if (conversation.unread && conversation.unread[user.uid] > 0) {
            const unreadCount = conversation.unread[user.uid];
            totalUnread += unreadCount;
            messageUnread += unreadCount;

            console.log(`💬 Found ${unreadCount} unread messages in conversation ${conversationDoc.id}`);

            try {
              const messagesQuery = query(
                collection(db, 'conversations', conversationDoc.id, 'messages'),
                orderBy('createdAt', 'desc'),
                limit(Math.max(unreadCount, 5)) // Get at least 5 messages for safety
              );
              
              const messagesSnapshot = await getDocs(messagesQuery);
              console.log(`📨 Messages in conversation ${conversationDoc.id}:`, messagesSnapshot.docs.length);
              
              if (!messagesSnapshot.empty) {
                let conversationName = '';
                
                if (conversation.type === 'direct') {
                  const partnerUid = conversation.participants.find(p => p !== user.uid);
                  const partnerDoc = await getDoc(firestoreDoc(db, 'users', partnerUid));
                  conversationName = partnerDoc.exists() ? partnerDoc.data().username : "Unknown";
                } else if (conversation.type === 'group') {
                  conversationName = conversation.groupName || conversation.name || 'קבוצה';
                } else if (conversation.type === 'community') {
                  conversationName = conversation.element || 'קהילה';
                }

                // Get all messages for analysis
                const allMessages = messagesSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                
                console.log('📨 Latest messages:', allMessages.slice(0, 3));

                // More flexible message filtering
                const messages = allMessages.filter(msg => {
                  // For regular messages: not from current user
                  if (msg.sender && msg.sender !== user.uid) {
                    return true;
                  }
                  
                  // For system messages: targeted to current user
                  if (msg.type === 'system' && msg.systemSubtype === 'personal' && msg.targetUid === user.uid) {
                    return true;
                  }
                  
                  return false;
                }).slice(0, unreadCount);

                console.log(`✅ Filtered messages for notifications (${messages.length}):`, messages);

                // Create notifications for valid messages
                for (const message of messages) {
                  let displayName;
                  let senderId;
                  let notificationType = 'message';

                  if (message.type === 'system') {
                    displayName = 'מערכת';
                    senderId = 'system';
                    notificationType = 'system';
                  } else {
                    // Get sender info
                    try {
                      const senderDoc = await getDoc(firestoreDoc(db, 'users', message.sender));
                      displayName = senderDoc.exists() ? senderDoc.data().username : message.senderName || 'Unknown';
                    } catch (e) {
                      displayName = message.senderName || 'Unknown';
                    }
                    
                    senderId = message.sender;
                    if (conversation.type === 'group' || conversation.type === 'community') {
                      displayName = `${displayName} (${conversationName})`;
                    }
                  }

                  const notification = {
                    id: `${conversationDoc.id}_${message.id}`,
                    type: notificationType,
                    message: message.text || message.content || (message.type === 'system' ? 'System event' : 'New message'),
                    timestamp: message.createdAt,
                    conversationId: conversationDoc.id,
                    senderId: senderId,
                    senderName: displayName,
                    conversationName: conversationName,
                    unreadCount: 1,
                    conversationType: conversation.type || 'direct'
                  };

                  console.log('✅ Creating notification:', notification);
                  notificationList.push(notification);
                }

                // If no valid messages found but we have unread count, create a generic notification
                if (messages.length === 0 && unreadCount > 0) {
                  console.log('⚠️ No specific messages found, creating generic notification');
                  notificationList.push({
                    id: `${conversationDoc.id}_generic`,
                    type: 'message',
                    message: `${unreadCount} הודעות חדשות`,
                    timestamp: new Date(),
                    conversationId: conversationDoc.id,
                    senderId: 'unknown',
                    senderName: conversationName || 'Unknown',
                    conversationName: conversationName,
                    unreadCount: unreadCount,
                    conversationType: conversation.type || 'direct'
                  });
                }
              } else {
                console.log(`⚠️ No messages found in conversation ${conversationDoc.id} despite unread count > 0`);
              }
            } catch (error) {
              console.error("❌ Error fetching message details for conversation:", conversationDoc.id, error);
              continue;
            }
          }
        }

        console.log('🔔 Final notification list:', notificationList);

        notificationList.sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || a.timestamp?.getTime?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || b.timestamp?.getTime?.() || 0;
          return timeB - timeA;
        });
        
        // Update notifications, but only replace message notifications, keep post and comment notifications
        setNotifications(prevNotifications => {
          const postAndCommentNotifications = prevNotifications.filter(n => n.type === 'post' || n.type === 'comment');
          const combined = [...notificationList, ...postAndCommentNotifications];
          combined.sort((a, b) => {
            const timeA = a.timestamp?.toMillis?.() || a.timestamp?.getTime?.() || 0;
            const timeB = b.timestamp?.toMillis?.() || b.timestamp?.getTime?.() || 0;
            return timeB - timeA;
          });
          return combined;
        });
        
        setMessageUnreadCount(messageUnread);
        setUnreadCount(messageUnread + postUnreadCount + commentUnreadCount);
        
        console.log('📊 Set messageUnreadCount:', messageUnread, 'Total unreadCount:', messageUnread + postUnreadCount + commentUnreadCount);
      } catch (error) {
        console.error('❌ Error processing notifications:', error);
        setNotifications(prev => prev.filter(n => n.type === 'post' || n.type === 'comment')); // Keep post and comment notifications
        setMessageUnreadCount(0);
        setUnreadCount(postUnreadCount + commentUnreadCount);
      }
    });

    return () => unsubscribe();
  }, [user, postUnreadCount, commentUnreadCount]);

  // Listen for new posts from followed users only (wait for seenPosts to load)
  useEffect(() => {
    console.log('useEffect: posts listener, user:', user, 'userProfile:', userProfile, 'seenPostsLoaded:', seenPostsLoaded);
    if (!user || !userProfile?.following || userProfile.following.length === 0 || !seenPostsLoaded) return;

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', 'in', userProfile.following),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      try {
        console.log('onSnapshot: posts, docs:', snapshot.docs.length);
        const postNotifications = [];
        
        for (const postDoc of snapshot.docs) {
          const post = postDoc.data();
          const postId = postDoc.id;

          // Only show if not seen
          if (seenPostsRef.current.has(postId)) continue;
          if (post.authorId === user.uid) continue;
          
          const postTime = post.createdAt?.toMillis() || 0;
          const now = Date.now();
          const dayInMs = 24 * 60 * 60 * 1000;
          if (now - postTime > dayInMs) continue;

          try {
            const authorProfileDoc = await getDoc(firestoreDoc(db, 'profiles', post.authorId));
            const authorProfile = authorProfileDoc.exists() ? authorProfileDoc.data() : null;
            const authorName = authorProfile?.username || post.authorName || 'משתמש';
            
            postNotifications.push({
              id: `post_${postId}`,
              type: 'post',
              message: 'פרסם פוסט חדש',
              timestamp: post.createdAt,
              senderId: post.authorId,
              senderName: authorName,
              postId: postId,
              postContent: post.content?.substring(0, 100) || 'פוסט חדש',
              unreadCount: 1,
              conversationType: 'post'
            });
          } catch (error) {
            console.error("Error processing post notification:", error);
          }
        }
        
        if (postNotifications.length > 0) {
          setNotifications(prevNotifications => {
            const existingIds = new Set(prevNotifications.map(n => n.id));
            const newNotifications = postNotifications.filter(n => !existingIds.has(n.id));
            
            if (newNotifications.length > 0) {
              const combined = [...newNotifications, ...prevNotifications];
              combined.sort((a, b) => {
                const timeA = a.timestamp?.toMillis?.() || 0;
                const timeB = b.timestamp?.toMillis?.() || 0;
                return timeB - timeA;
              });
              return combined;
            }
            return prevNotifications;
          });
          
          setPostUnreadCount(prev => prev + postNotifications.length);
          setUnreadCount(prev => prev + postNotifications.length);
        }
      } catch (error) {
        console.error('Error processing post notifications:', error);
      }
    });

    return () => unsubscribe();
  }, [user, userProfile?.following, seenPostsLoaded]);

  // Listen for new comments on posts user is involved in
  useEffect(() => {
    console.log('useEffect: comments listener, user:', user, 'seenCommentsLoaded:', seenCommentsLoaded, 'userPosts:', userPosts.size, 'userCommentedPosts:', userCommentedPosts.size);
    if (!user || !seenCommentsLoaded || (userPosts.size === 0 && userCommentedPosts.size === 0)) return;

    // Combine user's posts and posts they've commented on
    const relevantPostIds = new Set([...userPosts, ...userCommentedPosts]);
    if (relevantPostIds.size === 0) return;

    const unsubscribes = [];

    // Listen to comments on each relevant post
    relevantPostIds.forEach(postId => {
      const commentsQuery = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(20) // Limit to recent comments
      );

      const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
        try {
          console.log(`onSnapshot: comments for post ${postId}, docs:`, snapshot.docs.length);
          const commentNotifications = [];

          for (const commentDoc of snapshot.docs) {
            const comment = commentDoc.data();
            const commentId = commentDoc.id;

            // Skip if it's the user's own comment
            if (comment.authorId === user.uid) continue;

            // Skip if already seen
            if (seenCommentsRef.current.has(commentId)) continue;

            const commentTime = comment.createdAt?.toMillis() || 0;
            const now = Date.now();
            const dayInMs = 24 * 60 * 60 * 1000;
            if (now - commentTime > dayInMs) continue; // Only show comments from last 24 hours

            try {
              // Get post details
              const postDoc = await getDoc(firestoreDoc(db, 'posts', postId));
              if (!postDoc.exists()) continue;
              const postData = postDoc.data();

              // Get commenter profile
              const commenterProfileDoc = await getDoc(firestoreDoc(db, 'profiles', comment.authorId));
              const commenterProfile = commenterProfileDoc.exists() ? commenterProfileDoc.data() : null;
              const commenterName = commenterProfile?.username || comment.authorName || 'משתמש';

              // Determine notification message based on relationship to post
              let notificationMessage;
              if (userPosts.has(postId)) {
                notificationMessage = 'הגיב על הפוסט שלך';
              } else {
                notificationMessage = 'הגיב על פוסט שגם אתה הגבת עליו';
              }

              commentNotifications.push({
                id: `comment_${commentId}`,
                type: 'comment',
                message: notificationMessage,
                timestamp: comment.createdAt,
                senderId: comment.authorId,
                senderName: commenterName,
                postId: postId,
                commentId: commentId,
                commentContent: comment.content?.substring(0, 100) || 'תגובה חדשה',
                postContent: postData.content?.substring(0, 50) || 'פוסט',
                unreadCount: 1,
                conversationType: 'comment'
              });
            } catch (error) {
              console.error("Error processing comment notification:", error);
            }
          }

          if (commentNotifications.length > 0) {
            setNotifications(prevNotifications => {
              const existingIds = new Set(prevNotifications.map(n => n.id));
              const newNotifications = commentNotifications.filter(n => !existingIds.has(n.id));
              
              if (newNotifications.length > 0) {
                const combined = [...newNotifications, ...prevNotifications];
                combined.sort((a, b) => {
                  const timeA = a.timestamp?.toMillis?.() || 0;
                  const timeB = b.timestamp?.toMillis?.() || 0;
                  return timeB - timeA;
                });
                return combined;
              }
              return prevNotifications;
            });
            
            setCommentUnreadCount(prev => prev + commentNotifications.length);
            setUnreadCount(prev => prev + commentNotifications.length);
          }
        } catch (error) {
          console.error('Error processing comment notifications:', error);
        }
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user, seenCommentsLoaded, userPosts, userCommentedPosts]);

  // Fetch profile pictures
  useEffect(() => {
    console.log('useEffect: fetchProfilePictures, notifications:', notifications.length);
    const fetchProfilePictures = async () => {
      const pictures = {};
      for (const notification of notifications) {
        if (notification.type === 'message' || notification.type === 'post' || notification.type === 'comment') {
          try {
            const senderProfileRef = firestoreDoc(db, 'profiles', notification.senderId);
            const senderProfile = await getDoc(senderProfileRef);
            if (senderProfile.exists()) {
              pictures[notification.senderId] = senderProfile.data().photoURL;
            }
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          }
        }
      }
      setProfilePictures(pictures);
    };

    if (notifications.length > 0) {
      fetchProfilePictures();
    }
  }, [notifications]);

  // Modal behavior effects
  useEffect(() => {
    console.log('useEffect: showNotifications', showNotifications);
    if (showNotifications) {
      const scrollY = window.scrollY;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showNotifications]);

  useEffect(() => {
    console.log('useEffect: handleEscape, showNotifications', showNotifications);
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showNotifications) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showNotifications]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isProcessing) {
      e.stopPropagation();
      setShowNotifications(false);
    }
  };

  // Helper to persist seen postId in Firestore
  const persistSeenPost = async (postId) => {
    console.log('persistSeenPost called for postId:', postId);
    if (!user || !postId) return;
    try {
      await updateDoc(firestoreDoc(db, 'profiles', user.uid), {
        seenPostNotifications: arrayUnion(postId)
      });
    } catch (err) {
      console.error('Failed to persist seen post notification:', err);
    }
  };

  // Helper to persist seen commentId in Firestore
  const persistSeenComment = async (commentId) => {
    console.log('persistSeenComment called for commentId:', commentId);
    if (!user || !commentId) return;
    try {
      await updateDoc(firestoreDoc(db, 'profiles', user.uid), {
        seenCommentNotifications: arrayUnion(commentId)
      });
    } catch (err) {
      console.error('Failed to persist seen comment notification:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('handleNotificationClick:', notification);
    
    const notificationKey = notification.id;
    if (isProcessing || clickedNotifications[notificationKey]) return;
    
    setIsProcessing(true);
    setClickedNotifications(prev => ({...prev, [notificationKey]: true}));
    
    try {
      if (notification.type === 'post') {
        // Handle post notifications
        if (notification.postId) {
          seenPostsRef.current.add(notification.postId);
          setSeenPosts(prev => new Set([...prev, notification.postId]));
          persistSeenPost(notification.postId);
        }
        
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== notification.id)
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
        setPostUnreadCount(prev => Math.max(0, prev - 1));
        setShowNotifications(false);
        
        setTimeout(() => {
          navigate(`/post/${notification.postId}`);
          
          setTimeout(() => {
            setIsProcessing(false);
            setTimeout(() => {
              setClickedNotifications(prev => {
                const newState = {...prev};
                delete newState[notificationKey];
                return newState;
              });
            }, 5000);
          }, 500);
        }, 300);
        
      } else if (notification.type === 'comment') {
        // Handle comment notifications
        if (notification.commentId) {
          seenCommentsRef.current.add(notification.commentId);
          setSeenComments(prev => new Set([...prev, notification.commentId]));
          persistSeenComment(notification.commentId);
        }
        
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== notification.id)
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
        setCommentUnreadCount(prev => Math.max(0, prev - 1));
        setShowNotifications(false);
        
        setTimeout(() => {
          navigate(`/post/${notification.postId}`);
          
          setTimeout(() => {
            setIsProcessing(false);
            setTimeout(() => {
              setClickedNotifications(prev => {
                const newState = {...prev};
                delete newState[notificationKey];
                return newState;
              });
            }, 5000);
          }, 500);
        }, 300);
        
      } else {
        // Handle message notifications
        const conversationRef = firestoreDoc(db, 'conversations', notification.conversationId);
        
        await updateDoc(conversationRef, {
          [`unread.${user.uid}`]: 0
        });

        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== notification.id)
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
        setMessageUnreadCount(prev => Math.max(0, prev - 1));

        const targetConversationId = notification.conversationId;
        setShowNotifications(false);
        
        setTimeout(() => {
          navigate(`/chat/${targetConversationId}`);
          
          setTimeout(() => {
            setIsProcessing(false);
            setTimeout(() => {
              setClickedNotifications(prev => {
                const newState = {...prev};
                delete newState[notificationKey];
                return newState;
              });
            }, 5000);
          }, 500);
        }, 300);
      }
      
    } catch (error) {
      console.error("Error handling notification click:", error);
      setIsProcessing(false);
      setClickedNotifications(prev => {
        const newState = {...prev};
        delete newState[notificationKey];
        return newState;
      });
    }
  };

  const handleClearAllNotifications = () => {
    console.log('handleClearAllNotifications');
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Mark all post notifications as seen before clearing
    notifications.forEach(notification => {
      if (notification.type === 'post' && notification.postId) {
        seenPostsRef.current.add(notification.postId);
        setSeenPosts(prev => new Set([...prev, notification.postId]));
        persistSeenPost(notification.postId);
      } else if (notification.type === 'comment' && notification.commentId) {
        seenCommentsRef.current.add(notification.commentId);
        setSeenComments(prev => new Set([...prev, notification.commentId]));
        persistSeenComment(notification.commentId);
      }
    });
    
    setNotifications([]);
    setUnreadCount(0);
    setMessageUnreadCount(0);
    setPostUnreadCount(0);
    setCommentUnreadCount(0);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  };

  const NotificationsModal = () => {
    if (!showNotifications) return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleBackdropClick}
        role="presentation"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          ref={notificationRef}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-[10000] rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-800">התראות</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAllNotifications}
                className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md flex items-center gap-2 transition-colors"
                disabled={isProcessing}
                title="נקה הכל"
              >
                <Trash2 size={18} />
                <span>נקה הכל</span>
              </button>
              <button
                onClick={() => !isProcessing && setShowNotifications(false)}
                className={`text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="סגור התראות"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" dir="rtl">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-lg">טוען התראות...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !isProcessing && handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      {notification.type === 'system' ? (
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 border-2 border-gray-200 text-gray-600 text-2xl font-bold">
                          ⚙️
                        </div>
                      ) : notification.type === 'post' ? (
                        <div className="relative">
                          <img
                            src={profilePictures[notification.senderId] || '/images/default-avatar.png'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">📝</span>
                          </div>
                        </div>
                      ) : notification.type === 'comment' ? (
                        <div className="relative">
                          <img
                            src={profilePictures[notification.senderId] || '/images/default-avatar.png'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">💬</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={profilePictures[notification.senderId] || '/images/default-avatar.png'}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-base text-gray-800 font-medium mb-1">
                            {notification.senderName}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            {notification.type === 'post' ? (
                              <>
                                {notification.message}
                                {notification.postContent && (
                                  <span className="block text-xs text-gray-500 mt-1 italic">
                                    "{notification.postContent}..."
                                  </span>
                                )}
                              </>
                            ) : notification.type === 'comment' ? (
                              <>
                                {notification.message}
                                {notification.commentContent && (
                                  <span className="block text-xs text-gray-500 mt-1 italic">
                                    "{notification.commentContent}..."
                                  </span>
                                )}
                                {notification.postContent && (
                                  <span className="block text-xs text-gray-400 mt-1">
                                    על הפוסט: "{notification.postContent}..."
                                  </span>
                                )}
                              </>
                            ) : (
                              notification.message
                            )}
                          </p>
                          <span className="text-sm text-gray-500">
                            {notification.timestamp?.toDate().toLocaleString('he-IL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {notification.unreadCount > 0 && (
                          <span className={`flex-shrink-0 rounded-full text-white px-3 py-1 text-sm font-medium ${
                            notification.type === 'post' ? 'bg-blue-500' : 
                            notification.type === 'comment' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {notification.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">🔔</div>
                <p className="text-lg">אין התראות חדשות</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex gap-2 w-full">
              <button
                onClick={handleClearAllNotifications}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                disabled={isProcessing}
              >
                נקה הכל
              </button>
              <button
                onClick={() => !isProcessing && setShowNotifications(false)}
                className={`flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
              >
                סגור
              </button>
            </div>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  };

  const contextValue = {
    showNotifications,
    setShowNotifications,
    unreadCount,
    messageUnreadCount,
    postUnreadCount,
    commentUnreadCount,
    NotificationsModal,
    loading,
    notifications,
    isProcessing
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Keep the old hook for backward compatibility (deprecated)
const useNotificationsComponent = () => {
  console.warn('useNotificationsComponent is deprecated. Use useNotifications hook with NotificationsProvider instead.');
  return useNotifications();
};

export default useNotificationsComponent;