import React from 'react';
import Layout from '../components/layout/Layout'; 
import { Handshake, Lightbulb, Projector, Award, Wrench, Gem, User, Mail, Zap, Compass, Users } from 'lucide-react'; // Importing relevant icons from lucide-react

const InviteCollaborationPage = () => {
  return (
    <Layout> 
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 py-16 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto"> {/* Increased max-width for better content distribution */}
        {/* Header Section */}
        <header className="text-center mb-20 relative">
          {/* Large, subtle background icon */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-4 drop-shadow-lg relative z-10 py-12">
            הזמנה לשותפות עם " עמותת לגלות את האור - הנני"
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto relative z-10 font-medium">
            בואו לגלות איתנו את הכוח הטמון במנהיגות צעירה ויצירתית.
          </p>
          <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full shadow-inner"></div>
        </header>

        {/* Intro */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-200 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl">
            <div className="space-y-6 text-lg md:text-xl text-gray-700 leading-relaxed">
              <p className="font-semibold text-blue-800">שלום רב,</p>
              <p>
                תודה רבה על התעניינותכם ב"לגלות את האור - הנני". אנו נרגשים לשתף אתכם במידע מפורט על
                החזון שלנו, הפעילות הענפה שאנו מקיימים כיום, ומעמדה הנוכחי של העמותה.
              </p>
              <p>
                אנו מאמינים בכוחה של שותפות אמתית כדי להאיר דרכים חדשות ולחולל שינוי משמעותי.
              </p>
            </div>
          </div>
        </section>

        {/* Main Projects */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-200">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-10 text-center leading-tight">
              המיזמים המרכזיים שלנו
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Zap, title: 'פסטיבל מנהיגות נוער בצפון', description: 'אירוע מרכזי לפיתוח מנהיגות דרך אמנות ויצירה, המצית השראה וחיבור.' },
                { icon: Compass, title: 'סמינר מנהיגות בבית ברל', description: 'חמישה ימים אינטנסיביים ועוצמתיים של פיתוח מנהיגות מעשית ודיאלוגית.' },
                { icon: Users, title: 'תכנית הליבה "מסע הגילוי העצמי"', description: 'מסלול ארבע-שנתי ייחודי למשפחות נבחרות, המלווה בצמיחה אישית וקהילתית.' },
                { icon: Projector, title: 'פרויקט מקהלות גוספל', description: 'בניית מקהלות מקומיות עם ילדים ובני נוער, המהווה מנוף חזק למנהיגות קהילתית.' },
              ].map((project, index) => (
                <div key={index} className="flex items-start space-x-4 space-x-reverse p-6 rounded-2xl bg-blue-50 border border-blue-100 shadow-md transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  <project.icon className="flex-shrink-0 w-8 h-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-800 text-xl mb-2">{project.title}</h3>
                    <p className="text-gray-700 text-base">{project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-purple-200">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-10 text-center leading-tight">
              הישגים בולטים ופעילות נוכחית
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-b-4 border-green-500 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                  <h3 className="font-extrabold text-green-700 text-2xl">קהילה ופיתוח מנהיגות</h3>
                </div>
                <ul className="list-none space-y-3 text-gray-700 text-lg">
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-green-500 mt-1">✔</span>
                    <p>קהילת "האור" בווטסאפ: למעלה מ-100 חברים פעילים ונלהבים.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-green-500 mt-1">✔</span>
                    <p>רשת שגרירים וידידי העמותה מגובשת, הפועלת לקידום מנהיגות צעירה ברחבי הארץ.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-green-500 mt-1">✔</span>
                    <p>רשימת מנטורים מקצועיים מובחרים מתחום האמנויות, המלווים את המנהיגים הצעירים.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-green-500 mt-1">✔</span>
                    <p>מקהלת גוספל פעילה המשמשת כמודל לפיתוח מנהיגות באמצעות כוחה של המוזיקה.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-green-500 mt-1">✔</span>
                    <p>"שבט העמותות": קואליציה אסטרטגית של ארבע מנכ"ליות עמותות לחיזוק מנהיגות נשית.</p>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border-b-4 border-purple-500 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                  <h3 className="font-extrabold text-purple-700 text-2xl">תשתית דיגיטלית וארגונית</h3>
                </div>
                <ul className="list-none space-y-3 text-gray-700 text-lg">
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-purple-500 mt-1">✔</span>
                    <p>אתר אינטרנט מקצועי חדשני שהוקם בשיתוף פעולה עם סטודנטים ערבים ממכללת עזריאלי.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-purple-500 mt-1">✔</span>
                    <p>עמוד פייסבוק פעיל ומעודכן באופן שוטף, המרחיב את טווח ההגעה שלנו.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-purple-500 mt-1">✔</span>
                    <p>אישורים רגולטוריים מלאים: מע"מ, מס הכנסה; אישור 46 בתהליכים מתקדמים.</p>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="flex-shrink-0 text-purple-500 mt-1">✔</span>
                    <p>תרומה אנונימית ראשונית בסך 60,000 ש"ח, המשמשת אבן יסוד לפעילותנו.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Needs Section */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-orange-200">
            <div className="flex items-center justify-center mb-6">
              <Wrench className="w-20 h-20 text-orange-600 drop-shadow-md" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-orange-800 mb-10 text-center leading-tight">
              היכן אנו זקוקים למנהיגותך ולכישוריך
            </h2>
            <ul className="list-none space-y-4 text-gray-700 text-lg">
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-orange-500 mt-1">▪</span>
                <p><span className="font-semibold text-orange-700">ניהול אסטרטגי והובלה ארגונית:</span> הובלת המעבר ממיזם יזמי למוסד מובנה ובר קיימא.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-orange-500 mt-1">▪</span>
                <p><span className="font-semibold text-orange-700">גיוס משאבים ופיתוח עסקי:</span> הרחבת בסיס התמיכה והמימון לפעילותנו המתפתחת.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-orange-500 mt-1">▪</span>
                <p><span className="font-semibold text-orange-700">פיתוח שותפויות מקצועיות:</span> חיבור העמותה לגופים ממשלתיים, ארגונים גדולים וקרנות פילנתרופיות.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Contribution */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-blue-200">
            <div className="flex items-center justify-center mb-6">
              <Gem className="w-20 h-20 text-blue-600 drop-shadow-md" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-10 text-center leading-tight">
              איך תוכל/י לתרום לפיתוח המנהיגות אצלנו
            </h2>
            <ul className="list-none space-y-4 text-gray-700 text-lg">
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-blue-500 mt-1">▪</span>
                <p><span className="font-semibold text-blue-700">הובלת אסטרטגיה:</span> סיוע במעבר למודל פעילות בר-קיימא של פיתוח מנהיגות צעירה.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-blue-500 mt-1">▪</span>
                <p><span className="font-semibold text-blue-700">פיתוח משאבים:</span> גיבוש ויישום אסטרטגיית גיוס משאבים לתכניות מנהיגות ארוכות טווח.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-blue-500 mt-1">▪</span>
                <p><span className="font-semibold text-blue-700">ממשל תקין:</span> יצירת מערכת ממשל תקין חזקה, המהווה מודל למנהיגות עבור הדור הצעיר.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-blue-500 mt-1">▪</span>
                <p><span className="font-semibold text-blue-700">יצירת קשרים:</span> חיבור העמותה לרשתות מקצועיות ופילנתרופיות רלוונטיות בתחום פיתוח מנהיגות.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Founder */}
        <section className="mb-16 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-purple-200">
            <div className="flex items-center justify-center mb-6">
              <User className="w-20 h-20 text-purple-600 drop-shadow-md" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-purple-800 mb-10 text-center leading-tight">
              על המייסדת והמנכ"לית - ענת זגרון בוג'יו
            </h2>
            <div className="text-gray-700 text-lg leading-relaxed mb-8">
              <p className="mb-4 text-center">
                שמי ענת זגרון בוג'יו, ואני מייסדת ומנכ"לית העמותה מאז 25 בדצמבר 2024.
                יחד איתי, שש נשים נוספות ומוכשרות מתחומי האמנויות ייסדו את העמותה – צוות מסור ונחוש,
                המביא עמו ניסיון עשיר ותחושת שליחות עמוקה למען פיתוח מנהיגות צעירה בישראל.
              </p>
              <p className="mb-6 text-center">
                עם למעלה מ-25 שנות ניסיון עשיר בתחום החינוך וניהול מיזמים מורכבים,
                הבאתי לעמותה מומחיות ייחודית בפיתוח מנהיגות דרך חדשנות פדגוגית ויצירתיות.
              </p>
            </div>
            <ul className="list-none space-y-3 text-gray-700 text-lg">
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-purple-500 mt-1">▪</span>
                <p><span className="font-semibold text-purple-700">מלווה ומנחה מנהלי בתי ספר:</span> 5 שנים באגף מו"פ במשרד החינוך.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-purple-500 mt-1">▪</span>
                <p><span className="font-semibold text-purple-700">הקמת בי"ס רמת כורזים (2001-2016):</span> הובלה וניהול יוזמות חינוכיות וסביבתיות.</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-purple-500 mt-1">▪</span>
                <p><span className="font-semibold text-purple-700">מנהלת מטה בחירות:</span> מועצה אזורית מרום הגליל (2018).</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-purple-500 mt-1">▪</span>
                <p><span className="font-semibold text-purple-700">חברת הנהלה ויו"ר ועדת איכות הסביבה:</span> במועצה אזורית מרום הגליל (2013-2018).</p>
              </li>
              <li className="flex items-start space-x-4 space-x-reverse">
                <span className="flex-shrink-0 text-purple-500 mt-1">▪</span>
                <p><span className="font-semibold text-purple-700">ניהול תכנית "קמפוס ישראלי בקו הבריאות":</span> תחת תכנית בגפ"ן 56306.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8 animate-fade-in-up">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
            <Mail className="w-24 h-24 text-blue-700 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl text-blue-700 md:text-5xl font-extrabold mb-8 leading-tight">
              הזמנה לשותפות מנהיגותית
            </h2>
            <p className="text-xl text-black md:text-2xl mb-6">
              נשמח מאוד לקבוע פגישה כדי להרחיב ולהעמיק בפרטים, ולענות על כל שאלה שעשויה לעלות.
            </p>
            <p className="mt-4 text-xl md:text-2xl font-semibold text-blue-700">בברכה ובציפייה לשיתוף פעולה פורה,</p>
            <p className="mt-2 text-xl md:text-2xl font-bold text-blue-700">צוות "לגלות את האור - הנני"</p>
            {/* Optional: Add a call to action button */}
            {/* <button className="mt-10 bg-white text-blue-700 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-blue-100 hover:text-blue-800 transition duration-300 text-lg">
              צרו קשר
            </button> */}
          </div>
        </section>
      </div>
    </div>
   </Layout>
  );
};

export default InviteCollaborationPage;
