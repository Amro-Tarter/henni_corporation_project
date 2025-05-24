import React from 'react';

export default function NewGroupDialog({
  show,
  groupName,
  setGroupName,
  groupAvatarFile,
  setGroupAvatarFile,
  groupAvatarPreview,
  setGroupAvatarPreview,
  groupUserSearch,
  setGroupUserSearch,
  groupUserResults,
  setGroupUserResults,
  isSearching,
  selectedGroupUsers,
  setSelectedGroupUsers,
  currentUser,
  setShowNewGroupDialog,
  elementColors,
  createGroup
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 text-right relative" dir="rtl">
        <h3 className="text-lg font-bold mb-4">קבוצה חדשה</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">שם הקבוצה:</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-right mb-2"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="הזן שם קבוצה"
          />
          {/* Group avatar upload */}
          <label className="block text-sm font-medium mb-2 mt-2">תמונת קבוצה (אופציונלי):</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 border rounded text-right mb-2"
            onChange={e => {
              const file = e.target.files[0];
              setGroupAvatarFile(file || null);
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => setGroupAvatarPreview(ev.target.result);
                reader.readAsDataURL(file);
              } else {
                setGroupAvatarPreview(null);
              }
            }}
          />
          {groupAvatarPreview && (
            <div className="mb-2 flex justify-center"><img src={groupAvatarPreview} alt="Group Preview" className="w-20 h-20 object-cover rounded-full border" /></div>
          )}
          <label className="block text-sm font-medium mb-2 mt-2">הוסף חברים:</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-right"
            value={groupUserSearch}
            onChange={e => setGroupUserSearch(e.target.value)}
            placeholder="חפש משתמשים"
          />
          {isSearching && (
            <div className="absolute left-2 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
          {groupUserResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {groupUserResults.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-right flex items-center gap-2"
                  onClick={() => {
                    setSelectedGroupUsers([...selectedGroupUsers, user]);
                    setGroupUserResults([]);
                    setGroupUserSearch("");
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
          {selectedGroupUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGroupUsers.map(user => (
                <div key={user.id} className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full">
                  {user.username}
                  <button className="ml-1 text-red-500" onClick={() => setSelectedGroupUsers(selectedGroupUsers.filter(u => u.id !== user.id))}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className='px-4 py-2 text-white rounded-lg hover:scale-105 disabled:opacity-50'
            onClick={createGroup}
            disabled={!groupName.trim()}
            style={{ backgroundColor: elementColors.primary }}
          >
            צור קבוצה
          </button>
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-200"
            onClick={() => {
              setShowNewGroupDialog(false);
              setGroupName("");
              setGroupUserSearch("");
              setGroupUserResults([]);
              setSelectedGroupUsers([]);
              setGroupAvatarFile(null);
              setGroupAvatarPreview(null);
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
} 