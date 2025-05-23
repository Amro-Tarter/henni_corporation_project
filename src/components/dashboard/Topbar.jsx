import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Topbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    // In a real application, you would handle logout logic here,
    // e.g., clearing authentication tokens, calling a logout API.
    // For now, we'll just navigate to the home page.
    navigate("/"); 
  };

  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      <div className="font-semibold">ברוך הבא מנהל </div>
      <button 
        className="bg-red-500 text-white px-4 py-1 rounded"
        onClick={handleLogout} // Correctly call the navigation function
      >
        התנתק
      </button>
    </div>
  );
};

export default Topbar;