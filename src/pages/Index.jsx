import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {/* Main content would go here */}
        <div className="container mx-auto px-6 py-24">
          <h1 className="text-3xl font-bold">לגלות את האור – הנני</h1>
          <p className="mt-4">מיזם העצמה לנוער באמצעות יצירה, התפתחות רגשית ומנהיגות אמנותית בקהילה</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;