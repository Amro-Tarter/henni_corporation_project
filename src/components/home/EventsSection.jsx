import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

// Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const EventCard = ({ title, date, location, image, index }) => {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardVariants}
    >
      <Card className="overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 group">
        <div className="h-64 relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center text-fire mb-2">
            <Calendar size={18} className="mr-2 text-fire-dark" />
            <span className="text-sm font-medium text-fire-dark">{date}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1 leading-snug">{title}</h3>
          <p className="text-gray-600 text-base mb-6">{location}</p>
          <Link to="/events">
            <Button
              variant="outline"
              className="w-full border-fire text-fire hover:bg-fire/10 hover:shadow-md transition-all duration-300"
            >
              פרטים נוספים
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EventsSection = () => {
  const upcomingEvents = [
    {
      title: "ערב הופעות - תיאטרון ומוזיקה",
      date: "12 במאי, 2025",
      location: "מרכז אמנויות הבמה, תל אביב",
      image: "https://images.unsplash.com/photo-1508767297656-1356ca851008?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "תערוכת אמנות - יצירות חניכים",
      date: "20 במאי, 2025",
      location: "גלריה עירונית, חיפה",
      image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "סדנת מנהיגות - מובילים צעירים",
      date: "1 ביוני, 2025",
      location: "מרכז הצעירים, באר שבע",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-100" id="events" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-fire-dark mb-6">
            אירועים קרובים
          </h2>
          <div className="h-1 w-24 mx-auto bg-fire rounded-full mb-6"></div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            בואו לראות את היצירה והמנהיגות בפעולה באירועים הקרובים שלנו
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {upcomingEvents.map((event, index) => (
            <EventCard key={index} index={index} {...event} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/events">
          <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-xl shadow-lg transition-transform hover:scale-105 duration-300">
            צפו בכל האירועים שלנו
           </Button>

          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
