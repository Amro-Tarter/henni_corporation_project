import { useState } from "react";
import { motion } from "framer-motion";

const ElementCard = ({ title, description, color, gradient, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl p-8 ${gradient} text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300`}
      dir="rtl"
    >
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4 drop-shadow-lg">{title}</h3>
        <p className="leading-relaxed text-white/90">{description}</p>
      </div>

      {/* Decorative background symbol */}
      <div className="absolute -bottom-8 -left-8 opacity-10 text-9xl font-bold pointer-events-none select-none">
        {title.split(" ")[0]}
      </div>
    </motion.div>
  );
};

const ElementsSection = () => {
  const elements = [
    {
      title: "מים - התחלה",
      description:
        "מים מייצגים את שלב ההתחלה והקשבה לקול הפנימי שלנו. כמו מים הזורמים, זהו שלב הגילוי העצמי.",
      gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-600",
      color: "bg-blue-500",
    },
    {
      title: "עץ - צמיחה",
      description:
        "העץ מסמל את הצמיחה וההתפתחות, את הגילוי העצמי ואת ההתחדשות המתמדת.",
      gradient: "bg-gradient-to-br from-green-400 via-green-500 to-emerald-600",
      color: "bg-green-500",
    },
    {
      title: "אש - יצירה",
      description:
        "האש היא סמל ליצירה, להתלהבות ולמנהיגות פעילה שמאירה ומשפיעה על הסביבה.",
      gradient: "bg-gradient-to-br from-red-400 via-orange-500 to-yellow-500",
      color: "bg-red-500",
    },
    {
      title: "אדמה - קהילה",
      description:
        "האדמה מייצגת את היציבות, את הקהילה ואת הבסיס האיתן לפיתוח אישי וקבוצתי.",
      gradient: "bg-gradient-to-br from-yellow-700 via-yellow-600 to-amber-500",
      color: "bg-yellow-700",
    },
    {
      title: "מתכת - סיכום",
      description:
        "המתכת מסמלת את המסקנות, את הסיכום ואת תכנון העתיד להמשך הדרך.",
      gradient: "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-700",
      color: "bg-gray-600",
    },
  ];

  return (
    <section       className="relative py-20 md:py-28 bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 overflow-hidden"
    id="elements">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16" dir="rtl">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-fire-dark mb-4">
            חמשת היסודות שלנו
          </h2>
          <div className="h-1 w-24 bg-fire mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            אנו מיישמים את עקרונות חמשת היסודות בכל תכניותנו, כדי לסייע לחניכינו להתפתח ולהתחזק בכל היבטי חייהם
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {elements.map((element, index) => (
            <ElementCard key={index} {...element} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ElementsSection;
