import React from 'react';
import Layout from '../components/layout/Layout';

const PrivacyPolicy = () => {
  return (
    <Layout>
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
      </Layout>
  );
};

export default PrivacyPolicy;