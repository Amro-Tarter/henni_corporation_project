import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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
          
          // Handle group addition notification
          if (conversation.type === 'group') {
            const groupRef = firestoreDoc(db, 'conversations', conversationDoc.id);
            const groupDoc = await getDoc(groupRef);
            const groupData = groupDoc.data();
            
            if (groupData && groupData.participants?.includes(user.uid) && 
                groupData.lastUpdated && 
                groupData.lastUpdated.toDate() > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
              const adminDoc = await getDoc(firestoreDoc(db, 'users', groupData.admin));
              const adminName = adminDoc.exists() ? adminDoc.data().username : 'Unknown';
              
              notificationList.push({
                id: `${conversationDoc.id}_added`,
                type: 'group_added',
                message: `הוספת אותך לקבוצה ${groupData.groupName || 'קבוצה חדשה'}`,
                timestamp: groupData.lastUpdated || groupData.createdAt,
                conversationId: conversationDoc.id,
                senderId: groupData.admin,
                senderName: adminName,
                conversationName: groupData.groupName,
                unreadCount: 1,
                conversationType: 'group'
              });
              totalUnread++;
            }
          }

          // Handle unread messages
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
                  conversationName = partnerDoc.exists() ? partnerDoc.data().username : 'Unknown';
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
                  .filter(msg => msg.sender !== user.uid)
                  .slice(0, unreadCount);

                const senderIds = [...new Set(messages.map(msg => msg.sender))];
                const senderDocs = await Promise.all(
                  senderIds.map(id => getDoc(firestoreDoc(db, 'users', id)))
                );
                const senderNames = Object.fromEntries(
                  senderIds.map((id, index) => [
                    id,
                    senderDocs[index].exists() ? senderDocs[index].data().username : 'Unknown'
                  ])
                );

                for (const message of messages) {
                  let displayName = senderNames[message.sender];
                  
                  if (conversation.type === 'group' || conversation.type === 'community') {
                    displayName = `${displayName} (${conversationName})`;
                  }

                  notificationList.push({
                    id: `${conversationDoc.id}_${message.id}`,
                    type: 'message',
                    message: message.text || 'Sent a message',
                    timestamp: message.createdAt,
                    conversationId: conversationDoc.id,
                    senderId: message.sender,
                    senderName: displayName,
                    conversationName: conversationName,
                    unreadCount: 1,
                    conversationType: conversation.type
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching message details:', error);
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
        console.error('Error processing notifications:', error);
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
            console.error('Error fetching profile picture:', error);
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
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
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
    if (e.target === e.currentTarget) {
      setShowNotifications(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.type === 'message' || notification.type === 'group_added') {
      try {
        const conversationRef = firestoreDoc(db, 'conversations', notification.conversationId);
        
        if (notification.type === 'group_added') {
          // Mark group notification as seen and remove it from notifications
          await updateDoc(conversationRef, {
            [`seenNotifications.${user.uid}`]: true,
            [`groupNotifications.${user.uid}`]: false
          });
          
          // Remove the notification from local state
          setNotifications(prevNotifications => 
            prevNotifications.filter(n => n.id !== notification.id)
          );
          
          // Update unread count
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          // Handle message notifications as before
          await updateDoc(conversationRef, {
            [`unread.${user.uid}`]: 0
          });

          setNotifications(prevNotifications => 
            prevNotifications.filter(n => n.id !== notification.id)
          );

          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // Close notification panel and navigate to chat
        setShowNotifications(false);
        navigate(`/chat/${notification.conversationId}`);
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    }
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
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="סגור התראות"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" dir="rtl">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={profilePictures[notification.senderId] || '/default-avatar.png'}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
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
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              סגור
            </button>
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