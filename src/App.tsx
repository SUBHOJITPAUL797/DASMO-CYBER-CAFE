import { useState, useEffect } from 'react';
import { CatalogProvider } from './context/CatalogContext';
import Navbar from './components/Navbar';
import ActiveTicketBanner from './components/ActiveTicketBanner';
import Hero from './components/Hero';
import Services from './components/Services';
import RateCalculator from './components/RateCalculator';
import IntakeHub from './components/IntakeHub';
import Features from './components/Features';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';

import { LanguageConsentOverlay } from './components/LanguageSelector';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'home' | 'services' | 'calculator' | 'booking'>('home');

  const openAdmin = () => {
    setIsAdminOpen(true);
    if (!window.location.pathname.includes('/admin')) {
      window.history.replaceState({}, '', '/admin');
    }
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.pathname.includes('/admin')) {
      window.history.replaceState({}, '', '/');
    }
  };

  useEffect(() => {
    // Expose global callback for easy tab redirection from other components
    (window as any).setCurrentTab = (tab: 'all' | 'home' | 'services' | 'calculator' | 'booking') => {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 1. URL search, hash trigger, or route path: ?admin=true, #admin, or /admin
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    if (
      params.get('admin') === 'true' || 
      window.location.hash === '#admin' ||
      path === '/admin' ||
      path === '/admin/' ||
      path.endsWith('/admin') ||
      path.endsWith('/admin/')
    ) {
      openAdmin();
    }

    // 2. Secret Keyboard Shortcut: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 3. Global reference for easter-eggs (e.g. Footer double click)
    (window as any).openAdminPanel = () => {
      openAdmin();
    };

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete (window as any).openAdminPanel;
      delete (window as any).setCurrentTab;
    };
  }, []);

  return (
    <CatalogProvider>
      <div className="min-h-screen bg-[#030611] font-sans text-slate-50 selection:bg-blue-500/30 pb-20 lg:pb-0">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        
        <main className="relative">
          <ActiveTicketBanner />

          <AnimatePresence mode="wait">
            {/* HOME VIEW: Hero & Key Features */}
            {(currentTab === 'all' || currentTab === 'home') && (
              <motion.div
                key="home-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <Hero />
                <Features />
              </motion.div>
            )}

            {/* GOVERNMENT SCHEMES SERVICE VIEW */}
            {(currentTab === 'all' || currentTab === 'services') && (
              <motion.div
                key="services-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <Services />
              </motion.div>
            )}

            {/* TRANSPARENT PRICE RATE ESTIMATOR CALCULATOR */}
            {(currentTab === 'all' || currentTab === 'calculator') && (
              <motion.div
                key="calculator-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <RateCalculator />
              </motion.div>
            )}

            {/* APPOINTMENT & TOKENS INTAKE HUB */}
            {(currentTab === 'all' || currentTab === 'booking') && (
              <motion.div
                key="booking-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <IntakeHub />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer />

        {/* Secure Admin Portal Control Board Overlay */}
        <AdminPanel isOpen={isAdminOpen} onClose={closeAdmin} />

        {/* Language Selection & Geolocation Auto-Detection Manager */}
        <LanguageConsentOverlay />
      </div>
    </CatalogProvider>
  );
}
