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

import { LanguageConsentOverlay } from './components/LanguageSelector';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

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
    };
  }, []);

  return (
    <CatalogProvider>
      <div className="min-h-screen bg-[#030712] font-sans text-slate-50 selection:bg-blue-500/30">
        <Navbar />
        <main>
          <ActiveTicketBanner />
          <Hero />
          <Services />
          <RateCalculator />
          <IntakeHub />
          <Features />
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
