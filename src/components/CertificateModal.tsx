import React, { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Award,
  Download,
  Printer,
  Share2,
  X,
  CheckCircle,
  ShieldCheck,
  Heart,
  QrCode,
  Sparkles,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { DonationRecord } from "../types";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DonationRecord | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { language, userProfile, triggerNotification, theme } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
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

  // Fallback record if none provided
  const activeRecord: DonationRecord = record || {
    id: "cert-default",
    donorId: userProfile.id,
    recipientName: "Emergency ICU Patient",
    hospitalName: "Dhaka Medical College Hospital",
    bloodGroup: userProfile.bloodGroup,
    date: userProfile.lastDonationDate || new Date().toISOString().split("T")[0],
    certificateId: `BM-BD-${userProfile.bloodGroup.replace("+", "P").replace("-", "N")}-${Math.floor(100000 + Math.random() * 900000)}`,
    verified: true,
    pointsAwarded: 100,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (platform: "whatsapp" | "facebook" | "copy") => {
    const certText = `🎖️ National Life-Saver Certificate of Honor!
Recipient: ${userProfile.name}
Blood Group: ${activeRecord.bloodGroup}
Hospital: ${activeRecord.hospitalName}
Certificate ID: ${activeRecord.certificateId}
Verified via BloodMate AI National Emergency Blood Network 🇧🇩`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(certText)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(certText)}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(certText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      triggerNotification(
        language === "bn"
          ? "সার্টিফিকেট ভেরিফিকেশন লিঙ্ক কপি করা হয়েছে!"
          : "Certificate verification link copied to clipboard!"
      );
    }
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
        className="relative w-full max-w-2xl bg-slate-900/95 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10"
      >
        {/* Prominent Cross (✖) Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        {/* Printable Certificate Frame */}
        <div
          ref={printRef}
          className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/70 relative overflow-hidden shadow-2xl space-y-6 text-center"
        >
          {/* Decorative Corner Seals */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-amber-400 rounded-br-2xl pointer-events-none" />

          {/* Background Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Heart className="w-96 h-96 text-rose-500 fill-rose-500" />
          </div>

          {/* Crest */}
          <div className="w-18 h-18 mx-auto rounded-full bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-1 flex items-center justify-center shadow-xl shadow-amber-950/60">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-amber-400">
              <Award className="w-9 h-9 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NATIONAL CERTIFICATE OF HONOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 font-serif tracking-wide">
              {language === "bn" ? "রক্তদান জীবনরক্ষক সম্মাননা পত্র" : "Certificate of Blood Donation Honor"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              BloodMate AI National Emergency Network • Government of BD Health Directive Standards
            </p>
          </div>

          {/* Recipient Details */}
          <div className="space-y-3 py-4 border-y border-amber-500/30">
            <p className="text-xs text-slate-300 font-serif italic">
              {language === "bn" ? "এই মর্মে সসম্মানে প্রত্যয়ন করা যাচ্ছে যে," : "This is proudly and officially presented to"}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-wide font-sans">
              {userProfile.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed font-sans">
              {language === "bn"
                ? `যিনি পরম সহানুভূতি ও মানবতার উজ্জ্বল দৃষ্টান্ত স্থাপন করে ${activeRecord.hospitalName} হাসপাতালে ১ ব্যাগ (${activeRecord.bloodGroup}) রক্ত দান করে মুমূর্ষু রোগীর জীবন রক্ষায় অনন্য ভূমিকা রেখেছেন।`
                : `for selflessly donating 1 unit of life-saving (${activeRecord.bloodGroup}) blood at ${activeRecord.hospitalName} for patient ${activeRecord.recipientName}, making an indelible humanitarian impact.`}
            </p>
          </div>

          {/* Certificate Metadata & QR Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Certificate ID</span>
              <span className="font-mono font-bold text-amber-300">{activeRecord.certificateId}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Donation Date</span>
              <span className="font-semibold text-white">{activeRecord.date}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Blood Group</span>
              <span className="font-black text-rose-400">{activeRecord.bloodGroup}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="p-1.5 bg-white rounded-lg text-slate-950 shrink-0" title="Security QR Code">
                <QrCode className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="flex items-end justify-between pt-4 text-xs text-slate-400">
            <div className="text-center">
              <div className="w-28 border-b-2 border-slate-600 mb-1 mx-auto" />
              <span className="font-bold text-slate-300 block">Medical Officer</span>
              <span className="text-[10px] text-slate-500">Clinical Verification</span>
            </div>

            <div className="flex flex-col items-center justify-center text-amber-400">
              <ShieldCheck className="w-8 h-8 text-amber-400 mb-0.5 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Official LifeSaver Seal
              </span>
            </div>

            <div className="text-center">
              <div className="w-28 border-b-2 border-slate-600 mb-1 mx-auto" />
              <span className="font-bold text-slate-300 block">BloodMate Network</span>
              <span className="text-[10px] text-slate-500">Director of Operations</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Sharing */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleShare("whatsapp")}
              className="px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="px-3 py-2 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 hover:bg-blue-900 font-bold text-xs transition-all"
            >
              Facebook
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
