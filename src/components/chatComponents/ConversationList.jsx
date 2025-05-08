import { useMemo } from "react";

export default function ConversationList({
  currentUser,
  conversations,
  selectedConversation,
  setSelectedConversation,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  isLoadingConversations,
  setShowNewChatDialog,
  getChatPartner,
  elementColors
}) {
  // Refactored conversation list component with elementColors props
return (
  <div className="w-1/5 border-l border-gray-200 flex flex-col conversation-list" dir="rtl">
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-900">כל הצ'אטים</h1>
      <h2 className="text-sm text-gray-500 mt-1">הודעות ({filteredConversations.length})</h2>
      
      <div className="mt-4 relative">
        <input
          type="text"
          placeholder="חיפוש"
          className={`w-full p-2 pr-8 bg-gray-100 rounded-lg text-sm text-right focus:ring-1 focus:ring-[${elementColors.primary}] focus:outline-none`}
          style={{ '&:focus': { borderColor: elementColors.primary } }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg className="absolute right-2 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto place-items-center">
      <div className="text-xs font-medium text-gray-500 px-4 py-2 text-right">כל ההודעות</div>
      {isLoadingConversations ? (
        <div className="p-4 text-center text-gray-500">טוען צ'אטים...</div>
      ) : (
        filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConversation(conv)}
            className={`p-3 w-80 rounded-md border-b border-gray-100 cursor-pointer hover:bg-[${elementColors.light}] text-right ${
              selectedConversation?.id === conv.id ? `bg-[${elementColors.light}]` : ""
            }`}
            style={{
              '&:hover': { backgroundColor: elementColors.light },
              backgroundColor: selectedConversation?.id === conv.id ? elementColors.light : ''
            }}
          >
            <div className="font-medium text-gray-900">
              {getChatPartner(conv.participants)}
            </div>
            <div className="text-sm text-gray-500">
              {conv.lastMessage || "אין הודעות עדיין"}
            </div>
          </div>
        ))
      )}
    </div>

    <div className="p-4 border-t border-gray-200">
      <button
        onClick={() => setShowNewChatDialog(true)}
        className={`w-full bg-[${elementColors.primary}] text-white py-2 rounded-lg hover:bg-[${elementColors.hover}] transition-colors flex items-center justify-center gap-2`}
        style={{ 
          backgroundColor: elementColors.primary,
          '&:hover': { backgroundColor: elementColors.hover }
        }}
      >
        <span className="text-xl">+</span>
        <span>צ'אט חדש</span>
      </button>
    </div>
  </div>
);
}