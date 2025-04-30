import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-6">התחברות</h1>
      <p className="text-gray-600 mb-4">הכניסו את הפרטים שלכם כדי להתחבר.</p>
      {/* Here you can later add a real sign-in form */}
      <button
        onClick={() => navigate('/home')}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        מעבר לדף הבית
      </button>
    </div>
  );
};

export default SignIn;
