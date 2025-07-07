import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import ElementalLoader from '../../theme/ElementalLoader';
import { toast } from 'sonner';

const PartnerLogoGallery = () => {
  const [partnerLogos, setPartnerLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Triple logos for smoother infinite scroll
  const duplicatedLogos = partnerLogos.length > 0 ? [...partnerLogos, ...partnerLogos, ...partnerLogos] : [];

  useEffect(() => {
    if (!db) {
      console.error("Firebase Firestore instance not available. Check ../../config/firbaseConfig.js");
      setError("אירעה שגיאה: מסד הנתונים אינו זמין.");
      setLoading(false);
      toast.error("אירעה שגיאה בטעינת לוגואים: מסד נתונים אינו זמין.");
      return;
    }

    const partnersCollectionRef = collection(db, "partners");
    const q = query(partnersCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogos = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            logo: data.logo
          };
        })
        .filter(partner => partner.logo); // Only include partners that have a logo

      setPartnerLogos(fetchedLogos);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching partner logos:", err);
      setError("אירעה שגיאה בטעינת לוגואים.");
      setLoading(false);
      toast.error("אירעה שגיאה בטעינת לוגואים של שותפים.");
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ElementalLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

 if (partnerLogos.length === 0) {
  return null; // Don't render anything if no logos are available
}

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
        {/* Enhanced title with subtitle */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent sm:text-5xl mb-4 py-4">
            השותפים שלנו
          </h2>
        </div>

        {/* Enhanced scrolling container */}
        <div className="relative w-full overflow-hidden">
          <div className="inline-flex space-x-12 animate-scroll">
            {duplicatedLogos.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center p-4 group py-6"
              >
                <div className="relative">
                  <img
                    className="h-20 w-auto max-w-40 object-contain  transition-all duration-700 hover:scale-110 group-hover:drop-shadow-lg"
                    src={partner.logo}
                    alt={`${partner.name} Logo`}
                    title={partner.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150x75.png?text=Logo";
                      e.target.alt = `Failed to load ${partner.name} logo`;
                    }}
                  />
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-blue-400 to-purple-400 blur-xl -z-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style>
        {`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 45s linear infinite;
        }

        /* Pause on hover for better user experience */
        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Smooth scrolling for reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation-duration: 60s;
          }
        }
      `}
      </style>
    </section>
  );
};

export default PartnerLogoGallery;