import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {  ChevronDown } from "lucide-react";
import { db } from "../../config/firbaseConfig"; 
import { collection, getDocs} from "firebase/firestore";
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
      className="text-5xl font-bold text-5xl md:text-5xl text-red-800 mb-3 leading-tight"
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

// InteractiveIconButton - only the image is clickable
const InteractiveImageButton = ({ icon, onColorChange, size = "md", className = "" }) => {
 const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-44 h-44",
    lg: "w-48 h-48"
  };

  return (
    <div className={` ${className}`}>
      {typeof icon === 'string' ? (
        <img
          src={icon}
          alt="interactive icon"
          onClick={onColorChange}
          className={`${sizeClasses[size]} cursor-pointer transition-all duration-300`}
        />
      ) : (
        <span
          onClick={onColorChange}
          style={{ backgroundColor: '#DC2626' }}
        >
          {icon}
        </span>
      )}
    </div>
  );
};

// YearTabContent - Centered version
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
    <div className="flex justify-center items-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 max-w-4xl mx-auto text-center lg:text-right"
      >
        {/* Text content */}
        <div className="text-right flex-1" dir="rtl">
          <h3
            style={{ color }}
            className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight"
          >
            {title}
          </h3>
          <p className="mb-6 text-sm md:text-base leading-relaxed text-gray-700">
            {description}
          </p>
          <FeatureList features={features} color={color} />
        </div>

        {/* Icon */}
        <div className="flex justify-center items-center">
          <InteractiveImageButton
            icon={icon}
            onColorChange={handleColorChange}
            size="md"
          />
        </div>
      </motion.div>
    </div>
  );
};

// Flip Card Component
const FlipCard = ({ title, description, imageUrl, color, gradient, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true, amount: 0.1 }}
    className="group perspective cursor-pointer"
  >
    <div className="relative w-full h-48 md:h-56 transform transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
      {/* Front Side */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 backface-hidden ${color} border border-white/20`}
      >
        <div className="mb-3 w-40 aspect-square rounded-2xl overflow-hidden backdrop-blur-sm">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/20 flex items-center justify-center">
              <span className="text-gray-800 font-semibold">?</span>
            </div>
          )}
        </div>
        <h4 className="text-base md:text-lg font-bold text-center leading-tight">
          {title}
        </h4>
      </div>

      {/* Back Side */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} text-white text-center flex flex-col items-center justify-center rounded-2xl p-4 backface-hidden rotate-y-180 shadow-lg`}
      >
        {imageUrl && (
          <div className="mb-2 w-40 aspect-square rounded-2xl overflow-hidden opacity-80">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
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
const ArtSkillsGrid = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const snap = await getDocs(collection(db, 'artSkills'));
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSkills(docs);
      } catch (err) {
        console.error('Error fetching art skills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return <p className="text-center py-4">טוען כישורי אמנות…</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {skills.slice(0, 5).map((skill, idx) => (
        <FlipCard
          key={skill.id}
          {...skill}   
          index={idx}
        />
      ))}
    </div>
  );
};

// Data
const years = [
  {
    year: 1,
    icon: "/1st.png",
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
    icon: "/2nd.png",
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
    icon: "/3rd.png",
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
    icon: "/4th.png",
    title: "שנה 4 – השפעה ומנטורינג",
    description: "החניכים יוצרים פרויקט גמר ומלווים דור חדש במסע אישי מלא בגדילה.",
    features: [
      "יצירת פרויקט מסכם משמעותי",
      "מעבר לתפקיד מנטור",
      "הכנה להמשך הדרך"
    ],
  },
];


const ProgramSection = () => {
  const navigate = useNavigate();
  return (
    <section
      className="py-10 md:py-14 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative"
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
            <ArtSkillsGrid />
          </div>
          
          <div className="mt-8 text-center">
            <button
              className="bg-white text-orange-600 hover:bg-orange-50 transition-colors px-8 py-3 rounded-lg font-medium"
              onClick={() => navigate('/artSkills')}
            >
              לראות עוד
            </button>
          </div>
          
          <br />
          <br />
          
          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="rounded-full p-2 text-red-900 opacity-60 bottom-4 md:bottom-8 left-[45%] -translate-x-[55%]">
              <ChevronDown className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </div>

      <style>
        {`
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
      `}
      </style>
    </section>
  );
};

export default ProgramSection;