import { useEffect } from 'react';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { History, Landmark, Mountain, Camera, Info, MapPin, Clock, Sparkles, Footprints, AlertCircle, CheckCircle2 } from 'lucide-react';

const About = () => {
  
  // Scroll to top on mount
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
            
            {/* Decor Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span className="text-sm font-medium tracking-wide">มรดกแห่งศรัทธา</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
                    เกี่ยวกับวัดกำแพง
                </h1>
                <p className="text-lg md:text-xl text-orange-50 max-w-3xl mx-auto font-light leading-relaxed">
                    ศูนย์รวมจิตใจของพุทธศาสนิกชน สัญลักษณ์อันทรงคุณค่าทางวัฒนธรรมและประวัติศาสตร์ล้านนาที่สืบทอดมายาวนานกว่า 600 ปี
                </p>
            </div>
            
            {/* Curve Divider */}
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
                <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20 md:h-[120px]" preserveAspectRatio="none">
                    <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="#f9fafb"/>
                </svg>
            </div>
        </section>

        {/* History & Legend Section */}
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
                    {/* Image/Visual */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="absolute -inset-4 bg-linear-to-r from-orange-500 to-amber-500 rounded-[2.5rem] opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-500"></div>
                        <div className="relative rounded-4xl overflow-hidden shadow-2xl h-[400px] bg-white">
                            {/* Placeholder Image - Replace with real temple image */}
                            <img 
                                src="https://images.unsplash.com/photo-1599548480397-6e693c0032e2?q=80&w=1000&auto=format&fit=crop" 
                                alt="Wat Phra That History" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent text-white">
                                <span className="text-amber-300 font-bold text-sm block mb-1">ตำนานล้านนา</span>
                                <span className="text-xl font-bold">ช้างเผือกผู้เสี่ยงทาย</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                                <History size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">ประวัติและตำนาน</h2>
                        </div>
                        
                        <div className="prose prose-lg text-gray-600 leading-relaxed">
                            <p>
                                ประวัติการก่อสร้างวัดเริ่มขึ้นในสมัยของ <strong>กรุงศรีอยุธยา</strong> ได้รับพระราชทานวิสุงคามสีมาเมื่อ พ.ศ. 2226ได้รับการบูรณปฏิสังขรณ์เมื่อประมาณ พ.ศ. 2500 ในสมัยพระครูธรรมธรทวาย สีลธมฺโม เป็นเจ้าอาวาส ท่านได้สร้างศาสนวัตถุและเสนาสนะต่าง ๆ มากมาย หลังจากนั้นเจ้าอาวาสรูปต่อมาคือพระครูโกศลปริยัติวงศ์ (พระมหาญาณพงศ์ ถิรปุญฺโญ ป.ธ.๓)
                            </p>
                            <p>
                                <strong>อาคารเสนาสนะ:</strong> ได้แก่ อุโบสถ สร้างเมื่อ พ.ศ. 2226 เป็นอาคารคอนกรีตเสริมเหล็ก ศาลาการเปรียญ สร้างเมื่อ พ.ศ. 2514 เป็นอาคารคอนกรีตเสริมเหล็กทรงไทย กุฏิสงฆ์ เป็นอาคารไม้ อาคารครึ่งตึกครึ่งไม้ และอาคารคอนกรีตเสริมเหล็ก และศาลาบำเพ็ญกุศล สร้างด้วยคอนกรีตเสริมเหล็ก ส่วนปูชนียวัตถุ มีพระประธานประจำอุโบสถปางสมาธิ สร้างเมื่อ พ.ศ. 2226 พระประธานประจำศาลาการเปรียญปางสมาธิ สร้างเมื่อ พ.ศ. 2514 พระพุทธรูปพุทธลักษณะแบบพระพุทธชินราช
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <span className="block text-3xl font-bold text-orange-500 mb-1">300+</span>
                                <span className="text-sm text-gray-500">ปีแห่งประวัติศาสตร์</span>
                            </div>
                            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <span className="block text-3xl font-bold text-orange-500 mb-1">2220</span>
                                <span className="text-sm text-gray-500">พ.ศ. ที่เริ่มก่อสร้าง</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Architecture Highlights */}
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fb923c_1px,transparent_1px)] bg-size-[20px_20px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-2 block">Architecture & Highlights</span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">สถาปัตยกรรมและสิ่งที่น่าสนใจ</h2>
                    <div className="w-24 h-1 bg-linear-to-r from-orange-500 to-amber-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {[
                        { 
                            icon: Landmark, 
                            title: "พระธาตุเจดีย์ทองคำ", 
                            desc: "เจดีย์ทรงเชียงแสนปิดทองอร่าม บรรจุพระบรมสารีริกธาตุ สิ่งศักดิ์สิทธิ์สูงสุด",
                            color: "bg-amber-100 text-amber-600"
                        },
                        { 
                            icon: Footprints, 
                            title: "บันไดนาค 306 ขั้น", 
                            desc: "ทางขึ้นสู่วัดขนาบข้างด้วยพญานาคเจ็ดเศียร สัญลักษณ์ของผู้พิทักษ์พระพุทธศาสนา",
                            color: "bg-green-100 text-green-600"
                        },
                        { 
                            icon: Sparkles, 
                            title: "อนุสาวรีย์ช้างเผือก", 
                            desc: "สร้างขึ้นเพื่อรำลึกถึงช้างมงคลที่นำพาพระบรมสารีริกธาตุมายังดินแดนแห่งนี้",
                            color: "bg-blue-100 text-blue-600"
                        },
                        { 
                            icon: Mountain, 
                            title: "จุดชมวิวเมือง", 
                            desc: "จุดที่สามารถมองเห็นทิวทัศน์ของตัวเมืองเชียงใหม่ได้อย่างงดงามตระการตา",
                            color: "bg-purple-100 text-purple-600"
                        },
                    ].map((item, index) => (
                        <div key={index} className="group bg-white p-8 rounded-4xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] hover:border-orange-200 transition-all duration-300 hover:-translate-y-2">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Etiquette Section */}
        <section className="py-20 bg-linear-to-b from-orange-50 to-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-5/12 bg-linear-to-br from-orange-600 to-amber-500 p-10 text-white flex flex-col justify-center items-center text-center">
                        <Info size={64} className="mb-6 text-orange-200" />
                        <h3 className="text-2xl font-bold mb-4">ข้อปฏิบัติสำหรับผู้เยี่ยมชม</h3>
                        <p className="text-orange-100 opacity-90">เพื่อให้การเยี่ยมชมเป็นไปอย่างเรียบร้อยและเคารพต่อสถานที่ โปรดปฏิบัติตามคำแนะนำ</p>
                    </div>
                    
                    <div className="w-full md:w-7/12 p-10">
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0 mt-1">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">การแต่งกาย</h4>
                                    <p className="text-gray-500 text-sm mt-1">โปรดแต่งกายสุภาพ งดสวมเสื้อแขนกุด กางเกงขาสั้น หรือกระโปรงสั้นเหนือเข่า (มีบริการผ้าคลุมให้ยืม)</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0 mt-1">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">การสำรวมกิริยา</h4>
                                    <p className="text-gray-500 text-sm mt-1">ถอดรองเท้าก่อนเข้าสู่บริเวณศักดิ์สิทธิ์ ไม่ชี้เท้าไปทางพระพุทธรูป และงดส่งเสียงดัง</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-1">
                                    <Camera size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">การถ่ายภาพ</h4>
                                    <p className="text-gray-500 text-sm mt-1">สามารถถ่ายภาพได้ แต่ควรทำด้วยความเคารพ ไม่ยืนค้ำศีรษะพระพุทธรูป หรือโพสท่าที่ไม่เหมาะสม</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
      <Footer />
    </>
  );
};

export default About;
