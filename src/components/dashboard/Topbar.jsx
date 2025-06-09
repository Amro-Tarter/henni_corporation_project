import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; // Import icons

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement real logout logic (clearing tokens, API calls, etc.)
    navigate("/");
  };

  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">
      {/* User Greeting */}
      <div className="flex items-center gap-3 text-gray-700 font-semibold text-lg">
        <FaUserCircle size={24} className="text-gray-600" />
        <span>ברוך הבא מנהל</span>
      </div>

      {/* Logout Button */}
      <button 
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
        onClick={handleLogout}
      >
        <FaSignOutAlt size={18} />
        <span>התנתק</span>
      </button>
    </div>
  );
};

export default Topbar;
