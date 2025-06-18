// src/components/dashboard/DashboardLayout.jsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen"> {/* No flex-row-reverse here */}
      <Sidebar /> {/* Now on the left */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;