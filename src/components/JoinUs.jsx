import React from 'react';
import CTAButton from './CTAButton';

const JoinUs = () => {
  return (
    <section
      id="join-us"
      className="py-16 md:py-24 bg-gradient-to-br from-theme-bg-secondary/10 to-theme-bg-primary/10 relative overflow-hidden"
    >
      {/* Decorative ember effects */}
      <div className="absolute top-10 left-1/4 w-2 h-2 ember bg-theme-heading-accent"></div>
      <div
        className="absolute top-20 left-1/2 w-3 h-3 ember bg-theme-heading-accent"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute top-15 right-1/4 w-2 h-2 ember bg-theme-heading-accent"
        style={{ animationDelay: '0.5s' }}
      ></div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-gveret-levin text-3xl md:text-5xl text-theme-text-primary mb-6">
            הצטרפו אלינו
          </h2>

          <p className="text-lg md:text-xl mb-8 text-theme-text-primary">
            אנחנו מזמינים אתכם להיות חלק ממסע של גילוי עצמי והעצמה!
            הצטרפו אלינו ליצירת עתיד מלא אור, חיבור אמיתי והשפעה חיובית.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Why Join */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-theme-bg-primary/20">
              <h3 className="font-gveret-levin text-xl mb-4 text-theme-text-primary">למה להצטרף?</h3>
              <ul className="text-right space-y-2 mb-4">
                <li className="flex items-center">
                  <span className="ml-2 text-theme-heading-accent">✦</span>
                  <span className="text-theme-text-primary">פיתוח מיומנויות יצירה וביטוי עצמי</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-theme-heading-accent">✦</span>
                  <span className="text-theme-text-primary">חיבור לקהילה תומכת ומעצימה</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-theme-heading-accent">✦</span>
                  <span className="text-theme-text-primary">הזדמנויות למנהיגות והשפעה חברתית</span>
                </li>
              </ul>
            </div>

            {/* How to Join */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-theme-bg-primary/20">
              <h3 className="font-gveret-levin text-xl mb-4 text-theme-text-primary">איך מצטרפים?</h3>
              <p className="mb-4 text-theme-text-primary">
                מלאו את הטופס המקוון שלנו כדי להצטרף לארגון ולהתחיל את המסע שלכם
                של גילוי עצמי והעצמה.
              </p>
              <CTAButton
                href="https://forms.monday.com/forms/af28672efe2a47320cd729b1d01f6841?r=euc1"
                variant="fire"
                className="w-full justify-center"
              >
                הצטרפו לארגון
              </CTAButton>
            </div>
          </div>

          {/* Support Us */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-theme-bg-primary/20">
            <h3 className="font-gveret-levin text-2xl mb-6 text-theme-text-primary">תמכו במיזם</h3>
            <p className="mb-6 text-theme-text-primary">
              עזרו לנו להרחיב את ההשפעה החיובית שלנו ולהגיע ליותר בני נוער.
              כל תרומה מסייעת לנו ליצור מרחבים של יצירה, התפתחות והעצמה.
            </p>
            <CTAButton
              href="https://mrng.to/pFaSV3RKqT"
              variant="fire"
              size="lg"
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
