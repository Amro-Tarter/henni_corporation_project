import { motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Search, Hammer, Activity, Sparkles, Paintbrush, Music, Move3D, Pen } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMasksTheater } from "@fortawesome/free-solid-svg-icons";
import CTAButton from '@/components/CTAButton';

// תיאטרון - SVG מותאם (אין ב-lucide-react)
const TheaterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9.75 9.75h.008v.008H9.75V9.75zM14.25 9.75h.008v.008h-.008V9.75zM21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"
    />
  </svg>
);

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

const YearTab = ({ icon, title, description, features }) => {
  const [color, setColor] = useState(getRandomColor());

  const handleColorChange = () => {
    let newColor = getRandomColor();
    while (newColor === color) {
      newColor = getRandomColor();
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
          {title}
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
          className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform duration-300"
        >
          {icon}
        </button>
      </div>
    </motion.div>
  );
};

const artSkills = [
  {
    title: "אמנות פלסטית",
    description: "חשיבה יצירתית וחדשנית",
    icon: <Paintbrush size={36} />,
    color: "bg-green-100 text-green-900", // אדמה
    font: "font-serif",
  },
  {
    title: "מוזיקה",
    description: "הקשבה, שיתוף פעולה והובלה",
    icon: <Music size={36} />,
    color: "bg-blue-100 text-blue-900", // מים
    font: "font-sans",
  },
  {
    title: "תיאטרון",
    description: "ביטחון עצמי, תקשורת ומנהיגות רגשית",
    icon: <FontAwesomeIcon icon={faMasksTheater} className="text-3xl" />,
    color: "bg-gray-100 text-gray-800", // מתכת
    font: "font-bold",
  },
  {
    title: "מחול",
    description: "משמעת אישית, התמדה ודוגמה אישית",
    icon: <Move3D size={36} />,
    color: "bg-sky-100 text-sky-900", // אוויר
    font: "font-medium italic",
  },
  {
    title: "כתיבה יוצרת",
    description: "פיתוח קול אישי והשפעה תרבותית",
    icon: <Pen size={36} />,
    color: "bg-orange-100 text-orange-800", // אש
    font: "font-display",
  },
];

const years = [
  {
    year: 1,
    icon: <Search size={48} />,
    title: "שנה 1 – גילוי: הקול האישי מתעורר",
    description:
      "השלב הראשון במסע הוא שלב הגילוי – בו החניכים לומדים לזהות את הכישרונות הייחודיים שלהם ואת הקול הפנימי שאותו הם רוצים לבטא.",
    features: [
      "זיהוי חוזקות אישיות וביטוי אמנותי",
      "התנסות בסדנאות יצירה מגוונות",
      "פיתוח ביטחון עצמי והקשבה פנימית",
    ],
  },
  {
    year: 2,
    icon: <Hammer size={48} />,
    title: "שנה 2 – פיתוח: הכלים מתחדדים",
    description:
      "בשלב זה מתבצעת העמקה בתחום האמנותי. החניכים מפתחים מיומנויות מתקדמות ומתחילים להרגיש כשולטים בעשייה.",
    features: [
      "העמקה בתחומי האמנות",
      "סדנאות לפיתוח כישורי מנהיגות",
      "חיזוק קול אישי ומקצועי",
    ],
  },
  {
    year: 3,
    icon: <Activity size={48} />,
    title: "שנה 3 – יישום: מהשראה לפעולה",
    description:
      "החניכים יוזמים פרויקטים אמנותיים, משתפים פעולה ומשפיעים על סביבתם באופן יצירתי וחברתי.",
    features: [
      "ניהול פרויקטים קהילתיים",
      "עבודת צוות והובלה",
      "יצירת השפעה תרבותית",
    ],
  },
  {
    year: 4,
    icon: <Sparkles size={48} />,
    title: "שנה 4 – השפעה: להפוך למנטור",
    description:
      "החניכים יוצרים פרויקט גמר, מלווים דור חדש ומסכמים מסע אישי מלא בגדילה והגשמה.",
    features: [
      "יצירת פרויקט מסכם משמעותי",
      "מעבר לתפקיד מנטור",
      "הכנה להמשך הדרך",
    ],
  },
];

const ProgramSection = () => {
  return (
    <section 
    className="py-24 bg-gradient-to-tr from-sky-100 to-blue-100 rtl"
     id="leadership-program">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-red-800 mb-4">
            מסע המנהיגות היצירתית – ארבע שנות התחשלות
          </h2>
          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            בדומה למתכת שמתעצבת באש, כך גם תהליך ההתפתחות בתכנית – ארבע שנות עומק, תרגול והובלה דרך אמנות.
          </p>
        </div>

        <Tabs defaultValue="year1" className="w-full">
          <TabsList
            dir="rtl"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12 bg-gray-100 p-2 rounded-full shadow-inner"
          >
            {years.map((yearData) => (
              <TabsTrigger key={yearData.year} value={`year${yearData.year}`} className="rounded-full px-4 py-2">
                שנה {yearData.year}
              </TabsTrigger>
            ))}
          </TabsList>

          {years.map((yearData) => (
            <TabsContent key={yearData.year} value={`year${yearData.year}`} className="mt-0">
              <YearTab {...yearData} />
            </TabsContent>
          ))}
        </Tabs>

       {/* Flip Cards – תחומי אמנות ומיומנויות מנהיגות */}
        <div className="mt-28">
          <div className="text-center mb-12" dir="rtl">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 tracking-tight leading-snug">
              כלים ותחומי אמנות
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              כרטיסיות ויזואליות שמציגות כיצד כל תחום אמנותי בתכנית מחזק מיומנויות מנהיגות שונות.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto" dir="rtl">
            {artSkills.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group perspective"
              >
                <div className="relative w-full h-60 md:h-64 transform transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
                  {/* Front side */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl shadow-xl p-6 backface-hidden ${item.color}`}>
                    <div className="mb-4">{item.icon}</div>
                    <h4 className={`text-xl text-center ${item.font} tracking-tight`}>{item.title}</h4>
                  </div>

                  {/* Back side */}
                  <div className="absolute inset-0 bg-white text-gray-700 text-right flex items-center justify-center rounded-xl p-6 backface-hidden rotate-y-180">
                    <p className="text-base leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;
