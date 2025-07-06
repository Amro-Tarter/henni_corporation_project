import React from 'react';
import Layout from '../components/layout/Layout'; // Importing the Layout component for consistent page structure
import { Sparkles, Handshake, Speech, MapPin, Building, Sun } from 'lucide-react'; // Importing relevant icons from lucide-react

const GoalsPage = () => {
  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-yellow-100 py-16 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto"> {/* Increased max-width for better content distribution */}
        {/* Header Section */}
        <header className="text-center mb-20 relative">
          {/* Large, subtle background icon */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-yellow-700 mb-4 drop-shadow-lg relative z-10 py-6">
            המטרות שלנו בעמותת לגלות את האור - הנני
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto relative z-10 font-medium">
            מציתים את הניצוץ הפנימי, בונים מנהיגות משפיעה ויוצרים חיבורים בחברה הישראלית.
          </p>
          <div className="w-32 h-2 bg-gradient-to-r from-green-500 to-yellow-500 mx-auto rounded-full shadow-inner"></div>
        </header>

        {/* Goals Content - Structured with cards */}
        <section className="space-y-12 mb-20">
          {/* Introduction/Core Mission */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-green-200 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl">
            <h2 className="text-2xl md:text-4xl font-extrabold text-green-800 mb-8 text-center leading-tight">
              הליבה של פעילותנו - גילוי, יצירה והובלה
            </h2>
            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-700">
              <p className="text-xl md:text-2xl font-semibold text-green-900 border-r-6 border-green-400 pr-6 pl-2 italic">
                אנו פועלים עם בני ובנות נוער מכל המגזרים בישראל – מגדרה ועד חדרה –
                ומסייעים להם לגלות את הקול הייחודי, לפתח את היצירתיות ולבסס את הזהות העצמית שלהם דרך עולם האמנות.
              </p>
              <p>
                העמותה מכשירה אותם להתפתח ולהפוך למנהיגים אותנטיים, אמיצים ובעלי השפעה חברתית אמיתית.
              </p>
              <p>
                מה שמניע אותנו היא האמונה הבלתי מעורערת שיצירה אינה רק ביטוי אישי – אלא מנוע רב עוצמה לשינוי חברתי משמעותי.
              </p>
            </div>
          </div>

          {/* Key Pillars/Approach */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pillar 1: Education & Art Integration */}
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-yellow-200 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Sparkles className="w-16 h-16 text-yellow-600 mb-6 drop-shadow-md" />
              <h3 className="text-2xl md:text-3xl font-extrabold text-yellow-800 mb-4">
                שילוב ייחודי: חינוך ואמנות
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                אנו משלבים בין חינוך לאמנות, בין עומק רגשי לפרקטיקה מנהיגותית – בגישה חדשנית הנקראת מנהיגות דיאלוגית:
                המתבססת על הקשבה עמוקה, שיתוף פעולה, כנות ויצירת קשרים אנושיים אמיתיים.
              </p>
            </div>

            {/* Pillar 2: Dialogue & Social Action */}
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-green-200 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Speech className="w-16 h-16 text-green-600 mb-6 drop-shadow-md" />
              <h3 className="text-2xl md:text-3xl font-extrabold text-green-800 mb-4">
                מנהיגות דיאלוגית לשינוי חברתי
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                ב"לגלות את האור", בני הנוער לא רק יוצרים – הם לומדים להוביל שיח פורה,
                לבנות גשרים אמיתיים בין מגזרים, ולפעול למען עתיד טוב יותר בחברה שמייחלת לחיבור.
              </p>
            </div>
          </div>

          {/* Support System */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-200 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 md:space-x-reverse">
              <Handshake className="w-20 h-20 text-blue-600 flex-shrink-0 drop-shadow-md" />
              <div className="text-center md:text-right">
                <h3 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-4">
                  מערך תמיכה מקיף: מנטור אישי וליווי משפחתי
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  לכל משתתף ומשתתפת בתוכניותינו מוצמד מנטור אישי המלווה אותו צעד אחר צעד, והמשפחה כולה זוכה לליווי ותמיכה –
                  כי אנו מאמינים שצמיחה אמיתית ומשמעותית מתרחשת בתוך מעגל תומך ושלם, לא לבד.
                </p>
              </div>
            </div>
          </div>

          {/* Uniqueness Statement */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-orange-200 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 md:space-x-reverse">
              <MapPin className="w-20 h-20 text-orange-600 flex-shrink-0 drop-shadow-md" />
              <div className="text-center md:text-right">
                <h3 className="text-2xl md:text-3xl font-extrabold text-orange-800 mb-4">
                  אנו חלוצים בתחום: גישה שאין כדוגמתה
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  אין עוד גוף בארץ או בעולם שפועל בגילאים אלו (נוער),
                  עם גישה זו (מנהיגות דיאלוגית דרך יצירה), ובעומק זה של חיבור –
                  כדי להגיע לנוער מכל גווני הקשת החברתית הישראלית ולחבר ביניהם.
                </p>
              </div>
            </div>
          </div>

          {/* Founder's Vision */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-purple-200 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 md:space-x-reverse">
              <Building className="w-20 h-20 text-purple-600 flex-shrink-0 drop-shadow-md" />
              <div className="text-center md:text-right">
                <h3 className="text-2xl md:text-3xl font-extrabold text-purple-800 mb-4">
                  החזון של המייסדת והמנכ״לית
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed font-semibold">
                  העמותה הוקמה על ידי <span className="text-purple-700">ענת זגרון בוג'יו</span> – שהבינה שהשינוי האמיתי בישראל
                  מתחיל במנהיגות דיאלוגית דרך יצירה, שמחברת בין בני נוער מכל המגזרים.
                  כך אנו מעניקים להם קול, זהות וכוח להשפיע ולבנות עתיד חדש – ביחד.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-green-300 animate-pulse-subtle">
            <Sun className="w-24 h-24 text-green-600 mx-auto mb-6 opacity-80" />
            <p className="text-xl md:text-2xl font-extrabold text-green-800 leading-tight mb-6">
              אם מה שאמרנו נוגע בך, אפילו במעט 
              <br className="hidden sm:block"/> <span className="text-yellow-700">יש לך מקום איתנו.</span>
            </p>
            <p className="text-lg md:text-xl text-gray-700">
              בין אם כמתנדב, כשותף, או פשוט כמישהו שרוצה להיות חלק מהאור הגדול הזה.
            </p>
          </div>

        </section>
      </div>
    </div>
    </Layout>
  );
};

export default GoalsPage;
