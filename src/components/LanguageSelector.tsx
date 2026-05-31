import React, { useState, useEffect } from 'react';
import { Globe, Check, AlertCircle, Compass, RefreshCw, Languages, X } from 'lucide-react';

// Cookie helper
const setTranslationCookie = (lang: string) => {
  const domain = window.location.hostname.replace('www.', '');
  const value = `/en/${lang}`;
  const expires = "expires=Fri, 31 Dec 9999 23:59:59 GMT";
  
  document.cookie = `googtrans=${value}; path=/; ${expires};`;
  document.cookie = `googtrans=${value}; path=/; domain=.${domain}; ${expires};`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}; ${expires};`;
};

// Auto-trigger Google combo
export const triggerGoogleTranslate = (langCode: string) => {
  setTranslationCookie(langCode);
  localStorage.setItem('dasmo_lang_choice', langCode);

  const selectCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (selectCombo) {
    selectCombo.value = langCode;
    selectCombo.dispatchEvent(new Event('change'));
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const innerCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (innerCombo) {
        innerCombo.value = langCode;
        innerCombo.dispatchEvent(new Event('change'));
        clearInterval(interval);
      }
      if (attempts > 30) clearInterval(interval);
    }, 400);
  }
};

// Detection core
const detectLanguageByIP = async (): Promise<'bn' | 'hi' | 'en'> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('IP API lookup failed');
    const data = await response.json();
    const region = (data.region || '').toLowerCase();
    const country = (data.country_code || '').toLowerCase();

    if (region.includes('west bengal') || region.includes('bengal') || region.includes('wb')) {
      return 'bn';
    } else if (country === 'in') {
      return 'hi';
    }
  } catch (err) {
    console.warn("IP Language detection backup error:", err);
  }
  return 'en';
};

const detectLanguageByCoords = async (lat: number, lon: number): Promise<'bn' | 'hi' | 'en'> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!response.ok) throw new Error('Osm reverse geocoding hit error');
    const data = await response.json();
    const state = (data.address?.state || '').toLowerCase();
    const countryCode = (data.address?.country_code || '').toLowerCase();

    if (state.includes('west bengal') || state.includes('bengal') || state.includes('wb')) {
      return 'bn';
    } else if (countryCode === 'in') {
      return 'hi';
    }
  } catch (err) {
    console.warn("Coordinates lookup failed, falling back to IP:", err);
  }
  return detectLanguageByIP();
};

export function initGoogleTranslateScript() {
  const SCRIPT_ID = 'google-translate-script';
  if (!document.getElementById(SCRIPT_ID)) {
    // 1. Set window init handler
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,bn,hi',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element_hidden');
    };

    // 2. Load the Translation script
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // 3. Inject any initial cookie translation state
    const saved = localStorage.getItem('dasmo_lang_choice') || 'en';
    if (saved !== 'en') {
      setTranslationCookie(saved);
    }
  }
}

// ----------------------------------------------------
// Navigation bar language picker
// ----------------------------------------------------
export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<'en' | 'bn' | 'hi'>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initGoogleTranslateScript();
    
    const saved = localStorage.getItem('dasmo_lang_choice') as 'en' | 'bn' | 'hi' || 'en';
    setCurrentLang(saved);
    triggerGoogleTranslate(saved);
  }, []);

  const handleSelect = (lang: 'en' | 'bn' | 'hi') => {
    setCurrentLang(lang);
    triggerGoogleTranslate(lang);
    setIsOpen(false);
  };

  const getLangName = (code: 'en' | 'bn' | 'hi') => {
    switch (code) {
      case 'bn': return 'বাংলা (Bengali)';
      case 'hi': return 'हिन्दी (Hindi)';
      default: return 'English';
    }
  };

  return (
    <div className="relative font-sans z-50">
      {/* Hidden element needed for Google Translate */}
      <div id="google_translate_element_hidden" style={{ display: 'none', visibility: 'hidden' }}></div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs md:text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 md:px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer"
        title="Change language / ভাষা পরিবর্তন করুন"
      >
        <Globe size={15} className="text-blue-400 shrink-0" />
        <span>{getLangName(currentLang).split(' ')[0]}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-[#0c101d] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-255">
            <div className="text-[10px] text-slate-500 font-extrabold px-3 py-1.5 uppercase tracking-wider border-b border-white/5 mb-1.5 font-mono">
              Choose Language
            </div>
            
            <button
              onClick={() => handleSelect('en')}
              className={`w-full flex items-center justify-between text-left text-xs font-bold py-2 px-3 rounded-lg transition-all ${currentLang === 'en' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span>English</span>
              {currentLang === 'en' && <Check size={14} />}
            </button>
            
            <button
              onClick={() => handleSelect('bn')}
              className={`w-full flex items-center justify-between text-left text-xs font-bold py-2 px-3 rounded-lg transition-all ${currentLang === 'bn' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span>বাংলা (Bengali)</span>
              {currentLang === 'bn' && <Check size={14} />}
            </button>
            
            <button
              onClick={() => handleSelect('hi')}
              className={`w-full flex items-center justify-between text-left text-xs font-bold py-2 px-3 rounded-lg transition-all ${currentLang === 'hi' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span>हिन्दी (Hindi)</span>
              {currentLang === 'hi' && <Check size={14} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Automatic Consent overlay prompt modal
// ----------------------------------------------------
export function LanguageConsentOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedLangName, setSelectedLangName] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already declared their choice
    const isPreferred = localStorage.getItem('dasmo_lang_preferred');
    if (!isPreferred) {
      // Delay slightly for dramatic, nice UX entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleManualSelection = (lang: 'en' | 'bn' | 'hi') => {
    localStorage.setItem('dasmo_lang_preferred', 'manual');
    triggerGoogleTranslate(lang);
    setIsVisible(false);
  };

  const startAutoDetection = () => {
    setIsDetecting(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const detectedCode = await detectLanguageByCoords(lat, lon);
          
          triggerGoogleTranslate(detectedCode);
          localStorage.setItem('dasmo_lang_preferred', 'auto');
          
          const label = detectedCode === 'bn' ? 'Bengali (বাংলা)' : detectedCode === 'hi' ? 'Hindi (हिन्दी)' : 'English';
          setSelectedLangName(label);
          setIsDetecting(false);
          
          // Close after short success display
          setTimeout(() => {
            setIsVisible(false);
          }, 2000);
        },
        async (error) => {
          console.warn("Geolocation permission error, falling back to IP:", error);
          const detectedCode = await detectLanguageByIP();
          triggerGoogleTranslate(detectedCode);
          localStorage.setItem('dasmo_lang_preferred', 'auto');
          
          const label = detectedCode === 'bn' ? 'Bengali (বাংলা)' : detectedCode === 'hi' ? 'Hindi (हिन्दी)' : 'English';
          setSelectedLangName(label);
          setIsDetecting(false);
          
          setTimeout(() => {
            setIsVisible(false);
          }, 2000);
        },
        { timeout: 7000 }
      );
    } else {
      // Direct IP support fallback
      detectLanguageByIP().then((detectedCode) => {
        triggerGoogleTranslate(detectedCode);
        localStorage.setItem('dasmo_lang_preferred', 'auto');
        const label = detectedCode === 'bn' ? 'Bengali (বাংলা)' : detectedCode === 'hi' ? 'Hindi (हिन्दी)' : 'English';
        setSelectedLangName(label);
        setIsDetecting(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="w-full max-w-lg bg-[#0a0f1d] border border-blue-500/20 rounded-[2rem] p-6 md:p-8 shadow-[0_0_80px_rgba(59,130,246,0.15)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Dynamic decorative backdrop highlights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-[45px] pointer-events-none" />

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-5 right-5 text-slate-500 hover:text-white p-1.5 hover:bg-white/5 rounded-xl transition-all"
          title="Keep default English"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="bg-blue-500/10 text-blue-400 p-2.5 rounded-2xl border border-blue-500/25 animate-pulse">
            <Languages size={22} className="text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block leading-none">Language Customization</span>
            <h3 className="font-display font-black text-white text-base sm:text-lg mt-1.5">
              Personalize Your Experience
            </h3>
          </div>
        </div>

        {/* Triple Language Welcome Text Grid */}
        <div className="space-y-4 text-left border-y border-white/5 py-4 mb-6">
          <div className="space-y-1">
            <p className="text-slate-300 font-extrabold text-sm flex items-center gap-1.5">
               <span className="text-blue-500 font-bold font-mono">EN:</span> Would you like to set your preferred language based on location?
            </p>
            <p className="text-slate-400 text-xs font-semibold">
               West Bengal triggers Bengali (বাংলা), other regions trigger Hindi (हिन्दी).
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-slate-300 font-extrabold text-sm flex items-center gap-1.5">
               <span className="text-amber-400 font-bold font-mono">BN:</span> আপনি কি অবস্থানের ভিত্তিতে আপনার পছন্দের ভাষা সেট করতে চান?
            </p>
            <p className="text-slate-400 text-xs font-semibold">
               পশ্চিমবঙ্গ সনাক্ত করলে বাংলা সেট হবে, অন্যান্য স্থানে হিন্দি সেট হবে।
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-300 font-extrabold text-sm flex items-center gap-1.5">
               <span className="text-purple-400 font-bold font-mono">HI:</span> क्या आप अपनी स्थिति के आधार पर पसंदीदा भाषा सेट करना चाहते हैं?
            </p>
            <p className="text-slate-400 text-xs font-semibold">
               पश्चिम बंगाल के लिए बंगाली (বাংলা) और अन्य क्षेत्रों के लिए हिन्दी।
            </p>
          </div>
        </div>

        {/* State/Detections messages */}
        {isDetecting && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <RefreshCw size={20} className="animate-spin text-blue-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black text-white uppercase tracking-wider">Detecting location...</p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Please allow location request popup to auto-localize your layout.</p>
            </div>
          </div>
        )}

        {selectedLangName && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-emerald-500/30">✓</div>
            <div className="text-left">
              <p className="text-xs font-black text-white uppercase tracking-wider">Location Found!</p>
              <p className="text-xs text-emerald-400 font-extrabold mt-0.5">Language updated: {selectedLangName}</p>
            </div>
          </div>
        )}

        {/* User Choice CTAs */}
        {!isDetecting && !selectedLangName && (
          <div className="space-y-3.5">
            <button
              onClick={startAutoDetection}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-blue-500/15"
            >
              <Compass size={16} /> Auto-Detect Language (West Bengal / India)
            </button>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleManualSelection('bn')}
                className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-xs transition-all border border-white/5 hover:border-white/10"
              >
                বাংলা (Bengali)
              </button>
              <button
                onClick={() => handleManualSelection('hi')}
                className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-xs transition-all border border-white/5 hover:border-white/10"
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => handleManualSelection('en')}
                className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold py-3 rounded-xl text-xs transition-all border border-white/5 hover:border-white/10"
              >
                English
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
