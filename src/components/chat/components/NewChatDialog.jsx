import React from 'react';

export default function NewChatDialog({
  show,
  partnerName,
  setPartnerName,
  handlePartnerSearch,
  isSearching,
  searchResults,
  setSelectedUser,
  setSearchResults,
  selectedUser,
  createNewConversation,
  setShowNewChatDialog,
  elementColors
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 text-right relative" dir="rtl">
        <h3 className="text-lg font-bold mb-4">צ'אט חדש</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">שם השותף:</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 border rounded text-right"
              value={partnerName}
              onChange={(e) => handlePartnerSearch(e.target.value)}
              placeholder="הזן שם"
            />
            {isSearching && (
              <div className="absolute left-2 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-right flex items-center gap-2"
                    onClick={() => {
                      setPartnerName(user.username);
                      setSelectedUser(user);
                      setSearchResults([]);
                    }}
                  >
                    {user.photoURL && (
                      <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    )}
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className='px-4 py-2 text-white rounded-lg hover:scale-105 disabled:opacity-50'
            onClick={createNewConversation}
            disabled={!selectedUser}
            style={{ backgroundColor: elementColors.primary }}
          >
            צור
          </button>
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-200"
            onClick={() => {
              setShowNewChatDialog(false);
              setSearchResults([]);
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
} 