// src/components/dashboard/Sidebar.jsx
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-4 space-y-4 rtl">
      <h2 className="text-2xl font-bold mb-6">לוח מנהל</h2>
      <nav className="space-y-2">
        <Link to="/admin" className="block hover:text-gray-300">לוּחַ מַחווָנִים</Link>
        <Link to="/admin/users" className="block hover:text-gray-300">משתמשים</Link>
        <Link to="/admin/posts" className="block hover:text-gray-300">פוסטים</Link>
        <Link to="/admin/reports" className="block hover:text-gray-300">דוחות</Link>
        <Link to="/admin/analytics" className="block hover:text-gray-300">אנליטיקס</Link>
        <Link to="/admin/settings" className="block hover:text-gray-300">הגדרות</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
