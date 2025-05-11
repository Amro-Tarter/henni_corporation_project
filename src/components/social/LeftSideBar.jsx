import React from 'react';

// Sample data for friend suggestions
const friendSuggestions = [
  { id: 1, name: 'Julia Smith',        location: 'London, UK',  avatar: '/default_user_pic.jpg' },
  { id: 2, name: 'Vermillion D. Gray', location: 'New York, USA', avatar: '/default_user_pic.jpg' },
  { id: 3, name: 'Mai Senpai',         location: 'Tokyo, Japan',  avatar: '/default_user_pic.jpg' },
];

// Sample data for online friends
const onlineFriends = [
  { id: 1, name: 'Alice W.',   avatar: '/default_user_pic.jpg' },
  { id: 2, name: 'Bob K.',     avatar: '/default_user_pic.jpg' },
  { id: 3, name: 'Charlie Z.', avatar: '/default_user_pic.jpg' },
  { id: 4, name: 'Dana T.',    avatar: '/default_user_pic.jpg' },
];

const LeftSidebar = ({ element }) => {
  return (
    <aside
      className={`
        mt-12 flex flex-col h-full w-64
        bg-white
        border-r border-${element}-accent
        p-6 overflow-y-auto
      `}
    >
      {/* Friend Suggestions */}
      <section className="mb-8">
        <h2 className={`text-lg font-semibold mb-2`}>
          הצעות לחברים
        </h2>
        <div className={`h-0.5 w-12 bg-${element} rounded mb-4`} />
        <div className="space-y-4">
          {friendSuggestions.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className={`font-medium text-sm`}>
                    {user.name}
                  </p>
                  <p className={`text-xs`}>
                    {user.location}
                  </p>
                </div>
              </div>
              <button
                className={`
                  px-3 py-1 text-xs font-semibold text-white
                  bg-${element} rounded-full
                  hover:bg-${element}-accent transition
                `}
              >
                לעקוב
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Online Friends */}
      <section className="mb-8">
        <h2 className={`text-lg font-semibold mb-2`}>
          חברים מקוונים
        </h2>
        <div className={`h-0.5 w-12 bg-${element} rounded mb-4`} />
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
    </aside>
  );
};

export default LeftSidebar;