import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, ArrowRight, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden font-sans">
      
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-600 via-amber-500 to-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-10"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/50 group-hover:scale-105 transition-transform duration-300 border border-white/10">
                <span className="text-white text-2xl font-bold">ว</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">วัดกำแพง</span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-orange-400 uppercase">Smart Temple System</span>
              </div>
            </Link>
            
            <p className="text-gray-400 leading-relaxed pr-4">
              ศูนย์รวมจิตใจพุทธศาสนิกชน ให้บริการจองพิธีกรรมทางศาสนาออนไลน์ สะดวก รวดเร็ว โปร่งใส พร้อมสืบสานวัฒนธรรมไทยให้ยั่งยืน
            </p>

            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Facebook, href: "#", color: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
                { icon: Twitter, href: "#", color: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]" },
                { icon: Instagram, href: "#", color: "hover:bg-[#E4405F] hover:border-[#E4405F]" },
                { icon: Youtube, href: "#", color: "hover:bg-[#FF0000] hover:border-[#FF0000]" }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white hover:-translate-y-1 ${social.color}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-white font-bold text-lg relative inline-block">
              เมนูลัด
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: "หน้าแรก", to: "/" },
                { label: "ข่าวสารและกิจกรรม", to: "/news" },
                { label: "จองพิธีกรรม", to: "/booking" },
                { label: "ตรวจสอบสถานะ", to: "/profile" },
                { label: "ติดต่อเรา", to: "/contact" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.to} 
                    className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-orange-500" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-white font-bold text-lg relative inline-block">
              ข้อมูลติดต่อ
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-1">
                  <MapPin size={20} className="text-orange-500" />
                </div>
                <span className="text-gray-400 leading-relaxed">
                  123 ถนนพระธาตุ ตำบลวัด <br/>อำเภอเมือง จังหวัดเชียงใหม่ 50000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-green-500" />
                </div>
                <div>
                   <span className="block text-gray-400 text-xs">โทรศัพท์</span>
                   <span className="text-white font-medium hover:text-green-400 transition-colors cursor-pointer">053-123-456</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-blue-500" />
                </div>
                <div>
                   <span className="block text-gray-400 text-xs">อีเมล</span>
                   <span className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer">contact@temple.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-white font-bold text-lg relative inline-block">
              เวลาทำการ
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                    <span className="text-gray-400">ทุกวัน</span>
                    <span className="text-orange-400 font-bold">06:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">วันพระ</span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles size={14} />
                        เปิดตลอด 24 ชม.
                    </span>
                </div>
            </div>

            <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">รับข่าวสารทางอีเมล</p>
                <div className="relative">
                    <input 
                        type="email" 
                        placeholder="อีเมลของคุณ..." 
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all pr-12"
                    />
                    <button className="absolute right-1 top-1 bottom-1 bg-linear-to-r from-orange-500 to-amber-500 text-white p-2 rounded-lg hover:brightness-110 transition-all">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {currentYear} วัดพระธาตุ. All rights reserved.</p>
            <div className="flex items-center gap-6">
                <a href="#" className="hover:text-orange-400 transition-colors">นโยบายความเป็นส่วนตัว</a>
                <a href="#" className="hover:text-orange-400 transition-colors">เงื่อนไขการใช้งาน</a>
            </div>
            <p className="flex items-center gap-1 text-xs">
                Made with <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /> by DevTeam
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;