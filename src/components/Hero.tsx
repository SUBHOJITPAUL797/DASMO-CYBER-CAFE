import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Monitor, Wifi, Flame, Clock } from 'lucide-react';
import DasmoLogo from './DasmoLogo';
import { useCatalog } from '../context/CatalogContext';

export default function Hero() {
  const { catalog } = useCatalog();
  const statusInfo = catalog.statusInfo || {
    happyWalkins: '45,800+',
    formsProcessed: '12,400+',
    techClients: '1,250+',
    announcementTitle: 'Instant Walk-in Special',
    announcementText: 'Need instant colored passport size photos or emergency Aadhaar updating? Just walk straight in to our Mejhia counter. Average billing wait time is under 4 minutes.',
    locationText: 'Ardhagram, Mejhia',
    cafeStatus: 'auto' as const
  };

  const [isOpen, setIsOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Current IST calculation (or local system helper)
    const checkCafeStatus = () => {
      const now = new Date();
      // UTC time to Indian Standard Time (UTC +5:30) helper
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      
      const hours = istTime.getHours();
      setCurrentTime(istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
      
      const statusSetting = statusInfo.cafeStatus || 'auto';
      if (statusSetting === 'open') {
        setIsOpen(true);
      } else if (statusSetting === 'closed') {
        setIsOpen(false);
      } else {
        // Cafe operates from 09:00 AM to 09:00 PM (9 to 21)
        if (hours >= 9 && hours < 21) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    };

    checkCafeStatus();
    const interval = setInterval(checkCafeStatus, 60000);
    return () => clearInterval(interval);
  }, [statusInfo.cafeStatus]);

  return (
    <div className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden min-h-screen flex items-center bg-[#02050e]">
      
      {/* Background digital grid meshes */}
      <div className="absolute inset-0 bg-[#02050e] -z-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#02050e] to-[#02050e] -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[650px] h-[650px] bg-red-600/10 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[130px] -z-10 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Futuristic digital map matrix lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151c2e_1px,transparent_1px),linear-gradient(to_bottom,#151c2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero left information panels */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Dynamic Status Indicator Pill & Logo alignment */}
              <div className="flex flex-row items-center gap-4.5">
                <DasmoLogo size="md" className="hidden sm:flex" />
                <div className="flex flex-col gap-2">
                  <div className="inline-flex flex-wrap items-center gap-2.5 py-2 px-4 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs backdrop-blur-md">
                     <span className="flex h-2.5 w-2.5 relative items-center justify-center">
                       <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                       <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                     </span>
                     <span className="text-white">
                       {isOpen ? 'CAFE IS OPEN' : 'CAFE IS CLOSED'} (9 AM - 9 PM)
                     </span>
                     <span className="text-slate-600">|</span>
                     <span className="text-blue-400 flex items-center gap-1">
                       <Clock size={12} /> IST: {currentTime || "Live Status"}
                     </span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7.5xl font-display font-black leading-[1.08] tracking-tight text-white">
                Authorized Cyber & <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Digital Helpdesk</span>
              </h1>
              
              <p className="text-base md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl">
                Ardhagram’s premium digital services hub in Mejhia. Experience instant, error-free online form fill-ups, official document updates, fast colored photo printing, and robust technology solutions with zero hassle.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={() => {
                  if ((window as any).setCurrentTab) {
                    (window as any).setCurrentTab('services');
                  }
                }}
                className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:-translate-y-1.0 hover:scale-[1.02] duration-300 border border-blue-500/10 cursor-pointer"
              >
                Search Govt Schemes
                <ArrowRight size={20} className="stroke-[3]" />
              </button>
              <button 
                onClick={() => {
                  if ((window as any).setCurrentTab) {
                    (window as any).setCurrentTab('booking');
                  }
                }}
                className="inline-flex justify-center items-center gap-2 bg-[#10162a] text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#16203d] hover:border-white/20 transition-all backdrop-blur-sm cursor-pointer"
              >
                Book Priority Token
              </button>
            </motion.div>
            {/* Space buffer */}
            <div className="pt-2" />
          </div>

          {/* Hero right dynamic visualization panel (Mockups & brand styling) */}
          <div className="lg:col-span-5 relative flex justify-center mt-12 lg:mt-0">
             
             {/* Cyber frame glow background */}
             <div className="absolute inset-0 bg-blue-500/10 rounded-[3rem] blur-[80px] -z-10" />

             <div className="w-full max-w-sm bg-gradient-to-b from-[#11172a] to-[#070a14] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
                
                {/* Brand header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                   <div className="flex items-center gap-3">
                      <DasmoLogo size="sm" />
                      <span className="text-xs font-mono text-slate-400 font-bold">DASMO LIVE STATUS</span>
                   </div>
                   <span className="text-[10px] bg-slate-900 border border-slate-800 text-teal-400 px-2 py-1 rounded font-mono font-bold">CYBER SECURE</span>
                </div>

                {/* Live counters displaying simulated cafe statistics */}
                <div className="space-y-4">
                   <div className="bg-[#030712] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Total Happy Walk-ins</span>
                      <span className="font-mono text-lg font-bold text-white">{statusInfo.happyWalkins}</span>
                   </div>
                   <div className="bg-[#030712] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Government Forms Processed</span>
                      <span className="font-mono text-lg font-bold text-emerald-400">{statusInfo.formsProcessed}</span>
                   </div>
                   <div className="bg-[#030712] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Registered Tech Clients</span>
                      <span className="font-mono text-lg font-bold text-amber-400">{statusInfo.techClients}</span>
                   </div>
                </div>

                {/* Interactive walk-in prompt card */}
                <div className="mt-6 bg-gradient-to-tr from-[#121c38] to-transparent p-4.5 rounded-2xl border border-blue-500/30">
                   <div className="flex items-center gap-2.5 text-amber-400 font-bold mb-1.5 text-sm">
                      <Sparkles size={16} /> {statusInfo.announcementTitle}
                   </div>
                   <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {statusInfo.announcementText}
                   </p>
                </div>

                {/* Map quick indicator */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-500">
                   <span>Location: {statusInfo.locationText}</span>
                   <a href="https://maps.app.goo.gl/V37BNmDpUw1VVyEi9" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google Maps &rarr;</a>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
