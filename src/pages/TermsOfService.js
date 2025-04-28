import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">תנאי שימוש</h1>
          <div className="prose max-w-none">
            <p>
              השימוש באתר זה כפוף לתנאים המפורטים להלן. המשך השימוש באתר מהווה הסכמה לתנאים אלו.
            </p>
            {/* Additional content would go here */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;