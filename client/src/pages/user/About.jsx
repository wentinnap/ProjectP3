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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-sm font-medium tracking-wide">มรดกแห่งศรัทธา</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">เกี่ยวกับวัดกำแพง</h1>
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

        {/* History Section - จุดที่ Error ใน Log อยู่ตรงนี้ */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
              <div className="w-full lg:w-1/2 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px]">
                  <img 
                    src="https://images.unsplash.com/photo-1599548480397-6e693c0032e2?q=80&w=1000&auto=format&fit=crop" 
                    alt="History" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><History size={24} /></div>
                  <h2 className="text-3xl font-bold text-gray-800">ประวัติและตำนาน</h2>
                </div>
                
                <div className="prose prose-lg text-gray-600">
                  <p>
                    ประวัติการก่อสร้างวัดเริ่มขึ้นในสมัยของ <strong>กรุงศรีอยุธยา</strong> ได้รับพระราชทานวิสุงคามสีมาเมื่อ พ.ศ. 2226
                  </p>
                  {/* แก้ไขบรรทัดที่ 83-85: เปลี่ยนการปิด Tag จาก div เป็น p ให้ถูกต้อง */}
                  <p>
                    <strong>อาคารเสนาสนะ:</strong> ได้แก่ อุโบสถ สร้างเมื่อ พ.ศ. 2226 เป็นอาคารคอนกรีตเสริมเหล็ก ศาลาการเปรียญทรงไทย สร้างเมื่อ พ.ศ. 2514
                  </p>
                </div> {/* ปิด div prose-lg */}
                
                <div className="flex gap-4 pt-4">
                  <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <span className="block text-3xl font-bold text-orange-500">300+</span>
                    <span className="text-sm text-gray-500">ปีแห่งประวัติศาสตร์</span>
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <span className="block text-3xl font-bold text-orange-500">2226</span>
                    <span className="text-sm text-gray-500">พ.ศ. ที่เริ่มก่อสร้าง</span>
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
              <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: Landmark, title: "อุโบสถเก่าแก่", desc: "สถาปัตยกรรมสมัยอยุธยาตอนปลาย", color: "bg-amber-100 text-amber-600" },
                { icon: Footprints, title: "เขตศักดิ์สิทธิ์", desc: "พื้นที่วิสุงคามสีมาอันเก่าแก่", color: "bg-green-100 text-green-600" },
                { icon: Sparkles, title: "พระประธาน", desc: "พระพุทธรูปปางสมาธิพุทธลักษณะงดงาม", color: "bg-blue-100 text-blue-600" },
                { icon: Mountain, title: "ศาลาการเปรียญ", desc: "สถานที่ประกอบพิธีกรรมทางศาสนา", color: "bg-purple-100 text-purple-600" },
              ].map((item, index) => (
                <div key={index} className="p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}>
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Etiquette Section */}
        <section className="py-20 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-5/12 bg-orange-600 p-10 text-white text-center">
                <Info size={64} className="mx-auto mb-6" />
                <h3 className="text-2xl font-bold">ข้อปฏิบัติ</h3>
              </div>
              <div className="w-full md:w-7/12 p-10">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                    <p className="text-gray-600">โปรดแต่งกายสุภาพ เรียบร้อย</p>
                  </li>
                  <li className="flex gap-4">
                    <Camera className="text-blue-500 shrink-0" size={20} />
                    <p className="text-gray-600">ถ่ายภาพได้ด้วยความเคารพสถานที่</p>
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
