import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { Fingerprint, Scan, ShieldCheck, Lock, Unlock, X, CheckCircle2 } from "lucide-react";

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({ isOpen, onClose }) => {
  const { language, isBiometricUnlocked, toggleBiometricLock, userProfile } = useApp();
  const t = TRANSLATIONS[language];

  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanSuccess(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        toggleBiometricLock();
        setScanSuccess(false);
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 pt-16 sm:pt-24 pb-16 flex justify-center items-start animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-slate-900/95 border border-emerald-800/60 rounded-3xl p-6 shadow-2xl text-slate-100 text-center space-y-4 mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10"
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
          <Fingerprint className="w-9 h-9 animate-pulse" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            {language === "bn" ? "বায়োমেট্রিক সিকিউরিটি সেটিং" : "Biometric Security Lock"}
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {language === "bn"
              ? "ফিঙ্গারপ্রিন্ট বা ফেস আনলক এর মাধ্যমে দাতার স্পর্শকাতর তথ্য সুরক্ষিত রাখুন।"
              : "Protect donor phone numbers & medical history with biometric authentication."}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>{language === "bn" ? "বর্তমান স্ট্যাটাস:" : "Current Status:"}</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                isBiometricUnlocked
                  ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                  : "bg-amber-600/30 text-amber-400 border border-amber-500/40"
              }`}
            >
              {isBiometricUnlocked
                ? (language === "bn" ? "আনলক করা" : "Unlocked")
                : (language === "bn" ? "লক করা (Protected)" : "Locked")}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {language === "bn"
              ? `প্রোফাইল স্বত্বাধিকারী: ${userProfile.name} (${userProfile.phone})`
              : `Account Holder: ${userProfile.name}`}
          </div>
        </div>

        {/* Scan Button */}
        <div className="pt-2">
          {scanSuccess ? (
            <div className="p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {language === "bn" ? "বায়োমেট্রিক সফলভাবে সামঞ্জস্য হয়েছে!" : "Biometric Verified Successfully!"}
            </div>
          ) : (
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Scan className="w-4 h-4 animate-spin text-amber-300" />
                  {language === "bn" ? "আঙুলের ছাপ স্ক্যান করা হচ্ছে..." : "Scanning Fingerprint..."}
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  {isBiometricUnlocked
                    ? (language === "bn" ? "লক করতে ফিংগারপ্রিন্ট দিন" : "Scan to Lock App")
                    : (language === "bn" ? "আনলক করতে ফিংগারপ্রিন্ট দিন" : "Scan to Unlock App")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
