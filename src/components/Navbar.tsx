import { Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import DasmoLogo from './DasmoLogo';

import { LanguageSelector } from './LanguageSelector';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#030712]/80 backdrop-blur-xl shadow-lg border-white/5 py-3' : 'bg-transparent py-5 border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3.5 group cursor-pointer">
            <DasmoLogo size="sm" />
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-white leading-none tracking-tight">DASMO</h1>
              <p className="text-[10px] md:text-xs text-blue-400 font-bold tracking-[0.2em] mt-0.5">CYBER CAFE</p>
            </div>
          </div>
          
          <div className="flex flex-row items-center gap-3 md:gap-4">
            <LanguageSelector />
            
            <a href="tel:+917384551874" className="hidden lg:flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full backdrop-blur-md transition-all border border-white/10 hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Phone size={18} />
              +91 7384551874
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
