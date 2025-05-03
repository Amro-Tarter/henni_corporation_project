import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <div className="pt-20 bg-gradient-to-b from-amber-50 to-orange-50 min-h-screen" dir="rtl">
        {/* Page Header - Enhanced with animation and deeper shadows */}
        <div className="bg-gradient-to-r from-orange-900 via-fire to-orange-700 text-white py-20 shadow-xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-orange-200 blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg animate-fadeIn">צרו קשר</h1>
            <p className="text-xl max-w-2xl mx-auto text-amber-100 animate-slideUp">
              נשמח לשמוע מכם ולענות על כל שאלה שיש לכם
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form - Improved with animations and better focus states */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-amber-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b border-amber-100 pb-3">שלחו לנו הודעה</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800">שם מלא <span className="text-orange-500">*</span></label>
                    <div className="relative">
                      <Input 
                        id="name" 
                        placeholder="השם שלך" 
                        className="border-amber-200 focus:ring-2 focus:ring-orange-500 pr-3 transition-all duration-200 bg-orange-50/30 hover:bg-orange-50/50" 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800">אימייל <span className="text-orange-500">*</span></label>
                    <div className="relative">
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="border-amber-200 focus:ring-2 focus:ring-orange-500 pr-3 transition-all duration-200 bg-orange-50/30 hover:bg-orange-50/50" 
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-800">נושא</label>
                  <Input 
                    id="subject" 
                    placeholder="נושא ההודעה" 
                    className="border-amber-200 focus:ring-2 focus:ring-orange-500 pr-3 transition-all duration-200 bg-orange-50/30 hover:bg-orange-50/50" 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-800">הודעה <span className="text-orange-500">*</span></label>
                  <Textarea 
                    id="message" 
                    placeholder="מה תרצו לשאול אותנו?" 
                    rows={5} 
                    className="border-amber-200 focus:ring-2 focus:ring-orange-500 pr-3 transition-all duration-200 bg-orange-50/30 hover:bg-orange-50/50" 
                    required
                  />
                </div>
                <Button className="bg-gradient-to-r from-orange-700 to-fire hover:from-fire hover:to-orange-600 transition-all duration-300 w-full text-white font-semibold text-lg shadow-md hover:shadow-lg group relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    שליחת הודעה
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  <span className="text-orange-500">*</span> שדות חובה
                </p>
              </form>
            </div>

            {/* Contact Info - Enhanced with better visual hierarchy and animations */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-xl p-10 border border-amber-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b border-amber-100 pb-3">פרטי יצירת קשר</h2>
                <div className="space-y-6 text-gray-800">
                  <div className="flex items-start rounded-xl p-4 transition-colors duration-200 hover:bg-orange-50">
                    <div className="bg-orange-100 rounded-full p-2 ml-3">
                      <Mail className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">אימייל</p>
                      <a href="mailto:contact@hinneni.org" className="text-orange-700 hover:text-fire hover:underline transition-colors">
                        contact@hinneni.org
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start rounded-xl p-4 transition-colors duration-200 hover:bg-orange-50">
                    <div className="bg-orange-100 rounded-full p-2 ml-3">
                      <Phone className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">טלפון</p>
                      <a href="tel:+97250000000" className="text-orange-700 hover:text-fire hover:underline transition-colors">
                        050-000-0000
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start rounded-xl p-4 transition-colors duration-200 hover:bg-orange-50">
                    <div className="bg-orange-100 rounded-full p-2 ml-3">
                      <MapPin className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">כתובת</p>
                      <p className="text-gray-700">ישראל</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-amber-50 border border-orange-200 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 p-8 transform hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="mr-4">
                    <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 text-2xl font-bold">
                      אז
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-orange-800">צור קשר עם המייסדת</h3>
                    <p className="text-lg font-semibold text-gray-900">ענת זגרון בוג'יו</p>
                    <p className="text-sm text-orange-600 mt-1">מייסדת ומנכ"לית העמותה</p>
                    <div className="mt-3 inline-flex items-center text-sm text-orange-700 hover:text-orange-900 transition-colors">
                      <a href="#" className="inline-flex items-center">
                        <span>קביעת פגישה</span>
                        <ArrowRight className="w-4 h-4 mr-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-100 p-6 shadow-md">
                <div className="flex items-center text-orange-600 mb-2">
                  <CheckCircle size={20} className="ml-2" />
                  <h4 className="font-semibold">זמני תגובה</h4>
                </div>
                <p className="text-gray-700 text-sm">אנו משתדלים להגיב לכל הפניות תוך 24-48 שעות בימי עבודה.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;