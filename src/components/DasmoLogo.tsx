import { Laptop } from 'lucide-react';

export default function DasmoLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeClasses = {
    sm: {
      container: 'h-10 w-10',
      dSize: 'text-2xl',
      laptop: 12,
      pixels: 'w-0.5 h-0.5',
      pixelSift: 'translate-y-[-2px] translate-x-[-1px]',
      laptopShift: 'left-[46%] top-[42%]'
    },
    md: {
      container: 'h-14 w-14',
      dSize: 'text-4.5xl',
      laptop: 14,
      pixels: 'w-1 h-1',
      pixelSift: 'translate-y-[-4px] translate-x-[-2px]',
      laptopShift: 'left-[45%] top-[40%]'
    },
    lg: {
      container: 'h-24 w-24',
      dSize: 'text-7xl',
      laptop: 20,
      pixels: 'w-1.5 h-1.5',
      pixelSift: 'translate-y-[-6px] translate-x-[-3px]',
      laptopShift: 'left-[44%] top-[40%]'
    },
    xl: {
      container: 'h-36 w-36',
      dSize: 'text-9.5xl',
      laptop: 32,
      pixels: 'w-2.5 h-2.5',
      pixelSift: 'translate-y-[-10px] translate-x-[-5px]',
      laptopShift: 'left-[44%] top-[38%]'
    }
  };

  const config = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none group ${config.container} ${className}`}>
      {/* Background radial soft Glow */}
      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

      {/* Main Logo Composition */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Pixel drift blocks fading upwards to the top-left */}
        <div className={`absolute top-[10%] left-[8%] flex flex-col gap-[2px] opacity-90 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 ${config.pixelSift}`}>
          {/* Top row of pixels */}
          <div className="flex gap-[3px] items-end justify-end">
            <div className={`bg-[#0ea5e9] rounded-xs shadow-[0_0_8px_rgba(14,165,233,0.5)] ${config.pixels}`} />
            <div className={`bg-[#0284c7]/40 rounded-xs ${config.pixels}`} />
            <div className={`bg-[#1e3a8a]/20 rounded-xs ${config.pixels}`} />
          </div>
          {/* Second row */}
          <div className="flex gap-[3px] items-end justify-end translate-x-[-2px]">
            <div className={`bg-[#0284c7] rounded-xs ${config.pixels}`} />
            <div className={`bg-[#1e3a8a] rounded-xs ${config.pixels}`} />
            <div className={`bg-[#1e1b4b]/30 rounded-xs ${config.pixels}`} />
          </div>
          {/* Third row */}
          <div className="flex gap-[3px] pr-[4px]">
            <div className={`bg-[#1e40af] rounded-xs ${config.pixels}`} />
            <div className={`bg-[#1e3a8a] rounded-xs ${config.pixels}`} />
          </div>
        </div>

        {/* Large stylized letter 'D' of DASMO */}
        <span className={`font-sans font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-blue-900 to-[#020617] tracking-tighter leading-none select-none relative filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${config.dSize} font-extrabold`}>
          D
        </span>

        {/* Swooping Orange and Yellow Dynamic Arrow Loop Curve */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <svg className="w-[120%] h-[120%] overflow-visible absolute" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 5,95 C 10,122 110,118 115,62 C 118,32 75,52 42,75 C 22,86 10,90 2,82"
              stroke="url(#orangeSwoop)"
              strokeWidth="10"
              strokeLinecap="round"
              className="filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.45)] group-hover:scale-[1.03] transition-transform duration-500"
              style={{ transformOrigin: '50% 50%' }}
            />
            
            <defs>
              <linearGradient id="orangeSwoop" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="85%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Inner Laptop situated strategically in the hole of D */}
        <div className={`absolute -translate-x-1/2 -translate-y-1/2 bg-[#020617] rounded-lg border border-white/20 p-1 md:p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transform group-hover:scale-110 group-hover:border-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 ${config.laptopShift}`}>
          <div className="relative flex items-center justify-center">
            <style>{`
              @keyframes cyanGlow {
                0%, 100% { filter: drop-shadow(0 0 2px rgba(6,182,212,0.7)); }
                50% { filter: drop-shadow(0 0 8px rgba(6,182,212,0.9)); }
              }
              .glow-laptop {
                animation: cyanGlow 3s infinite ease-in-out;
              }
            `}</style>
            <Laptop size={config.laptop} className="text-[#06b6d4] glow-laptop stroke-[2]" />
          </div>
        </div>

      </div>
    </div>
  );
}
