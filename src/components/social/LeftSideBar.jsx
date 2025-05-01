import React from 'react';

// Sample data for friend suggestions
const friendSuggestions = [
  { id: 1, name: 'Julia Smith', location: 'London, UK', avatar: '/try.webp' },
  { id: 2, name: 'Vermillion D. Gray', location: 'New York, USA', avatar: '/try.webp' },
  { id: 3, name: 'Mai Senpai', location: 'Tokyo, Japan', avatar: '/try.webp' },
];

// Sample data for online friends
const onlineFriends = [
  { id: 1, name: 'Alice W.', avatar: '/try.webp' },
  { id: 2, name: 'Bob K.', avatar: '/try.webp' },
  { id: 3, name: 'Charlie Z.', avatar: '/try.webp' },
  { id: 4, name: 'Dana T.', avatar: '/try.webp' },
];

const LeftSidebar = () => {
  return (
    <aside className="flex flex-col h-full w-64 bg-white text-gray-900 border-r border-black p-6 overflow-y-auto">

      {/* Friend Suggestions */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">הצעות לחברים</h2>
        <div className="space-y-4">
          {friendSuggestions.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.location}</p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs font-semibold text-white bg-[#D94C1A] rounded hover:bg-blue-600">
                לעקוב
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Online Friends */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">חברים מקוונים</h2>
        <div className="grid grid-cols-4 gap-3">
          {onlineFriends.map(friend => (
            <div key={friend.id} className="relative">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 block h-2 w-2 bg-green-400 border-2 border-white rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Topics */}
      <section>
        <h2 className="text-xl font-bold mb-4">נושאים פופולריים</h2>
        <ul className="space-y-2">
          <li className="text-sm hover:text-blue-500 cursor-pointer">#WebDevelopment</li>
          <li className="text-sm hover:text-blue-500 cursor-pointer">#ReactJS</li>
          <li className="text-sm hover:text-blue-500 cursor-pointer">#TechNews</li>
        </ul>
      </section>

    </aside>
  );
};

export default LeftSidebar;