import { motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Hammer, Activity, Sparkles, Paintbrush, Music, Move3D, Pen } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMasksTheater } from '@fortawesome/free-solid-svg-icons';
import CTAButton from "@/components/CTAButton";


// Color utilities
const colorMap = {
  red: "#DC2626", blue: "#2563EB", orange: "#EA580C", 
  green: "#16A34A", purple: "#9333EA", teal: "#0D9488",
};

const getRandomColor = () => {
  const keys = Object.keys(colorMap);
  return colorMap[keys[Math.floor(Math.random() * keys.length)]];
};

// Section Header Component
const SectionHeader = ({ title, subtitle, className = "" }) => (
  <div className={`text-center ${className}`} dir="rtl">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-800 mb-3 leading-tight"
    >
      {title}
    </motion.h2>
    <motion.div 
      initial={{ width: 0 }}
      whileInView={{ width: "4rem" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
      className="h-1 bg-gradient-to-l from-red-600 to-red-500 mx-auto rounded-full mb-3"
    />
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

// Feature List Component
const FeatureList = ({ features, color }) => (
  <ul className="space-y-2 text-sm md:text-base text-gray-600" dir="rtl">
    {features.map((feature, index) => (
      <li key={index} className="flex items-start">
        <span
          style={{ backgroundColor: color }}
          className="mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm me-3"
        />
        <span className="leading-snug text-right">{feature}</span>
      </li>
    ))}
  </ul>
);

// Interactive Icon Button Component
const InteractiveIconButton = ({ icon, color, onColorChange, size = "md" }) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-24 h-24 md:w-28 md:h-28",
    lg: "w-28 h-28 md:w-32 md:h-32"
  };

  return (
    <button
      onClick={onColorChange}
      style={{ backgroundColor: color }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95`}
    >
      {icon}
    </button>
  );
};

// Year Tab Content Component
const YearTabContent = ({ icon, title, description, features }) => {
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
    >
      {/* Text Content - RTL */}
      <div className="text-right order-2 lg:order-1" dir="rtl">
        <h3 
          style={{ color }} 
          className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 leading-tight"
        >
          {title}
        </h3>
        <p className="mb-4 text-sm md:text-base leading-relaxed text-gray-700">
          {description}
        </p>
        <FeatureList features={features} color={color} />
      </div>
      
      {/* Interactive Visual */}
      <div
        style={{ backgroundColor: `${color}15` }}
        className="rounded-2xl p-6 h-40 md:h-48 flex items-center justify-center order-1 lg:order-2"
      >
        <InteractiveIconButton 
          icon={icon} 
          color={color} 
          onColorChange={handleColorChange} 
          size="md"
        />
      </div>
    </motion.div>
  );
};

// Flip Card Component
const FlipCard = ({ title, description, icon, color, gradient, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true, amount: 0.1 }}
    className="group perspective cursor-pointer"
  >
    <div className="relative w-full h-48 md:h-56 transform transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
      {/* Front Side */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 backface-hidden ${color} border border-white/20`}>
        <div className="mb-3 p-3 rounded-full bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        <h4 className="text-base md:text-lg font-bold text-center leading-tight">
          {title}
        </h4>
      </div>

      {/* Back Side */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} text-white text-center flex items-center justify-center rounded-2xl p-4 backface-hidden rotate-y-180 shadow-lg`}>
        <p className="text-xs md:text-sm leading-relaxed" dir="rtl">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

// Main Tabs Component
const YearTabs = ({ years }) => (
  <Tabs defaultValue="year1" className="w-full">
    <TabsList
      dir="rtl"
      className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-lg md:max-w-xl mx-auto mb-8 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg border border-gray-200"
    >
      {years.map((yearData) => (
        <TabsTrigger 
          key={yearData.year} 
          value={`year${yearData.year}`} 
          className="rounded-xl px-2 py-2 md:px-3 text-xs md:text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-l data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          שנה {yearData.year}
        </TabsTrigger>
      ))}
    </TabsList>

    {years.map((yearData) => (
      <TabsContent key={yearData.year} value={`year${yearData.year}`} className="mt-0">
        <YearTabContent {...yearData} />
      </TabsContent>
    ))}
  </Tabs>
);

// Art Skills Grid Component
const ArtSkillsGrid = ({ skills }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
    {skills.map((skill, index) => (
      <FlipCard key={index} {...skill} index={index} />
    ))}
  </div>
);

// Data
const years = [
  {
    year: 1,
    icon: <Search size={32} />,
    title: "שנה 1 – גילוי הקול האישי",
    description: "השלב הראשון במסע הוא שלב הגילוי – בו החניכים לומדים לזהות את הכישרונות הייחודיים שלהם.",
    features: [
      "זיהוי חוזקות אישיות וביטוי אמנותי",
      "התנסות בסדנאות יצירה מגוונות", 
      "פיתוח ביטחון עצמי והקשבה פנימית"
    ],
  },
  {
    year: 2,
    icon: <Hammer size={32} />,
    title: "שנה 2 – פיתוח הכלים",
    description: "בשלב זה מתבצעת העמקה בתחום האמנותי. החניכים מפתחים מיומנויות מתקדמות.",
    features: [
      "העמקה בתחומי האמנות",
      "סדנאות לפיתוח כישורי מנהיגות",
      "חיזוק קול אישי ומקצועי"
    ],
  },
  {
    year: 3,
    icon: <Activity size={32} />,
    title: "שנה 3 – יישום מעשי",
    description: "החניכים יוזמים פרויקטים אמנותיים ומשפיעים על סביבתם באופן יצירתי וחברתי.",
    features: [
      "ניהול פרויקטים קהילתיים",
      "עבודת צוות והובלה",
      "יצירת השפעה תרבותית"
    ],
  },
  {
    year: 4,
    icon: <Sparkles size={32} />,
    title: "שנה 4 – השפעה ומנטורינג",
    description: "החניכים יוצרים פרויקט גמר ומלווים דור חדש במסע אישי מלא בגדילה.",
    features: [
      "יצירת פרויקט מסכם משמעותי",
      "מעבר לתפקיד מנטור",
      "הכנה להמשך הדרך"
    ],
  },
];
const TheaterIcon = (props) => (
  <FontAwesomeIcon icon={faMasksTheater} {...props} />
);
const artSkills = [
  {
    title: "אמנות פלסטית",
    description: "חשיבה יצירתית וחדשנית המאפשרת פתרון בעיות בדרכים לא שגרתיות",
    icon: <Paintbrush className="w-6 h-6 md:w-7 md:h-7" />,
    color: "bg-green-100 text-green-800",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    title: "מוזיקה", 
    description: "הקשבה עמוקה, שיתוף פעולה הרמוני והובלת קבוצות במטרה ליצור יצירות משותפות",
    icon: <Music className="w-6 h-6 md:w-7 md:h-7" />,
    color: "bg-blue-100 text-blue-800",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    title: "תיאטרון",
    description: "ביטחון עצמי, תקשורת אפקטיבית ומנהיגות רגשית המאפשרת השפעה והשראה",
    icon: <TheaterIcon className="w-6 h-6 md:w-7 md:h-7" />,
    color: "bg-purple-100 text-purple-800", 
    gradient: "from-purple-400 to-pink-500",
  },
  {
    title: "מחול",
    description: "משמעת אישית, התמדה ודוגמה אישית המחזקת כושר גופני ומנטלי",
    icon: <Move3D className="w-6 h-6 md:w-7 md:h-7" />,
    color: "bg-sky-100 text-sky-800",
    gradient: "from-sky-400 to-cyan-500",
  },
  {
    title: "כתיבה יוצרת",
    description: "פיתוח קול אישי והשפעה תרבותית דרך יכולת ביטוי מילולי מדויק",
    icon: <Pen className="w-6 h-6 md:w-7 md:h-7" />,
    color: "bg-orange-100 text-orange-800",
    gradient: "from-orange-400 to-red-500",
  },
];

// Main Component
const ProgramSection = () => {
  return (
    <section 
      className="py-10 md:py-14 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      id="leadership-program"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Main Header */}
        <SectionHeader 
          title="מסע המנהיגות היצירתית"
          subtitle="ארבע שנות עומק, תרגול והובלה דרך אמנות"
          className="mb-10 md:mb-12"
        />

        {/* Year Tabs */}
        <YearTabs years={years} />

        {/* Art Skills Section */}
        <div className="mt-12 md:mt-16">
          <SectionHeader 
            title="תחומי אמנות ומיומנויות"
            subtitle="גלו כיצד כל תחום אמנותי מחזק מיומנויות מנהיגות שונות"
            className="mb-8 md:mb-10"
          />
          
          <div dir="rtl">
            <ArtSkillsGrid skills={artSkills} />
          </div>
          <div className="mt-8 text-center">
             <CTAButton
                href="/artskills"
                variant="inverse-air"
                size="md"
                className="bg-white text-orange-600 hover:bg-orange-50 transition-colors px-8 py-3"
              >
                <span className="text-base font-medium">לראות עוד</span>
              </CTAButton>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
};

export default ProgramSection;