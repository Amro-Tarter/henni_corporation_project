import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Handshake, 
  FileText, 
  Heart, 
  ClipboardList, 
  GraduationCap,
  ChevronLeft,
  Home
} from "lucide-react";

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  
  const menuItems = [
    { 
      path: "/admin", 
      label: "לוח מחוונים", 
      icon: BarChart3,
      exact: true
    },
    { 
      path: "/admin/users", 
      label: "משתמשים", 
      icon: Users 
    },
    { 
      path: "/admin/Partners", 
      label: "שותפים שלנו", 
      icon: Handshake 
    },
    { 
      path: "/admin/reports", 
      label: "דוחות", 
      icon: FileText 
    },
    { 
      path: "/admin/donations", 
      label: "תרומות", 
      icon: Heart 
    },
    { 
      path: "/admin/forms", 
      label: "טפסים", 
      icon: ClipboardList 
    },
    { 
      path: "/admin/Mentorship", 
      label: "מנטורים", 
      icon: GraduationCap 
    }
  ];

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className={`h-full bg-red-900 text-white transition-all duration-300 ease-in-out shadow-xl ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white">לוח מנהל</h2>
              <span className="text-orange-100 text-sm">ניהול המערכת</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            aria-label={isCollapsed ? "הרחב תפריט" : "כווץ תפריט"}
          >
            <ChevronLeft 
              size={20} 
              className={`transform transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Back to main site */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? "חזור לאתר הראשי" : ""}
        >
          <Home size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              חזור לאתר הראשי
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-px bg-white/10 my-4"></div>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.path, item.exact);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'hover:bg-white/10 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ""}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l"></div>
              )}
              
              <Icon 
                size={20} 
                className={`flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'text-orange-200' : 'group-hover:scale-110'
                }`} 
              />
              
              {!isCollapsed && (
                <span className={`group-hover:translate-x-1 transition-transform duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-orange-100/70">
              עמותת לגלות את האור
            </p>
            <p className="text-xs text-white/50 mt-1">
              © 2025 כל הזכויות שמורות
            </p>
          </div>
        </div>
      )}

      {/* Collapsed tooltip helper */}
      {isCollapsed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;