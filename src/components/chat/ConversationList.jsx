import { useMemo } from "react";

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
  const visibleConversations = useMemo(() =>
    filteredConversations.filter((conv) => {
      if (activeTab === "all") return true;
      return conv.type === activeTab;
    }),
    [filteredConversations, activeTab]
  );

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
            } else if (conv.partnerProfilePic) {
              avatar = (
                <img src={conv.partnerProfilePic} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
              );
            } else {
              avatar = (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">
                  <span role="img" aria-label="avatar">👤</span>
                </div>
              );
            }
            const bgColorStyle = isSelected ? { backgroundColor: elementColorsMap[currentUser?.element]?.light || '#f5f5f5' } : {};
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
                  <div className="font-medium text-gray-900 truncate">
                    {getChatPartner(
                      conv.participants,
                      conv.type,
                      conv.element,
                      currentUser,
                      undefined,
                      conv.type === 'group' ? conv.groupName : 'undefined'
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
      {activeTab === "direct" && (
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
      {activeTab === "group" && (
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

