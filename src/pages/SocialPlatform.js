import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const SocialPlatform = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">הפלטפורמה החברתית שלנו</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">ההודעות האחרונות</h2>
              <p className="text-gray-600">אין הודעות להצגה כרגע</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">אירועים קרובים</h2>
              <p className="text-gray-600">אין אירועים קרובים להצגה כרגע</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">חברי הקהילה</h2>
              <p className="text-gray-600">אין חברים להצגה כרגע</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SocialPlatform;