import Layout from '../components/layout/Layout';
import { Lightbulb, Users, Handshake, Sun, Sparkles } from 'lucide-react'; // Example icons from lucide-react

const VisionPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto h-full">
          {/* Header Section */}
          <header className="text-center mb-16 relative">
            <h1 className=" text-4xl md:text-5xl lg:text-6xl
              font-extrabold
              text-transparent bg-clip-text
              bg-gradient-to-r from-orange-700 to-orange-900
              mb-4 drop-shadow-lg relative z-10
              leading-tight py-6 ">
              חזון עמותת "לגלות את האור – הנני"
            </h1>
            <div className="w-28 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full shadow-inner"></div>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 h-auto">

            {/* Main Vision Statement */}
            <section className="lg:col-span-8 mb-8 lg:mb-0">
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-orange-200 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl md:text-5xl font-extrabold text-orange-800 mb-8 text-center leading-tight">
                    מעוררים את המנהיגות הדיאולוגית של דור המחר!
                  </h3>

                  <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-700">
                    <p className="text-xl md:text-2xl font-semibold text-orange-900 border-r-6 border-orange-400 pr-6 pl-2 italic">
                      ב"לגלות את האור – הנני", אנו מאמינים עמוקות שבליבו של כל נער ונערה בישראל טמון פוטנציאל בלתי מוגבל – כישרון שמחכה להתגלות, קול שמבקש להישמע, והשפעה שעתידה לעצב עולמות טובים יותר.
                    </p>

                    <p>
                      אנו יוצאים למסע של מהפכה שקטה: לא רק ללמד, אלא להצית מנהיגות אמיתית, אותנטית, דרך כוחה הטרנספורמטיבי של האמנות. אנו רואים ביצירה לא רק ביטוי עצמי, אלא מנוף עוצמתי לפיתוח מיומנויות מנהיגות קריטיות, חשיבה חדשנית, ויצירת ביטחון עצמי איתן, כל אלה כלים חיוניים שישרתו את הפרט והחברה כולה.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center text-orange-600 font-bold text-lg">
                  "כשאור פוגש אור, נוצר עולם שלם חדש."
                </div>
              </div>
            </section>

            {/* Unique Features - Sidebar */}
            <section className="lg:col-span-4">
              <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 h-full border border-orange-200">
                <h2 className="text-2xl md:text-3xl font-extrabold text-orange-800 mb-6 text-center">
                  מה הופך אותנו לייחודיים?
                </h2>

                <div className="space-y-5">
                  {[
                    { icon: Sparkles, color: 'text-orange-500', title: 'שילוב עולמות', description: 'מזיגה מדויקת בין אמנויות מגוונות לבין פיתוח מנהיגות מעשית.', bgColor: 'bg-orange-50', hoverBorder: 'border-orange-500' },
                    { icon: Handshake, color: 'text-green-600', title: 'ליווי אישי ומנטורינג', description: 'מנטורים מקצועיים ומנוסים המלווים כל משתתף במסעו הייחודי.', bgColor: 'bg-green-50', hoverBorder: 'border-green-600' },
                    { icon: Users, color: 'text-pink-400', title: 'קהילתיות תומכת', description: 'יצירת רשת תמיכה ענפה הכוללת משפחות, אמנים ומובילי דעה.', bgColor: 'bg-pink-50', hoverBorder: 'border-pink-400' },
                    { icon: Sun, color: 'text-yellow-500', title: 'כפר אמנים צעירים', description: 'מרחב פיזי ורעיוני ייחודי המיועד לצמיחת קהילת יוצרים-מנהיגים.', bgColor: 'bg-yellow-50', hoverBorder: 'border-yellow-500' },
                    { icon: Sparkles, color: 'text-blue-500', title: 'נגישות ארצית רחבה', description: 'פעילות מקיפה הפונה לכל המגזרים והאוכלוסיות בישראל, ללא יוצא מן הכלל.', bgColor: 'bg-blue-50', hoverBorder: 'border-blue-500' },
                  ].map((item, index) => (
                    <div key={index} className={`flex items-start space-x-4 space-x-reverse p-4 rounded-xl transition-all duration-300 ${item.bgColor} hover:shadow-md border-r-4 border-transparent hover:${item.hoverBorder}`}>
                      <item.icon className={`flex-shrink-0 w-6 h-6 ${item.color} mt-1`} />
                      <div>
                        <h3 className={`font-extrabold ${item.color} text-lg mb-1`}>{item.title}</h3>
                        <p className="text-gray-700 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Impact Section */}
            <section className="lg:col-span-full">
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mt-8 border border-orange-200">
                <h2 className="text-2xl md:text-4xl font-extrabold text-orange-800 mb-8 text-center">
                  השפעה רב-מעגלית: גלים של שינוי ותקווה
                </h2>

                <p className="text-lg md:text-xl text-gray-700 mb-10 text-center max-w-4xl mx-auto">
                  כל משתתף בתוכניות "לגלות את האור" אינו רק משקיע בעצמו, אלא הופך למוקד של גלי השפעה המתרחבים ומשפיעים על מעגלים רחבים יותר:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-orange-500 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <Lightbulb className="w-12 h-12 text-orange-500 mb-4" />
                    <h3 className="font-extrabold text-orange-700 text-xl mb-2">ברמה האישית:</h3>
                    <p className="text-gray-700 text-base">
                      ביצירת **זהות אישית מגובשת** ובעלת משמעות עמוקה, פיתוח חוסן נפשי וביטחון עצמי להגשמה עצמית.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-green-600 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <Users className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="font-extrabold text-green-700 text-xl mb-2">ברמת הקהילה:</h3>
                    <p className="text-gray-700 text-base">
                      בהעצמת הקהילה המקומית באמצעות **יוזמות חברתיות-אמנותיות** פורצות דרך, המעוררות השראה וחיבור.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-pink-400 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <Handshake className="w-12 h-12 text-pink-600 mb-4" />
                    <h3 className="font-extrabold text-pink-600 text-xl mb-2">ברמת החברה:</h3>
                    <p className="text-gray-700 text-base">
                      בעיצוב פניה העתידיים של החברה הישראלית דרך דור חדש של **מנהיגים יצירתיים, מעורבים וערכיים**.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VisionPage;