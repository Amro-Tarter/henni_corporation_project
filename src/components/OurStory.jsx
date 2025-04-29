import React from 'react';
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Star, 
  Users, 
  HandHeart, 
  CircleDot, 
  Lightbulb, 
  Sparkles 
} from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import ArtPanelCard from "./ArtPanelCard";

// Updated backgrounds with fire/orange-red colors
const BACKGROUNDS = [
  // FIRE - Intense orange-red gradients
  "linear-gradient(135deg, #FF4500 10%, #FF6347 90%)",  // Tomato to Orangered
  "linear-gradient(135deg, #FF6347 10%, #FF8C00 90%)",  // Orangered to Dark Orange
  "linear-gradient(135deg, #FF8C00 10%, #FF4500 90%)",  // Dark Orange to Orangered
];

const TEXT_COLORS = [
  "#ccf3ff",   // Light blue
  "#E0fbff",   // Slightly darker light blue
  "#ffffff",   // Pure white
  "#f9ffe8",   // Pale yellow-green
  "#ebffc"     // Very soft blue
];

const BLOB_COLORS = [
  "#FF4500",  // Orangered
  "#FF6347",  // Tomato
  "#FF8C00",  // Dark Orange
];

const OurStory = () => {
  return (
    <section id="our-story" className="relative py-20 overflow-hidden bg-fire/10 rounded-lg flex items-center justify-center" >
      {/* Section Background Doodles */}
      <DecorativeDoodles />
      <div className="container relative z-10 mx-auto px-4">
        {/* 1. Vision & Purpose */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: { transition: { staggerChildren: 0.13 } }
          }}
        >
          <ArtPanelCard
            title="החזון שלנו"
            icon={<Sparkles size={40} className="text-white" />}
            bgGradient={BACKGROUNDS[0]}
            blobColor={BLOB_COLORS[0]}
            iconSide="right"
            doodles={<DoodleStars />}
            textColor={TEXT_COLORS[2]}
          >
            <p className="text-lg" style={{ color: TEXT_COLORS[0] }}>
              אנחנו מאמינים בכוחה של היצירה להעצים בני נוער ולפתח מנהיגות צעירה.
              באמצעות תהליכים אמנותיים, אנו מסייעים לצעירים לגלות את הכוחות הטמונים בהם
              ולהפוך לסוכני שינוי בקהילה שלהם.
            </p>
          </ArtPanelCard>
          
          <ArtPanelCard
            title="חזון דור צעיר"
            icon={<Sparkles size={40} className="text-white" />}
            bgGradient={BACKGROUNDS[1]}
            blobColor={BLOB_COLORS[1]}
            iconSide="left"
            doodles={<DoodleWave />}
            textColor={TEXT_COLORS[2]}
          >
            <p className="text-lg" style={{ color: TEXT_COLORS[1] }}>
              החזון שלנו הוא ליצור דור של מנהיגים צעירים המחוברים לעצמם,
              לקהילה שלהם ולעולם הסובב אותם, תוך שימוש בכלים אמנותיים
              ויצירתיים ככלי להעצמה וצמיחה.
            </p>
          </ArtPanelCard>
        </motion.div>

        {/* Remaining sections will follow the same pattern */}
        <motion.div
          className="mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: { transition: { staggerChildren: 0.13 } }
          }}
        >
          <ArtPanelCard
            title="המטרה שלנו"
            icon={<Lightbulb size={36} className="text-[#7E69AB]" />}
            bgGradient={BACKGROUNDS[1]}
            blobColor={BLOB_COLORS[1]}
            iconSide="right"
            doodles={<DoodleLightbulb />}
            className="mx-auto max-w-3xl"
            textColor={TEXT_COLORS[2]}
          >
            <p className="text-lg" style={{ color: TEXT_COLORS[1] }}>
              להעניק לכל נער ונערה מישראל מכל המגזרים את הכלים וה&quot;במה&quot; לגלות את &quot;קולם&quot; הייחודי ולהשפיע על החברה
            </p>
          </ArtPanelCard>
        </motion.div>

        {/* 3. Leadership by Creativity */}
        <motion.div
          className="mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: { transition: { staggerChildren: 0.13 } }
          }}
        >
          <ArtPanelCard
            title="הכוח המשנה של יצירה ומנהיגות"
            icon={<Star size={38} className="text-theme-heading-accent" />}
            bgGradient={BACKGROUNDS[2]}
            blobColor={BLOB_COLORS[2]}
            iconSide="left"
            doodles={<DoodleMusic />}
            className="mb-6"
            textColor={TEXT_COLORS[2]}
          >
            <p className="mb-4 text-lg" style={{ color: TEXT_COLORS[2] }}>
              אנו יודעים כי כל תחום אמנותי מפתח יכולות ייחודיות שמעצימות את כישורי המנהיגות:
            </p>
            <ul className="space-y-3 pl-4 text-base" style={{ color: TEXT_COLORS[2] }}>
              <li>✦ אמנות פלסטית – פיתוח חשיבה יצירתית בפתרון אתגרים</li>
              <li>✦ מוזיקה – הקשבה, תיאום והובלת אחרים בהרמוניה</li>
              <li>✦ תיאטרון – ביטחון עצמי, תקשורת אפקטיבית והבנת נקודות מבט שונות</li>
              <li>✦ מחול – משמעת עצמית, התמדה והובלה דרך דוגמה אישית</li>
              <li>✦ כתיבה יוצרת – פיתוח קול אישי והעברת מסרים משמעותיים</li>
            </ul>
          </ArtPanelCard>
        </motion.div>

        {/* 4. Four Year Program Timeline (Grid) */}
        <motion.div
          className="mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: { transition: { staggerChildren: 0.11 } }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Year 1 */}
            <ArtPanelCard
              title="שנה ראשונה – גילוי הקול האישי"
              icon={<BookOpen size={30} className="text-fire" />}
              bgGradient={BACKGROUNDS[0]}
              blobColor={BLOB_COLORS[0]}
              iconSide="right"
              textColor={TEXT_COLORS[2]}
            >
              <ul className="space-y-2 text-base" style={{ color: TEXT_COLORS[2] }}>
                <li>• זיהוי חוזקות אמנותיות</li>
                <li>• פיתוח ביטחון עצמי ויכולת יצירתית</li>
                <li>• התנסות במגוון תחומי אמנות</li>
              </ul>
            </ArtPanelCard>
            {/* Year 2 */}
            <ArtPanelCard
              title="שנה שנייה – פיתוח מיומנויות"
              icon={<BookOpen size={30} className="text-air-dark" />}
              bgGradient={BACKGROUNDS[1]}
              blobColor={BLOB_COLORS[1]}
              iconSide="left"
              textColor={TEXT_COLORS[2]}
            >
              <ul className="space-y-2 text-base" style={{ color: TEXT_COLORS[2] }}>
                <li>• העמקה בתחום האמנותי הנבחר</li>
                <li>• סדנאות מנהיגות דרך אמנות</li>
                <li>• התחלת עבודה על פרויקט אישי</li>
              </ul>
            </ArtPanelCard>
            {/* Year 3 */}
            <ArtPanelCard
              title="שנה שלישית – יישום מנהיגות"
              icon={<BookOpen size={30} className="text-water" />}
              bgGradient={BACKGROUNDS[2]}
              blobColor={BLOB_COLORS[2]}
              iconSide="left"
              textColor={TEXT_COLORS[2]}
            >
              <ul className="space-y-2 text-base" style={{ color: TEXT_COLORS[2] }}>
                <li>• הובלת פרויקטים קהילתיים</li>
                <li>• חניכת יוצרים צעירים</li>
                <li>• פיתוח יוזמות אמנותיות חברתיות</li>
              </ul>
            </ArtPanelCard>
            {/* Year 4 */}
            <ArtPanelCard
              title="שנה רביעית – השפעה ומסע המשך"
              icon={<BookOpen size={30} className="text-fire" />}
              bgGradient={BACKGROUNDS[0]}
              blobColor={BLOB_COLORS[0]}
              iconSide="left"
              textColor={TEXT_COLORS[2]}
            >
              <ul className="space-y-2 text-base" style={{ color: TEXT_COLORS[2] }}>
                <li>• יצירת פרויקט מסכם משמעותי</li>
                <li>• בניית תכנית המשך אישית</li>
                <li>• הפיכה למנטורים לדור הבא</li>
              </ul>
            </ArtPanelCard>
          </div>
        </motion.div>

        {/* 5. Unique Benefits (Grid) */}
        <motion.div
        className="mb-28 px-4 md:px-10"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          animate: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
          <ArtPanelCard
            title="יתרונות ייחודיים"
            icon={<HandHeart size={36} className="text-fire drop-shadow-md" />}
            bgGradient={BACKGROUNDS[0]}
            blobColor={BLOB_COLORS[0]}
            iconSide="left"
            textColor={TEXT_COLORS[2]}
          >
            <ul className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: TEXT_COLORS[2] }}>
              <li>• מספר המשתתפים יעמוד על 444 נערים ונערות, מגדרה דרומה ומחדרה צפונה</li>
              <li>• ליווי מנטורי אישי בזום אחת לשלושה שבועות</li>
              <li>• ליווי משפחתי מותאם</li>
              <li>• מפגשים עם אמנים-מנהיגים מובילים</li>
            </ul>
          </ArtPanelCard>

          <ArtPanelCard
            title="הזדמנויות קהילתיות"
            icon={<Users size={34} className="text-air-dark drop-shadow-sm" />}
            bgGradient={BACKGROUNDS[1]}
            blobColor={BLOB_COLORS[1]}
            iconSide="left"
            textColor={TEXT_COLORS[2]}
          >
            <ul className="space-y-5 text-base md:text-lg leading-relaxed" style={{ color: TEXT_COLORS[2] }}>
              <li>• חשיפה להזדמנויות ייחודיות בתחום האמנות</li>
              <li>• יצירת רשת תמיכה קהילתית וחברתית</li>
              <li>• הקמת כפר אמנים צעירים מאזור גדרה צפונה חדרה דרומה</li>
            </ul>
          </ArtPanelCard>
        </div>
      </motion.div>

      </div>
    </section>
  );
};

/* --- Decorative Doodles / SVGs for Section --- */
function DecorativeDoodles() {
  return (
    <>
      {/* Doodle 1: floating star */}
      <svg width={60} height={60} className="absolute left-4 top-10 opacity-30 animate-float" viewBox="0 0 60 60">
        <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize={36}>★</text>
      </svg>
      {/* Doodle 2: wavy line */}
      <svg width={92} height={30} className="absolute right-6 bottom-16 opacity-30" viewBox="0 0 92 30">
        <path d="M4 25c14-20 34 9 45 1 13-10 21-22 39 0" stroke="#D3E4FD" strokeWidth="3" fill="none" />
      </svg>
      {/* Doodle 3: paint splash */}
      <svg width={60} height={60} className="absolute left-12 bottom-12 opacity-20" viewBox="0 0 60 60">
        <ellipse cx="30" cy="30" rx="25" ry="14" fill="#FDE1D3"/>
      </svg>
    </>
  );
}
function DoodleStars() {
  return (
    <svg width="36" height="36" className="absolute top-5 left-5 opacity-40 z-10" viewBox="0 0 36 36">
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize={22}>✨</text>
    </svg>
  );
}
function DoodleWave() {
  return (
    <svg width="78" height="24" className="absolute bottom-4 right-8 opacity-40 z-10" viewBox="0 0 80 24">
      <path d="M4 20c11-16 27 6 37 2 10-4 19-16 35 0" stroke="#D3E4FD" strokeWidth="2" fill="none" />
    </svg>
  );
}
function DoodleMusic() {
  return (
    <svg width="44" height="44" className="absolute left-6 top-8 opacity-30 z-10" viewBox="0 0 44 44">
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize={22}>🎶</text>
    </svg>
  );
}
function DoodleLightbulb() {
  return (
    <svg width="44" height="44" className="absolute left-1 top-8 opacity-30 z-10" viewBox="0 0 44 44">
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize={16}>💡</text>
    </svg>
  );
}

export default OurStory;
