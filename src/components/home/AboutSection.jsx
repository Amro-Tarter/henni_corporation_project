import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HandHeart, Users, Heart } from 'lucide-react';

const AboutSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      title: "החזון שלנו",
      icon: <Heart className="h-12 w-12 text-pink-600 drop-shadow-md" />,
      description: "אנו מאמינים ביצירת דור חדש של מנהיגים צעירים ואותנטיים דרך עולם האמנות והיצירה.",
    },
    {
      title: "המטרה שלנו",
      icon: <Users className="h-12 w-12 text-orange-500 drop-shadow-md" />,
      description: "להעניק לכל נער ונערה מישראל את הכלים וה\"במה\" לגלות את \"קולם\" הייחודי ולהשפיע על החברה.",
    },
    {
      title: "ההשפעה שלנו",
      icon: <HandHeart className="h-12 w-12 text-green-600 drop-shadow-md" />,
      description: "פיתוח דור חדש של מנהיגים-יוצרים ברמה האישית, הקהילתית והלאומית.",
    },
  ];

  return (
    <section id="about-section" className="py-24 bg-gradient-to-b from-white to-amber-50" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-orange-800 mb-4 drop-shadow">
            אודות עמותת "לגלות את האור - הנני"
          </h2>
          <div className="h-1 w-28 bg-orange-500 mx-auto mb-6 rounded-full animate-pulse"></div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            עמותת "לגלות את האור - הנני" פועלת להעצמת בני נוער דרך שילוב ייחודי בין אמנות, יצירה ומנהיגות
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
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

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link to="/about">
            <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-lg px-6 py-3 rounded-xl shadow-lg transition-all duration-300">
              קראו עוד על העמותה שלנו
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
