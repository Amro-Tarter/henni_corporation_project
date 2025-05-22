import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [profilePictures, setProfilePictures] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickedNotifications, setClickedNotifications] = useState({});
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      try {
        const notificationList = [];
        let totalUnread = 0;

        for (const conversationDoc of snapshot.docs) {
          const conversation = conversationDoc.data();
          
          // We're removing the group addition notification code completely
          // Don't track or display "added to group" notifications
          
          // Keep handling unread messages from all conversation types (direct, group, community)
          if (conversation.unread && conversation.unread[user.uid] > 0) {
            const unreadCount = conversation.unread[user.uid];
            totalUnread += unreadCount;

            try {
              const messagesQuery = query(
                collection(db, 'conversations', conversationDoc.id, 'messages'),
                orderBy('createdAt', 'desc')
              );
              
              const messagesSnapshot = await getDocs(messagesQuery);
              if (!messagesSnapshot.empty) {
                let conversationName = '';
                
                if (conversation.type === 'direct') {
                  const partnerUid = conversation.participants.find(p => p !== user.uid);
                  const partnerDoc = await getDoc(firestoreDoc(db, 'users', partnerUid));
                  conversationName = partnerDoc.exists() ? partnerDoc.data().username : "Unknown";
                } else if (conversation.type === 'group') {
                  conversationName = conversation.groupName || 'קבוצה';
                } else if (conversation.type === 'community') {
                  conversationName = conversation.element || 'קהילה';
                }

                const messages = messagesSnapshot.docs
                  .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }))
                  .filter(msg => 
                    (msg.type === 'message' && msg.sender !== user.uid) ||
                    (msg.type === 'system' && msg.systemSubtype === 'personal' && msg.targetUid === user.uid)
                  )
                  .slice(0, unreadCount);

                const senderIds = [...new Set(messages.filter(msg => msg.type === 'message').map(msg => msg.sender))];
                const senderDocs = await Promise.all(
                  senderIds.map(id => getDoc(firestoreDoc(db, 'users', id)))
                );
                const senderNames = Object.fromEntries(
                  senderIds.map((id, index) => [
                    id,
                    senderDocs[index].exists() ? senderDocs[index].data().username : "Unknown"
                  ])
                );

                for (const message of messages) {
                  let displayName;
                  let senderId;
                  let notificationType = message.type;

                  if (message.type === 'system') {
                    displayName = 'מערכת'; // System in Hebrew
                    senderId = 'system';
                  } else {
                    displayName = senderNames[message.sender];
                    senderId = message.sender;
                    if (conversation.type === 'group' || conversation.type === 'community') {
                      displayName = `${displayName} (${conversationName})`;
                    }
                  }

                  notificationList.push({
                    id: `${conversationDoc.id}_${message.id}`,
                    type: notificationType,
                    message: message.text || (message.type === 'system' ? 'System event' : 'Sent a message'),
                    timestamp: message.createdAt,
                    conversationId: conversationDoc.id,
                    senderId: senderId,
                    senderName: displayName,
                    conversationName: conversationName,
                    unreadCount: 1,
                    conversationType: conversation.type
                  });
                }
              }
            } catch (error) {
              console.error("Error fetching message details:", error);
              continue;
            }
          }
        }

        notificationList.sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        setNotifications(notificationList);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Error processing notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchProfilePictures = async () => {
      const pictures = {};
      for (const notification of notifications) {
        if (notification.type === 'message') {
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

  useEffect(() => {
    if (showNotifications) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Apply modal styles
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore original body styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showNotifications]);

  useEffect(() => {
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

  const handleNotificationClick = async (notification) => {
    // Prevent handling already-clicked notifications
    const notificationKey = notification.id;
    if (isProcessing || clickedNotifications[notificationKey]) return;
    
    setIsProcessing(true);
    setClickedNotifications(prev => ({...prev, [notificationKey]: true}));
    
    // Now we only handle message notifications - group_added type is removed
    try {
      const conversationRef = firestoreDoc(db, 'conversations', notification.conversationId);
      
      // Update unread count
      await updateDoc(conversationRef, {
        [`unread.${user.uid}`]: 0
      });

      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== notification.id)
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

      // Store the target conversation ID
      const targetConversationId = notification.conversationId;
      
      // Close the notification panel
      setShowNotifications(false);
      
      // Add a small delay to ensure the panel closes and state updates complete
      setTimeout(() => {
        // Navigate after a short delay to ensure state updates are processed
        navigate(`/chat/${targetConversationId}`);
        
        // Reset processing state after navigation
        setTimeout(() => {
          setIsProcessing(false);
          // Clear clicked notifications after a while to allow re-clicking in the future if needed
          setTimeout(() => {
            setClickedNotifications(prev => {
              const newState = {...prev};
              delete newState[notificationKey];
              return newState;
            });
          }, 5000); // Reset after 5 seconds
        }, 500); // Increased delay to ensure navigation completes
      }, 300);
      
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
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Only clear notifications from UI without marking as read in Firebase
    setNotifications([]);
    
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
            {notifications.length > 0 ? (
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
                            {notification.message}
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
                          <span className="flex-shrink-0 rounded-full bg-red-500 text-white px-3 py-1 text-sm font-medium">
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

  return {
    showNotifications,
    setShowNotifications,
    unreadCount,
    NotificationsModal
  };
};

export default NotificationsComponent;