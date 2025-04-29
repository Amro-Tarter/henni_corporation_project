import React from 'react';
import CTAButton from './CTAButton';

const JoinUs = () => {
  return (
    <section
      id="join-us"
      className="py-16 md:py-24 bg-gradient-to-br from-fire-dark/20 to-fire/30 relative overflow-hidden"
    >
      {/* Decorative ember effects - Using fire accent colors */}
      <div className="absolute top-10 left-1/4 w-2 h-2 ember bg-fire-accent"></div>
      <div
        className="absolute top-20 left-1/2 w-3 h-3 ember bg-fire-glow"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute top-15 right-1/4 w-2 h-2 ember bg-fire-accent"
        style={{ animationDelay: '0.5s' }}
      ></div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-gveret-levin text-3xl md:text-5xl text-fire-dark mb-6">
            הצטרפו אלינו
          </h2>

          <p className="text-lg md:text-xl mb-8 text-fire-dark/90">
            אנחנו מזמינים אתכם להיות חלק ממסע של גילוי עצמי והעצמה!
            הצטרפו אלינו ליצירת עתיד מלא אור, חיבור אמיתי והשפעה חיובית.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Why Join - Using fire gradient */}
            <div className="bg-fire/5 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-fire/20">
              <h3 className="font-gveret-levin text-xl mb-4 text-fire-dark">למה להצטרף?</h3>
              <ul className="text-right space-y-2 mb-4">
                <li className="flex items-center">
                  <span className="ml-2 text-fire-accent">✦</span>
                  <span className="text-fire-dark">פיתוח מיומנויות יצירה וביטוי עצמי</span>
                </li>
                {/* ... other list items ... */}
              </ul>
            </div>

            {/* How to Join - Using complementary earth tones */}
            <div className="bg-earth-light/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-earth/20">
              <h3 className="font-gveret-levin text-xl mb-4 text-earth-dark">איך מצטרפים?</h3>
              <p className="mb-4 text-earth-dark/90">
                מלאו את הטופס המקוון שלנו כדי להצטרף לארגון ולהתחיל את המסע שלכם
                של גילוי עצמי והעצמה.
              </p>
              <CTAButton
                href="https://forms.monday.com/forms/af28672efe2a47320cd729b1d01f6841?r=euc1"
                variant="inverse-fire"
                size="lg"
                className="hover:bg-fire-glow"
              >
                הצטרפו לארגון
              </CTAButton>
            </div>
          </div>

          {/* Support Us - Strong fire gradient */}
          <div className="bg-gradient-to-r from-fire-dark/80 to-fire/90 rounded-lg p-8 shadow-lg">
            <h3 className="font-gveret-levin text-2xl mb-6 text-fire-light">תמכו במיזם</h3>
            <p className="mb-6 text-fire-light/95">
              עזרו לנו להרחיב את ההשפעה החיובית שלנו ולהגיע ליותר בני נוער.
              כל תרומה מסייעת לנו ליצור מרחבים של יצירה, התפתחות והעצמה.
            </p>
            <CTAButton
              href="https://mrng.to/pFaSV3RKqT"
              variant="inverse-fire"
              size="lg"
              className="hover:bg-fire-glow"
            >
              תרמו עכשיו
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;