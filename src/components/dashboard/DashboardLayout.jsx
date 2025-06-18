import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prevIsCollapsed) => !prevIsCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "mr-16" : "mr-64" // On larger screens, "mr-64" when expanded, "mr-0" when collapsed
        } lg:mr-0`} // Override for larger screens where sidebar is always visible and doesn't push content
      >
        {/* Pass the toggle function and state to Topbar */}
        <Topbar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;