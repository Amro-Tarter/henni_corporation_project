import React from 'react';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Star, 
  Users, 
  HandHeart, 
  Lightbulb, 
  Sparkles 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ArtPanelCard from './ArtPanelCard';

const BACKGROUNDS = [
  "linear-gradient(135deg, #FF4500 10%, #FF6347 90%)",
  "linear-gradient(135deg, #FF6347 10%, #FF8C00 90%)",
  "linear-gradient(135deg, #FF8C00 10%, #FF4500 90%)",
];

const TEXT_COLORS = [
  "#ccf3ff", "#E0fbff", "#ffffff", "#f9ffe8", "#ebffc"
];

const BLOB_COLORS = [
  "#FF4500", "#FF6347", "#FF8C00"
];

const OurStory = () => {
  return (
    <section id="our-story" className="relative py-20 overflow-hidden bg-fire/10 rounded-lg flex items-center justify-center">
      <DecorativeDoodles />
      <div className="container relative z-10 mx-auto px-4 space-y-20">

        {/* Vision & Purpose */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ animate: { transition: { staggerChildren: 0.13 } } }}
        >
          <Card className="mb-16 bg-white/90 shadow-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    אנחנו מאמינים בכוחה של היצירה להעצים בני נוער ולפתח מנהיגות צעירה...
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
                    החזון שלנו הוא ליצור דור של מנהיגים צעירים המחוברים לעצמם...
                  </p>
                </ArtPanelCard>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Separator */}
        <Separator className="my-10" />

        {/* Purpose */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ animate: { transition: { staggerChildren: 0.13 } } }}
        >
          <Card className="mx-auto max-w-3xl bg-white/90 shadow-lg">
            <CardContent className="p-8">
              <ArtPanelCard
                title="המטרה שלנו"
                icon={<Lightbulb size={36} className="text-[#7E69AB]" />}
                bgGradient={BACKGROUNDS[1]}
                blobColor={BLOB_COLORS[1]}
                iconSide="right"
                doodles={<DoodleLightbulb />}
                textColor={TEXT_COLORS[2]}
              >
                <p className="text-lg" style={{ color: TEXT_COLORS[1] }}>
                  להעניק לכל נער ונערה מישראל מכל המגזרים את הכלים והבמה לגלות את קולם הייחודי ולהשפיע על החברה.
                </p>
              </ArtPanelCard>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Separator */}
        <Separator className="my-10" />

        {/* Leadership by Creativity */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ animate: { transition: { staggerChildren: 0.13 } } }}
        >
          <Card className="bg-white/90 shadow-lg">
            <CardContent className="p-8">
              <ArtPanelCard
                title="הכוח המשנה של יצירה ומנהיגות"
                icon={<Star size={38} className="text-theme-heading-accent" />}
                bgGradient={BACKGROUNDS[2]}
                blobColor={BLOB_COLORS[2]}
                iconSide="left"
                doodles={<DoodleMusic />}
                textColor={TEXT_COLORS[2]}
              >
                <p className="mb-4 text-lg" style={{ color: TEXT_COLORS[2] }}>
                  אנו יודעים כי כל תחום אמנותי מפתח יכולות ייחודיות:
                </p>
                <ul className="space-y-3 pl-4 text-base" style={{ color: TEXT_COLORS[2] }}>
                  <li>✦ אמנות פלסטית – פתרון אתגרים</li>
                  <li>✦ מוזיקה – הקשבה והרמוניה</li>
                  <li>✦ תיאטרון – ביטחון ותקשורת</li>
                  <li>✦ מחול – משמעת ודוגמה אישית</li>
                  <li>✦ כתיבה יוצרת – מסרים משמעותיים</li>
                </ul>
              </ArtPanelCard>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Separator */}
        <Separator className="my-10" />

        {/* Four Year Program Timeline */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ animate: { transition: { staggerChildren: 0.11 } } }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((year, index) => (
              <Card key={year} className="bg-white/90 shadow-lg">
                <CardContent className="p-6">
                  <ArtPanelCard
                    title={`שנה ${year} - ${year === 1 ? "גילוי" : year === 2 ? "פיתוח" : year === 3 ? "יישום" : "מסע המשך"}`}
                    icon={<BookOpen size={30} className="text-fire" />}
                    bgGradient={BACKGROUNDS[index % 3]}
                    blobColor={BLOB_COLORS[index % 3]}
                    iconSide="left"
                    textColor={TEXT_COLORS[2]}
                  >
                    <ul className="space-y-2 text-base" style={{ color: TEXT_COLORS[2] }}>
                      <li>• שלב {year} - משימות ופעילויות מיוחדות</li>
                      <li>• הדרכות אישיות וקהילתיות</li>
                    </ul>
                  </ArtPanelCard>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Section Separator */}
        <Separator className="my-10" />

        {/* Unique Benefits */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card className="bg-white/90 shadow-lg">
              <CardContent className="p-8">
                <ArtPanelCard
                  title="יתרונות ייחודיים"
                  icon={<HandHeart size={36} className="text-fire drop-shadow-md" />}
                  bgGradient={BACKGROUNDS[0]}
                  blobColor={BLOB_COLORS[0]}
                  iconSide="left"
                  textColor={TEXT_COLORS[2]}
                >
                  <ul className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: TEXT_COLORS[2] }}>
                    <li>• ליווי אישי בזום</li>
                    <li>• ליווי משפחתי מותאם</li>
                    <li>• מפגשים עם אמנים מובילים</li>
                  </ul>
                </ArtPanelCard>
              </CardContent>
            </Card>

            <Card className="bg-white/90 shadow-lg">
              <CardContent className="p-8">
                <ArtPanelCard
                  title="הזדמנויות קהילתיות"
                  icon={<Users size={34} className="text-air-dark drop-shadow-sm" />}
                  bgGradient={BACKGROUNDS[1]}
                  blobColor={BLOB_COLORS[1]}
                  iconSide="left"
                  textColor={TEXT_COLORS[2]}
                >
                  <ul className="space-y-5 text-base md:text-lg leading-relaxed" style={{ color: TEXT_COLORS[2] }}>
                    <li>• רשת תמיכה קהילתית</li>
                    <li>• יוזמות חברתיות</li>
                  </ul>
                </ArtPanelCard>
              </CardContent>
            </Card>
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
