import { Mail, MapPin, Phone, Globe, ArrowUpRight } from 'lucide-react';
import DasmoLogo from './DasmoLogo';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#020617] text-white pt-24 pb-8 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          <div className="lg:col-span-2 pr-0 lg:pr-12">
            <div className="flex items-center gap-3.5 mb-8">
               <DasmoLogo size="md" />
               <div>
                  <h2 className="text-3xl font-display font-bold tracking-tight leading-none mb-1 text-white">DASMO</h2>
                  <p className="text-xs text-blue-400 font-bold tracking-[0.2em]">CYBER CAFE</p>
               </div>
            </div>
            <p className="text-slate-400 mb-8 max-w-sm text-lg leading-relaxed font-medium">
              Elevating traditional digital services with modern efficiency. From essential forms to complex software architecture.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-display font-bold mb-8 text-white">
               Contact & Location
            </h3>
            <ul className="space-y-6 text-slate-300 font-medium">
              <li className="flex items-start gap-4">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-red-400 shrink-0">
                  <MapPin size={20} />
                </div>
                <span className="pt-1 text-slate-400">Ardhagram, Mejhia<br/>Bankura, West Bengal</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-green-400 shrink-0 group-hover:bg-green-400/10 transition-colors">
                  <Phone size={20} />
                </div>
                <a href="tel:+917384551874" className="text-slate-400 hover:text-white transition-colors text-lg">+91 7384551874</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-display font-bold mb-8 text-white">
               Connect Online
            </h3>
            <ul className="space-y-6 text-slate-300 font-medium">
              <li className="flex items-center gap-4 group">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-400 shrink-0 group-hover:bg-cyan-400/10 transition-colors">
                  <Mail size={20} />
                </div>
                <a href="mailto:subhojitdev@dasmo.in" className="text-slate-400 hover:text-white transition-colors break-all">subhojitdev@dasmo.in</a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-blue-400 shrink-0 group-hover:bg-blue-400/10 transition-colors">
                  <Globe size={20} />
                </div>
                <a href="https://www.cafe.dasmo.in" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                   www.cafe.dasmo.in
                   <ArrowUpRight size={14} className="text-slate-600" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-500">
          <p 
            onDoubleClick={() => (window as any).openAdminPanel?.()}
            className="cursor-default select-none hover:text-slate-400 transition-colors"
            title="Double-click to open system terminal secure desk"
          >
            © {new Date().getFullYear()} Dasmo Cyber Cafe. All rights reserved.
          </p>
          <p 
            onDoubleClick={() => (window as any).openAdminPanel?.()}
            className="flex items-center gap-2 cursor-default select-none hover:text-slate-400 transition-colors"
          >
            Developed with excellence <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse"></span>
          </p>
        </div>
      </div>
    </footer>
  );
}
