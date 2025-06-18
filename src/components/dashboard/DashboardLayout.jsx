// src/components/dashboard/DashboardLayout.jsx
import React, { useState } from "react"; // Import useState
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
  // 1. Declare the state for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Initialize to false (expanded)

  // 2. Define the toggle function
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prevIsCollapsed) => !prevIsCollapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Pass the state and the toggle function as props to Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "" : "" // Adjust content margin based on sidebar width
        }`}
      >
        <Topbar />
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;