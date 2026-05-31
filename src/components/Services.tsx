import { useState } from 'react';
import { useCatalog, getIconComponent } from '../context/CatalogContext';
import { 
  Building2, Landmark, Rocket, Wrench, Sparkles, FileText, CheckCircle, Code, 
  Search, ShieldCheck, HelpCircle, ArrowUpRight, CheckSquare, Coins, Timer, X, Flame,
  Printer, Laptop, Layers
} from 'lucide-react';

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'central' | 'state' | 'special' | 'support'>('all');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>('passport');
  const [activeDetailsSvc, setActiveDetailsSvc] = useState<any | null>(null);
  
  const { catalog, isLoading } = useCatalog();

  // Combine dynamic admin settings options together safely
  const allServicesList = [
    ...(catalog.central || []).map(s => ({ ...s, category: 'central', categoryLabel: 'Central Scheme' })),
    ...(catalog.state || []).map(s => ({ ...s, category: 'state', categoryLabel: 'State Scheme' })),
    ...(catalog.special || []).map(s => ({ ...s, category: 'special', categoryLabel: 'Special Scheme' })),
    ...(catalog.support || []).map(s => ({ ...s, category: 'support', categoryLabel: 'System Support' }))
  ];

  const hotServices = allServicesList.filter(s => s.isHot);

  // Dynamic filter lists based on choice
  const filteredServices = allServicesList.filter((svc) => {
    const matchesCategory = selectedCategory === 'all' || svc.category === selectedCategory;
    const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          svc.benefits.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-slate-400 mt-4 font-bold text-sm">Synchronizing Digital Service Directory...</p>
      </div>
    );
  }

  return (
    <section id="services" className="py-24 bg-slate-950 text-left relative overflow-hidden">
      {/* Visual Ambient Grid background Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0e_1px,transparent_1px)] bg-[size:30px_30px] opacity-40" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header content section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full text-xs uppercase tracking-wider mb-4">
             <Sparkles size={14} className="text-blue-400 animate-spin" style={{ animationDuration: '6s' }} /> Interactive Catalog
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
            Authorized Scheme <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">Search Directory</span>
          </h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg leading-relaxed font-medium">
            Type your card, certificate, or service name to check required documents, estimated processing prices, and secure guidance.
          </p>
        </div>

        {/* Hot / Featured Highlight Section */}
        {hotServices.length > 0 && (
          <div className="mb-14 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-amber-500/10 rounded-[2.5rem] blur-2xl opacity-50 -z-10 animate-pulse" />
            <div className="bg-gradient-to-b from-[#140b0e] to-[#070405] border border-red-500/20 rounded-[2.5rem] p-6 md:p-10 shadow-[0_0_50px_rgba(239,68,68,0.08)] relative">
              <div className="absolute top-0 right-0 p-6 text-red-500 opacity-5 pointer-events-none transform translate-x-5 -translate-y-5">
                <Flame size={180} className="fill-red-500 animate-pulse" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 text-red-400 p-2.5 rounded-2xl border border-red-500/30 animate-pulse">
                    <Flame size={24} className="fill-red-400 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      Active High-Priority Schemes <span className="bg-red-500 text-slate-950 font-black text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full animate-ping">Live Campaign</span>
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm mt-0.5 font-medium">Currently active mega schemes running state-wide with high daily processing volumes.</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotServices.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => {
                      setExpandedServiceId(svc.id);
                      setActiveDetailsSvc(svc);
                    }}
                    className="relative group bg-[#0e070a] hover:bg-[#1a0e13] border border-red-500/20 hover:border-red-500/50 p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-500/5 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Glowing highlight corner */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all duration-300" />
                    
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="bg-red-950/40 text-red-400 p-3 rounded-xl border border-red-500/15 group-hover:border-red-500/40 transition-colors">
                          {(() => {
                            const IconComp = getIconComponent(svc.icon);
                            return <IconComp size={20} />;
                          })()}
                        </div>
                        <span className="bg-amber-400/10 text-amber-400 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border border-amber-400/20">
                          HOT SECTOR
                        </span>
                      </div>
                      
                      <h4 className="text-base md:text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                        {svc.name}
                      </h4>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-2 line-clamp-3">
                        {svc.benefits}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-white/5 mt-5 flex justify-between items-center text-xs font-bold leading-none">
                      <span className="text-slate-500">Service Fee: <span className="text-amber-400 font-extrabold font-mono text-sm leading-none ml-1">₹{svc.approxFee}</span></span>
                      <span className="text-red-400 group-hover:underline inline-flex items-center gap-1">Check Documents <ArrowUpRight size={12} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Organized Three Pillars of Service blocks */}
        <div className="mb-14 text-left">
          <div className="text-center md:text-left mb-8 border-b border-white/5 pb-6">
             <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center justify-center md:justify-start gap-2.5">
               <Layers className="text-blue-500 animate-pulse" size={22} /> OUR 3 CORE DIGITAL SERVICES
             </h3>
             <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
               We have organized our services into 3 clear departments below. Click your desired department card to jump directly to its options!
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             
             {/* Core Pillar 1: Printing, Scanning & Photo print rates */}
             <div 
               onClick={() => {
                 document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="bg-[#0b0f1a] border border-blue-500/10 hover:border-blue-500/40 p-6 rounded-[2rem] transition-all duration-350 cursor-pointer shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 relative group overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10" />
                <div className="flex items-center gap-3 mb-5">
                   <div className="bg-blue-500/10 text-blue-400 p-3 rounded-2xl border border-blue-500/20 group-hover:scale-105 transition-transform">
                      <Printer size={26} className="text-blue-400" />
                   </div>
                   <div>
                      <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block leading-none">Instant Xerox Desk</span>
                      <h4 className="font-display font-bold text-white text-base sm:text-lg mt-1.5 group-hover:text-blue-400 transition-colors">
                         1. Print & Xerox Cards
                      </h4>
                   </div>
                </div>

                <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2.5 mb-6 text-xs text-slate-300">
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Laser Black & White Copying (₹5)</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>High-Quality Color Photos (₹15)</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Studio Photo Print Sheet (8 Pics)</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Premium Document Lamination Protection</span>
                   </div>
                </div>

                <button className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/20">
                   Open Pricing Calculator &rarr;
                </button>
             </div>

             {/* Core Pillar 2: Government Schemes & Form Fill-ups */}
             <div 
               onClick={() => {
                 setSelectedCategory('all');
                 setSearchQuery('');
                 document.getElementById('services-catalog-anchor')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="bg-[#0b0f1a] border border-amber-500/10 hover:border-amber-500/40 p-6 rounded-[2rem] transition-all duration-350 cursor-pointer shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 relative group overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10" />
                <div className="flex items-center gap-3 mb-5">
                   <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl border border-amber-500/20 group-hover:scale-105 transition-transform">
                      <FileText size={26} className="text-amber-400" />
                   </div>
                   <div>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block leading-none">Forms assistance</span>
                      <h4 className="font-display font-bold text-white text-base sm:text-lg mt-1.5 group-hover:text-amber-400 transition-colors">
                         2. Sarkari Form Fill-up
                      </h4>
                   </div>
                </div>

                <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2.5 mb-6 text-xs text-slate-300">
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Passport & PAN Card Registration</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Aadhaar Link & Address Update</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Caste Status Certificates (SC/ST/OBC)</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Lakshmir Bhandar & PM-Kisan filings</span>
                   </div>
                </div>

                <button className="w-full bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-500/20">
                   View Schemes List &rarr;
                </button>
             </div>

             {/* Core Pillar 3: Laptop repairing, drivers setup, and software dev */}
             <div 
               onClick={() => {
                 setSelectedCategory('support');
                 setSearchQuery('');
                 document.getElementById('services-catalog-anchor')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="bg-[#0b0f1a] border border-rose-500/10 hover:border-rose-500/40 p-6 rounded-[2rem] transition-all duration-350 cursor-pointer shadow-lg hover:shadow-rose-500/5 hover:-translate-y-1 relative group overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10" />
                <div className="flex items-center gap-3 mb-5">
                   <div className="bg-rose-500/10 text-rose-400 p-3 rounded-2xl border border-rose-500/20 group-hover:scale-105 transition-transform">
                      <Laptop size={26} className="text-rose-400" />
                   </div>
                   <div>
                      <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-widest block leading-none">Repairing & custom code</span>
                      <h4 className="font-display font-bold text-white text-base sm:text-lg mt-1.5 group-hover:text-rose-400 transition-colors">
                         3. PC Repair & Dev Lab
                      </h4>
                   </div>
                </div>

                <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2.5 mb-6 text-xs text-slate-300">
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Expert Laptop Format & Windows install</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Data Restore, Pen-drive Recovery & Antivirus</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Printer Driver setup & System Optimization</span>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>Custom Business Websites & Software</span>
                   </div>
                </div>

                <button className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/20">
                   View Repairs & Custom Code &rarr;
                </button>
             </div>

          </div>
        </div>

        {/* Anchor point to scroll catalog selectors smoothly */}
        <div id="services-catalog-anchor" />

        {/* Dynamic Filtering Panel */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-6 md:p-8 mb-12 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            
            {/* Realtime Search Bar input wrapper */}
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes (e.g. Passport, Caste...)"
                className="w-full bg-[#151b2e] text-slate-100 pl-11 pr-4 py-3.5 rounded-2xl border border-white/5 focus:border-blue-500 focus:outline-none placeholder-slate-500 font-medium text-sm transition-all shadow-inner"
              />
            </div>

            {/* Interactive Grid Category selectors */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              {(['all', 'central', 'state', 'special', 'support'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all capitalize border ${selectedCategory === cat ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-transparent shadow-blue-500/10' : 'bg-[#151b2e]/60 border-white/5 text-slate-400 hover:text-white'}`}
                >
                  {cat === 'all' ? 'All Services' : `${cat} Schemes`}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Dynamic Content Columns */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* List grid column */}
          <div className="lg:col-span-7 space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scroll">
            {filteredServices.length === 0 ? (
              <div className="bg-[#0b0f19] border border-white/5 p-12 text-center rounded-3xl">
                <HelpCircle size={48} className="mx-auto text-slate-700 mb-4 stroke-[1.5]" />
                <p className="text-slate-400 text-base font-bold">No digital services found</p>
                <p className="text-slate-500 text-sm mt-1">Try resetting filters or typing another utility term.</p>
              </div>
            ) : (
              filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => {
                    setExpandedServiceId(svc.id);
                    setActiveDetailsSvc(svc);
                  }}
                  className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${expandedServiceId === svc.id ? 'bg-[#121828] border-blue-500/40 shadow-lg shadow-blue-500/5' : 'bg-[#0a0f1c] border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl border transition-colors ${expandedServiceId === svc.id ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-slate-400 border-white/5 group-hover:text-white group-hover:bg-white/10'}`}>
                        {(() => {
                          const IconComponent = getIconComponent(svc.icon);
                          return <IconComponent size={22} />;
                        })()}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h4 className="font-display font-semibold text-white group-hover:text-blue-400 transition-colors text-base md:text-lg">{svc.name}</h4>
                         {svc.category === 'special' && (
                           <span className="bg-red-500/20 text-red-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-red-500/30 animate-pulse">PROMPT</span>
                         )}
                       </div>
                       <p className="text-slate-400 text-xs font-semibold mt-1 truncate max-w-[18rem] md:max-w-md">{svc.benefits}</p>
                     </div>
                  </div>

                  <div className="text-right shrink-0">
                     <span className="text-slate-500 text-xs font-bold block">{svc.categoryLabel}</span>
                     <span className="text-amber-400 text-xs md:text-sm font-extrabold block mt-1 hover:underline">Details &rarr;</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Interactive Document Checklist Validation Column Preview */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#111625] to-[#070a14] border border-white/15 p-6 md:p-8 rounded-3xl lg:sticky lg:top-28 shadow-xl">
             
             {expandedServiceId ? (() => {
                const currentSvc = allServicesList.find(s => s.id === expandedServiceId);
                if (!currentSvc) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                       <div className="flex items-center gap-3">
                          <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-xl border border-blue-500/20">
                             {(() => {
                                const IconComp = getIconComponent(currentSvc.icon);
                                return <IconComp size={24} />;
                              })()}
                          </div>
                          <div>
                             <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">{currentSvc.categoryLabel} Support</span>
                             <h3 className="font-display font-bold text-white text-xl mt-0.5">{currentSvc.name}</h3>
                          </div>
                       </div>
                       <span className="bg-emerald-500/10 text-emerald-400 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          No Errors
                       </span>
                    </div>

                    <p className="text-slate-300 font-medium text-sm leading-relaxed">{currentSvc.benefits}</p>

                    {/* Key Specifications */}
                    <div className="grid grid-cols-2 gap-4 bg-[#030712]/50 p-4 rounded-2xl border border-white/5">
                       <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide flex items-center gap-1"><Coins size={12} className="text-amber-500" /> Walk-In Fee</span>
                          <span className="text-amber-400 text-base font-black">₹{currentSvc.approxFee}*</span>
                       </div>
                       <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide flex items-center gap-1"><Timer size={12} className="text-blue-500" /> Est. Processing</span>
                          <span className="text-slate-300 text-base font-black">Instant Filing</span>
                       </div>
                    </div>

                    {/* Packing checklist requirements */}
                    <div className="space-y-3">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Essential Document Checklist (Bring Original):</span>
                       <div className="space-y-2.5">
                          {currentSvc.documents.map((doc, i) => (
                            <div key={i} className="flex gap-3 bg-[#121727] p-3.5 rounded-xl border border-white/5 hover:border-slate-800 transition-colors">
                               <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                               <span className="text-slate-300 font-semibold text-sm leading-tight">{doc}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic mt-4 leading-relaxed">* Standard walk-in prices exclude third-party/Govt treasury stamp costs if applicable. We support secure UPI / Card / Cash payments at DASMO cafe.</p>

                    <div className="pt-2">
                      <a 
                        href="#pre-fill" 
                        className="w-full text-center justify-center inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      >
                        Draft Form Online &rarr;
                      </a>
                    </div>
                  </div>
                );
             })() : (
                <div className="text-center py-24 text-slate-500 font-medium">
                   <HelpCircle size={48} className="mx-auto text-slate-700 mb-4 stroke-[1.5]" />
                   <p className="text-base text-slate-401 text-slate-400">No Service selected.</p>
                   <p className="text-sm text-slate-500 mt-1">Choose any service from the left layout list to inspect processing guidelines.</p>
                </div>
             )}

          </div>

        </div>

        {/* Software Dev Segment Highlights */}
        <div className="mt-28 bg-gradient-to-r from-[#0d162d] to-[#040814] border border-blue-500/20 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 text-blue-500 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10">
              <Code size={250} />
           </div>
           
           <div className="relative z-10 max-w-3xl">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-blue-500/30">
                 Enterprise Contracts
              </span>
              <h3 className="text-3xl md:text-5xl font-display font-black text-white mt-6 mb-4 tracking-tight leading-none">
                 Custom Software <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Engineering Hub</span>
              </h3>
              <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed">
                 Beyond walk-in services, DASMO engineers custom high-performance web applications, inventory management backends, database pipelines, and mobile apps customized exactly for your local business automation.
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                 {(catalog.software_dev || []).map((dev) => (
                   <div key={dev.id} className="bg-[#030712]/55 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                      <span className="text-xs text-blue-400 font-extrabold tracking-widest uppercase block">{dev.duration}</span>
                      <h5 className="font-bold text-white text-sm mt-1.5">{dev.name}</h5>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
      {/* Gorgeous Scheme Details Modal */}
      {activeDetailsSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scroll">
            
            {/* Close button */}
            <button 
              onClick={() => setActiveDetailsSvc(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
              title="Close Details"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-5 mb-6">
              <div className="bg-blue-500/15 text-blue-400 p-3.5 rounded-2xl border border-blue-500/20">
                {(() => {
                  const IconComp = getIconComponent(activeDetailsSvc.icon);
                  return <IconComp size={26} />;
                })()}
              </div>
              <div>
                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest leading-none block">
                  {activeDetailsSvc.category === 'central' ? 'Central Govt' : activeDetailsSvc.category === 'state' ? 'State Govt' : activeDetailsSvc.category === 'special' ? 'Special Scheme' : 'System Support'} Guidelines
                </span>
                <h3 className="font-display font-black text-white text-xl sm:text-2xl mt-1.5 leading-tight">
                  {activeDetailsSvc.name}
                </h3>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Benefits & Description</span>
                <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
                  {activeDetailsSvc.benefits}
                </p>
              </div>

              {/* Service Fees & Estimates */}
              <div className="grid grid-cols-2 gap-4 bg-[#030712]/50 p-4 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Coins size={12} className="text-amber-500" /> Walk-In Fee
                  </span>
                  <span className="text-amber-400 text-lg font-black">₹{activeDetailsSvc.approxFee}*</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Timer size={12} className="text-blue-500" /> Est. Processing
                  </span>
                  <span className="text-slate-300 text-lg font-black">Instant Filing</span>
                </div>
              </div>

              {/* Secure checklist with toggleable interactive status */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                    Essential Document Requirement Checklist:
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold animate-pulse">
                     SECURE
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  {activeDetailsSvc.documents?.length > 0 ? (
                    activeDetailsSvc.documents.map((doc: string, i: number) => (
                      <div 
                        key={i} 
                        className="flex gap-3 bg-[#121727] p-3.5 rounded-2xl border border-white/5 hover:border-slate-800 transition-colors"
                      >
                        <span className="w-5.5 h-5.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0">
                          ✓
                        </span>
                        <span className="text-slate-200 font-semibold text-sm leading-tight">
                          {doc}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs italic">No document requirements set by Administrator.</p>
                  )}
                </div>
              </div>

              {/* Note */}
              <p className="text-[11px] text-slate-500 italic leading-relaxed pt-2">
                * Note: The document requirements above are configured directly by the authorized administrator of Dasmo Cyber Cafe to minimize form rejection risks. Please bring original physical copies of these items for direct scanning.
              </p>

              {/* Call to action */}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setActiveDetailsSvc(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all"
                >
                  Close Details
                </button>
                <a 
                  href="#pre-fill" 
                  onClick={() => setActiveDetailsSvc(null)}
                  className="flex-1 text-center justify-center inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Draft Form Online &rarr;
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}
