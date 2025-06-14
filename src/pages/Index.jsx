import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Droplet, Leaf, Flame } from 'lucide-react';
import Hero from '../components/home/Hero';
import Navigation from '../components/layout/Navigation';
import EventsSection from '../components/home/EventsSection';
import ProgramSection from '../components/home/ProgramSection';
import JoinUs from '../components/home/JoinUs';
import Footer from '../components/layout/Footer';
import Gallery from '@/components/home/Gallery';
import AboutSection from '../components/home/AboutSection';
import MusicPlayer from '../components/MusicPlayer';
import ScrollDown from '../components/ui/ScrollDown';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-yellow-100" dir="rtl">
      <Navigation />
      <Hero />
      <ScrollDown targetId="about-section" offset={100} hideOnScroll={true} position="bottom-center" className="mb-4" style="pulsing" />
      <AboutSection/>
      <main className="relative overflow-hidden">
        <FloatingElements />
        <ProgramSection/>
        <Gallery />
        <EventsSection/>
        <JoinUs />
      </main>
      <MusicPlayer />
      <Footer />
    </div>
  );
};

const FloatingElements = () => (
  <>
    <div className="absolute top-32 left-12 w-24 h-24 bg-fire/20 rounded-full blur-2xl animate-pulse" />
    <div className="absolute bottom-20 right-16 w-20 h-20 bg-air-dark/20 rounded-full blur-2xl animate-ping" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-water/10 rounded-full blur-3xl opacity-30 animate-float" />
  </>
);

export default HomePage;