import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; // Import icons

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement real logout logic (clearing tokens, API calls, etc.)
    navigate("/");
  };

  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-4 sm:px-6"> {/* Adjusted padding */}
      {/* User Greeting */}
      <div className="flex items-center gap-2 sm:gap-3 text-gray-700 font-semibold text-base sm:text-lg"> {/* Adjusted font size and gap */}
        <FaUserCircle size={20} className="text-gray-600 sm:size-10" /> {/* Adjusted icon size */}
        <span className="hidden sm:inline">ברוך הבא מנהל</span> {/* Hide text on small screens */}
        <span className="inline sm:hidden text-sm">מנהל</span> {/* Show shortened text on small screens */}
      </div>

      {/* Logout Button */}
      <button
        className="flex items-center gap-1 sm:gap-2 bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-sm sm:text-base" // Adjusted padding, font size, and gap
        onClick={handleLogout}
      >
        <FaSignOutAlt size={16} className="sm:size-18" /> {/* Adjusted icon size */}
        <span className="hidden sm:inline">התנתק</span> {/* Hide text on small screens */}
        <span className="inline sm:hidden">יציאה</span> {/* Show shortened text on small screens */}
      </button>
    </div>
  );
};

export default Topbar;