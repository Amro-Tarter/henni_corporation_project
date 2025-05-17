import React from 'react';
import { useNavigate } from 'react-router-dom';

const LeftSidebar = ({ element, users = [], viewerProfile, onFollowToggle }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-[calc(100vh-56.8px)] bg-white shadow-lg overflow-y-auto">
      <div className="p-6">
        <h2 className={`text-${element} text-xl font-bold mb-6 text-right`}>
          משתמשים מאותו היסוד
        </h2>
        
        {users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.username}`)}
                >
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-right">
                    <h3 className="font-medium text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.bio?.slice(0, 30)}</p>
                  </div>
                </div>
                
                {viewerProfile && viewerProfile.uid !== user.id && (
                  <button
                    onClick={() => onFollowToggle(user.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${(viewerProfile.following || []).includes(user.id)
                        ? `bg-${element} text-white hover:bg-${element}-dark`
                        : `border border-${element} text-${element} hover:bg-${element}-soft`
                      }`}
                  >
                    {(viewerProfile.following || []).includes(user.id) ? 'עוקב' : 'עקוב'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">
            לא נמצאו משתמשים מאותו היסוד
          </p>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
