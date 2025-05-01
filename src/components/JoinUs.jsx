import React from 'react';
import CTAButton from './CTAButton';

const JoinUs = () => {
  return (
    <section
      id="join-us"
      className="relative py-20 md:py-28 bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 overflow-hidden"
      dir="rtl"
    >
      {/* 🔥 Decorative floating embers */}
      <div className="absolute top-10 left-[25%] w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
      <div className="absolute top-24 left-[55%] w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
      <div className="absolute top-32 right-[20%] w-2 h-2 rounded-full bg-red-400 animate-pulse delay-300" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-orange-800 mb-6 drop-shadow-sm">
            הצטרפו אלינו
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-orange-900 leading-relaxed">
            אנחנו מזמינים אתכם להיות חלק ממסע של גילוי עצמי והעצמה!<br />
            הצטרפו אלינו ליצירת עתיד מלא אור, חיבור אמיתי והשפעה חיובית.
          </p>

          {/* 💡 Two-column info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            {/* 🔥 Why Join */}
            <div className="bg-white/70 backdrop-blur-md border border-orange-200 rounded-xl p-6 shadow-md transition-all hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">למה להצטרף?</h3>
              <ul className="space-y-3 text-orange-700 text-lg text-right">
                <li className="flex items-center">
                  <span className="ml-2 text-orange-600">✦</span>
                  פיתוח מיומנויות יצירה וביטוי עצמי
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-orange-600">✦</span>
                  חיבור לקהילה יוצרת ותומכת
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-orange-600">✦</span>
                  השתתפות באירועים ותערוכות
                </li>
              </ul>
            </div>

            {/* 🌱 How to Join */}
            <div className="bg-emerald-100/70 backdrop-blur-md border border-emerald-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">איך מצטרפים?</h3>
              <p className="text-emerald-900 mb-6 text-lg">
                מלאו את הטופס המקוון שלנו והתחילו את המסע שלכם של גילוי עצמי והתפתחות אישית.
              </p>
              <CTAButton
                href="https://forms.monday.com/forms/af28672efe2a47320cd729b1d01f6841?r=euc1"
                variant="inverse-fire"
                size="lg"
                className="hover:bg-orange-300 transition-colors"
              >
                הצטרפו לארגון
              </CTAButton>
            </div>
          </div>

          {/* 🎁 Support Section */}
          <div className="bg-gradient-to-br from-orange-600 to-red-500 text-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all">
            <h3 className="text-3xl font-gveret-levin mb-6">תמכו במיזם</h3>
            <p className="mb-6 text-lg text-orange-50">
              עזרו לנו להרחיב את ההשפעה החיובית שלנו ולהגיע לעוד בני נוער ברחבי הארץ. 
              כל תרומה יוצרת שינוי אמיתי!
            </p>
            <CTAButton
              href="https://mrng.to/pFaSV3RKqT"
              variant="inverse-fire"
              size="lg"
              className="hover:bg-red-600 hover:text-white transition-colors"
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
