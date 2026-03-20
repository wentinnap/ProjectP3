import { Link } from 'react-router-dom';
// เปลี่ยน Lotus เป็น Flower2
import { Facebook, MapPin, Phone, Mail, ArrowRight, Heart, Sparkles, Clock3, Flower2 } from 'lucide-react'; 

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const facebookUrl = "https://www.facebook.com/share/17Ef9GzgzY/?mibextid=wwXIfr";

  const isCurrentlyOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 6 && hours < 18;
  };

  const isOpen = isCurrentlyOpen();

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden font-sans border-t border-white/5">
      
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-600 via-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] z-10"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')]"></div>
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-amber-600/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 space-y-7">
            <Link to="/" className="inline-flex items-center gap-4 group relative">
              <div className="relative w-14 h-14 shrink-0">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-900/50 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 z-10">
                    <span className="text-white text-3xl font-bold">ว</span>
                  </div>
                  <div className="absolute -inset-1 bg-orange-400/50 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight group-hover:text-orange-300 transition-colors">วัดกำแพง</span>
                <span className="text-[10px] font-medium tracking-[0.25em] text-orange-400 uppercase">SMART TEMPLE SYSTEM</span>
              </div>
            </Link>
            
            <p className="text-gray-400 leading-relaxed pr-6 text-[15px]">
              ศูนย์รวมจิตใจพุทธศาสนิกชน ให้บริการจองพิธีกรรมทางศาสนาออนไลน์ สะดวก รวดเร็ว โปร่งใส พร้อมสืบสานวัฒนธรรมไทยให้ยั่งยืนสืบไป
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a 
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white hover:-translate-y-1.5 hover:bg-[#1877F2] hover:border-[#1877F2] hover:shadow-lg hover:shadow-[#1877F2]/30 group"
              >
                <Facebook size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <span className="text-xs text-gray-600 tracking-wide">ติดตามข่าวสารผ่าน Facebook</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-7">
            <h3 className="text-white font-semibold text-lg relative inline-flex items-center gap-2">
              <Flower2 size={18} className="text-orange-500 opacity-70" /> {/* แก้เป็น Flower2 */}
              เมนูลัด
              <span className="absolute -bottom-2.5 left-0 w-14 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3.5 pt-1">
              {[
                { label: "หน้าแรก", to: "/" },
                { label: "ข่าวสารและกิจกรรม", to: "/news" },
                { label: "จองพิธีกรรม", to: "/booking" },
                { label: "ตรวจสอบสถานะ", to: "/profile" },
                { label: "ติดต่อเรา", to: "/contact" },
              ].map((item, idx) => (
                <li key={idx} className="overflow-hidden">
                  <Link 
                    to={item.to} 
                    className="text-gray-400 hover:text-orange-300 transition-all duration-300 flex items-center gap-2 group relative py-0.5 hover:scale-[1.03] origin-left"
                  >
                    <ArrowRight size={15} className="absolute -left-6 opacity-0 group-hover:left-0 group-hover:opacity-100 transition-all duration-300 text-orange-500" />
                    <span className="group-hover:pl-6 transition-all duration-300 relative overflow-hidden">
                        {item.label}
                        <span className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:left-full transition-all duration-500 ease-in-out"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="lg:col-span-3 space-y-7">
            <h3 className="text-white font-semibold text-lg relative inline-flex items-center gap-2">
               <Flower2 size={18} className="text-orange-500 opacity-70" /> {/* แก้เป็น Flower2 */}
              ข้อมูลติดต่อ
              <span className="absolute -bottom-2.5 left-0 w-14 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-5 pt-1">
              <li className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                  <MapPin size={20} className="text-orange-500" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-gray-200 font-medium text-[15px]">ที่อยู่</span>
                    <span className="text-gray-400 leading-relaxed text-[14px]">
                        เลขที่ 19 หมู่ที่ 8 ซอยพิบูลสงคราม 22 อำเภอนนทบุรี จังหวัดนนทบุรี 11000
                    </span>
                </div>
              </li>
              <li className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Phone size={20} className="text-green-500" />
                </div>
                <div>
                   <span className="block text-gray-200 font-medium text-[15px]">โทรศัพท์</span>
                   <span className="text-white font-semibold hover:text-green-400 transition-colors cursor-pointer tracking-wider text-[15px]">091-935-6242</span>
                </div>
              </li>
              <li className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Mail size={20} className="text-blue-500" />
                </div>
                <div>
                   <span className="block text-gray-200 font-medium text-[15px]">อีเมล</span>
                   <span className="text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-[15px]">wat.kampaeng@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours */}
          <div className="lg:col-span-3 space-y-7">
            <h3 className="text-white font-semibold text-lg relative inline-flex items-center gap-2">
               <Flower2 size={18} className="text-orange-500 opacity-70" /> {/* แก้เป็น Flower2 */}
              เวลาทำการ
              <span className="absolute -bottom-2.5 left-0 w-14 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            
            <div className="relative group overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm space-y-5 shadow-inner shadow-black/20 hover:border-orange-500/30 transition-colors duration-500">
                <Clock3 size={80} className="absolute -bottom-6 -right-6 text-white/5 group-hover:text-orange-500/5 transition-colors duration-500 rotate-12" />

                <div className="flex justify-between items-center border-b border-white/10 pb-4 relative z-10">
                    <span className="text-gray-300 font-medium">ทุกวัน</span>
                    <span className="text-orange-400 font-bold text-lg tracking-tight">06:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center relative z-10">
                    <span className="text-gray-300 font-medium">วันพระ</span>
                    <span className="text-amber-300 font-bold flex items-center gap-2">
                        <Sparkles size={16} className="animate-pulse text-amber-400" />
                        เปิดตลอด 24 ชม.
                    </span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1 bg-black/30 border border-white/5 text-[11px] font-medium relative z-10">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {isOpen ? 'ขณะนี้เปิดทำการ' : 'ขณะนี้ปิดทำการ'}
                </div>
            </div>

            <p className="text-[12px] text-gray-500 leading-relaxed italic px-2">
              * เวลาทำการอาจมีการเปลี่ยนแปลงตามความเหมาะสมของพิธีกรรมและงานเทศกาลสำคัญ
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-10 mt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-gray-500 bg-black/10 rounded-t-2xl px-6">
            <p>© {currentYear} <span className="font-medium text-gray-400">วัดกำแพง</span>. All rights reserved.</p>
            <div className="flex items-center gap-6 font-medium">
                <a href="#" className="hover:text-orange-400 transition-colors relative group">
                    นโยบายความเป็นส่วนตัว
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#" className="hover:text-orange-400 transition-colors relative group">
                    เงื่อนไขการใช้งาน
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </a>
            </div>
            <p className="flex items-center gap-1.5 text-[12px] bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                Made with <Heart size={13} className="text-red-500 fill-red-500 animate-pulse" /> by <span className="text-gray-400 font-medium">ทีมพัฒนาวัดกำแพง</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;