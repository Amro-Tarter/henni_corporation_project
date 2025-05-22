import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-4 space-y-4 rtl font-sans"> {/* Added font-sans here */}
      <h2 className="text-2xl font-bold mb-6">לוח מנהל</h2>
      <nav className="space-y-2">
        <Link to="/admin" className="block hover:text-gray-300 ">לוח מחוונים</Link>
        <Link to="/admin/users" className="block hover:text-gray-300">משתמשים</Link>
        <Link to="/admin/Partners" className="block hover:text-gray-300">שוטפים שלנו</Link>
        <Link to="/admin/reports" className="block hover:text-gray-300">דוחות</Link>
        <Link to="/admin/settings" className="block hover:text-gray-300">הגדרות</Link>
        <Link to="/admin/donations" className="block hover:text-gray-300">תרומות</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
