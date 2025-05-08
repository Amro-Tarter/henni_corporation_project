import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFound = () => {
  return (
    <Layout>
    <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-6">404</h1>
      <h2 className="text-2xl mb-4">העמוד שביקשתם לא נמצא</h2>
      <Link to="/" className="text-blue-600 hover:underline">
        חזרה לעמוד הראשי
      </Link>
    </div>
    </Layout>
  );
};

export default NotFound;
