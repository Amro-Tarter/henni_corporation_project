import React from 'react';

const elementOptions = {
  fire: { icon: '🔥' },
  water: { icon: '💧' },
  air:   { icon: '🌪️' },
  earth: { icon: '🌍' },
  metal: { icon: '⚙️' },
};

const LeftSidebar = ({ element, users = [] }) => {
  return (
    <aside
      className={`
        fixed top-[56.8px] bottom-0 left-0 w-64 z-30
        bg-white shadow-md p-6 overflow-y-auto
      `}
    >
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">משתמשים עם אותו אלמנט</h2>
        <div className={`h-0.5 w-12 bg-${element} rounded mb-4`} />

        {users.length === 0 ? (
          <p className="text-sm text-gray-500">לא נמצאו משתמשים</p>
        ) : (
          <div className="space-y-4">
            {users.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || '/default_user_pic.jpg'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="flex items-center gap-1 font-medium text-sm">
                    {user.username}
                    <span>{elementOptions[user.element]?.icon}</span>
                  </p>
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
        )}
      </section>
    </aside>
  );
};

export default LeftSidebar;
