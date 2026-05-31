import { 
  FileText, Cpu, Code, ShieldCheck, MapPin, Phone, Mail, Globe, CheckCircle2, 
  MonitorSmartphone, Wrench, FileArchive, Globe2, ScanFace, FileBadge2, 
  Tractor, ShieldPlus, Briefcase, FileInput, Map, Star, Printer, Layers, Image, HardDrive
} from 'lucide-react';

export interface ServiceItem {
  name: string;
  id: string;
  icon: any;
  documents: string[];
  approxFee: number;
  benefits: string;
}

export const services = {
  central: [
    { 
      id: "passport",
      name: "Passport Services", 
      icon: Globe2,
      documents: ["Aadhaar Card", "PAN / Voter ID Card", "Birth Certificate or 10th Admit Card", "Active Mobile Number", "Bank Passbook"],
      approxFee: 1500,
      benefits: "Get your fresh Indian Passport or Re-issue quickly with online scheduling."
    },
    { 
      id: "pan",
      name: "PAN Card Registration", 
      icon: FileBadge2,
      documents: ["Aadhaar Card (Linked with Phone preferred)", "2 Passport Size Photos", "Active Mobile Number"],
      approxFee: 150,
      benefits: "Get your Permanent Account Number for banking and tax compliance."
    },
    { 
      id: "aadhaar",
      name: "Aadhaar Services", 
      icon: ScanFace,
      documents: ["Existing Aadhaar Copy", "Voter Card or Passport", "Proof of Address (Utility Bill/Bank Passbook)", "Mobile with active network"],
      approxFee: 100,
      benefits: "Address change, Phone linking support, and Demographic updates."
    },
    { 
      id: "ayushman",
      name: "Ayushman Bharat Card", 
      icon: ShieldPlus,
      documents: ["Aadhaar Card", "Ration Card", "Mobile Linked with Aadhaar"],
      approxFee: 50,
      benefits: "Get cash-free health cover up to ₹5 Lakh/year for your family."
    },
    { 
      id: "pm_kisan",
      name: "PM Kisan Samman Nidhi", 
      icon: Tractor,
      documents: ["Land Deed (Parcha) / Mutation Record", "Aadhaar Card", "Bank Account Details with passbook", "Mobile linked with Aadhaar"],
      approxFee: 80,
      benefits: "Get guaranteed annual income support of ₹6,000 in direct bank transfers."
    },
    { 
      id: "udyam",
      name: "UDYAM MSME Registration", 
      icon: FileInput,
      documents: ["Aadhaar Card of Owner", "PAN Card of Business", "Bank Account Passbook", "GSTIN (If applicable)"],
      approxFee: 200,
      benefits: "Get official central business recognition, eligible for government MSME credit schemes."
    },
  ],
  state: [
    { 
      id: "caste_cert",
      name: "Caste Certificate (SC/ST/OBC)", 
      icon: FileText,
      documents: ["Aadhaar Card", "Land Deed / Parcha of family", "Caste Certificate of paternal blood relative", "1950 Proof of ancestry / Family Tree", "Income & Residence Certificate from local authority"],
      approxFee: 120,
      benefits: "Official scheduled caste/tribe or OBC status document for education and job quotas."
    },
    { 
      id: "income_cert",
      name: "Income Certificate", 
      icon: FileText,
      documents: ["Aadhaar Card", "Salary Slip or Income details declaration", "Pradhan / Municipality Recommendation Certificate", "Passport Size Photograph"],
      approxFee: 80,
      benefits: "Required for state scholarships, college admissions, and low-cost welfare schemes."
    },
    { 
      id: "residence_cert",
      name: "Residential Certificate", 
      icon: FileText,
      documents: ["Aadhaar Card or Voter Card", "Ration Card or Land Bill of father", "Pradhan Recommendation Document", "Passport Size Photograph"],
      approxFee: 80,
      benefits: "Proof of original permanent living status for administrative state needs."
    },
    { 
      id: "kanyashree",
      name: "Kanyashree / Rupashree", 
      icon: Star,
      documents: ["Aadhaar Card", "School Enrollment Certificate", "Single Girl Declaration from Pradhan", "Bank Passbook strictly in candidate's name", "Family Income Declaration"],
      approxFee: 100,
      benefits: "State monetary incentive to empower girl children, prevent early marriage, promote education."
    },
    { 
      id: "land_mut",
      name: "Land & Mutation Services", 
      icon: Map,
      documents: ["Registered Sale Deed / Parcha", "No-Outstanding Tax Certificate from Panchayat", "Seller Land Details Info", "Aadhaar of applicant"],
      approxFee: 250,
      benefits: "Correct update of land record ownership register with land administration."
    },
  ],
  special: [
     { 
       id: "lakshmir",
       name: "Lakshmir Bhandar Form Fill-up", 
       icon: Star, 
       documents: ["Swasthya Sathi Card", "Aadhaar Card", "SC/ST Certificate (Optional for premium benefit)", "Bank Passbook with Single Account link", "Colored Passport Photograph"],
       approxFee: 50,
       benefits: "Filing and application assistance for the state-sponsored female family benefit program.",
       isHot: true
     },
     { 
       id: "annapurna",
       name: "Annapurna Bhandar Form", 
       icon: Star, 
       documents: ["Ration Card Copy", "Aadhaar Card", "Swasthya Sathi Card Copy", "Bank Passbook Photo"],
       approxFee: 50,
       benefits: "Food security and subsidy incentives designated to family home-makers.",
       isHot: true
     },
  ],
  support: [
    { 
      id: "repair",
      name: "PC & Laptop Repair", 
      icon: Wrench,
      documents: ["Device charging adapter (for laptops)", "Detail explanation of faults"],
      approxFee: 350,
      benefits: "Expert hardware analysis, RAM cleaning, keyboard repair, hardware replacement."
    },
    { 
      id: "os_install",
      name: "Operating System Setup", 
      icon: MonitorSmartphone,
      documents: ["Back up of essential client personal files on cloud"],
      approxFee: 400,
      benefits: "Genuine installation of Windows 10/11 or Ubuntu Linux including basic utilities."
    },
    { 
      id: "driver_update",
      name: "Driver & Software Updates", 
      icon: Cpu,
      documents: ["Device info"],
      approxFee: 150,
      benefits: "Solves stutter, graphics lag, Wi-Fi connectivity issues, and printer issues."
    },
    { 
      id: "antivirus",
      name: "Antivirus & Cybersecurity", 
      icon: ShieldCheck,
      documents: ["Device with active system"],
      approxFee: 450,
      benefits: "Clean active malware, configure firewalls, and licensed real-time cyber protection."
    },
    { 
      id: "data_recovery",
      name: "Data Restore & Recovery", 
      icon: FileArchive,
      documents: ["Faulty Pen drive, Memory Card, or HDD"],
      approxFee: 800,
      benefits: "Restore formatted documents, essential family photos, or business spreadsheets."
    },
  ],
  printing: [
    { id: "xerox_black", name: "Laser B&W Xerox Print", rate: 5, icon: Printer, unit: "Per Page" },
    { id: "xerox_color", name: "High-Quality Color Print", rate: 15, icon: Printer, unit: "Per Page" },
    { id: "laminating", name: "Premium Lamination Protection", rate: 30, icon: Layers, unit: "Per Document" },
    { id: "photo_std", name: "Studio Photo Print (8 Pics)", rate: 50, icon: Image, unit: "Sheet of 8" },
    { id: "scanning", name: "Optical Document Digitizing File", rate: 10, icon: HardDrive, unit: "Per Document" },
  ],
  software_dev: [
     { id: "custom_web", name: "Custom Web Application", icon: ShieldCheck, duration: "2-4 Weeks" },
     { id: "mobile_app", name: "Mobile App Development", icon: MonitorSmartphone, duration: "3-5 Weeks" },
     { id: "db_design", name: "Database Design & Setup", icon: FileArchive, duration: "1-2 Weeks" },
     { id: "contract_dev", name: "Enterprise Outsourcing", icon: Code, duration: "On Agreement" },
  ]
};

export const features = [
  "Government Authorized Forms Submission Partner",
  "High Speed Internet Access & Document Verification Cabins",
  "Professional Technical Team for Complex Software Dev & PC Repairs",
  "Zero Error Filing to Prevent Form Rejections",
  "Highly Competitive Rates & Transparent Billing"
];
