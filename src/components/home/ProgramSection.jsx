import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const colorMap = {
  red: "#DC2626",
  blue: "#2563EB",
  orange: "#EA580C",
  green: "#16A34A",
};

const getRandomColor = () => {
  const keys = Object.keys(colorMap);
  return colorMap[keys[Math.floor(Math.random() * keys.length)]];
};

const YearTab = ({ year, title, description, features }) => {
    const colorMap = {
      red: "#DC2626",
      blue: "#2563EB",
      orange: "#EA580C",
      green: "#16A34A",
    };
  
    const [color, setColor] = useState(getRandomColor());
  
    const handleColorChange = () => {
      let newColor = getRandomColor();
      while (newColor === color) {
        newColor = getRandomColor(); // avoid same color
      }
      setColor(newColor);
    };
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center rtl"
      >
        <div className="text-right">
          <h3 style={{ color }} className="text-3xl md:text-4xl font-bold mb-5">
            שנה {year} – {title}
          </h3>
          <p className="mb-6 text-lg leading-relaxed text-gray-700">{description}</p>
          <ul className="space-y-4 text-base text-gray-600">
            {features.map((feature, index) => (
              <li key={index} className="flex flex-row-reverse items-start">
                <span
                  style={{ backgroundColor: color }}
                  className="mt-1 h-4 w-4 rounded-full flex-shrink-0 shadow-sm ml-3"
                ></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{ backgroundColor: `${color}10` }}
          className="rounded-3xl p-10 h-full flex items-center justify-center"
        >
          <button
            onClick={handleColorChange}
            style={{ backgroundColor: color }}
            className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl hover:scale-105 transition-transform duration-300"
          >
            {year}
          </button>
        </div>
      </motion.div>
    );
  };
  

const ProgramSection = () => {
  const years = [
    { year: 1, title: "המוכשר מגלה את הקול האישי שבתוכו", description: "בשנה הראשונה, החניכים מתחילים את המסע בגילוי הכישרונות והחוזקות האישיות שלהם.", features: ["זיהוי חוזקות אמנותיות", "פיתוח ביטחון עצמי ויכולת יצירתית", "התנסות במגוון תחומי אמנות"] },
    { year: 2, title: "המוכשר מפתח מיומנויות", description: "השנה השנייה מוקדשת להעמקה במיומנויות נבחרות והתחלת תהליך של פיתוח פרויקטים אישיים.", features: ["העמקה בתחום האמנותי הנבחר", "סדנאות מנהיגות דרך אמנות", "התחלת עבודה על פרויקט אישי"] },
    { year: 3, title: "המוכשר מיישם מנהיגות", description: "בשנה השלישית, החניכים מתחילים להוביל פרויקטים ולהשפיע על סביבתם דרך היצירה והאמנות.", features: ["הובלת פרויקטים קהילתיים", "חניכת יוצרים צעירים", "פיתוח יוזמות אמנותיות חברתיות"] },
    { year: 4, title: "המוכשר משפיע וממשיך דרך", description: "השנה הרביעית היא שנת הסיכום וההשפעה, בה החניכים הופכים למנטורים ומתכננים את המשך דרכם.", features: ["יצירת פרויקט מסכם משמעותי", "בניית תכנית המשך אישית", "הפיכה למנטורים לדור הבא"] },
  ];

  return (
<section className="py-24 bg-gradient-to-b from-white to-slate-100" dir="rtl">
<div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-red-800 mb-4">
            תכנית ארבע השנים שלנו
          </h2>
          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            התכנית המשולבת שלנו מורכבת ממסלול פיתוח של ארבע שנים המשלב בין יצירה, העצמה והשפעה חברתית
          </p>
        </div>

        <Tabs defaultValue="year1" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12 bg-gray-100 p-2 rounded-full shadow-inner rtl">
            {years.map((yearData, index) => (
              <TabsTrigger key={index} value={`year${yearData.year}`} className="rounded-full px-4 py-2">
                שנה {yearData.year}
              </TabsTrigger>
            ))}
          </TabsList>

          {years.map((yearData, index) => (
            <TabsContent key={index} value={`year${yearData.year}`} className="mt-0">
              <YearTab {...yearData} />
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-20 text-center">
          <Link to="/program">
            <Button className="bg-red-600 hover:bg-red-700 text-white text-lg px-6 py-3 rounded-xl shadow-md transition-all duration-300">
              גלו את התכנית המלאה שלנו
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;
