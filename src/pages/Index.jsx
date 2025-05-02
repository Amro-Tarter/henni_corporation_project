import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Droplet, Leaf, Flame } from 'lucide-react';

import Hero from '../components/home/Hero';
import Navigation from '../components/layout/Navigation';
import ElementSection from '../components/home/ElementSection';
import EventsSection from '../components/home/EventsSection';
import ProgramSection from '../components/home/ProgramSection';
import JoinUs from '../components/home/JoinUs';
import Footer from '../components/layout/Footer';
import OurStory from '@/components/home/OurStory';
import Gallery from '@/components/home/Gallery';
import AboutSection from '../components/home/AboutSection';
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' },
};

const staggerChildren = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.2 },
  },
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-yellow-100" dir="rtl">
      <Navigation />
      <Hero />
      <AboutSection/>
      <main className="relative overflow-hidden">
        <FloatingElements />
        <Gallery />
        <OurStory />
        <ProgramSection/>
        {/* Elements - Fire, Air, Water, Earth */}
        <div className="space-y-24">
          <ElementSection
            id="fire-element"
            element="fire"
            title="אש - יצירה ותשוקה"
            illustration={<AnimatedIcon icon={<Flame size={120} className="text-fire" />} bgColor="bg-fire/10" />}
          >
          </ElementSection>
        </div>
        <EventsSection/>
        <JoinUs />
      </main>

      <Footer />
    </div>
  );
};

const AnimatedIcon = ({ icon, bgColor }) => (
  <motion.div
    className={`aspect-video ${bgColor} rounded-2xl flex items-center justify-center relative shadow-md`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="relative p-8 md:p-12">
      {icon}
    </div>
  </motion.div>
);

const FloatingElements = () => (
  <>
    <div className="absolute top-32 left-12 w-24 h-24 bg-fire/20 rounded-full blur-2xl animate-pulse" />
    <div className="absolute bottom-20 right-16 w-20 h-20 bg-air-dark/20 rounded-full blur-2xl animate-ping" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-water/10 rounded-full blur-3xl opacity-30 animate-float" />
  </>
);

export default HomePage;