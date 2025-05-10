import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandHeart, Users, Heart, TreePine, X, Award, ExternalLink } from 'lucide-react';

// Animation variants
const fadeSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

const AboutSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        // Query users collection for team members (role != 'user')
        const teamQuery = query(collection(db, 'users'), where('role', '!=', 'user'));
        const querySnapshot = await getDocs(teamQuery);
        
        const members = [];
        querySnapshot.forEach((doc) => {
          members.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by role priority to ensure CEO appears first
        members.sort((a, b) => {
          if (a.role === 'ceo') return -1;
          if (b.role === 'ceo') return 1;
          return 0;
        });
        
        setTeamMembers(members);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);

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

  const handleMemberClick = (idx) => {
    setSelectedMember(idx === selectedMember ? null : idx);
  };
  
  const handleCloseCard = () => {
    setSelectedMember(null);
  };

  // Function to render role badge with appropriate styling
  const renderRoleBadge = (role) => {
    const roleStyles = {
      ceo: "bg-orange-100 text-orange-800 border-orange-300",
      manager: "bg-blue-100 text-blue-800 border-blue-300",
      mentor: "bg-green-100 text-green-800 border-green-300",
      volunteer: "bg-purple-100 text-purple-800 border-purple-300",
      default: "bg-gray-100 text-gray-800 border-gray-300"
    };

    const roleLabels = {
      ceo: "מייסד ומנכ\"ל",
      manager: "מנהל",
      mentor: "מנטור",
      volunteer: "מתנדב",
    };

    const style = roleStyles[role] || roleStyles.default;
    const label = roleLabels[role] || role;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        {label}
      </span>
    );
  };

  return (
    <section
      id="about-section"
      className="relative py-20 md:py-28 bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 overflow-hidden"
      dir="rtl"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-pink-200/30 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-orange-300/20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
        {/* Vision & Mission Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="font-gveret-levin text-4xl md:text-5xl lg:text-6xl text-orange-800 mb-4 drop-shadow">
            שורשים של אור – החזון שמוביל אותנו
          </h2>
          <div className="h-1 w-28 bg-orange-500 mx-auto mb-6 rounded-full animate-pulse"></div>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            כל ילד וילדה נולדים עם אור פנימי חד-פעמי. דרך אמנות, יצירה וחיבורים אנושיים, אנו יוצרים עבורם קרקע לצמיחה – מעץ צעיר למנהיג פורח.
          </p>
          <blockquote className="mt-8 italic text-orange-800 font-semibold text-lg md:text-xl">
            "לגלות את האור שבתוכי, זו תחילתה של הנהגה אמיתית"
          </blockquote>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mb-16">
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
                className={`transition-all duration-300 rounded-3xl shadow-lg bg-white/90 backdrop-blur-md h-full ${
                  hoveredIndex === index
                    ? 'border-2 border-orange-400 shadow-orange-200 shadow-2xl scale-[1.03] -translate-y-2'
                    : 'border border-transparent'
                }`}
              >
                <CardContent className="p-6 md:p-8 text-center h-full flex flex-col">
                  <div className="mb-4 md:mb-6 flex justify-center">
                    <div className={`p-3 rounded-full ${
                      hoveredIndex === index ? 'bg-orange-100 scale-110' : 'bg-orange-50'
                    } transition-all duration-300`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action */}
        <motion.div
          className="my-16 md:my-24 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
        >
          <div className="p-3 bg-green-100 rounded-full inline-flex mb-4">
            <TreePine className="h-8 w-8 md:h-10 md:w-10 text-green-700" />
          </div>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            כמו שתיל שמקבל את כל מה שצריך כדי לצמוח לעץ מלא פירות – כך אנו רואים את תהליך ההתפתחות של בני הנוער.
          </p>
          <a href="/community">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-base md:text-lg px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-orange-300/50 hover:shadow-xl hover:-translate-y-1">
              קראו עוד על העמותה שלנו
            </Button>
          </a>
        </motion.div>

        {/* Regional Impact Note */}
        <motion.div
          className="mt-16 md:mt-20 bg-orange-100 border-r-8 border-orange-400 rounded-xl p-4 md:p-6 shadow-lg text-gray-800 text-base md:text-lg leading-relaxed"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
        >
          <p>
            פעילותינו נפרשת מצפון ועד דרום – מחדרה ועד גדרה – ומקיפה מגזרים שונים. כל משתתף זוכה לליווי אישי של מנטור מקצועי אחת לשלושה שבועות בזום, וכן לתמיכה גם לבני המשפחה המלווים את התהליך היצירתי מקרוב.
          </p>
        </motion.div>

        {/* Featured Team Members Preview Section */}
        <motion.div
          className="mt-20 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeSlideUp}
        >
          <h3 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">צוות העמותה</h3>
          <p className="text-gray-600 mb-8">הכירו את האנשים שמובילים את החזון שלנו</p>

          {/* Container for relative positioning */}
          <div className="relative">
            {loading ? (
              // Loading state
              <div className="flex justify-center items-center py-12">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Grid of featured team members - show up to 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {teamMembers.slice(0, 3).map((member, idx) => (
                    <motion.div 
                      key={member.id} 
                      onClick={() => handleMemberClick(idx)}
                      className={`bg-white/90 rounded-2xl p-4 md:p-6 shadow-lg cursor-pointer transform transition-all duration-300 ${
                        member.role === 'ceo' ? 'border-2 border-orange-400 relative' : ''
                      } ${
                        selectedMember === idx ? 'scale-[1.03]' : 'hover:shadow-xl hover:-translate-y-1'
                      }`}
                      whileHover={{ scale: 1.03 }}
                    >
                      {/* CEO Badge if applicable */}
                      {member.role === 'ceo' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg z-10">
                          מייסד
                        </div>
                      )}
                      
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 overflow-hidden bg-orange-100">
                        <img 
                          src={member.photoURL || '/team.png'} 
                          alt={member.displayName} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                        />
                      </div>
                      <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{member.displayName}</h4>
                      <div className="mb-2 flex justify-center">
                        {renderRoleBadge(member.role)}
                      </div>
                      <p className="text-gray-600 text-sm md:text-base line-clamp-2 mb-2">{member.title || 'חבר צוות'}</p>
                      <p className="text-orange-500 text-xs md:text-sm mt-2">לחץ לפרטים נוספים</p>
                    </motion.div>
                  ))}
                </div>

                {/* View All Team Members button */}
                <div className="mt-8 text-center">
                  <a href="/team">
                    <Button variant="outline" className="border-orange-400 text-orange-600 hover:bg-orange-50">
                      <span>הכירו את כל הצוות</span>
                      <ExternalLink className="h-4 w-4 mr-2" />
                    </Button>
                  </a>
                </div>

                {/* Expanded team member card - Displayed in the middle of the page */}
                <AnimatePresence>
                  {selectedMember !== null && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={scaleIn}
                      className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseCard}></div>
                      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <button 
                          onClick={handleCloseCard}
                          className="absolute top-4 left-4 bg-white/80 rounded-full p-1 hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-6 w-6 text-gray-600" />
                        </button>

                        {teamMembers[selectedMember] && (
                          <div className="p-6 md:p-8 flex flex-col md:flex-row md:gap-6 items-center md:items-start text-right">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mb-4 md:mb-0 overflow-hidden flex-shrink-0 border-4 border-orange-200">
                              <img 
                                src={teamMembers[selectedMember].photoURL || '/default_user_pic.jpg'} 
                                alt={teamMembers[selectedMember].displayName} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{teamMembers[selectedMember].displayName}</h3>
                                <div>
                                  {renderRoleBadge(teamMembers[selectedMember].role)}
                                </div>
                              </div>
                              <p className="text-lg text-orange-500 font-medium mb-4">{teamMembers[selectedMember].title || 'חבר צוות העמותה'}</p>
                              
                              <p className="text-gray-700 mb-6 leading-relaxed">
                                {teamMembers[selectedMember].bio || 'חבר צוות מסור המחויב לחזון העמותה ופועל לקידום הערכים והמטרות שלנו.'}
                              </p>
                              
                              {teamMembers[selectedMember].achievements && (
                                <div className="mb-4 bg-orange-50 p-3 rounded-lg">
                                  <h4 className="font-semibold text-gray-800 mb-2">הישגים</h4>
                                  <p className="text-gray-700">{teamMembers[selectedMember].achievements}</p>
                                </div>
                              )}
                              
                              {teamMembers[selectedMember].expertise && (
                                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                                  <h4 className="font-semibold text-gray-800 mb-2">תחומי מומחיות</h4>
                                  <p className="text-gray-700">{teamMembers[selectedMember].expertise}</p>
                                </div>
                              )}

                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;