import { useState } from 'react';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { HandHeart, Sparkles, Info, Image as ImageIcon } from 'lucide-react';

const Donate = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 font-sans pb-0">
        
        {/* --- ส่วนหัว (Header) --- */}
        <section className="relative pt-32 pb-32 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <HandHeart className="w-5 h-5 text-amber-200" />
                    <span className="text-sm font-medium tracking-wide">ร่วมสร้างกุศล</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
                    ร่วมทำบุญบูรณปฏิสังขรณ์
                </h1>
                
                <p className="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto font-light leading-relaxed">
                    ขอเชิญผู้มีจิตศรัทธาร่วมบริจาคสมทบทุนเพื่อบูรณะเสนาสนะภายในวัดตามกำลังศรัทธาผ่านช่องทางด้านล่างนี้
                </p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
                <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20 md:h-[120px]" preserveAspectRatio="none">
                    <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="#f9fafb"/>
                </svg>
            </div>
        </section>

        {/* --- ส่วนเนื้อหา (Donation Image Card) --- */}
        <div className="container mx-auto px-4 relative z-20 -mt-20 pb-20">
            <div className="max-w-2xl mx-auto">
                
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-orange-500/10 border border-white/60 relative overflow-hidden transform hover:-translate-y-1 transition-all duration-500">
                    
                    {/* แถบสีตกแต่งด้านบนการ์ด */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
                    
                    <div className="p-4 md:p-6 text-center">
                        
                        {/* ช่องทางบริจาค (Image จาก Public) */}
                        <div className="relative group">
                            {/* กรอบตกแต่งรูปภาพ */}
                            <div className="absolute -inset-2 bg-linear-to-br from-orange-100 to-amber-100 rounded-4xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                            
                            <div className="relative overflow-hidden rounded-4xl border-2 border-orange-50 shadow-sm inline-block w-full bg-gray-50">
                                {/* เรียกใช้รูป donate.jpg จากโฟลเดอร์ public */}
                                <img 
                                    src="/donate.jpg" 
                                    alt="ช่องทางการบริจาค" 
                                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                                    onError={(e) => {
                                        e.target.src = "https://placehold.co/600x800?text=Donation+Info"; // Fallback หากไม่พบรูป
                                    }}
                                />
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
                                <Sparkles size={16} className="text-amber-400" />
                                <span className="font-medium tracking-wide">สแกนหรือโอนผ่านบัญชีที่ปรากฏในรูปภาพ</span>
                                <Sparkles size={16} className="text-amber-400" />
                            </div>
                        </div>

                        {/* ข้อความเพิ่มเติม */}
                        <div className="mt-8 pt-8 border-t border-gray-100 max-w-sm mx-auto">
                            <div className="flex items-start gap-3 justify-center text-xs text-gray-500 leading-relaxed text-center">
                                <Info size={16} className="shrink-0 text-orange-400" />
                                <p>ท่านสามารถแจ้งความประสงค์รับใบอนุโมทนาบัตรได้ที่สำนักงานวัด หรือติดต่อผ่านช่องทางแชทของทางเว็บไซต์</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ปุ่มกลับหน้าหลัก (Option) */}
                <div className="text-center mt-10">
                    <p className="text-gray-400 text-sm italic font-light">"การให้ทาน เป็นทางมาแห่งโภคทรัพย์และสิริมงคลแก่ชีวิต"</p>
                </div>

            </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Donate;