import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Search, Hammer, Activity, Sparkles } from "lucide-react";

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

const ProgramSection = () => {
  const years = [
    {
      year: 1,
      icon: <Search size={48} />,
      title: "שנה 1 – גילוי: הקול האישי מתעורר",
      description:
        "השלב הראשון במסע הוא שלב הגילוי – בו החניכים לומדים לזהות את הכישרונות הייחודיים שלהם ואת הקול הפנימי שאותו הם רוצים לבטא. זהו הבסיס לכל מסע מנהיגותי.",
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
        "בשלב זה מתרחשת העמקה בתחום האמנותי הנבחר. החניכים מפתחים מיומנויות מתקדמות ומתחילים להרגיש כשולטים בחומר – ומתוך כך, מסוגלים גם להוביל.",
      features: [
        "העמקה אישית בתחומי האמנות",
        "סדנאות לפיתוח כישורי מנהיגות",
        "בניית זהות אמנותית מובחנת",
      ],
    },
    {
      year: 3,
      icon: <Activity size={48} />,
      title: "שנה 3 – יישום: מהשראה לפעולה",
      description:
        "בשלב הזה החניכים לוקחים את הכלים שרכשו ומתחילים לפעול. הם יוזמים פרויקטים, משתפים פעולה ומשפיעים באמצעות האמנות.",
      features: [
        "הובלת פרויקטים אמנותיים עם ערך חברתי",
        "עבודת צוות והנחיית קבוצות צעירות",
        "יזמות תרבותית בשטח",
      ],
    },
    {
      year: 4,
      icon: <Sparkles size={48} />,
      title: "שנה 4 – השפעה: להיות השראה לאחרים",
      description:
        "המסע מגיע לשיאו: החניכים יוצרים פרויקט גמר משמעותי, מתנסים בהנחיה של אחרים ומתכוננים להמשך הדרך כמנהיגים יצירתיים.",
      features: [
        "יצירת פרויקט אמנותי מסכם",
        "ליווי מנטורינג לדור הבא",
        "עיצוב אישי של הדרך קדימה",
      ],
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-orange-50 rtl">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-red-800 mb-4">
            מסע המנהיגות היצירתית – ארבע שנות התחשלות
          </h2>
          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            בדומה למתכת שמתעצבת באש, כך גם תהליך ההתפתחות בתכנית – ארבע שנות עומק, תרגול והובלה דרך אמנות.
            כל שנה מצמיחה שכבת חוסן חדשה, כלי נוסף, וקול ברור יותר.
          </p>
        </div>

        <Tabs defaultValue="year1" className="w-full">
          <TabsList dir="rtl" className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12 bg-gray-100 p-2 rounded-full shadow-inner">
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
