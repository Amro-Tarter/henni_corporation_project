import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <Layout>
      <main className="flex-grow pt-24 min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-6 py-16 relative overflow-hidden min-h-[calc(100vh-6rem)] flex items-center justify-center">
          <motion.div 
            className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <h1 className="text-8xl font-bold text-[#D73502] mb-2 relative">404</h1>
            </div>
            
            <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-[#D73502] mx-auto rounded-full my-6" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-semibold mb-6 text-[#801100]">העמוד שביקשתם לא נמצא</h2>
              <p className="text-[#801100] mb-8 text-lg max-w-lg mx-auto bg-white px-6 py-4 rounded-xl shadow-sm border border-amber-100">
                נראה שהעמוד שחיפשת לא קיים או הועבר לכתובת אחרת. 
                אנא בדקו את הכתובת או חזרו לעמוד הראשי.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#D73502] to-[#E85826] text-white rounded-full shadow-lg hover:shadow-xl hover:from-[#C42D00] hover:to-[#D73502] transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                חזרה לעמוד הראשי
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
};

export default NotFound;