import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { DonorResponseStatus, EmergencyRequest } from "../types";
import {
  X,
  Heart,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Car,
  Building,
  ShieldCheck,
  Award,
  AlertTriangle,
  Radio,
  Sparkles,
  ArrowRight,
  UserCheck,
  ThumbsUp,
  Ban
} from "lucide-react";
import { generateTelEmergencyLink } from "../lib/bloodLogic";

interface IncomingDonorAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
  donorResponse: DonorResponseStatus | null;
  onOpenFeedbackModal?: (req: EmergencyRequest) => void;
}

export const IncomingDonorAlertModal: React.FC<IncomingDonorAlertModalProps> = ({
  isOpen,
  onClose,
  request,
  donorResponse,
  onOpenFeedbackModal
}) => {
  const {
    language,
    updateDonorResponseStatus,
    triggerNotification,
    theme
  } = useApp();

  const isDark = theme === "dark";
  const [currentStatus, setCurrentStatus] = useState<string>("Accepted");

  useEffect(() => {
    if (donorResponse) {
      setCurrentStatus(donorResponse.status || "Accepted");
    }
  }, [donorResponse]);

  // Audio tone cue when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch {
        // audio context fallback silently
      }
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request || !donorResponse) return null;

  const handleStatusUpdate = async (newStatus: "Accepted" | "On The Way" | "Arrived" | "Completed" | "Declined") => {
    setCurrentStatus(newStatus);
    await updateDonorResponseStatus(request.id, donorResponse.donorId, newStatus);
    
    if (newStatus === "Accepted") {
      triggerNotification(
        language === "bn"
          ? `✅ রক্তদাতা ${donorResponse.donorName}-এর অফার গ্রহণ করা হয়েছে!`
          : `✅ Accepted donor offer from ${donorResponse.donorName}!`
      );
    } else if (newStatus === "On The Way") {
      triggerNotification(
        language === "bn"
          ? `🚗 রক্তদাতা ${donorResponse.donorName}-কে হাসপাতালে রওনা হতে অনুরোধ পাঠানো হয়েছে।`
          : `🚗 Requested donor ${donorResponse.donorName} to start journey.`
      );
    } else if (newStatus === "Arrived") {
      triggerNotification(
        language === "bn"
          ? `🏥 রক্তদাতা ${donorResponse.donorName} হাসপাতালে উপস্থিত হয়েছেন।`
          : `🏥 Confirmed donor ${donorResponse.donorName} has arrived at hospital.`
      );
    } else if (newStatus === "Completed") {
      triggerNotification(
        language === "bn"
          ? `🎉 রক্তদান সফলভাবে সম্পন্ন হয়েছে! রোগী ও রক্তদাতাকে অভিনন্দন।`
          : `🎉 Blood donation completed successfully!`
      );
      if (onOpenFeedbackModal) {
        onOpenFeedbackModal(request);
      }
      onClose();
    } else if (newStatus === "Declined") {
      triggerNotification(
        language === "bn"
          ? `রক্তদাতার অফার বাতিল করা হয়েছে। নতুন ডোনার খোঁজা হচ্ছে।`
          : `Donor offer declined.`
      );
      onClose();
    }
  };

  const getWhatsAppMessageLink = () => {
    const cleanPhone = donorResponse.donorPhone.replace(/[^0-9]/g, "");
    const intlPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone.replace(/^0+/, "")}`;
    const textBn = `আসসালামু আলাইকুম ${donorResponse.donorName}!
আমি রোগী ${request.patientName}-এর পক্ষ থেকে যোগাযোগ করছি (${request.hospitalName})।
আপনি BloodMate AI-তে রক্তদানের যে প্রস্তাব দিয়েছেন তা আমরা সানন্দে পেয়েছি। অনুগ্রহ করে কল রিসিভ করবেন বা লোকেশন জানাবেন। ধন্যবাদ!`;
    const textEn = `Hello ${donorResponse.donorName}!
I am reaching out regarding patient ${request.patientName} at ${request.hospitalName}.
We received your kind blood donation pledge on BloodMate AI. Please let us know your current status. Thank you!`;
    const msg = language === "bn" ? textBn : textEn;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`;
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
        className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border mt-2 sm:mt-4 mb-10 frosted-glass-card ring-2 ring-red-500/40 ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-rose-900/15"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="space-y-6">
          {/* Incoming Alert Header Banner */}
          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-xl shadow-emerald-950/50 shrink-0 animate-bounce">
              <Heart className="w-7 h-7 fill-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  {language === "bn" ? "🚨 নতুন রক্তদাতার সাড়া পাওয়া গেছে!" : "🚨 New Donor Offer Received!"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {language === "bn" ? "রক্তদাতা সাহায্য করতে চাচ্ছেন" : "A Donor Wants to Help You!"}
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn"
                  ? `রোগী "${request.patientName}" (${request.bloodGroup} গ্রুপ)-এর আবেদনের বিপরীতে রক্তদাতা সাড়া দিয়েছেন।`
                  : `A volunteer donor has pledged to donate blood for patient "${request.patientName}" (${request.bloodGroup}).`}
              </p>
            </div>
          </div>

          {/* Request Patient Context Tag */}
          <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
            isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">{language === "bn" ? "রোগী:" : "Patient:"}</span>
              <strong className="text-slate-200">{request.patientName}</strong>
              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[11px]">
                {request.bloodGroup}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Building className="w-3.5 h-3.5 text-rose-500" />
              <span>{request.hospitalName}, {request.district}</span>
            </div>
          </div>

          {/* Donor Profile Card */}
          <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${
            isDark
              ? "bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-slate-700/80"
              : "bg-gradient-to-b from-white to-rose-50/50 border-slate-200"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                  {donorResponse.donorBloodGroup || request.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-100">
                      {donorResponse.donorName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Donor
                    </span>
                  </div>
                  <p className="text-xs text-rose-400 font-bold mt-0.5">
                    {language === "bn" ? `ম্যাচিং গ্রুপ: ${donorResponse.donorBloodGroup || request.bloodGroup}` : `Matching Group: ${donorResponse.donorBloodGroup || request.bloodGroup}`}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                  currentStatus === "Completed"
                    ? "bg-purple-950 border-purple-600 text-purple-300"
                    : currentStatus === "Arrived"
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300 animate-pulse"
                    : currentStatus === "On The Way"
                    ? "bg-amber-950 border-amber-500 text-amber-300 animate-pulse"
                    : "bg-blue-950 border-blue-500 text-blue-300"
                }`}>
                  {currentStatus === "Completed" ? (
                    <Award className="w-3.5 h-3.5" />
                  ) : currentStatus === "Arrived" ? (
                    <Building className="w-3.5 h-3.5" />
                  ) : currentStatus === "On The Way" ? (
                    <Car className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {currentStatus === "Completed"
                      ? (language === "bn" ? "রক্তদান সম্পন্ন" : "Completed")
                      : currentStatus === "Arrived"
                      ? (language === "bn" ? "হাসপাতালে উপস্থিত" : "Arrived at Hospital")
                      : currentStatus === "On The Way"
                      ? (language === "bn" ? "রওনা হয়েছেন" : "On The Way")
                      : (language === "bn" ? "প্রস্তাব গৃহীত" : "Pledge Accepted")}
                  </span>
                </span>
              </div>
            </div>

            {/* ETA & Location & Notes grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-100 border-slate-200"
              }`}>
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {language === "bn" ? "পৌঁছানোর সম্ভাব্য সময়" : "Estimated Arrival (ETA)"}
                  </span>
                  <strong className="text-amber-400 font-extrabold">
                    {donorResponse.estimatedArrivalMinutes
                      ? (language === "bn" ? `প্রায় ${donorResponse.estimatedArrivalMinutes} মিনিট` : `Approx. ${donorResponse.estimatedArrivalMinutes} mins`)
                      : (language === "bn" ? "প্রায় ৩০ মিনিট" : "Approx. 30 mins")}
                  </strong>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-100 border-slate-200"
              }`}>
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {language === "bn" ? "ডোনারের বর্তমান অবস্থান" : "Donor Location"}
                  </span>
                  <strong className="text-slate-200 font-semibold truncate block max-w-[170px]">
                    {donorResponse.donorLocation || `${request.area}, ${request.district}`}
                  </strong>
                </div>
              </div>
            </div>

            {/* Donor Note */}
            {donorResponse.note && (
              <div className={`p-3 rounded-2xl border text-xs italic ${
                isDark ? "bg-slate-950/40 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
              }`}>
                <span className="text-[10px] font-bold not-italic text-slate-400 uppercase block mb-0.5">
                  {language === "bn" ? "রক্তদাতার বার্তা:" : "Donor Message:"}
                </span>
                "{donorResponse.note}"
              </div>
            )}
          </div>

          {/* Quick Communication Actions (Call & WhatsApp) */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={generateTelEmergencyLink(donorResponse.donorPhone)}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-95 border border-emerald-400/30"
            >
              <Phone className="w-4 h-4" />
              <span>
                {language === "bn"
                  ? `ডোনারকে কল দিন (${donorResponse.donorPhone})`
                  : `Call Donor (${donorResponse.donorPhone})`}
              </span>
            </a>

            <a
              href={getWhatsAppMessageLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{language === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</span>
            </a>
          </div>

          {/* Lifecycle State Progression Controls for Requester */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === "bn" ? "রক্তদান প্রক্রিয়ার অগ্রগতি পরিচালনা করুন:" : "Manage Donation Progression:"}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStatusUpdate("Accepted")}
                className={`py-2 px-2 rounded-xl text-xs font-black border transition-all text-center flex flex-col items-center gap-1 ${
                  currentStatus === "Accepted"
                    ? "bg-blue-600 border-blue-500 text-white shadow-md"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "১. গ্রহণ করুন" : "1. Accept"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate("On The Way")}
                className={`py-2 px-2 rounded-xl text-xs font-black border transition-all text-center flex flex-col items-center gap-1 ${
                  currentStatus === "On The Way"
                    ? "bg-amber-600 border-amber-500 text-white shadow-md animate-pulse"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "২. রওনা হয়েছেন" : "2. On Way"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate("Arrived")}
                className={`py-2 px-2 rounded-xl text-xs font-black border transition-all text-center flex flex-col items-center gap-1 ${
                  currentStatus === "Arrived"
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-md animate-pulse"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "৩. উপস্থিত" : "3. Arrived"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate("Completed")}
                className={`py-2 px-2 rounded-xl text-xs font-black border transition-all text-center flex flex-col items-center gap-1 ${
                  currentStatus === "Completed"
                    ? "bg-purple-600 border-purple-500 text-white shadow-md"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "৪. সম্পন্ন (+XP)" : "4. Complete"}</span>
              </button>
            </div>
          </div>

          {/* Bottom dismiss & decline */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
            <button
              type="button"
              onClick={() => handleStatusUpdate("Declined")}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "অফার বাতিল করুন" : "Decline Offer"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 font-semibold underline"
            >
              {language === "bn" ? "পরে সিদ্ধান্ত নেব (বন্ধ করুন)" : "Dismiss for now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
