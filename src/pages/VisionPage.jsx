import Layout from '../components/layout/Layout';

const VisionPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              חזון עמותת "לגלות את האור – הנני"
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </header>

          {/* Main Vision Statement */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100">
              <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">
                מעוררים את המנהיגות הדיאולוגית של דור המחר!!!!
              </h2>
              
              <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                <p className="text-xl font-medium text-blue-900">
                  בלב כל נער ונערה בישראל טמון אור ייחודי – כישרון שממתין להתגלות, קול שמבקש להישמע, והשפעה שעתידה לשנות עולמות.
                </p>
                
                <p>
                  אנחנו ב"לגלות את האור – הנני" יוצרים מהפכה שקטה: מפתחים מנהיגות אותנטית דרך כוחה המעצים של האמנות. אנו מאמינים שיצירה אינה רק ביטוי עצמי, אלא דרך עוצמתית לפיתוח מיומנויות מנהיגות, חשיבה יצירתית וביטחון עצמי שישרתו את החברה כולה.
                </p>
              </div>
            </div>
          </section>

          {/* Journey Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-purple-800 mb-8 text-center">
                המסע שלנו: מיצירה למנהיגות
              </h2>
              
              <p className="text-lg text-gray-700 mb-8 text-center">
                בתכנית הארבע-שנתית שלנו, משתתפים עוברים מסע טרנספורמטיבי:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-700 mb-3">שנת הגילוי</h3>
                  <p className="text-gray-600">מפגש ראשוני עם האור הפנימי והפוטנציאל היצירתי</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-green-500">
                  <h3 className="text-xl font-bold text-green-700 mb-3">שנת הפיתוח</h3>
                  <p className="text-gray-600">העמקה באמנות ומיומנויות מנהיגות</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-orange-500">
                  <h3 className="text-xl font-bold text-orange-700 mb-3">שנת היישום</h3>
                  <p className="text-gray-600">הובלת יוזמות קהילתיות ופרויקטים חברתיים</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-purple-500">
                  <h3 className="text-xl font-bold text-purple-700 mb-3">שנת ההשפעה</h3>
                  <p className="text-gray-600">מעבר ממשתתפים למנטורים ויצירת מורשת אישית</p>
                </div>
              </div>
            </div>
          </section>

          {/* Unique Features */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">
                מה שהופך אותנו לייחודיים
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-bold text-blue-700 mb-1">שילוב עולמות</h3>
                    <p className="text-gray-600">מזיגה מדויקת בין אמנויות שונות לבין פיתוח מנהיגות מעשית</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-bold text-green-700 mb-1">ליווי אישי</h3>
                    <p className="text-gray-600">מנטורים מקצועיים המלווים כל משתתף לאורך המסע</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-bold text-purple-700 mb-1">קהילתיות</h3>
                    <p className="text-gray-600">יצירת רשת תמיכה של משפחות, אמנים ומובילי דעה</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-bold text-orange-700 mb-1">כפר אמנים צעירים</h3>
                    <p className="text-gray-600">מרחב פיזי ורעיוני לצמיחת קהילת יוצרים-מנהיגים</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-bold text-red-700 mb-1">נגישות</h3>
                    <p className="text-gray-600">פעילות ארצית המקיפה את כל המגזרים והאוכלוסיות בישראל</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">
                השפעה רב-מעגלית
              </h2>
              
              <p className="text-lg text-gray-700 mb-6 text-center">
                כל משתתף ב"לגלות את האור" אינו רק מפתח את עצמו, אלא מהווה גל של השפעה:
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-md border-r-4 border-blue-400">
                  <p className="text-gray-700">ביצירת זהות אישית מגובשת ובעלת משמעות</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-md border-r-4 border-green-400">
                  <p className="text-gray-700">בהעצמת הקהילה באמצעות יוזמות חברתיות-אמנותיות</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-md border-r-4 border-purple-400">
                  <p className="text-gray-700">בעיצוב פני החברה הישראלית דרך דור חדש של מנהיגים יצירתיים</p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-6">הצטרפו למהפכה</h2>
              <p className="text-xl mb-8">
                השקעה ב"לגלות את האור – הנני" היא השקעה בעתיד – ביצירת דור של מנהיגים אותנטיים שיובילו את החברה הישראלית למחוזות חדשים.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-blue-800 mb-6">צור קשר</h2>
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-800">ענת זגרון בוג'יו | מייסדת ומנכ"לית</p>
                <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 md:space-x-reverse">
                  <a href="mailto:Boggio3@gmail.com" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="mr-2">📧</span>
                    Boggio3@gmail.com
                  </a>
                  <a href="tel:050-2470857" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="mr-2">📱</span>
                    050-2470857
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default VisionPage;