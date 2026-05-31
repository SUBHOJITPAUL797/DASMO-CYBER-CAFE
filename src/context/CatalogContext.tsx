import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { services as defaultServices } from '../data';
import * as Icons from 'lucide-react';

// Help map serializable icons to Lucide components
export function getIconComponent(iconName: string | any): any {
  if (typeof iconName === 'string') {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.FileText; // Default fallback
  }
  return iconName || Icons.FileText;
}

export interface CatalogData {
  central: any[];
  state: any[];
  special: any[];
  support: any[];
  printing: any[];
  software_dev: any[];
  updatedAt?: string;
  statusInfo?: {
    happyWalkins: string;
    formsProcessed: string;
    techClients: string;
    announcementTitle: string;
    announcementText: string;
    locationText: string;
    cafeStatus: 'auto' | 'open' | 'closed';
  };
  bookingConfig?: {
    startHour: string;     // e.g. "09:00"
    endHour: string;       // e.g. "21:00"
    slotGap: number;       // e.g. 15 | 30 | 45 | 60
    limitPerPhone: number; // e.g. 1 | 2 | 3 | 5
  };
}

interface CatalogContextType {
  catalog: CatalogData;
  isLoading: boolean;
  isFirebaseActive: boolean;
  saveCatalog: (updatedCatalog: CatalogData) => Promise<void>;
  seedFirebase: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Helper to serialize static data icon components to name strings
function serializeCatalog(raw: any): CatalogData {
  const serializeService = (svc: any) => ({
    ...svc,
    isHot: !!svc.isHot,
    icon: typeof svc.icon === 'string' ? svc.icon : (svc.icon?.name || svc.icon?.displayName || 'FileText')
  });

  return {
    central: raw.central ? raw.central.map(serializeService) : [],
    state: raw.state ? raw.state.map(serializeService) : [],
    special: raw.special ? raw.special.map(serializeService) : [],
    support: raw.support ? raw.support.map(serializeService) : [],
    printing: raw.printing ? raw.printing.map(serializeService) : [],
    software_dev: raw.software_dev ? raw.software_dev.map(serializeService) : [],
    statusInfo: raw.statusInfo || {
      happyWalkins: '45,800+',
      formsProcessed: '12,400+',
      techClients: '1,250+',
      announcementTitle: 'Instant Walk-in Special',
      announcementText: 'Need instant colored passport size photos or emergency Aadhaar updating? Just walk straight in to our Mejhia counter. Average billing wait time is under 4 minutes.',
      locationText: 'Ardhagram, Mejhia',
      cafeStatus: 'auto'
    },
    bookingConfig: raw.bookingConfig || {
      startHour: '09:00',
      endHour: '21:00',
      slotGap: 30,
      limitPerPhone: 3
    }
  };
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogData>(() => serializeCatalog(defaultServices));
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'catalog');
    
    // Subscribe to Firestore for real-time changes
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        setIsLoading(false);
        if (docSnap.exists()) {
          const data = docSnap.data() as CatalogData;
          setCatalog({
            central: data.central || [],
            state: data.state || [],
            special: data.special || [],
            support: data.support || [],
            printing: data.printing || [],
            software_dev: data.software_dev || [],
            statusInfo: data.statusInfo || {
              happyWalkins: '45,800+',
              formsProcessed: '12,400+',
              techClients: '1,250+',
              announcementTitle: 'Instant Walk-in Special',
              announcementText: 'Need instant colored passport size photos or emergency Aadhaar updating? Just walk straight in to our Mejhia counter. Average billing wait time is under 4 minutes.',
              locationText: 'Ardhagram, Mejhia',
              cafeStatus: 'auto'
            },
            bookingConfig: data.bookingConfig || {
              startHour: '09:00',
              endHour: '21:00',
              slotGap: 30,
              limitPerPhone: 3
            },
            updatedAt: data.updatedAt
          });
          setIsFirebaseActive(true);
        } else {
          // Document does not exist yet (Database needs seeding)
          setIsFirebaseActive(false);
          // Fall back to default static configuration
          setCatalog(serializeCatalog(defaultServices));
        }
      },
      (error) => {
        console.warn("Firestore snapshot subscription failed. Using local catalog fallback. Error details direct to console.", error);
        setIsLoading(false);
        setIsFirebaseActive(false);
        setCatalog(serializeCatalog(defaultServices));
      }
    );

    return () => unsubscribe();
  }, []);

  // Write changes to Firestore settings document
  const saveCatalog = async (updatedCatalog: CatalogData) => {
    const docRef = doc(db, 'settings', 'catalog');
    const path = 'settings/catalog';
    try {
      const payload = {
        ...updatedCatalog,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Seed default static options to the Firestore DB with one-click
  const seedFirebase = async () => {
    try {
      const defaults = serializeCatalog(defaultServices);
      await saveCatalog(defaults);
      setIsFirebaseActive(true);
    } catch (error) {
      console.error("Filing default seed catalog failure:", error);
      throw error;
    }
  };

  return (
    <CatalogContext.Provider value={{ catalog, isLoading, isFirebaseActive, saveCatalog, seedFirebase }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
