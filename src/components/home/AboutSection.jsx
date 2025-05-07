import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HandHeart, Users, Heart, TreePine } from 'lucide-react';
import { fadeSlideUp } from '@/lib/animations';

const AboutSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      title: 'החזון שלנו',
      icon: <Heart className="h-12 w-12 text-pink-600 drop-shadow-md" />,
      description:
        'ב"עמותת לגלות את האור - הנני" אנו מאמינים שכל נער ונערה בישראל נושאים בתוכם אור ייחודי – כישרון, קול והשפעה – שרק ממתינים להתגלות. מטרתנו היא לחשוף אור זה דרך תהליך אמנותי, אותנטי ומעצים.',
    },
    {
      title: 'המטרה שלנו',
      icon: <Users className="h-12 w-12 text-orange-500 drop-shadow-md" />,
      description:
        'יצירת דור חדש של מנהיגים צעירים, רגישים ומודעים – דרך הבמה היצירתית. אנו מעניקים כלים לפיתוח אישי וביטוי עצמי אותנטי, המובילים להשפעה חברתית עמוקה.',
    },
    {
      title: 'ההשפעה שלנו',
      icon: <HandHeart className="h-12 w-12 text-green-600 drop-shadow-md" />,
      description:
        'התוכניות שלנו משנות חיים. אנו רואים את הנוער לא רק כאמנים – אלא ככוחות של שינוי אישי, קהילתי ולאומי.',
    },
  ];

  return (
    <section
      id="about-section"
      className="relative py-20 md:py-28 bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
          className="text-center mb-20"
        >
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-orange-800 mb-4 drop-shadow">
            שורשים של אור – החזון שמוביל אותנו
          </h2>
          <div className="h-1 w-28 bg-orange-500 mx-auto mb-6 rounded-full animate-pulse"></div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            כל ילד וילדה נולדים עם אור פנימי חד-פעמי. דרך אמנות, יצירה וחיבורים אנושיים, אנו יוצרים עבורם קרקע לצמיחה – מעץ צעיר למנהיג פורח.
          </p>
          <blockquote className="mt-8 italic text-orange-800 font-semibold">
            "לגלות את האור שבתוכי, זו תחילתה של הנהגה אמיתית"
          </blockquote>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeSlideUp}
              transition={{ delay: index * 0.15 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card
                className={`transition-all duration-300 rounded-3xl shadow-lg bg-white/90 backdrop-blur-md ${
                  hoveredIndex === index
                    ? 'border-2 border-orange-400 shadow-2xl scale-[1.03]'
                    : 'border border-transparent'
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
        >
          <TreePine className="h-10 w-10 mx-auto mb-4 text-green-700" />
          <p className="text-gray-700 mb-6">
            כמו שתיל שמקבל את כל מה שצריך כדי לצמוח לעץ מלא פירות – כך אנו רואים את תהליך ההתפתחות של בני הנוער.
          </p>
          <Link to="/about">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-6 py-3 rounded-xl shadow-lg transition-all duration-300">
              קראו עוד על העמותה שלנו
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="mt-20 bg-orange-100 border-l-8 border-orange-400 rounded-xl p-6 shadow-lg text-gray-800 text-lg leading-relaxed"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
        >
          <p>
            פעילותינו נפרשת מצפון ועד דרום – מחדרה ועד גדרה – ומקיפה מגזרים שונים. כל משתתף זוכה לליווי אישי של מנטור מקצועי אחת לשלושה שבועות בזום, וכן לתמיכה גם לבני המשפחה המלווים את התהליך היצירתי מקרוב.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
