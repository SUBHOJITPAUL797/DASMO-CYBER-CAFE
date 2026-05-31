import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useCatalog, CatalogData } from '../context/CatalogContext';
import { 
  Lock, LogOut, CheckCircle2, Save, Sparkles, RefreshCw, Plus, Trash2, 
  Settings, X, ShieldAlert, Cpu, Code, Printer, FileText, Star, Database, AlertCircle,
  CalendarDays, Calendar, Ticket, Flame, Check, Phone, Search
} from 'lucide-react';
import { 
  collection, doc, getDoc, onSnapshot, writeBatch 
} from 'firebase/firestore';
import { getSlotStatus } from '../utils/bookingUtils';
import QRScanner from './QRScanner';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type CatalogSection = 'central' | 'state' | 'special' | 'support' | 'printing' | 'software_dev' | 'live_status' | 'bookings_list';

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { catalog, isFirebaseActive, saveCatalog, seedFirebase } = useCatalog();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Local editable copy of the catalog
  const [editedCatalog, setEditedCatalog] = useState<CatalogData | null>(null);
  const [activeSection, setActiveSection] = useState<CatalogSection>('central');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [actionError, setActionError] = useState('');

  // Bookings lists states
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');

  // Load bookings from Firestore database
  useEffect(() => {
    if (!currentUser || activeSection !== 'bookings_list') return;

    setBookingsLoading(true);
    const bookingsColl = collection(db, 'bookings');
    
    const unsubscribe = onSnapshot(
      bookingsColl,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setBookings(list);
        setBookingsLoading(false);
      },
      (error) => {
        console.error("Booking sync failed:", error);
        setBookingsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, activeSection]);

  const updateBookingConfigField = (field: string, value: any) => {
    if (!editedCatalog) return;
    const currentConfig = editedCatalog.bookingConfig || {
      startHour: '09:00',
      endHour: '21:00',
      slotGap: 30,
      limitPerPhone: 3
    };
    setEditedCatalog({
      ...editedCatalog,
      bookingConfig: {
        ...currentConfig,
        [field]: value
      }
    });
  };

  const handleDeleteBooking = async (booking: any) => {
    if (!window.confirm(`Resolve and remove slot booking for ${booking.name}? This will free up their phone booking count.`)) return;
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, 'bookings', booking.id);
      batch.delete(bookingRef);

      const limitRef = doc(db, 'client_limits', booking.mobile);
      const limitSnap = await getDoc(limitRef);
      if (limitSnap.exists()) {
        const data = limitSnap.data();
        const updatedIds = (data.bookingIds || []).filter((id: string) => id !== booking.id);
        batch.set(limitRef, {
          ...data,
          bookingIds: updatedIds,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();
    } catch (err: any) {
      console.error("Booking removal error:", err);
      alert("Failed to remove booking: " + err.message);
    }
  };

  const handleCheckInById = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, 'bookings', booking.id);
      batch.delete(bookingRef);

      const limitRef = doc(db, 'client_limits', booking.mobile);
      const limitSnap = await getDoc(limitRef);
      if (limitSnap.exists()) {
        const data = limitSnap.data();
        const updatedIds = (data.bookingIds || []).filter((id: string) => id !== booking.id);
        batch.set(limitRef, {
          ...data,
          bookingIds: updatedIds,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();
    } catch (err: any) {
      console.error("QR Check-in error:", err);
      throw err;
    }
  };

  // Watch authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync edits when catalog changes or component opens
  useEffect(() => {
    if (isOpen && catalog) {
      setEditedCatalog(JSON.parse(JSON.stringify(catalog)));
    }
  }, [isOpen, catalog]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setActionError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to authentic with Google.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error(err);
    }
  };

  const isAdmin = currentUser && (
    currentUser.email === 'suvojitpal797@gmail.com' ||
    currentUser.email === 'subhojitpaul26042004@gmail.com'
  );

  const handleSave = async () => {
    if (!editedCatalog) return;
    setSaveStatus('saving');
    setActionError('');
    try {
      await saveCatalog(editedCatalog);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      console.error(err);
      setSaveStatus('error');
      setActionError(err.message || 'Permission denied or Firestore sync crashed.');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("Restore and seed database from default hardcoded parameters? This overwrites current Firestore variables.")) return;
    setActionError('');
    setSaveStatus('saving');
    try {
      await seedFirebase();
      setSaveStatus('success');
      // Force reload editedCatalog
      setEditedCatalog(JSON.parse(JSON.stringify(catalog)));
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      console.error(err);
      setSaveStatus('error');
      setActionError(err.message || 'Seeding Firestore failure.');
    }
  };

  // Helper state changers for array items
  const updateServiceField = (idx: number, field: string, value: any) => {
    if (!editedCatalog) return;
    const arrayName = activeSection as 'central' | 'state' | 'special' | 'support';
    const updatedSection = [...editedCatalog[arrayName]];
    updatedSection[idx] = { ...updatedSection[idx], [field]: value };
    setEditedCatalog({ ...editedCatalog, [arrayName]: updatedSection });
  };

  const addDocumentToService = (svcIdx: number) => {
    if (!editedCatalog) return;
    const arrayName = activeSection as 'central' | 'state' | 'special' | 'support';
    const updatedSection = [...editedCatalog[arrayName]];
    const docs = [...(updatedSection[svcIdx].documents || [])];
    docs.push("New Document Requirement");
    updatedSection[svcIdx] = { ...updatedSection[svcIdx], documents: docs };
    setEditedCatalog({ ...editedCatalog, [arrayName]: updatedSection });
  };

  const removeDocumentFromService = (svcIdx: number, docIdx: number) => {
    if (!editedCatalog) return;
    const arrayName = activeSection as 'central' | 'state' | 'special' | 'support';
    const updatedSection = [...editedCatalog[arrayName]];
    const docs = (updatedSection[svcIdx].documents || []).filter((_: any, i: number) => i !== docIdx);
    updatedSection[svcIdx] = { ...updatedSection[svcIdx], documents: docs };
    setEditedCatalog({ ...editedCatalog, [arrayName]: updatedSection });
  };

  const updateDocumentText = (svcIdx: number, docIdx: number, val: string) => {
    if (!editedCatalog) return;
    const arrayName = activeSection as 'central' | 'state' | 'special' | 'support';
    const updatedSection = [...editedCatalog[arrayName]];
    const docs = [...(updatedSection[svcIdx].documents || [])];
    docs[docIdx] = val;
    updatedSection[svcIdx] = { ...updatedSection[svcIdx], documents: docs };
    setEditedCatalog({ ...editedCatalog, [arrayName]: updatedSection });
  };

  const addServiceItem = () => {
    if (!editedCatalog) return;
    const arrayName = activeSection as 'central' | 'state' | 'special' | 'support';
    const updatedSection = [...editedCatalog[arrayName]];
    
    updatedSection.push({
      id: 'custom_' + Math.floor(1000 + Math.random() * 9000),
      name: 'New Custom Service Scheme',
      benefits: 'Detail benefits or descriptions go here.',
      approxFee: 100,
      documents: ['Aadhaar Card', 'Mobile Number'],
      icon: 'FileText'
    });
    setEditedCatalog({ ...editedCatalog, [arrayName]: updatedSection });
  };

  const deleteServiceItem = (idx: number) => {
    if (!editedCatalog) return;
    const arrayName = activeSection as 'central' | 'state' | 'special' | 'support';
    const updatedSection = editedCatalog[arrayName].filter((_, i) => i !== idx);
    setEditedCatalog({ ...editedCatalog, [arrayName]: updatedSection });
  };

  // Helper updates for Printing rates
  const updatePrintingItem = (idx: number, field: string, value: any) => {
    if (!editedCatalog) return;
    const updated = [...editedCatalog.printing];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedCatalog({ ...editedCatalog, printing: updated });
  };

  const addPrintingItem = () => {
    if (!editedCatalog) return;
    const updated = [...editedCatalog.printing];
    updated.push({
      id: 'print_' + Math.floor(1000 + Math.random() * 9000),
      name: 'Custom Billed Item',
      rate: 10,
      unit: 'Per Page',
      icon: 'Printer'
    });
    setEditedCatalog({ ...editedCatalog, printing: updated });
  };

  const removePrintingItem = (idx: number) => {
    if (!editedCatalog) return;
    const updated = editedCatalog.printing.filter((_, i) => i !== idx);
    setEditedCatalog({ ...editedCatalog, printing: updated });
  };

  // Helper updates for software dev items
  const updateSoftwareItem = (idx: number, field: string, value: any) => {
    if (!editedCatalog) return;
    const updated = [...editedCatalog.software_dev];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedCatalog({ ...editedCatalog, software_dev: updated });
  };

  const addSoftwareItem = () => {
    if (!editedCatalog) return;
    const updated = [...editedCatalog.software_dev];
    updated.push({
      id: 'soft_' + Math.floor(1000 + Math.random() * 9000),
      name: 'High Performance Development Service',
      duration: '2-3 Weeks',
      icon: 'Code'
    });
    setEditedCatalog({ ...editedCatalog, software_dev: updated });
  };

  const removeSoftwareItem = (idx: number) => {
    if (!editedCatalog) return;
    const updated = editedCatalog.software_dev.filter((_, i) => i !== idx);
    setEditedCatalog({ ...editedCatalog, software_dev: updated });
  };

  const updateStatusInfoField = (field: string, value: any) => {
    if (!editedCatalog) return;
    const currentStatusInfo = editedCatalog.statusInfo || {
      happyWalkins: '45,800+',
      formsProcessed: '12,400+',
      techClients: '1,250+',
      announcementTitle: 'Instant Walk-in Special',
      announcementText: 'Need instant colored passport size photos or emergency Aadhaar updating? Just walk straight in to our Mejhia counter. Average billing wait time is under 4 minutes.',
      locationText: 'Ardhagram, Mejhia',
      cafeStatus: 'auto'
    };
    
    setEditedCatalog({
      ...editedCatalog,
      statusInfo: {
        ...currentStatusInfo,
        [field]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0b0f19] border border-white/10 rounded-[2rem] flex flex-col justify-between shadow-2xl relative">
        
        {/* Header bar controls */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-amber-500 to-red-500 text-slate-950 p-2.5 rounded-xl shadow-lg shadow-red-500/15">
                <Settings size={22} className="animate-spin" style={{ animationDuration: '10s' }} />
             </div>
             <div>
                <h3 className="text-xl font-display font-black text-white tracking-tight flex items-center gap-2">
                   Dasmo Cyber Admin Panel
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure live digital scheme catalogs, fees, and client guidelines instantly in Firestore database.</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
            title="Close Dashboard"
          >
            <X size={20} />
          </button>
        </div>

        {/* Center content wrapper */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Auth loading screen */}
          {authLoading ? (
            <div className="flex-1 flex flex-col justify-center items-center py-24 space-y-4">
              <RefreshCw size={32} className="text-blue-500 animate-spin" />
              <span className="text-sm text-slate-400 font-mono">Authenticating session variables...</span>
            </div>
          ) : !currentUser ? (
            /* SignIn view */
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center max-w-md mx-auto space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
                 <Lock size={36} className="mx-auto" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Administrator Log In</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Authentication is highly locked. Only your configured email is authorized to gain edit privileges.
                </p>
              </div>

              {actionError && (
                <div className="w-full p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2 text-left">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white text-slate-950 font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-[0.98]"
              >
                {/* Custom inline clean Google G-Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.7l3.25-3.25C17.65 1.58 15.01 1 12 1 7.24 1 3.23 3.73 1.34 7.69l3.85 2.99C6.1 7.57 8.82 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.63z" />
                  <path fill="#FBBC05" d="M5.19 14.3C4.94 13.56 4.8 12.79 4.8 12s.14-1.56.39-2.3L1.34 6.71C.49 8.4-.01 10.15-.01 12s.5 3.6 1.35 5.29l3.85-2.99z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.03.69-2.35 1.1-4.23 1.1-3.18 0-5.9-2.53-6.81-5.64l-3.85 2.99C3.23 20.27 7.24 23 12 23z" />
                </svg>
                Sign in with Google Admin
              </button>
            </div>
          ) : !isAdmin ? (
            /* Restricted unauthorized access view */
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center max-w-md mx-auto space-y-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl animate-pulse">
                 <ShieldAlert size={36} className="mx-auto" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Access Disallowed</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  You aren't Subhojit or Suvojit! This digital workstation's edit access is strictly restricted to registered portal administrators only.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={16} /> Sign Out & Re-authenticate
              </button>
            </div>
          ) : (
            /* Admin loaded interface panels mapping database configuration */
            <>
              {/* Category selector sidebar */}
              <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/5 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:overflow-x-visible shrink-0 md:max-h-full">
                <span className="hidden md:block text-[10px] text-slate-500 font-black tracking-widest uppercase mb-2 px-3">Service Sectors</span>
                
                {([
                  { id: 'central', label: 'Central Govt', icon: FileText },
                  { id: 'state', label: 'State Govt', icon: FileText },
                  { id: 'special', label: 'Special Schemes', icon: Star },
                  { id: 'support', label: 'System support', icon: Cpu },
                  { id: 'printing', label: 'Printing rates', icon: Printer },
                  { id: 'software_dev', label: 'Software Dev', icon: Code },
                  { id: 'live_status', label: 'Live Cafe Status', icon: Settings },
                  { id: 'bookings_list', label: 'Client Bookings', icon: CalendarDays },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full ${activeSection === tab.id ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}

                <div className="hidden md:block mt-auto border-t border-white/5 pt-4 px-3 space-y-2">
                   <span className="text-[10px] text-slate-500 font-bold block">User Identity:</span>
                   <span className="text-[10.5px] font-mono font-bold text-slate-300 block truncate" title={currentUser.email || ''}>{currentUser.email}</span>
                   <button
                     onClick={handleLogout}
                     className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 cursor-pointer mt-1 hover:underline"
                   >
                     <LogOut size={12} /> Log Out
                   </button>
                </div>
              </div>

              {/* Editable values form viewport container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {actionError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-sm">
                    <ShieldAlert size={18} className="shrink-0 animate-bounce" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* DB status indicator */}
                <div className="flex justify-between items-center bg-[#151c2e]/40 p-4 rounded-2xl border border-white/5 flex-wrap gap-3">
                   <div className="flex items-center gap-2.5">
                     <Database className="text-blue-400" size={18} />
                     <div>
                       <span className="text-slate-300 text-xs font-extrabold flex items-center gap-1">
                          Database Storage: 
                          <span className={isFirebaseActive ? "text-emerald-400" : "text-amber-400"}>
                            {isFirebaseActive ? "Connected Live" : "Local Fallback Status (No document seeded)"}
                          </span>
                       </span>
                       <p className="text-[10px] text-slate-500 mt-0.5">Loads live online configs. Seeding writes static arrays as base values.</p>
                     </div>
                   </div>
                   {!isFirebaseActive && (
                     <button
                       onClick={handleSeed}
                       className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                     >
                       <Database size={12} /> Seed Defaults to DB
                     </button>
                   )}
                </div>

                {editedCatalog ? (
                  <>
                    {/* Render inputs for normal scheme sections (Central, State, Special, Support) */}
                    {(activeSection === 'central' || activeSection === 'state' || activeSection === 'special' || activeSection === 'support') && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                             Active Catalog items ({editedCatalog[activeSection]?.length || 0})
                           </h4>
                           <button
                             onClick={addServiceItem}
                             className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 transition-all"
                           >
                             <Plus size={13} /> Add New Scheme
                           </button>
                        </div>

                        {editedCatalog[activeSection]?.map((svc, sIdx) => (
                           <div key={svc.id} className="bg-[#121828]/60 border border-white/5 p-4 md:p-6 rounded-2xl space-y-4 hover:border-white/10 transition-colors relative">
                              <button
                                onClick={() => deleteServiceItem(sIdx)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                                title="Remove Scheme"
                              >
                                <Trash2 size={14} />
                              </button>

                              <div className="grid md:grid-cols-12 gap-4">
                                <div className="md:col-span-8 space-y-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Scheme/Service Name</label>
                                  <input
                                    type="text"
                                    value={svc.name}
                                    onChange={(e) => updateServiceField(sIdx, 'name', e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                                  />
                                </div>
                                <div className="md:col-span-4 space-y-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Approx Fee (₹)</label>
                                  <input
                                    type="number"
                                    value={svc.approxFee}
                                    onChange={(e) => updateServiceField(sIdx, 'approxFee', parseInt(e.target.value) || 0)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-amber-400 focus:outline-none focus:border-blue-500 font-mono font-bold"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Service Benefits / Dynamic Description</label>
                                <input
                                  type="text"
                                  value={svc.benefits}
                                  onChange={(e) => updateServiceField(sIdx, 'benefits', e.target.value)}
                                  className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                                />
                              </div>

                              {/* Toggle isHot */}
                              <div className="flex items-center gap-3 bg-[#151b2e]/40 p-3 rounded-xl border border-white/5">
                                 <input
                                   type="checkbox"
                                   id={`isHot-${svc.id}-${sIdx}`}
                                   checked={!!svc.isHot}
                                   onChange={(e) => updateServiceField(sIdx, 'isHot', e.target.checked)}
                                   className="w-4.5 h-4.5 text-blue-600 focus:ring-blue-500 border-white/10 rounded bg-[#0b0f19] cursor-pointer"
                                 />
                                 <label htmlFor={`isHot-${svc.id}-${sIdx}`} className="text-xs font-bold text-slate-350 cursor-pointer flex items-center gap-1.5 selection:bg-transparent">
                                   <Flame size={14} className="text-red-500 animate-pulse fill-red-500" />
                                   Highlight as Hot/Featured Scheme (Render on top of public view with glowing animations)
                                 </label>
                              </div>

                              <div className="space-y-2.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Documents checklist requirements:</span>
                                <div className="space-y-2">
                                  {svc.documents?.map((doc: string, dIdx: number) => (
                                    <div key={dIdx} className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        value={doc}
                                        onChange={(e) => updateDocumentText(sIdx, dIdx, e.target.value)}
                                        className="flex-1 bg-[#0b0f19]/70 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-semibold"
                                      />
                                      <button
                                        onClick={() => removeDocumentFromService(sIdx, dIdx)}
                                        className="text-slate-500 hover:text-red-400 p-1.5"
                                        title="Delete requirement"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addDocumentToService(sIdx)}
                                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-400 hover:text-blue-300 hover:underline mt-1 cursor-pointer"
                                  >
                                    <Plus size={12} /> Add document metric
                                  </button>
                                </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    )}

                    {/* Render Printing Prices */}
                    {activeSection === 'printing' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                             Printing & Xerox Calculator Rates ({editedCatalog.printing?.length || 0})
                           </h4>
                           <button
                             onClick={addPrintingItem}
                             className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 transition-all"
                           >
                             <Plus size={13} /> Add Rate Column
                           </button>
                        </div>

                        <div className="space-y-3">
                          {editedCatalog.printing?.map((print, pIdx) => (
                            <div key={print.id} className="grid sm:grid-cols-12 gap-3 bg-[#121828]/60 border border-white/5 p-3.5 rounded-2xl items-center relative">
                               <div className="sm:col-span-5 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Service Category Title</span>
                                  <input
                                    type="text"
                                    value={print.name}
                                    onChange={(e) => updatePrintingItem(pIdx, 'name', e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold"
                                  />
                               </div>
                               <div className="sm:col-span-3 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Rate (₹)</span>
                                  <input
                                    type="number"
                                    value={print.rate}
                                    onChange={(e) => updatePrintingItem(pIdx, 'rate', parseInt(e.target.value) || 0)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-emerald-400 focus:outline-none font-bold font-mono"
                                  />
                               </div>
                               <div className="sm:col-span-3 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Unit</span>
                                  <input
                                    type="text"
                                    value={print.unit}
                                    onChange={(e) => updatePrintingItem(pIdx, 'unit', e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none font-semibold"
                                  />
                               </div>
                               <div className="sm:col-span-1 pt-4 flex justify-end">
                                  <button
                                    onClick={() => removePrintingItem(pIdx)}
                                    className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                                    title="Delete printing option"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render Custom Software specifications */}
                    {activeSection === 'software_dev' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                             Software Dev Products & Timelines ({editedCatalog.software_dev?.length || 0})
                           </h4>
                           <button
                             onClick={addSoftwareItem}
                             className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 transition-all"
                           >
                             <Plus size={13} /> Add Software Product
                           </button>
                        </div>

                        <div className="space-y-3">
                          {editedCatalog.software_dev?.map((soft, sIdx) => (
                            <div key={soft.id} className="grid sm:grid-cols-12 gap-3 bg-[#121828]/60 border border-white/5 p-3.5 rounded-2xl items-center">
                               <div className="sm:col-span-7 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Technical Product Type</span>
                                  <input
                                    type="text"
                                    value={soft.name}
                                    onChange={(e) => updateSoftwareItem(sIdx, 'name', e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold"
                                  />
                               </div>
                               <div className="sm:col-span-4 space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Duration Time</span>
                                  <input
                                    type="text"
                                    value={soft.duration}
                                    onChange={(e) => updateSoftwareItem(sIdx, 'duration', e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-blue-400 focus:outline-none font-bold"
                                  />
                               </div>
                               <div className="sm:col-span-1 pt-4 flex justify-end">
                                  <button
                                    onClick={() => removeSoftwareItem(sIdx)}
                                    className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                                    title="Delete product"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render Live Cafe Status editors */}
                    {activeSection === 'live_status' && (
                      <div className="space-y-6">
                        <div className="pb-2 border-b border-white/5">
                           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                             Live Cafe Status Card & Displays
                           </h4>
                        </div>

                        <div className="bg-[#121828]/60 border border-white/5 p-4 md:p-6 rounded-2xl space-y-6">
                          
                          {/* Force Status Dropdown */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cafe Current Operating Mode</label>
                            <select
                              value={editedCatalog.statusInfo?.cafeStatus || 'auto'}
                              onChange={(e) => updateStatusInfoField('cafeStatus', e.target.value)}
                              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                            >
                              <option value="auto">Auto-detect (Open from 9:00 AM to 9:00 PM IST)</option>
                              <option value="open">Force ALWAYS OPEN (Display Cafe Is Open)</option>
                              <option value="closed">Force ALWAYS CLOSED (Display Cafe Is Closed)</option>
                            </select>
                            <p className="text-[10px] text-slate-500">Auto mode calculates status dynamically based on current IST clock variables.</p>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Happy Walk-ins label</label>
                              <input
                                type="text"
                                value={editedCatalog.statusInfo?.happyWalkins || ''}
                                onChange={(e) => updateStatusInfoField('happyWalkins', e.target.value)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Govt Forms Processed label</label>
                              <input
                                type="text"
                                value={editedCatalog.statusInfo?.formsProcessed || ''}
                                onChange={(e) => updateStatusInfoField('formsProcessed', e.target.value)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-emerald-400 focus:outline-none focus:border-blue-500 font-mono font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registered Tech Clients label</label>
                              <input
                                type="text"
                                value={editedCatalog.statusInfo?.techClients || ''}
                                onChange={(e) => updateStatusInfoField('techClients', e.target.value)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-amber-400 focus:outline-none focus:border-blue-500 font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Announcement Banner Title</label>
                            <input
                              type="text"
                              value={editedCatalog.statusInfo?.announcementTitle || ''}
                              onChange={(e) => updateStatusInfoField('announcementTitle', e.target.value)}
                              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Announcement Banner Description</label>
                            <textarea
                              rows={3}
                              value={editedCatalog.statusInfo?.announcementText || ''}
                              onChange={(e) => updateStatusInfoField('announcementText', e.target.value)}
                              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Address / Location Text</label>
                            <input
                              type="text"
                              value={editedCatalog.statusInfo?.locationText || ''}
                              onChange={(e) => updateStatusInfoField('locationText', e.target.value)}
                              className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                            />
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Render Client Bookings */}
                    {activeSection === 'bookings_list' && (
                      <div className="space-y-6">
                        <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                           <div>
                             <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                               Live Client Reservations ({bookings.length})
                             </h4>
                             <p className="text-[10px] text-slate-500 mt-1">Real-time walk-in bookings registered in Firestore database.</p>
                           </div>
                        </div>

                        {/* Booking Schedule Configurations */}
                        <div className="bg-[#121828]/60 border border-white/5 p-4 md:p-6 rounded-2xl space-y-4">
                          <h5 className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Settings size={14} className="text-blue-400" /> Walk-In Slots Configurations
                          </h5>
                          
                          <div className="grid md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cafe Operating Open Time</label>
                              <select
                                value={editedCatalog.bookingConfig?.startHour || '09:00'}
                                onChange={(e) => updateBookingConfigField('startHour', e.target.value)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                              >
                                {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'].map(t => (
                                  <option key={t} value={t}>{t} AM</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cafe Operating Close Time</label>
                              <select
                                value={editedCatalog.bookingConfig?.endHour || '21:00'}
                                onChange={(e) => updateBookingConfigField('endHour', e.target.value)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                              >
                                {['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                                  <option key={t} value={t}>{parseInt(t) - 12}:00 PM</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gap Interval (Minutes)</label>
                              <select
                                value={editedCatalog.bookingConfig?.slotGap || 30}
                                onChange={(e) => updateBookingConfigField('slotGap', parseInt(e.target.value) || 30)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                              >
                                {[15, 30, 45, 60].map(gap => (
                                  <option key={gap} value={gap}>{gap} minutes Gap</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rate Limit (per unique mobile)</label>
                              <select
                                value={editedCatalog.bookingConfig?.limitPerPhone || 3}
                                onChange={(e) => updateBookingConfigField('limitPerPhone', parseInt(e.target.value) || 3)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                              >
                                {[1, 2, 3, 5, 10].map(limit => (
                                  <option key={limit} value={limit}>{limit} Active booking{limit > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Changes are secure and securely enforced server-side. Click Save main database button below to apply.</p>
                        </div>

                        {/* Interactive QR and barcode scanner intake check-in */}
                        <QRScanner bookings={bookings} onCheckIn={handleCheckInById} />

                        {/* Search & Filter bookings list */}
                        <div className="bg-[#121828]/60 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                           <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <Search size={16} />
                              </div>
                              <input
                                type="text"
                                value={bookingSearch}
                                onChange={(e) => setBookingSearch(e.target.value)}
                                placeholder="Search reservations by name, mobile, work requested, etc."
                                className="w-full bg-[#0b0f19] border border-white/10 text-slate-300 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:border-blue-500 focus:outline-none"
                              />
                           </div>
                           {bookingSearch && (
                             <button onClick={() => setBookingSearch('')} className="text-xs text-slate-400 hover:text-white hover:underline">Clear</button>
                           )}
                        </div>

                        {/* Real-time bookings list block */}
                        {bookingsLoading ? (
                          <div className="py-12 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-2">
                             <RefreshCw size={24} className="animate-spin text-blue-500" />
                             <span>Loading client registrations...</span>
                          </div>
                        ) : bookings.length === 0 ? (
                          <div className="bg-[#121828]/30 border border-white/5 p-12 rounded-2xl text-center">
                             <Ticket size={36} className="mx-auto text-slate-600 mb-2" />
                             <p className="text-slate-400 text-xs font-bold">No active reservations recorded on databases.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {bookings
                              .filter(b => {
                                if (!bookingSearch.trim()) return true;
                                const term = bookingSearch.toLowerCase();
                                return (b.name || '').toLowerCase().includes(term) ||
                                       (b.mobile || '').toLowerCase().includes(term) ||
                                       (b.work || '').toLowerCase().includes(term);
                              })
                              .map((booking) => {
                                const status = getSlotStatus(booking.date, booking.time);
                                return (
                                  <div key={booking.id} className="bg-[#121828]/60 hover:bg-[#121828]/95 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                                  <div className="flex items-start gap-3.5">
                                     <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-xl border border-blue-500/15 shrink-0">
                                        <Ticket size={18} />
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5 className="font-bold text-white text-sm">{booking.name}</h5>
                                          <span className="text-[10px] bg-[#1a233b] text-blue-300 font-bold px-2 py-0.5 rounded-md border border-blue-500/15">{booking.id}</span>
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${status.colorClass}`}>
                                            {status.label}
                                          </span>
                                        </div>
                                        <p className="text-slate-400 text-xs mt-1 font-semibold flex items-center gap-1.5 flex-wrap">
                                          <span className="text-amber-400 font-extrabold">{booking.work}</span>
                                          <span className="text-slate-650">•</span>
                                          <span className="text-slate-400 inline-flex items-center gap-1"><Phone size={11} className="text-slate-500" /> {booking.mobile}</span>
                                        </p>
                                     </div>
                                  </div>

                                  <div className="flex items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                                     <div className="text-left md:text-right">
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Walk-In Date & Slot</span>
                                        <span className="text-emerald-400 font-bold font-mono text-xs block mt-0.5">{booking.date} • {booking.time}</span>
                                     </div>
                                     <button
                                       onClick={() => handleDeleteBooking(booking)}
                                       className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-300 font-bold py-1.5 px-3 rounded-lg text-[11px] transition-all flex items-center gap-1 hover:scale-[1.02]"
                                       title="Mark client service task as completed and remove from active list"
                                     >
                                       <Check size={12} /> Resolve
                                     </button>
                                  </div>
                                </div>
                              ); })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-2">
                     <AlertCircle size={32} />
                     <p>Loading database parameters...</p>
                  </div>
                )}

              </div>
            </>
          )}

        </div>

        {/* Floating controls footer save bar */}
        {currentUser && isAdmin && editedCatalog && (
          <div className="p-5 border-t border-white/5 bg-[#070a13] rounded-b-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2">
               <span className="flex h-2.5 w-2.5 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
               </span>
               <span className="text-xs text-slate-400 font-mono font-medium">
                 {saveStatus === 'saving' && 'Saving updates to Google Firestore...'}
                 {saveStatus === 'success' && '🔥 All rates and document checklist catalog details saved instantly!'}
                 {saveStatus === 'error' && '❌ Database replication failed. Retrying...'}
                 {saveStatus === 'idle' && 'Ready to sync modifications.'}
               </span>
             </div>

             <div className="flex gap-3 w-full sm:w-auto">
               <button
                 onClick={() => setEditedCatalog(JSON.parse(JSON.stringify(catalog)))}
                 disabled={saveStatus === 'saving'}
                 className="flex-1 sm:flex-initial bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
               >
                 Reset Edits
               </button>
               <button
                 onClick={handleSave}
                 disabled={saveStatus === 'saving'}
                 className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 active:scale-95 cursor-pointer"
               >
                 {saveStatus === 'saving' ? (
                   <RefreshCw className="animate-spin" size={13} />
                 ) : (
                   <Save size={13} />
                 )}
                 Save catalog database
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
