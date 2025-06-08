import React from 'react';
import { ELEMENT_COLORS } from '../utils/ELEMENT_COLORS';
import { Mentor_icon } from '../utils/icons_library';
import { All_mentors_icon } from '../utils/icons_library';
import { All_mentors_with_admin_icon } from '../utils/icons_library';
import { db } from '../../../config/firbaseConfig';
import { collection, getDocs, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';


/**
 * ChatHeader displays the name of the chat partner or community.
 */

// Handler to delete all messages in a direct conversation


const ChatHeader = ({ chatTitle, avatar, icon, type, onInfoClick, mentorName, currentUser, participantNames, communityType, element, onBack, conversation }) => {
  const handleVideoCall = () => {
    // Open Zoom meeting link in a new tab
    window.open('https://zoom.us/start', '_blank');
  };

  // Handler to delete all messages in a direct conversation
  const handleDeleteAllMessages = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את כל ההודעות בצ׳אט זה? פעולה זו אינה הפיכה!')) return;
    try {
      const messagesRef = collection(db, 'conversations', conversation.id, 'messages');
      const snapshot = await getDocs(messagesRef);
      const batchSize = 500;
      let batch = [];
      for (const docSnap of snapshot.docs) {
        batch.push(docSnap.ref);
        if (batch.length === batchSize) {
          await Promise.all(batch.map(ref => deleteDoc(ref)));
          batch = [];
        }
      }
      if (batch.length > 0) {
        await Promise.all(batch.map(ref => deleteDoc(ref)));
      }
      // Reset lastMessage and lastUpdated in the conversation document
      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessage: null,
        lastUpdated: serverTimestamp(),
      });
      window.toast && window.toast.success && window.toast.success('כל ההודעות נמחקו בהצלחה!');
      alert('כל ההודעות נמחקו בהצלחה!');
    } catch (e) {
      alert('שגיאה במחיקת הודעות: ' + e.message);
    }
  };

  // For direct chats, get partner name from participantNames
  const partnerName = type === 'direct'
    ? participantNames?.find(name => name !== currentUser.username)
    : chatTitle;
  
    

  // Determine what name to show in header
  let displayName;
  let displayIcon;
  if (type === 'direct') {
    displayName = partnerName || '';
  } else if (type === 'community') {
    if (communityType === 'mentor_community') {
      displayName = mentorName ? `קהילה של ${mentorName}` : 'קהילת מנחה';
      displayIcon = <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl"><Mentor_icon color='#7f1d1d' width={28} height={28}/></span>;
    } else if (communityType === 'element') {
      const elementLabel = element ? ELEMENT_COLORS[element]?.label : '';
      displayName = elementLabel ? `קהילת ${elementLabel} ` : chatTitle || 'קהילה';
      displayIcon = <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">{icon}</span>;
    } else if (communityType === 'all_mentors') {
      displayName = 'קהילת כל המנחים';
      displayIcon = <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl"><All_mentors_icon color='#7f1d1d' width={28} height={28}/></span>;
    } else if (communityType === 'all_mentors_with_admin') {
      displayName = 'קהילת כל המנחים והמנהלים';
      displayIcon = <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl"><All_mentors_with_admin_icon color='#7f1d1d' width={28} height={28}/></span>;
    }
  } else {
    displayName = chatTitle;
  }

  return (
    <div className="p-2 sm:p-3 z-30 shadow-xl border-gray-200 text-right flex items-center gap-2 sm:gap-3 relative bg-white">
      {/* Mobile back arrow button */}
      {onBack && (
        <button
          className="md:hidden flex items-center justify-center p-1 mr-1 text-lg text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
          onClick={onBack}
          aria-label="חזור לרשימת שיחות"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {currentUser.role !== 'admin' && (
        type === 'community' ? (
          displayIcon
        ) : avatar ? (
          <img src={avatar} alt="avatar" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full" />
        ) : (
          <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 text-xl text-gray-400">👤</span>
        )
      )}
      
      {currentUser.role === 'admin' && type === 'direct' && (
        <div className="text-gray-900 font-bold text-lg">
          {participantNames.join(' - ')}
        </div>
      )}
      
      {type === 'community' || type === 'group' ? (
        <div className="text-gray-900 font-bold text-lg flex items-center gap-2">
          {displayName}
        </div>
      ) : currentUser.role !== 'admin' && (
        <div className="text-gray-900 font-bold text-lg">
          {displayName}
        </div>
      )}
      {displayName === mentorName && (
        <div className="text-gray-500 mt-1 text-sm">מנחה שלך</div>
      )}
      {currentUser.role === 'mentor' && (
        <button
          onClick={handleVideoCall}
          className="ml-1 sm:ml-2 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="התחל שיחת וידאו"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </button>
      )}
      {currentUser.role === 'admin' && (
        <button
          onClick={handleDeleteAllMessages}
          className="ml-14 sm:ml-14 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 absolute left-4 sm:left-4 top-1/2 -translate-y-1/2"
          aria-label="מחק את כל ההודעות"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="10" y="11" width="4" height="10"/><path d="M12 8h4"/></svg>
        </button>
      )}
      
      <button
        onClick={onInfoClick}
        className="ml-1 sm:ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 absolute left-2 sm:left-4 top-1/2 -translate-y-1/2"
        aria-label="פרטי צ'אט"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    </div>
  );
};

export default ChatHeader;