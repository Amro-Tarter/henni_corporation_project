import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Send,
  Calendar,
  Clock
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Layout>
      <div className="pt-16 min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 transition-all duration-700" dir="rtl">
     {/* Decorative floating elements using FontAwesome icons */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-10 opacity-20 animate-float">
            <FontAwesomeIcon icon={faLeaf} className="w-12 h-12 text-orange-400" />
          </div>
          <div className="absolute bottom-1/3 left-20 opacity-20 animate-float-delayed">
            <FontAwesomeIcon icon={faHammer} className="w-10 h-10 text-orange-500" />
          </div>
          <div className="absolute top-2/3 right-1/4 opacity-20 animate-float-slow">
            <FontAwesomeIcon icon={faWind} className="w-8 h-8 text-amber-500" />
          </div>
          <div className="absolute bottom-1/4 right-1/3 opacity-20 animate-float-slower">
            <FontAwesomeIcon icon={faWater} className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute top-1/3 left-1/4 opacity-20 animate-float-delay-faster">
            <FontAwesomeIcon icon={faFire} className="w-12 h-12 text-red-400" />
          </div>
          {/* Additional decorative icons */}
          <div className="absolute top-1/5 left-1/5 opacity-15 animate-float-slower">
            <FontAwesomeIcon icon={faLeaf} className="w-8 h-8 text-green-300" />
          </div>
          <div className="absolute bottom-1/5 left-1/2 opacity-15 animate-float-delay-faster">
            <FontAwesomeIcon icon={faWind} className="w-6 h-6 text-teal-400" />
          </div>
          <div className="absolute top-2/5 right-1/3 opacity-15 animate-float-slow">
            <FontAwesomeIcon icon={faWater} className="w-8 h-8 text-blue-300" />
          </div>
        </div>

        {/* Page Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-800 via-fire to-orange-600 text-white py-24 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-yellow-200 blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-orange-200 blur-3xl animate-pulse-slower"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block relative">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fadeIn">
                צרו קשר
              </h1>
            </div>
            <p className="text-xl max-w-2xl mx-auto animate-slideUp text-amber-100">
              נשמח לשמוע מכם ולענות על כל שאלה שיש לכם
            </p>
          </div>

          {/* Decorative wave divider */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path
              fill="#fff9f1"
              fillOpacity="1"
              d="M0,32L48,48C96,64,192,96,288,96C384,96,480,64,576,48C672,32,768,32,864,42.7C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
            ></path>
          </svg>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          {submitted ? (
            <div className="max-w-2xl mx-auto my-12 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-700 bg-white animate-scaleUp">
              <div className="p-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-100">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">תודה שיצרתם קשר!</h2>
                <p className="mb-8 text-gray-600">
                  ההודעה שלכם התקבלה בהצלחה. נחזור אליכם בהקדם.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  חזרה לטופס
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Contact Form */}
              <div className="md:col-span-7">
                <div className="rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 bg-white hover:-translate-y-1 hover:shadow-3xl">
                  <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500"></div>

                  <div className="p-10">
                    <h2 className="text-2xl font-bold mb-8 flex items-center text-orange-800">
                      <Send className="ml-2 animate-pulse-slow" size={22} />
                      <span>שלחו לנו הודעה</span>
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="group">
                          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800">
                            שם מלא <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative overflow-hidden rounded-lg">
                            <Input
                              id="name"
                              placeholder="השם שלך"
                              className="border-2 focus:ring-2 pr-3 transition-all duration-300 border-amber-200 focus:border-orange-400 focus:ring-orange-300 bg-orange-50/30"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-focus-within:w-full bg-orange-500"></span>
                          </div>
                        </div>
                        {/* Email */}
                        <div className="group">
                          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800">
                            אימייל <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative overflow-hidden rounded-lg">
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              className="border-2 focus:ring-2 pr-3 transition-all duration-300 border-amber-200 focus:border-orange-400 focus:ring-orange-300 bg-orange-50/30"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-focus-within:w-full bg-orange-500"></span>
                          </div>
                        </div>
                      </div>

                      <div className="group">
                        <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-800">
                          נושא
                        </label>
                        <div className="relative overflow-hidden rounded-lg">
                          <Input
                            id="subject"
                            placeholder="נושא ההודעה"
                            className="border-2 focus:ring-2 pr-3 transition-all duration-300 border-amber-200 focus:border-orange-400 focus:ring-orange-300 bg-orange-50/30"
                            value={formData.subject}
                            onChange={handleInputChange}
                          />
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-focus-within:w-full bg-orange-500"></span>
                        </div>
                      </div>

                      <div className="group">
                        <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-800">
                          הודעה <span className="text-orange-500">*</span>
                        </label>
                        <div className="relative overflow-hidden rounded-lg">
                          <Textarea
                            id="message"
                            placeholder="מה תרצו לשאול אותנו?"
                            rows={5}
                            className="border-2 focus:ring-2 pr-3 transition-all duration-300 border-amber-200 focus:border-orange-400 focus:ring-orange-300 bg-orange-50/30"
                            required
                            value={formData.message}
                            onChange={handleInputChange}
                          />
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-focus-within:w-full bg-orange-500"></span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="relative overflow-hidden w-full text-white font-semibold text-lg py-6 rounded-xl shadow-lg group bg-gradient-to-r from-orange-600 to-fire hover:from-fire hover:to-orange-600 transition-all duration-500"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <span className="animate-pulse">שולח...</span>
                              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
                            </>
                          ) : (
                            <>
                              שליחת הודעה
                              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="absolute top-0 left-0 w-full h-full">
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full bg-white opacity-10 group-hover:w-96 group-hover:h-96 transition-all duration-700"></span>
                        </span>
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-4">
                        <span className="text-orange-500">*</span> שדות חובה
                      </p>
                    </form>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="md:col-span-5 space-y-6">
                <div className="rounded-3xl shadow-xl p-8 border transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br from-white to-amber-50 border-amber-200">
                  <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-orange-800 border-amber-100">פרטי יצירת קשר</h2>
                  <div className="space-y-6">
                    <div className="flex items-start rounded-xl p-4 transition-all duration-300 hover:bg-orange-50">
                      <div className="rounded-full p-3 mr-3 bg-orange-100">
                        <Mail className="text-orange-600" size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">אימייל</p>
                        <a href="mailto:contact@hinneni.org" className="text-orange-700 hover:text-fire hover:underline transition-colors">
                          contact@hinneni.org
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start rounded-xl p-4 transition-all duration-300 hover:bg-orange-50">
                      <div className="rounded-full p-3 mr-3 bg-orange-100">
                        <Phone className="text-orange-600" size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">טלפון</p>
                        <a href="tel:+97250000000" className="text-orange-700 hover:text-fire hover:underline transition-colors">
                          050-000-0000
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start rounded-xl p-4 transition-all duration-300 hover:bg-orange-50">
                      <div className="rounded-full p-3 mr-3 bg-orange-100">
                        <MapPin className="text-orange-600" size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">כתובת</p>
                        <p className="text-gray-700">ישראל</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Founder contact card */}
                <div className="rounded-3xl shadow-xl overflow-hidden transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl relative bg-gradient-to-br from-orange-100 via-amber-100 to-amber-50 border border-orange-200">
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-orange-200 opacity-20 group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-amber-300 opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="p-8 relative z-10">
                    <div className="flex items-start">
                      <div className="mr-4 relative">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden bg-orange-200 text-orange-700">
                          <span className="relative z-10">אז</span>
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-orange-300 animate-ping-slow opacity-30"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-orange-800">צור קשר עם המייסדת</h3>
                        <p className="text-lg font-semibold text-gray-900">ענת זגרון בוג'יו</p>
                        <p className="text-sm text-orange-600 mt-1">מייסדת ומנכ"לית העמותה</p>
                        <div className="mt-4">
                          <a href="#" className="inline-flex items-center px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-300 shadow-md">
                            <Calendar className="ml-2" size={16} />
                            <span>קביעת פגישה</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response time */}
                <div className="rounded-2xl shadow-md transition-all duration-500 transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-6">
                  <div className="flex items-center mb-3 text-orange-600">
                    <Clock size={18} className="ml-2" />
                    <h4 className="font-semibold">זמני תגובה</h4>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-pulse"></div>
                    </div>
                    <p className="text-sm">אנו משתדלים להגיב לכל הפניות תוך 24-48 שעות בימי עבודה.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
