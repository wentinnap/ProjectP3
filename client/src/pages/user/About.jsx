import { useEffect } from 'react';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { History, Landmark, Mountain, Camera, Info, Sparkles, Footprints, CheckCircle2 } from 'lucide-react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-sans pb-0">
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-sm font-medium tracking-wide">มรดกแห่งศรัทธา</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">เกี่ยวกับวัดกำแพง</h1>
            <p className="text-lg md:text-xl text-orange-50 max-w-3xl mx-auto font-light">
              ศูนย์รวมจิตใจของพุทธศาสนิกชนที่สืบทอดมายาวนาน
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20 md:h-[120px]" preserveAspectRatio="none">
              <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="#f9fafb"/>
            </svg>
          </div>
        </section>

        {/* History Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
              <div className="w-full lg:w-1/2 relative">
                <div className="relative rounded-4xl overflow-hidden shadow-2xl h-[450px] border-8 border-white">
                  <img 
                    src="/assets/images/about/history.png" 
                    alt="History" 
                    className="w-full h-full object-cover shadow-inner"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shadow-sm"><History size={28} /></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">ประวัติและตำนาน</h2>
                </div>
                
                <div className="prose prose-lg text-gray-600 leading-relaxed">
                  <p>
                    ประวัติการก่อสร้างวัดเริ่มขึ้นในสมัยของ <strong className="text-orange-600">กรุงศรีอยุธยา</strong> ได้รับพระราชทานวิสุงคามสีมาเมื่อ พ.ศ. 2226
                  </p>
                  <p>
                    <strong className="text-gray-800">อาคารเสนาสนะ:</strong> ได้แก่ อุโบสถ สร้างเมื่อ พ.ศ. 2226 เป็นอาคารคอนกรีตเสริมเหล็ก ศาลาการเปรียญทรงไทย สร้างเมื่อ พ.ศ. 2514
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <span className="block text-4xl font-bold text-orange-500 mb-1">300+</span>
                    <span className="text-sm text-gray-500 font-medium">ปีแห่งประวัติศาสตร์</span>
                  </div>
                  <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <span className="block text-4xl font-bold text-orange-500 mb-1">2220</span>
                    <span className="text-sm text-gray-500 font-medium">พ.ศ. ที่เริ่มก่อสร้าง</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">สถาปัตยกรรมที่น่าสนใจ</h2>
              <div className="w-20 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[
                { icon: Landmark, title: "อุโบสถเก่าแก่", desc: "สถาปัตยกรรมสมัยอยุธยาตอนปลายที่ทรงคุณค่า", color: "bg-amber-100 text-amber-600" },
                { icon: Footprints, title: "หอระฆัง", desc: "สถาปัตยกรรมพื้นถิ่น พื้นที่บอกสัญญาณเวลา", color: "bg-green-100 text-green-600" },
                { icon: Sparkles, title: "พระประธาน", desc: "พระพุทธประธานในอุโบสถ พุทธลักษณะงดงาม", color: "bg-blue-100 text-blue-600" },
                { icon: Mountain, title: "ศาลาการเปรียญ", desc: "สถานที่ประกอบพิธีกรรมทรงไทยประยุกต์", color: "bg-purple-100 text-purple-600" },
              ].map((item, index) => (
                <div key={index} className="group p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Etiquette Section - New Premium Design */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-stretch rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white bg-white">
              
              {/* Left Side: Title Card */}
              <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 to-orange-500 p-12 text-white flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/30 shadow-inner">
                    <Info size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">ข้อปฏิบัติ</h3>
                  <div className="w-12 h-1 bg-white/40 mt-4 rounded-full"></div>
                </div>
              </div>

              {/* Right Side: Guidelines List */}
              <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col justify-center">
                <ul className="space-y-8">
                  <li className="flex items-start gap-5 group">
                    <div className="p-3.5 bg-green-50 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 border border-green-100 shadow-sm">
                      <CheckCircle2 size={24} strokeWidth={2.5} />
                    </div>
                    <div className="pt-1">
                      <p className="text-xl font-semibold text-gray-800 mb-1">โปรดแต่งกายสุภาพ</p>
                      <p className="text-gray-500 text-sm md:text-base">แต่งกายมิดชิดเพื่อรักษาบรรยากาศอันสงบของวัด</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-5 group">
                    <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 border border-blue-100 shadow-sm">
                      <Camera size={24} strokeWidth={2.5} />
                    </div>
                    <div className="pt-1">
                      <p className="text-xl font-semibold text-gray-800 mb-1">ถ่ายภาพด้วยความเคารพ</p>
                      <p className="text-gray-500 text-sm md:text-base">ถ่ายภาพได้โดยไม่รบกวนสมาธิและผู้อื่น</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default About;