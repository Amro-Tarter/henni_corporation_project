import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">הצהרת פרטיות</h1>
          <div className="prose max-w-none">
            <p>
              פרטיות המשתמשים שלנו חשובה לנו. מסמך זה מפרט את המדיניות שלנו בנוגע לאיסוף, שימוש, ושמירה של מידע אישי.
            </p>
            {/* Additional content would go here */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;