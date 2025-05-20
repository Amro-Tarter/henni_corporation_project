// src/components/dashboard/Topbar.jsx
const Topbar = () => {
  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      <div className="font-semibold">ברוך הבא מנהל </div>
      <button className="bg-red-500 text-white px-4 py-1 rounded">התנתק</button>
    </div>
  );
};

export default Topbar;
