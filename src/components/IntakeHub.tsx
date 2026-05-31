import { useState, useEffect, FormEvent } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { db } from '../firebase';
import { 
  collection, doc, getDoc, onSnapshot, writeBatch 
} from 'firebase/firestore';
import { 
  Ticket, Calendar, CalendarDays, User, Phone, CheckSquare, Layers, 
  Download, CheckCircle, Sparkles, FileStack, AlertCircle, RefreshCw, QrCode, Clock
} from 'lucide-react';
import { isBookingExpired, getSlotStatus, getSlotEndDateTime } from '../utils/bookingUtils';

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

export default function IntakeHub() {
  const { catalog } = useCatalog();
  const [activeTab, setActiveTab] = useState<'create' | 'vault'>('create');
  
  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'central' | 'state' | 'special' | 'support'>('central');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [walkinDate, setWalkinDate] = useState('');
  const [walkinTime, setWalkinTime] = useState('');
  
  // Submit states
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<PriorityToken | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Local storage cache for client convenience
  const [savedTokens, setSavedTokens] = useState<PriorityToken[]>([]);
  const [dayBookings, setDayBookings] = useState<any[]>([]);
  const [existingDbIds, setExistingDbIds] = useState<Set<string>>(new Set());
  const [isDbLinked, setIsDbLinked] = useState(false);
  const [vaultSubTab, setVaultSubTab] = useState<'active' | 'history'>('active');

  // Sync saved tokens existence from database
  useEffect(() => {
    if (savedTokens.length === 0) {
      setIsDbLinked(true);
      return;
    }
    const bookingsColl = collection(db, 'bookings');
    const unsubscribe = onSnapshot(
      bookingsColl,
      (snapshot) => {
        const activeIds = new Set<string>();
        snapshot.forEach((docSnap) => {
          activeIds.add(docSnap.id);
        });
        setExistingDbIds(activeIds);
        setIsDbLinked(true);
      },
      (error) => {
        console.error("Sync client saved tokens database error:", error);
        setIsDbLinked(true);
      }
    );
    return () => unsubscribe();
  }, [savedTokens.length]);

  // Load saved slots from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dasmo_tokens');
      if (stored) {
        setSavedTokens(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage lookup failed:", e);
    }
  }, []);

  // Update selection on category transition
  useEffect(() => {
    const list = catalog[selectedCategory] || [];
    if (list && list.length > 0) {
      setSelectedServiceId(list[0].id);
    }
  }, [selectedCategory, catalog]);

  // Sync bookings for the selected date to display real-time availability indicator
  useEffect(() => {
    if (!walkinDate) {
      setDayBookings([]);
      return;
    }

    const bookingsColl = collection(db, 'bookings');
    const unsubscribe = onSnapshot(
      bookingsColl,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.date === walkinDate) {
            list.push(data);
          }
        });
        setDayBookings(list);
      },
      (error) => {
        console.error("Calendar day sync error:", error);
      }
    );

    return () => unsubscribe();
  }, [walkinDate]);

  const activeServicesList = catalog[selectedCategory] || [];
  const currentServiceObj = activeServicesList.find(s => s.id === selectedServiceId) as any;

  // Generate dynamic slots based on standard admin operability parameters
  const generateSlots = () => {
    const config = catalog.bookingConfig || {
      startHour: '09:00',
      endHour: '21:00',
      slotGap: 30,
      limitPerPhone: 3
    };

    const slots: string[] = [];
    const getMinutes = (hStr: string) => {
      const [h, m] = hStr.split(':').map(Number);
      return h * 60 + m;
    };

    const startMin = getMinutes(config.startHour);
    const endMin = getMinutes(config.endHour);
    const gap = config.slotGap;

    for (let current = startMin; current < endMin; current += gap) {
      const formatTime = (totalMin: number) => {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m < 10 ? '0' + m : m;
        return `${displayH}:${displayM} ${ampm}`;
      };

      const startText = formatTime(current);
      const endText = formatTime(current + gap);
      slots.push(`${startText} - ${endText}`);
    }

    return slots;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBookingError('');
    
    if (!name.trim() || !mobile.trim() || !selectedServiceId || !walkinDate || !walkinTime) {
      setBookingError("Please complete all requested booking credentials and schedule slots!");
      return;
    }

    const cleanPhone = mobile.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      setBookingError("Please enter a valid telephone contact number.");
      return;
    }

    setBookingInProgress(true);
    try {
      const config = catalog.bookingConfig || {
        startHour: '09:00',
        endHour: '21:00',
        slotGap: 30,
        limitPerPhone: 3
      };

      // 1. Transaction limit guard on telephone identifier
      const limitRef = doc(db, 'client_limits', cleanPhone);
      const limitSnap = await getDoc(limitRef);
      let activeIds: string[] = [];
      if (limitSnap.exists()) {
        activeIds = limitSnap.data().bookingIds || [];
      }

      if (activeIds.length >= (config.limitPerPhone || 3)) {
        setBookingError(`Rate Limit Triggered: You are allowed a maximum of ${config.limitPerPhone} simultaneous active booking slots! Please resolve or cancel existing entry listings.`);
        setBookingInProgress(false);
        return;
      }

      // Check slot occupancy double reservation check
      const requestedSlotIsTaken = dayBookings.some((b) => b.time === walkinTime && !isBookingExpired(b.date, b.time));
      if (requestedSlotIsTaken) {
        setBookingError(`Slot Fully Booked: The selected slot (${walkinTime}) has just been reserved by another client! Please select a adjacent available slot.`);
        setBookingInProgress(false);
        return;
      }

      // 2. Form reservation packages
      const tId = 'DSM-' + Math.floor(100000 + Math.random() * 900000);
      const tokenObj: PriorityToken = {
        id: tId,
        name: name.trim(),
        mobile: cleanPhone,
        serviceCategory: selectedCategory,
        serviceName: currentServiceObj ? currentServiceObj.name : "Digital Consultation",
        walkinDate,
        walkinTime,
        documentsNeeded: currentServiceObj ? currentServiceObj.documents : ["Identity Proof", "Active Mobile"],
        approxFee: currentServiceObj ? currentServiceObj.approxFee : 100,
        createdAt: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      // 3. Atomically write to Firestore matching Rules criteria
      const batch = writeBatch(db);
      const bookingRef = doc(db, 'bookings', tId);
      
      batch.set(bookingRef, {
        id: tId,
        name: tokenObj.name,
        mobile: tokenObj.mobile,
        work: tokenObj.serviceName,
        date: tokenObj.walkinDate,
        time: tokenObj.walkinTime,
        createdAt: new Date().toISOString()
      });

      const updatedIds = [...activeIds, tId];
      batch.set(limitRef, {
        bookingIds: updatedIds,
        phoneNumber: cleanPhone,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await batch.commit();

      // Commit to local lists
      const updatedLocal = [tokenObj, ...savedTokens];
      setSavedTokens(updatedLocal);
      localStorage.setItem('dasmo_tokens', JSON.stringify(updatedLocal));
      
      setGeneratedToken(tokenObj);
      setSubmitSuccess(true);

      // Clean form parameters
      setName('');
      setMobile('');
      setWalkinDate('');
      setWalkinTime('');
    } catch (err: any) {
      console.error("Booking transactional submit failure:", err);
      setBookingError("Storage write offline or network connection interrupted! Error details: " + err.message);
    } finally {
      setBookingInProgress(false);
    }
  };

  const deleteToken = async (id: string, mobileNum: string) => {
    if (!window.confirm("Do you want to cancel and revoke this walk-in entry reservation slot?")) return;
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, 'bookings', id);
      batch.delete(bookingRef);

      const limitRef = doc(db, 'client_limits', mobileNum);
      const limitSnap = await getDoc(limitRef);
      if (limitSnap.exists()) {
        const data = limitSnap.data();
        const updatedIds = (data.bookingIds || []).filter((bId: string) => bId !== id);
        batch.set(limitRef, {
          ...data,
          bookingIds: updatedIds,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();

      // Clear local cache arrays
      const updated = savedTokens.filter(t => t.id !== id);
      setSavedTokens(updated);
      localStorage.setItem('dasmo_tokens', JSON.stringify(updated));
      if (generatedToken?.id === id) {
        setGeneratedToken(null);
      }
    } catch (err: any) {
      console.error("Failed to revoke booking:", err);
      alert("Revocation offline or database denied. Error details: " + err.message);
    }
  };

  const activeTokens = savedTokens.filter(t => !isDbLinked ? true : existingDbIds.has(t.id));
  const historyTokens = savedTokens.filter(t => isDbLinked ? !existingDbIds.has(t.id) : false);

  return (
    <section id="pre-fill" className="py-24 bg-[#030712] relative overflow-hidden border-t border-white/5">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute right-0 top-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-full text-xs uppercase tracking-wider mb-4">
             <Ticket size={14} className="text-red-400" /> Digital Counter Booking
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Priority <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-yellow-300">Entry Token Generator</span>
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed font-semibold">
            Draft your digital form request online! Generate a priority booking token to skip queues, check your exact packing documents, and experience high-speed service.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#0b0f19] border border-white/5 p-1 rounded-2xl flex max-w-md w-full">
            <button
              onClick={() => { setActiveTab('create'); setSubmitSuccess(false); setBookingError(''); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'create' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/15' : 'text-slate-400 hover:text-white'}`}
            >
              <CalendarDays size={18} /> Generate New Slot
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative cursor-pointer ${activeTab === 'vault' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/15' : 'text-slate-400 hover:text-white'}`}
            >
              <Ticket size={18} /> My Tokens Hub
              {activeTokens.length > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'create' && !submitSuccess ? (
          <div className="grid lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#0b0f1a] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                   Provide Booking Credentials
                </h3>

                {bookingError && (
                  <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl flex items-start gap-2.5 animate-pulse text-xs font-semibold">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Applicant's Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex. Subhojit Paul"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#151b2e] text-slate-100 pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Active Phone / Mobile *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Ex. 7384551874"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-[#151b2e] text-slate-100 pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Service Category *</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(['central', 'state', 'special', 'support'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border capitalize transition-all cursor-pointer ${selectedCategory === cat ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm' : 'bg-[#151b2e]/60 border-white/5 text-slate-400 hover:border-white/10'}`}
                        >
                          {cat} Services
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Select Digital Scheme *</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full bg-[#151b2e] text-slate-100 px-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-semibold text-sm transition-all"
                    >
                      {activeServicesList.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-5 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Preferred Date of Walk-in *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={walkinDate}
                      onChange={(e) => { setWalkinDate(e.target.value); setWalkinTime(''); }}
                      className="w-full bg-[#151b2e] text-slate-100 px-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium transition-all"
                    />
                  </div>

                  <div className="md:col-span-7 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Available Time Slots *</label>
                    {walkinDate ? (
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {generateSlots().map((slot) => {
                          const isReserved = dayBookings.some(b => b.time === slot && !isBookingExpired(b.date, b.time));
                          const isPast = walkinDate === new Date().toISOString().split('T')[0] && (() => {
                            const endDt = getSlotEndDateTime(walkinDate, slot);
                            return endDt ? new Date().getTime() > endDt.getTime() : false;
                          })();
                          const isDisabled = isReserved || isPast;
                          const isSelected = walkinTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setWalkinTime(slot)}
                              className={`text-center py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isDisabled ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed line-through' : isSelected ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/10' : 'bg-[#151b2e] text-slate-300 border-white/5 hover:border-slate-700'}`}
                            >
                              <span className="block truncate">{slot.replace(' AM', '').replace(' PM', '')} {slot.includes('AM') ? 'AM' : 'PM'}</span>
                              <span className={`block text-[8px] font-black tracking-widest uppercase mt-0.5 ${isPast ? 'text-slate-500' : isReserved ? 'text-red-500' : isSelected ? 'text-blue-200' : 'text-emerald-500'}`}>
                                {isPast ? 'Passed' : isReserved ? 'Booked' : 'Available'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-[#121727]/30 border border-white/5 p-4 rounded-xl text-center text-slate-500 font-medium text-xs">
                         Please select a walking date first to display operational slots.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 max-w-sm font-medium text-center sm:text-left">✨ Submit details to receive an authentic printable token for direct physical processing.</p>
                <button
                  type="submit"
                  disabled={bookingInProgress}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-blue-500/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {bookingInProgress ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Securing Slot...</span>
                    </>
                  ) : (
                    <>
                      <Ticket size={16} />
                      <span>Book Walk-In Slot</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Document Checklist Generator */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#111625] to-[#070a14] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
                    <FileStack size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">Dynamic Checklist</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Documents you must bring for this service</p>
                  </div>
                </div>

                {currentServiceObj ? (
                  <div className="space-y-5">
                    <div className="bg-[#151b2e]/60 border border-white/5 p-4 rounded-xl">
                      <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">Active Choice</span>
                      <h4 className="text-lg font-bold text-white mt-1">{currentServiceObj.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">{currentServiceObj.benefits}</p>
                    </div>

                    <div className="space-y-2.5">
                       <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1">Checklist:</span>
                       {currentServiceObj.documents.map((doc: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-[#030712]/50 p-3 rounded-lg border border-white/5">
                             <span className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                             <span className="text-slate-300 font-medium text-sm leading-tight">{doc}</span>
                          </div>
                       ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-medium">
                     <AlertCircle size={40} className="mx-auto text-slate-600 mb-3" />
                     <p>Please select a service schema to display custom document validation details.</p>
                  </div>
                )}
              </div>

              {currentServiceObj && (
                <div className="pt-6 border-t border-white/10 mt-6 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Approx. Walk-In Fee:</span>
                  <span className="text-amber-400 text-base font-black">₹{currentServiceObj.approxFee} (+ GST / stamp if any)</span>
                </div>
              )}
            </div>

          </div>
        ) : activeTab === 'create' && submitSuccess && generatedToken ? (
          /* Successful Generation Ticket view */
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#111625] to-[#070a14] border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
             
             <div className="text-center pb-6 border-b border-white/10 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Entry Token Generated!</h3>
                <p className="text-xs text-slate-300 mt-2">Your booking has been compiled successfully. Please save or print this token receipt.</p>
             </div>

             <div className="bg-[#030712] border border-white/5 rounded-2xl p-6 space-y-6 relative font-mono text-sm">
                
                <div className="flex justify-between items-center bg-blue-500/5 hover:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                   <div>
                     <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block">Priority Code</span>
                     <span className="text-xl font-bold text-white font-mono">{generatedToken.id}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Created On</span>
                     <span className="text-sm font-semibold text-slate-400">{generatedToken.createdAt}</span>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs">
                   <div className="space-y-1">
                     <span className="text-slate-500 block">Applicant Name</span>
                     <span className="text-slate-100 font-bold text-sm block">{generatedToken.name}</span>
                   </div>
                   <div className="space-y-1">
                     <span className="text-slate-500 block">Phone Contact</span>
                     <span className="text-slate-100 font-bold text-sm block">{generatedToken.mobile}</span>
                   </div>
                   <div className="space-y-1">
                     <span className="text-slate-500 block">Digital Service</span>
                     <span className="text-slate-100 font-bold text-sm block">{generatedToken.serviceName}</span>
                   </div>
                   <div className="space-y-1">
                     <span className="text-slate-500 block">Appointment Date</span>
                     <span className="text-amber-400 font-bold text-sm block">{generatedToken.walkinDate} • {generatedToken.walkinTime}</span>
                   </div>
                </div>

                {/* Real-time Expiration and QR Verification Block */}
                {(() => {
                   const slotState = getSlotStatus(generatedToken.walkinDate, generatedToken.walkinTime);
                   const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                     JSON.stringify({ id: generatedToken.id, hash: "DSM-SECURE", name: generatedToken.name, slot: generatedToken.walkinTime, service: generatedToken.serviceName })
                   )}`;
                   return (
                     <div className="border-t border-b border-white/5 py-4 space-y-3 font-sans">
                       <div className={`flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl border text-[11px] gap-2 ${slotState.colorClass}`}>
                         <div className="flex items-center gap-1.5 font-bold shrink-0">
                           <Clock size={13} />
                           <span>Slot Status: {slotState.label}</span>
                         </div>
                         <span className="text-[9px] text-slate-400 font-medium leading-tight sm:text-right">
                           {slotState.status === 'expired' 
                             ? 'Expired: Slot released' 
                             : 'Released if unclaimed after 1 hr'}
                         </span>
                       </div>

                       <div className="bg-[#0b0f1a] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                         <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mb-2.5 flex items-center gap-1.5 font-sans font-black">
                           <QrCode size={12} className="text-blue-500 animate-pulse" /> Counter Entry Verifier QR
                         </span>
                         
                         {/* Pristine high-contrast QR wrapper */}
                         <div className="bg-white p-2.5 rounded-xl inline-block shadow-lg hover:scale-102 transition-transform duration-350">
                            <img 
                              src={qrDataUrl} 
                              alt="Booking QR Code" 
                              className="w-32 h-32 object-contain"
                              referrerPolicy="no-referrer"
                            />
                         </div>

                         <p className="text-[9px] text-slate-400 mt-2 max-w-sm font-semibold leading-relaxed font-sans">
                           Show this QR at the entrance counter for checking in. 
                           {slotState.status !== 'expired' && " If unclaimed within 1 hour under this slot, your reservation is automatically released."}
                         </p>
                       </div>
                     </div>
                   );
                })()}

                <div className="border-t border-slate-800 pt-5">
                   <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Required Documents to Bring:</span>
                   <div className="space-y-2">
                     {generatedToken.documentsNeeded.map((doc, i) => (
                       <div key={i} className="flex gap-2.5 text-xs text-slate-300 font-semibold items-center">
                          <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                          <span>{doc}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Authorized Walk-in Counter</span>
                  <span className="text-blue-400 font-semibold">Dasmo Cyber Cafe Portal</span>
                </div>
             </div>

             <div className="mt-8 flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 justify-center inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
                >
                  <Download size={16} /> Print/Download Token
                </button>
                <button
                  onClick={() => { setSubmitSuccess(false); setGeneratedToken(null); }}
                  className="flex-1 justify-center inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
                >
                  Book Another Service
                </button>
             </div>
          </div>
        ) : (
          /* Vault tokens list view */
          <div className="max-w-4xl mx-auto space-y-6">
             {savedTokens.length === 0 ? (
                <div className="bg-[#0b0f1a] border border-white/5 p-12 text-center rounded-3xl">
                   <Ticket size={48} className="mx-auto text-slate-600 mb-4 stroke-[1]" />
                   <p className="text-slate-400 text-base font-bold">No active slots found on this device.</p>
                   <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Generate a priority walkthrough token to check document requirements and secure digital slot booking.</p>
                </div>
             ) : (
                <div className="space-y-6">
                  {/* Vault Sub-tabs */}
                  <div className="flex border-b border-white/10 pb-px gap-6 mb-2">
                     <button
                       onClick={() => setVaultSubTab('active')}
                       className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${vaultSubTab === 'active' ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                     >
                       Active Slots ({activeTokens.length})
                       {vaultSubTab === 'active' && (
                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                       )}
                     </button>
                     <button
                       onClick={() => setVaultSubTab('history')}
                       className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${vaultSubTab === 'history' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                     >
                       Completed History ({historyTokens.length})
                       {vaultSubTab === 'history' && (
                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                       )}
                     </button>
                  </div>

                  {/* Render items based on chosen subTab */}
                  {((vaultSubTab === 'active' ? activeTokens : historyTokens).length === 0) ? (
                    <div className="bg-[#0b0f1a] border border-white/5 p-12 text-center rounded-2xl">
                       <Ticket size={36} className="mx-auto mb-3 stroke-[1] text-slate-600" />
                       <p className="text-slate-400 text-sm font-bold">
                         {vaultSubTab === 'active' ? 'No active booking slots.' : 'No service check-in history found.'}
                       </p>
                       <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                         {vaultSubTab === 'active' 
                           ? 'All your generated tokens are resolved, expired, or checked-in!' 
                           : 'Checked-in slots will naturally appear in your service history tab.'}
                       </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {(vaultSubTab === 'active' ? activeTokens : historyTokens).map((token) => {
                         const status = getSlotStatus(token.walkinDate, token.walkinTime);
                         const isHistory = vaultSubTab === 'history';
                         return (
                            <div key={token.id} className={`bg-[#0b0f1a] border rounded-2xl p-6 flex flex-col justify-between relative hover:border-blue-500/30 transition-all ${isHistory ? 'opacity-70 border-white/5' : 'border-white/10'}`}>
                               <div className="absolute top-4 right-4 flex items-center gap-1.5 font-sans">
                                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isHistory ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/15' : status.colorClass}`}>
                                   {isHistory ? 'Completed' : status.label}
                                 </span>
                                 <span className="bg-blue-500/10 text-blue-300 text-[11px] font-bold px-2.5 py-1 rounded border border-blue-500/15">
                                   {token.id}
                                 </span>
                               </div>
                               
                               <div className="space-y-4 pt-4">
                               <div>
                                 <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">{token.walkinDate} • {token.walkinTime}</span>
                                 <h4 className="font-display font-semibold text-lg text-white mt-0.5">{token.serviceName}</h4>
                                 <p className="text-xs text-slate-400 font-semibold mt-1">Applicant: <span className="text-slate-200">{token.name}</span></p>
                               </div>

                               <div className="bg-[#030712] border border-white/5 p-3 rounded-xl space-y-1.5">
                                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Bring Checklist:</div>
                                  {token.documentsNeeded.slice(0, 3).map((doc, idx) => (
                                    <div key={idx} className="flex gap-2 text-xs font-medium text-slate-400 truncate">
                                       <span className="text-emerald-500 font-bold">•</span> {doc}
                                    </div>
                                  ))}
                                  {token.documentsNeeded.length > 3 && (
                                    <p className="text-[10px] text-slate-600 font-medium italic pl-2">+{token.documentsNeeded.length - 3} more essential documents...</p>
                                  )}
                               </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 mt-5 flex justify-between items-center">
                              <button
                                onClick={() => { setSelectedServiceId(token.serviceCategory); setGeneratedToken(token); setSubmitSuccess(true); setActiveTab('create'); }}
                                className="text-xs text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                              >
                                Display Complete Receipt
                              </button>
                              {!isHistory && (
                                <button
                                  onClick={() => deleteToken(token.id, token.mobile)}
                                  className="text-xs text-slate-500 hover:text-red-400 font-bold cursor-pointer"
                                >
                                  Revoke Token
                                </button>
                              )}
                            </div>
                         </div>
                      ); })}
                    </div>
                  )}
                </div>
             )}
          </div>
        )}

      </div>
    </section>
  );
}
