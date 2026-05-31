import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Ticket, QrCode, Clock, CheckSquare, Sparkles, X, ChevronRight, CheckCircle2, User, Phone, FileText 
} from 'lucide-react';
import { getSlotStatus, isBookingExpired } from '../utils/bookingUtils';

interface PriorityToken {
  id: string;
  name: string;
  mobile: string;
  serviceCategory: string;
  serviceName: string;
  walkinDate: string;
  walkinTime: string;
  documentsNeeded: string[];
  approxFee: number;
  createdAt: string;
}

export default function ActiveTicketBanner() {
  const [localTokens, setLocalTokens] = useState<PriorityToken[]>([]);
  const [activeDbIds, setActiveDbIds] = useState<Set<string>>(new Set());
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // 1. Load local tokens from localStorage initially and when local storage changes
  useEffect(() => {
    const loadTokens = () => {
      try {
        const stored = localStorage.getItem('dasmo_tokens');
        if (stored) {
          setLocalTokens(JSON.parse(stored));
        } else {
          setLocalTokens([]);
        }
      } catch (e) {
        console.error("Local storage read error inside ActiveTicketBanner:", e);
      }
    };

    loadTokens();
    
    // Custom window listener trigger to detect local ticketing updates
    window.addEventListener('storage', loadTokens);
    const interval = setInterval(loadTokens, 2000); // Polling backup for quick state changes
    
    return () => {
      window.removeEventListener('storage', loadTokens);
      clearInterval(interval);
    };
  }, []);

  // 2. Listen to Firestore real-time snapshots to keep active DB IDs updated
  useEffect(() => {
    if (localTokens.length === 0) {
      setIsDbLoaded(true);
      return;
    }

    const bookingsColl = collection(db, 'bookings');
    const unsubscribe = onSnapshot(
      bookingsColl,
      (snapshot) => {
        const activeIds = new Set<string>();
        snapshot.forEach((doc) => {
          activeIds.add(doc.id);
        });
        setActiveDbIds(activeIds);
        setIsDbLoaded(true);
      },
      (error) => {
        console.error("Error synchronizing banner database status:", error);
        setIsDbLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [localTokens]);

  // 3. Filter to find the first token from local cache that remains Active in Firebase Firestore Database
  const activeToken = localTokens.find(token => {
    // Must be in the active bookings list in firestore database
    const inDb = activeDbIds.has(token.id);
    if (!inDb) return false;

    // Must not be expired (for safety, though we prioritize showing it anyway)
    const expired = isBookingExpired(token.walkinDate, token.walkinTime);
    return !expired;
  });

  // If none active or dismissed, render nothing
  if (!activeToken || isDismissed) {
    return null;
  }

  const slotState = getSlotStatus(activeToken.walkinDate, activeToken.walkinTime);
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    JSON.stringify({ 
      id: activeToken.id, 
      hash: "DSM-SECURE", 
      name: activeToken.name, 
      slot: activeToken.walkinTime, 
      service: activeToken.serviceName 
    })
  )}`;

  return (
    <div className="bg-gradient-to-b from-blue-950/40 to-[#030712] border-b border-blue-500/30 pt-28 pb-10 relative overflow-hidden">
      {/* Dynamic ambient highlights */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-amber-400" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Simple friendly guidance header for easy reading */}
        <div className="max-w-3xl mx-auto bg-[#0a0f1d] border border-blue-500/30 rounded-[2rem] p-5 sm:p-7 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
          
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4.5 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl border border-blue-500/25">
                <Ticket className="animate-pulse" size={18} />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block leading-none">Mejhia Counter Entry System</span>
                <h4 className="font-display font-black text-white text-base sm:text-lg mt-1.5 flex items-center gap-1.5">
                  YOUR WALK-IN SLIP IS ACTIVE <Sparkles className="text-yellow-400 hidden sm:inline" size={14} />
                </h4>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-white p-1 bg-white/5 rounded-lg border border-white/5 transition-all"
              title="Hide for now"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            
            {/* Left side: Main slip details mapped clearly with simple labels */}
            <div className="md:col-span-7 space-y-4 font-sans">
              
              <div className="grid grid-cols-2 gap-3.5 bg-black/40 p-4.5 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Priority Code</span>
                  <span className="text-lg font-black text-white font-mono mt-0.5 block">{activeToken.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Booking Slot</span>
                  <span className="text-xs font-black text-emerald-400 font-bold mt-0.5 block truncate leading-none">
                    {activeToken.walkinDate}<br />
                    <span className="text-[11px] text-slate-300 font-medium">{activeToken.walkinTime}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <User size={14} className="text-blue-400 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">Applicant: <strong className="text-white font-bold">{activeToken.name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText size={14} className="text-amber-400 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">Work Type: <strong className="text-white font-bold">{activeToken.serviceName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={14} className="text-purple-400 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">Registered: <strong className="text-white font-bold">{activeToken.mobile}</strong></span>
                </div>
              </div>

              {/* Simple readable guidance for less educated citizens */}
              <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wide">
                  <CheckSquare size={13} className="text-blue-400" /> simple instruction for counter:
                </div>
                <p className="text-[11.5px] text-slate-300 font-medium leading-relaxed">
                  1. Show this screen to our operator <br />
                  2. Bring these documents with you: <strong className="text-amber-400">{activeToken.documentsNeeded.slice(0, 3).join(', ')}</strong><br />
                  3. Once they finish your job, this screen will auto-close.
                </p>
              </div>

            </div>

            {/* Right side: High contrast QR checker box */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-black/30 border border-white/5 p-4.5 rounded-2xl">
              <span className="text-[10px] text-blue-300 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1 font-mono">
                <QrCode size={13} className="text-blue-400" /> INSTANT BARCODE
              </span>

              {/* White scan canvas box */}
              <div className="bg-white p-2.5 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300">
                <img 
                  src={qrDataUrl} 
                  alt="Walk-in QR Code Verification slip" 
                  className="w-28 h-28 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-[9px] text-slate-500 font-bold mt-2.5 uppercase tracking-wide px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-center">
                Operator direct verification scan
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
