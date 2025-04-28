import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const AccessibilityStatement = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">הצהרת נגישות</h1>
          <div className="prose max-w-none">
            <p>
              אנו מחויבים להנגיש את האתר שלנו בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות.
            </p>
            {/* Additional content would go here */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccessibilityStatement;