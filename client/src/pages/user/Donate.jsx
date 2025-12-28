import { useState } from 'react';
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { QrCode, Copy, Check, Building, HandHeart, Info, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

const Donate = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('คัดลอกเลขบัญชีแล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 font-sans pb-0">
        
        {/* --- ส่วนหัว (Header) แบบเดียวกับหน้า About --- */}
        <section className="relative pt-32 pb-32 overflow-hidden">
            {/* พื้นหลัง Gradient สีส้ม-ทอง */}
            <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500"></div>
            
            {/* ลวดลาย Pattern จางๆ */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* ก้อนแสงตกแต่ง (Blobs) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <HandHeart className="w-5 h-5 text-amber-200" />
                    <span className="text-sm font-medium tracking-wide">ร่วมสร้างกุศล</span>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
                    ร่วมทำบุญบูรณปฏิสังขรณ์
                </h1>
                
                {/* Description */}
                <p className="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto font-light leading-relaxed">
                    ขอเชิญผู้มีจิตศรัทธาร่วมเป็นเจ้าภาพทอดผ้าป่าสามัคคี และบริจาคสมทบทุนเพื่อบูรณะเสนาสนะภายในวัดตามกำลังศรัทธา
                </p>
            </div>
            
            {/* เส้นโค้ง (Curve Divider) */}
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
                <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20 md:h-[120px]" preserveAspectRatio="none">
                    <path d="M0 0C240 100 480 120 720 100C960 80 1200 60 1440 90V120H0V0Z" fill="#f9fafb"/>
                </svg>
            </div>
        </section>

        {/* --- ส่วนเนื้อหา (Donation Card) --- */}
        <div className="container mx-auto px-4 relative z-20 -mt-20 pb-20">
            <div className="max-w-xl mx-auto">
                
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-orange-500/10 border border-white/60 relative overflow-hidden transform hover:-translate-y-1 transition-all duration-500">
                    
                    {/* แถบสีตกแต่งด้านบนการ์ด */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
                    
                    <div className="p-8 md:p-12 text-center">
                        
                        {/* QR Code Section */}
                        <div className="relative mb-10 group">
                            <div className="absolute -inset-4 bg-linear-to-br from-orange-200 to-amber-200 rounded-[2.5rem] blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <div className="relative bg-white p-6 rounded-4xl border-2 border-orange-100 shadow-sm inline-block">
                                {/* มุมตกแต่ง QR */}
                                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-200"></div>
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-200"></div>
                                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gray-200"></div>
                                <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gray-200"></div>
                                
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                                    alt="QR Code Donation" 
                                    className="w-56 h-56 object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-orange-100 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-gray-500 tracking-wide uppercase">PromptPay</span>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                <QrCode size={16} className="text-orange-400" />
                                <span>สแกน QR Code เพื่อโอนเงิน</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-8"></div>

                        {/* Bank Details Section */}
                        <div className="text-left space-y-6">
                            
                            {/* Bank Info */}
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 shrink-0">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">ธนาคาร</p>
                                    <p className="font-bold text-gray-800 text-lg leading-tight">ธนาคารกรุงไทย</p>
                                    <p className="text-xs text-gray-500">สาขาเชียงใหม่</p>
                                </div>
                            </div>

                            {/* Account Number & Copy */}
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 ml-1">เลขที่บัญชี & ชื่อบัญชี</p>
                                <div className="bg-orange-50/60 p-1 rounded-2xl border border-orange-100 flex items-center justify-between pr-2 pl-5 py-4">
                                    <div>
                                        <p className="font-mono text-2xl font-bold text-orange-600 tracking-wide leading-none mb-1">
                                            123-4-56789-0
                                        </p>
                                        <p className="text-sm font-medium text-gray-600 truncate max-w-[200px] md:max-w-xs">
                                            กองทุนบูรณะวัดพระธาตุ
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard('123-4-56789-0')}
                                        className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                                            copied 
                                            ? 'bg-green-500 text-white shadow-green-200' 
                                            : 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-200 shadow-orange-100'
                                        }`}
                                        title="คัดลอกเลขบัญชี"
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Footer Note */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-start gap-2 justify-center text-xs text-gray-400 leading-relaxed max-w-sm mx-auto text-center">
                                <Info size={14} className="shrink-0 mt-0.5 text-orange-400" />
                                <p>ใบอนุโมทนาบัตรจะออกให้สำหรับยอดบริจาค 500 บาทขึ้นไป โปรดติดต่อเจ้าหน้าที่ผ่าน Line หรือ Facebook ของวัด</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Donate;