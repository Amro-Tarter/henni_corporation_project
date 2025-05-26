import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeSlideUp } from '@/lib/animations'; 
import CTAButton from '@/components/CTAButton';
import { auth } from '@/config/firbaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Hero = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // subscribe to auth state
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // choose path based on auth
  const platformLink = currentUser ? '/home' : '/login';

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/background vid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <motion.h1
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          className="font-title text-6xl text-white mb-6 drop-shadow-lg"
        >
          עמותת לגלות את האור – הנני 
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-orange-400 font-medium mb-8 sm:mb-12 max-w-4xl mx-auto drop-shadow-md leading-relaxed"
        >
            מנהיגות צומחת מיצירה - מעצימים את דור העתיד!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <CTAButton
            href="https://forms.monday.com/forms/af28672efe2a47320cd729b1d01f6841?r=euc1"
            variant="fire"
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-lg sm:text-xl font-medium shadow-lg hover:shadow-xl px-8 sm:px-10 py-3 sm:py-4"
          >
            הצטרפו לעמותה
          </CTAButton>

          {/* conditional Link */}
          <Link
            to={platformLink}
            className="flex items-center gap-2 sm:gap-3 text-white hover:text-orange-400 transition-colors duration-300 text-lg sm:text-xl font-medium"
          >
            לפלטפורמה שלנו
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
