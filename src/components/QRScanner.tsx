import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, X, QrCode, Search, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { getSlotStatus } from '../utils/bookingUtils';

interface Booking {
  id: string;
  name: string;
  mobile: string;
  work: string;
  date: string;
  time: string;
}

interface QRScannerProps {
  bookings: Booking[];
  onCheckIn: (bookingId: string) => Promise<void>;
}

export default function QRScanner({ bookings, onCheckIn }: QRScannerProps) {
  const [isCamerActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<{
    success?: boolean;
    message: string;
    booking?: Booking;
  } | null>(null);
  
  // Manual text lookup state
  const [manualId, setManualId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Video and canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanStatus(null);
    try {
      const constraints = { video: { facingMode: 'environment' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        videoRef.current.play();
        setIsCameraActive(true);
        // Start decoding frames
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera access denied or unsupported. (If using AI Studio iframe preview, try the File Upload or simulate option instead!)"
      );
    }
  };

  // QR scan frame analysis loop
  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code) {
        try {
          // Parse QR payload
          let data = code.data;
          let parsedId = data;

          if (data.startsWith('{')) {
            const parsed = JSON.parse(data);
            parsedId = parsed.id || data;
          }

          handleQRCodeFound(parsedId);
          return; // Stop scan loop immediately on successful read match
        } catch (e) {
          // Fallback to direct raw string match if JSON parse fails
          handleQRCodeFound(code.data.trim());
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // Process decoded Token ID
  const handleQRCodeFound = async (tokenId: string) => {
    stopCamera();
    setIsVerifying(true);
    
    // Look up this ID in current bookings list
    const found = bookings.find(b => b.id.toLowerCase() === tokenId.toLowerCase());
    
    if (!found) {
      setScanStatus({
        success: false,
        message: `Booking verification failed. Code "${tokenId}" not found in current bookings database.`
      });
      setIsVerifying(false);
      return;
    }

    // Verify time status
    const timeStatus = getSlotStatus(found.date, found.time);
    
    if (timeStatus.status === 'expired') {
      setScanStatus({
        success: false,
        message: `This slot has expired. Authorized slot time: ${found.date} • ${found.time}. It has been auto-released.`,
        booking: found
      });
      setIsVerifying(false);
      return;
    }

    // Show booking valid details & trigger check-in
    setScanStatus({
      success: true,
      message: `Verified and entry confirmed! Checking in applicant for ${found.work}.`,
      booking: found
    });

    try {
      await onCheckIn(found.id);
    } catch (err: any) {
      setScanStatus(prev => prev ? { ...prev, message: `Checked in but Firestore sync failed: ${err.message}` } : null);
    }
    setIsVerifying(false);
  };

  // Decodes image data from selected QR image files
  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus(null);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            try {
              let parsedId = code.data;
              if (code.data.startsWith('{')) {
                const parsed = JSON.parse(code.data);
                parsedId = parsed.id || code.data;
              }
              handleQRCodeFound(parsedId);
            } catch (err) {
              handleQRCodeFound(code.data.trim());
            }
          } else {
            setScanStatus({
              success: false,
              message: "Unable to find a valid QR Code within the uploaded image. Please ensure high contrast!"
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manually input token ID check-in
  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    handleQRCodeFound(manualId.trim());
    setManualId('');
  };

  return (
    <div className="bg-[#121828]/90 border border-white/10 rounded-2xl p-5 md:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl border border-blue-500/20">
            <QrCode size={18} className="animate-pulse" />
          </div>
          <div>
            <h5 className="font-extrabold text-white text-sm tracking-wide">ENTRY BARCODE & QR INSTANT CHECK-IN</h5>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">High precision front-counter verification scanner</p>
          </div>
        </div>
        
        {/* Toggle camera view */}
        <div className="flex items-center gap-2">
          {isCamerActive ? (
            <button
              onClick={stopCamera}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3.5 py-1.5 rounded-xl border border-red-500/20 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <X size={13} /> Close Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="bg-blue-600 text-white hover:bg-blue-500 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/15 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Camera size={13} /> Active Live Camera
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/5 text-slate-300 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Upload size={13} /> Upload Slip Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUploaded}
          />
        </div>
      </div>

      {/* Live Camera Scanner Box */}
      {isCamerActive && (
        <div className="relative w-full aspect-video sm:max-w-md mx-auto bg-black rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-2xl"
          />
          {/* Neon laser scan bar overlay */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 animate-[bounce_2s_infinite] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <div className="absolute inset-0 border-[24px] border-black/40 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-dashed border-blue-400/50 rounded-lg" />
          </div>
          <span className="absolute bottom-3 bg-black/80 text-[10px] text-blue-300 font-extrabold px-3 py-1 rounded-full border border-blue-500/20">
            LASER SCAN READY • PLACE QR COMPACT IN SHADOW
          </span>
        </div>
      )}

      {/* Show Camera Errors with useful guidance */}
      {cameraError && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 leading-relaxed font-semibold">
          <div className="flex gap-1.5 items-start">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="font-sans">
              {cameraError}
            </span>
          </div>
        </div>
      )}

      {/* Verification scanning status response screen */}
      {isVerifying ? (
        <div className="p-5 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-2 bg-[#080d1a] border border-white/5 rounded-2xl">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          <span>Syncing entry token with secure database...</span>
        </div>
      ) : scanStatus ? (
        <div className={`p-4 rounded-xl border font-sans ${scanStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
          <div className="flex gap-3 items-start">
            {scanStatus.success ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <h6 className="font-bold text-xs uppercase tracking-wider">{scanStatus.success ? "VERIFICATION SUCCESSFUL" : "VERIFICATION ERROR"}</h6>
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">{scanStatus.message}</p>
              
              {scanStatus.booking && (
                <div className="bg-black/40 rounded-lg p-3 text-[11px] border border-white/5 space-y-1 text-slate-300 mt-1 max-w-lg">
                  <p><strong>Applicant Name:</strong> {scanStatus.booking.name}</p>
                  <p><strong>Mobile Number:</strong> {scanStatus.booking.mobile}</p>
                  <p><strong>Requested Work:</strong> {scanStatus.booking.work}</p>
                  <p><strong>Appointment Date/Slot:</strong> {scanStatus.booking.date} • {scanStatus.booking.time}</p>
                  <p className="flex items-center gap-1 pt-1.5">
                    <strong>Time Verification:</strong> 
                    {(() => {
                      const stat = getSlotStatus(scanStatus.booking.date, scanStatus.booking.time);
                      return <span className={`px-1.5 py-0.5 rounded font-black border text-[9px] ${stat.colorClass}`}>{stat.label}</span>;
                    })()}
                  </p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setScanStatus(null)}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Manual Verification Search bar AND Quick Simulate Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Manual lookup input form */}
        <form onSubmit={handleManualVerify} className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verify by Code ID / Token Number</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none" size={14} />
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Ex: dsm-xxxx-xxxx"
                className="w-full bg-[#0b0f19] text-xs text-slate-200 pl-8.5 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600/20 text-blue-400 border border-blue-500/25 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Verify
            </button>
          </div>
        </form>

        {/* Rapid testing instant scan simulation drop selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Quick-Test Simulation (Fast Checker)</label>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleQRCodeFound(e.target.value);
                  e.target.value = ''; // Reset select tag
                }
              }}
              defaultValue=""
              className="flex-1 bg-[#0b0f19] text-xs text-slate-300 px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="" disabled>-- Choose a Client to Simulate Scanning --</option>
              {bookings.length === 0 ? (
                <option value="" disabled>No active bookings in Firestore</option>
              ) : (
                bookings.map(b => {
                  const stat = getSlotStatus(b.date, b.time);
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} - {b.work} ({stat.label})
                    </option>
                  );
                })
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
