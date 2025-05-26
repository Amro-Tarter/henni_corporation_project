import { useMemo, useEffect, useState } from "react";
import { db } from '@/config/firbaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/**
 * ConversationList displays the list of conversations.
 */
export default function ConversationList({
  selectedConversation,
  setSelectedConversation,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  isLoadingConversations,
  setShowNewChatDialog,
  setShowNewGroupDialog,
  getChatPartner,
  elementColorsMap,
  activeTab,
  currentUser
}) {
  const [usernames, setUsernames] = useState({});

  const visibleConversations = useMemo(() =>
    filteredConversations.filter((conv) => {
      if (activeTab === "all") return true;
      return conv.type === activeTab;
    }),
    [filteredConversations, activeTab]
  );

  useEffect(() => {
    const ids = new Set();
    visibleConversations.forEach(conv => {
      if (Array.isArray(conv.participants)) {
        conv.participants.forEach(id => ids.add(id));
      }
    });
    const idsToFetch = Array.from(ids).filter(id => !usernames[id]);
    if (idsToFetch.length === 0) return;
    Promise.all(idsToFetch.map(async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return [uid, userDoc.exists() ? userDoc.data().username : uid];
      } catch {
        return [uid, uid];
      }
    })).then(entries => {
      setUsernames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    });
  }, [visibleConversations]);

  return (
    <div className="w-full md:w-1/4 z-50 shadow-md flex flex-col conversation-list mt-16" dir="rtl">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900">כל הצ'אטים</h1>
        <h2 className="text-sm text-gray-500 mt-1">הודעות ({visibleConversations.length})</h2>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="חיפוש"
            className={`w-full p-2 pr-8 bg-gray-100 rounded-lg text-sm text-right focus:ring-1 focus:outline-none`}
            style={{ borderColor: "transparent", outlineColor: elementColorsMap[currentUser?.element]?.primary || '#ccc' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute right-2 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2" onClick={() => setSelectedConversation(null)}>
        <div className="text-xs font-medium text-gray-500 px-4 py-2 text-right">כל ההודעות</div>
        {isLoadingConversations ? (
          <div className="p-4 text-center text-gray-500">טוען צ'אטים...</div>
        ) : (
          visibleConversations.map((conv) => {
            const isSelected = selectedConversation?.id === conv.id;
            const mentorName = currentUser.mentorName;
            let avatar = null;
            if (conv.type === 'community') {
              const icon = elementColorsMap[conv.element]?.icon;
              avatar = (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">
                  {icon}
                </div>
              );
            } else if (conv.type === 'group') {
              avatar = conv.avatarURL ? (
                <img src={conv.avatarURL} alt="group avatar" className="w-10 h-10 object-cover rounded-full" />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">
                  <span role="img" aria-label="avatar">👤</span>
                </div>
              );
            } else if (conv.partnerProfilePic && currentUser.role !== 'staff') {
              avatar = (
                <img src={conv.partnerProfilePic} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
              );
            } else if (currentUser.role === 'staff' && conv.type === 'direct') {
              avatar = (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-4xl text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M256.064 32C132.288 32 32 125.248 32 241.6c0 66.016 34.816 123.36 89.216 160.192V480l81.312-44.608c17.472 4.736 35.84 7.296 53.536 7.296 123.744 0 223.936-93.248 223.936-209.6S379.808 32 256.064 32zm29.056 257.728l-54.4-58.88-111.936 58.88 132.736-141.632 54.4 58.88 111.936-58.88-132.736 141.632z"/>
                  </svg>
                </div>
              );
            }
            
            else {
              avatar = (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">
                  <span role="img" aria-label="avatar">👤</span>
                </div>
              );
            }
            const bgColorStyle = isSelected ? { backgroundColor: elementColorsMap[currentUser?.element]?.light || '#f5f5f5' } : {};
            let partnerName;
            if (currentUser.role === 'staff' && conv.type === 'direct') {
              partnerName = Array.isArray(conv.participants)
                ? conv.participants.map(uid => usernames[uid] || uid).join(' - ')
                : 'Unknown';
            } else if (conv.type === 'direct' && Array.isArray(conv.participants)) {
              const partnerUid = conv.participants.find(uid => uid !== currentUser.uid);
              partnerName = partnerUid ? (usernames[partnerUid] || partnerUid) : 'Unknown';
            } else {
              partnerName = getChatPartner(
                conv.participants,
                conv.type,
                conv.element,
                currentUser,
                undefined,
                conv.type === 'group' ? conv.groupName : undefined,
                conv.participantNames
              );
            }
            return (
              <div
                key={conv.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConversation(conv);
                }}
                className={`p-3 rounded-md border-b border-gray-100 cursor-pointer hover:bg-gray-50 text-right mx-auto mb-2 w-full max-w-full flex items-center gap-3`}
                style={bgColorStyle}
              >

                {avatar}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                    {partnerName}
                    {partnerName === mentorName && (
                      <div className="text-gray-500 mt-1 text-sm">מנטור שלך</div>
                    )}
                    {/* Unread badge */}
                    {conv.unread?.[currentUser.uid] > 0 && (
                      <span
                        className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow"
                        aria-label={`יש ${conv.unread[currentUser.uid]} הודעות שלא נקראו`}
                        title={`יש ${conv.unread[currentUser.uid]} הודעות שלא נקראו`}
                      >
                        {conv.unread[currentUser.uid]}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {conv.lastMessage || "אין הודעות עדיין"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {activeTab === "direct" && currentUser.role !== 'staff' && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowNewChatDialog(true)}
            className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: elementColorsMap[currentUser?.element]?.primary || '#888' }}
          >
            <span className="text-xl">+</span>
            <span>צ'אט חדש</span>
          </button>
        </div>
      )}
      {activeTab === "group" && currentUser.role !== 'staff' && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowNewGroupDialog(true)}
            className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: elementColorsMap[currentUser?.element]?.primary || '#888' }}
          >
            <span className="text-xl">+</span>
            <span>קבוצה חדשה</span>
          </button>
        </div>
      )}
    </div>
  );
}

