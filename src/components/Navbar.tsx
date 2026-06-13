import { Phone, Home, Search, Calculator, Ticket, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import DasmoLogo from './DasmoLogo';

import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentTab?: 'all' | 'home' | 'services' | 'calculator' | 'booking';
  setCurrentTab?: (tab: 'all' | 'home' | 'services' | 'calculator' | 'booking') => void;
}

export default function Navbar({ currentTab = 'home', setCurrentTab }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeTab = (tab: 'all' | 'home' | 'services' | 'calculator' | 'booking') => {
    if (setCurrentTab) {
      setCurrentTab(tab);
    } else if ((window as any).setCurrentTab) {
      (window as any).setCurrentTab(tab);
    }
    // Scroll smoothly to top when switching views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'services' as const, label: 'Govt Schemes', icon: Search },
    { id: 'calculator' as const, label: 'Xerox & Printing', icon: Calculator },
    { id: 'booking' as const, label: 'Walk-in Tokens', icon: Ticket },
    { id: 'all' as const, label: 'All-in-One', icon: Layers },
  ];

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#030712]/90 backdrop-blur-xl shadow-lg border-white/5 py-2.5' : 'bg-transparent py-4 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo and Brand Title */}
            <div 
              onClick={() => changeTab('home')} 
              className="flex items-center gap-2.5 group cursor-pointer select-none shrink-0"
            >
              <DasmoLogo size="sm" />
              <div>
                <h1 className="text-xl md:text-2.5xl font-display font-black text-white leading-none tracking-tight group-hover:text-blue-400 transition-colors">DASMO</h1>
                <p className="text-[9px] md:text-[10px] text-blue-400 font-bold tracking-[0.2em] mt-0.5">CYBER CAFE</p>
              </div>
            </div>

            {/* Desktop Center Segment Navigation Tabs */}
            <div className="hidden lg:flex items-center bg-slate-950/80 border border-white/5 p-1 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] mx-4 backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => changeTab(item.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 select-none cursor-pointer ${
                      active 
                        ? 'bg-blue-600/20 text-blue-300 shadow-[0_2px_10px_rgba(59,130,246,0.15)] border-t border-white/5 font-extrabold text-blue-100' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-blue-400' : 'text-slate-500'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Right Quick Actions (Language and Call button) */}
            <div className="flex flex-row items-center gap-2 md:gap-3 shrink-0">
              <LanguageSelector />
              
              <a 
                href="tel:+917384551874" 
                className="hidden sm:flex items-center gap-2 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 text-blue-300 px-4 py-2.5 rounded-full backdrop-blur-md transition-all shadow-[0_0_15px_rgba(59,130,246,0.05)]"
              >
                <Phone size={14} className="text-blue-400" />
                +91 7384551874
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Bottom Navigator for Mobile devices */}
      <div className="lg:hidden fixed bottom-5 left-4 right-4 z-50 bg-[#070b16]/90 backdrop-blur-2xl border border-white/10 px-2 py-3.5 rounded-[2rem] flex justify-around items-center shadow-[0_10px_45px_rgba(0,0,0,0.65)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => changeTab(item.id)}
              className="flex flex-col items-center gap-1.5 relative select-none cursor-pointer group flex-1"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                active 
                  ? 'text-blue-400 scale-110 bg-blue-500/10 border border-blue-500/20' 
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}>
                <Icon size={18} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight transition-colors duration-300 ${
                active ? 'text-blue-300 font-extrabold' : 'text-slate-400'
              }`}>
                {item.label === 'Xerox & Printing' ? 'Xerox' : item.label === 'Walk-in Tokens' ? 'Tokens' : item.label}
              </span>
              {active && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

