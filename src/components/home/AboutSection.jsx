import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandHeart, Users, Heart, TreePine, X, Edit2 } from 'lucide-react';

const AboutSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      setLoading(true);
      try {
        // Query users collection for admin role
        const adminQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin')
        );
        
        console.log('Fetching admin users...');
        const querySnapshot = await getDocs(adminQuery);
        
        const admins = [];
        
        // Process each admin user and fetch their profile if needed
        for (const userDoc of querySnapshot.docs) {
          const userData = userDoc.data();
          console.log('Admin user document:', userDoc.id, userData);
          
          // Get the associated_id from userData or use document id
          const associatedId = userData.associated_id || userDoc.id;
          
          // Try to fetch the user's profile for additional info
          let profileData = {};
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', associatedId));
            profileData = profileDoc.exists() ? profileDoc.data() : {};
          } catch (profileError) {
            console.log('No profile found for user:', associatedId);
          }
          
          // Create admin object with data from both collections
          const admin = {
            id: userDoc.id,
            associated_id: associatedId,
            displayName: profileData.displayName || userData.displayName || userData.email?.split('@')[0] || 'מנהל',
            role: userData.role,
            title: userData.title || profileData.title || 'מנהל מערכת',
            photoURL: profileData.photoURL || userData.photoURL || '/default_user_pic.jpg',
            bio: profileData.bio || userData.bio || 'מנהל מערכת מנוסה המוביל את פעילות העמותה ומחויב לחזון ולמטרות שלנו.',
            email: userData.email,
            is_active: userData.is_active !== false // default to true if not specified
          };
          
          // Only add active admins
          if (admin.is_active) {
            admins.push(admin);
          }
        }
        
        console.log('Processed admin users:', admins);
        
        // Sort by display name
        admins.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        setTeamMembers(admins);
      } catch (error) {
        console.error("Error fetching admin users:", error);
        // Set empty array on error
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminUsers();
  }, []);

  const features = [
    {
      title: 'החזון שלנו',
      icon: <Heart className="h-8 w-8 text-pink-600" />,
      description: 'ב"עמותת לגלות את האור - הנני" אנו מאמינים שכל נער ונערה בישראל נושאים בתוכם אור ייחודי.',
    },
    {
      title: 'המטרה שלנו',
      icon: <Users className="h-8 w-8 text-orange-500" />,
      description: 'יצירת דור חדש של מנהיגים צעירים, רגישים ומודעים – דרך הבמה היצירתית.',
    },
    {
      title: 'ההשפעה שלנו',
      icon: <HandHeart className="h-8 w-8 text-green-600" />,
      description: 'התוכניות שלנו משנות חיים. אנו רואים את הנוער לא רק כאמנים – אלא ככוחות של שינוי.',
    },
  ];

  const handleMemberClick = (idx) => {
    setSelectedMember(idx === selectedMember ? null : idx);
  };
  
  const handleCloseCard = () => {
    setSelectedMember(null);
  };

  return (
    <section
      id="about-section"
      className="relative py-12 md:py-16 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-100 overflow-hidden"
    >
      {/* Compact decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-pink-200/20 -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-orange-300/15 translate-x-1/3 translate-y-1/3 blur-2xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Compact Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-orange-800 mb-3">
            שורשים של אור – החזון שמוביל אותנו
          </h2>
          <div className="h-1 w-20 bg-orange-500 mx-auto mb-4 rounded-full"></div>
          <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
            כל ילד וילדה נולדים עם אור פנימי חד-פעמי. דרך אמנות, יצירה וחיבורים אנושיים, אנו יוצרים עבורם קרקע לצמיחה.
          </p>
        </div>

        {/* Compact Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`transition-all duration-300 ${
                hoveredIndex === index ? 'transform -translate-y-1' : ''
              }`}
            >
              <Card className={`h-full bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-2xl ${
                hoveredIndex === index ? 'shadow-lg shadow-orange-200/50' : ''
              }`}>
                <CardContent className="p-4 md:p-6 text-center h-full flex flex-col">
                  <div className="mb-3 flex justify-center">
                    <div className={`p-2 rounded-full bg-orange-50 ${
                      hoveredIndex === index ? 'scale-110' : ''
                    } transition-all duration-300`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Compact CTA */}
        <div className="text-center mb-10 bg-white/60 backdrop-blur-sm rounded-2xl p-6 mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-4">
            <TreePine className="h-6 w-6 text-green-700" />
            <span className="text-gray-700 font-medium">צפו בניוזלטר שלנו</span>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            קראו עוד
          </Button>
        </div>

        {/* Compact Team Section */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-orange-800 mb-2">צוות העמותה</h3>
          <p className="text-gray-600 mb-6 text-sm md:text-base">הכירו את האנשים שמובילים את החזון שלנו</p>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              <span className="mr-3 text-gray-600">טוען מנהלים...</span>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>לא נמצאו מנהלים במערכת</p>
            </div>
          ) : (
            <>
              {/* Compact Team Grid - Show only first 3 members */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {teamMembers.slice(0, 3).map((member, idx) => (
                  <div 
                    key={member.id} 
                    onClick={() => handleMemberClick(idx)}
                    className="bg-white/90 rounded-xl p-4 shadow-md cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-orange-100"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-3 overflow-hidden bg-orange-100">
                      <img 
                        src={member.photoURL} 
                        alt={member.displayName} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                      />
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1">{member.displayName}</h4>
                    <p className="text-gray-600 text-xs md:text-sm mb-1">{member.title}</p>
                    <p className="text-orange-500 text-xs">לחץ לפרטים נוספים</p>
                  </div>
                ))}
              </div>

              {/* Compact View All Button - Show count if more than 3 */}
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                {teamMembers.length > 3 
                  ? `הכירו את כל הצוות (${teamMembers.length} חברים)` 
                  : 'הכירו את כל הצוות'
                }
              </Button>

              {/* Enhanced Modal */}
              <AnimatePresence>
                {selectedMember !== null && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div 
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                      onClick={handleCloseCard}
                    ></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100">
                      <button 
                        onClick={handleCloseCard}
                        className="absolute top-4 left-4 bg-white/90 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-md z-10"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                      </button>

                      {teamMembers[selectedMember] && (
                        <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-right">
                          <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-orange-200 shadow-lg">
                            <img 
                              src={teamMembers[selectedMember].photoURL} 
                              alt={teamMembers[selectedMember].displayName} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          
                          <div className="flex-1 text-center md:text-right">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {teamMembers[selectedMember].displayName}
                            </h3>             
                            <p className="text-lg text-orange-500 font-medium mb-4">
                              {teamMembers[selectedMember].title}
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                              {teamMembers[selectedMember].bio}
                            </p>
                            
                            <div className="mt-6 flex justify-center md:justify-end">
                              <Button 
                                onClick={handleCloseCard}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                              >
                                סגור
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;