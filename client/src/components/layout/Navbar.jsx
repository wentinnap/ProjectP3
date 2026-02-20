import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Calendar, Newspaper, LayoutDashboard, ChevronDown, Sparkles, Landmark, HeartHandshake, CalendarClock, MessageCircleQuestion } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Image
} from 'lucide-react';

// เมนู Navbar
const NAV_LINKS = [
  { to: '/', label: 'หน้าแรก', icon: Sparkles },
  { to: '/about', label: 'เกี่ยวกับวัด', icon: Landmark },
  {
    label: 'ข่าวสาร & กิจกรรม',
    icon: Newspaper,
    children: [
      { to: '/news', label: 'ข่าวสารประชาสัมพันธ์', icon: Newspaper },
      { to: '/events', label: 'ปฏิทินกิจกรรม', icon: CalendarClock },
      { to: '/gallery', label: 'แกลเลอรี่รูปภาพ', icon: Image },
    ]
  },
  { to: '/booking', label: 'จองพิธี', icon: Calendar },
  { to: '/donate', label: 'ร่วมทำบุญ', icon: HeartHandshake },
  { to: '/qna', label: 'ถาม-ตอบ', icon: MessageCircleQuestion },
];

function NavLink({ to, label, icon: Icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-3 py-2 flex items-center gap-1.5 font-medium transition-all duration-300 rounded-full group text-sm xl:text-base ${
        isActive 
          ? 'text-orange-600 bg-orange-50' 
          : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
      }`}
    >
      {Icon && (
        <Icon 
          size={18} 
          className={`transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 ${
            isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500'
          }`}
        />
      )}
      <span className="whitespace-nowrap">{label}</span>
      {isActive && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></span>
      )}
    </Link>
  );
}

// Component สำหรับ Dropdown (Desktop)
function NavDropdown({ item }) {
  const location = useLocation();
  const isActive = item.children.some(child => location.pathname === child.to);
  const Icon = item.icon;

  return (
    <div className="relative group">
      <button
        className={`relative px-3 py-2 flex items-center gap-1.5 font-medium transition-all duration-300 rounded-full group text-sm xl:text-base cursor-default ${
          isActive
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
        }`}
      >
        {Icon && (
          <Icon
            size={18}
            className={`transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 ${
              isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500'
            }`}
          />
        )}
        <span className="whitespace-nowrap">{item.label}</span>
        <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute top-full left-0 pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                location.pathname === child.to
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                 location.pathname === child.to ? 'bg-white text-orange-500 shadow-sm' : 'bg-gray-50 text-gray-400'
              }`}>
                 {child.icon && <child.icon size={16} />}
              </div>
              <span className="text-sm whitespace-nowrap">{child.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user, isAdmin, onLogout, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const getInitial = () => user.full_name?.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    if(isOpen) window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
    onClose();
  };

  return (
    <div className="relative shrink-0 z-50">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-gray-200 bg-white/80 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all duration-300 group backdrop-blur-sm"
      >
        <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform border-2 border-white">
          {getInitial()}
        </div>
        <span className="max-w-20 lg:max-w-[100px] truncate text-gray-700 text-sm font-medium group-hover:text-orange-800 transition-colors hidden sm:block">
            {user.full_name}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
      </button>

      {isOpen && (
        <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden"
        >
          <div className="px-5 py-4 bg-linear-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/50">
            <p className="text-xs text-orange-600 uppercase tracking-widest font-bold mb-1">บัญชีของฉัน</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          
          <div className="p-2 space-y-1">
            <Link
                to="/profile"
                onClick={() => { setIsOpen(false); onClose(); }}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-orange-700 transition-all duration-200 rounded-xl group"
            >
                <div className="p-2 bg-gray-50 group-hover:bg-white group-hover:shadow-sm rounded-lg transition-all text-gray-500 group-hover:text-orange-500">
                    <User size={16} />
                </div>
                <div className="flex-1">
                    <span className="block font-medium text-sm">ข้อมูลส่วนตัว</span>
                </div>
            </Link>

            <div className="h-px bg-gray-100 my-1 mx-2"></div>

            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl group"
            >
                <div className="p-2 bg-gray-50 group-hover:bg-white group-hover:shadow-sm rounded-lg transition-all text-gray-500 group-hover:text-red-500">
                    <LogOut size={16} />
                </div>
                <span className="font-medium text-sm">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-orange-500/5 border-b border-white/20 py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">
            
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 group shrink-0 relative z-50 pr-4">
              
              {/* Logo Image Placeholder */}
              <div className="relative w-10 h-10 md:w-11 md:h-11 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden border border-orange-100 group-hover:scale-105 transition-transform duration-300">
                  {/* ใส่รูปโลโก้จริงที่นี่ เช่น <img src="/logo.png" className="w-full h-full object-contain" /> */}
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                  
              </div>

              {/* Text Logo */}
              <div className="flex flex-col justify-center">
                <span className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 whitespace-nowrap leading-none ${
                    scrolled ? 'text-gray-800' : 'text-gray-900 drop-shadow-sm md:text-white md:drop-shadow-md lg:text-gray-900 lg:drop-shadow-none'
                }`}>
                  วัดกำแพง
                </span>
                {/* ลบ Smart Temple ออกแล้ว */}
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className={`hidden xl:flex items-center gap-1 p-1 rounded-full transition-all duration-500 ${scrolled ? 'bg-gray-100/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-md shadow-sm'}`}>
              {NAV_LINKS.map((link) => (
                link.children ? (
                  <NavDropdown key={link.label} item={link} />
                ) : (
                  <NavLink key={link.to} {...link} />
                )
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0 pl-2">
              <div className="hidden lg:flex items-center gap-3">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition-all duration-300 shadow-lg shadow-gray-900/20 hover:-translate-y-0.5 text-xs"
                      >
                        <LayoutDashboard size={14} />
                        <span>Admin</span>
                      </Link>
                    )}
                    <UserMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} onClose={() => {}} />
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`px-4 py-2 font-medium rounded-full transition-all duration-300 text-sm hover:-translate-y-0.5 whitespace-nowrap ${
                        scrolled 
                          ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50' 
                          : 'text-white hover:text-white bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30'
                      }`}
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-white text-orange-600 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>สมัครสมาชิก</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`xl:hidden p-2 rounded-xl transition-all duration-300 active:scale-95 border ${
                    scrolled 
                    ? 'text-gray-700 bg-white border-gray-200' 
                    : 'text-white bg-white/20 border-white/20 backdrop-blur-md'
                }`}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeMobileMenu}></div>
            <div className="absolute top-20 left-4 right-4 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-10 duration-300 border border-white/50 max-h-[85vh] flex flex-col">
                <div className="p-2 overflow-y-auto">
                    <div className="bg-gray-50/50 rounded-2xl p-2 space-y-1">
                        {NAV_LINKS.map((link) => {
                            if (link.children) {
                                return (
                                    <div key={link.label} className="space-y-1 pt-1 pb-1">
                                        <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            {link.icon && <link.icon size={12} />}
                                            {link.label}
                                        </div>
                                        {link.children.map(child => (
                                            <Link
                                                key={child.to}
                                                to={child.to}
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-600 hover:text-orange-600 transition-all group pl-8"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 group-hover:text-orange-500 shadow-sm group-hover:shadow-orange-100 transition-all">
                                                    {child.icon && <child.icon size={16} />}
                                                </div>
                                                <span className="font-medium text-sm">{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )
                            }
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white hover:shadow-sm text-gray-600 hover:text-orange-600 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-orange-500 shadow-sm group-hover:shadow-orange-100 transition-all">
                                        {link.icon && <link.icon size={18} />}
                                    </div>
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="h-px bg-gray-100 my-2"></div>

                    {user ? (
                        <div className="bg-orange-50/30 rounded-2xl p-4 border border-orange-100/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 truncate">{user.full_name}</p>
                                    <p className="text-xs text-orange-600 truncate bg-orange-100/50 px-2 py-0.5 rounded-md inline-block mt-0.5">{user.email}</p>
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-200 mb-2 active:scale-95 transition-transform"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>จัดการระบบ (Admin)</span>
                                </Link>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to="/profile"
                                    onClick={closeMobileMenu}
                                    className="flex items-center justify-center gap-2 px-3 py-3 bg-white text-gray-700 rounded-xl border border-gray-100 shadow-sm font-medium text-sm hover:border-orange-200 transition-colors"
                                >
                                    <User size={16} />
                                    <span>โปรไฟล์</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 px-3 py-3 bg-white text-red-600 rounded-xl border border-red-100/50 shadow-sm font-medium text-sm hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>ออก</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 p-2">
                            <Link
                                to="/login"
                                onClick={closeMobileMenu}
                                className="flex items-center justify-center px-4 py-3.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                to="/register"
                                onClick={closeMobileMenu}
                                className="flex items-center justify-center px-4 py-3.5 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 active:scale-95 transition-transform"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
}

export default Navbar;