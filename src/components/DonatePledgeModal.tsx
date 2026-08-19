import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { EmergencyRequest } from "../types";
import {
  X,
  Heart,
  Car,
  Clock,
  Phone,
  MessageCircle,
  Building,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send
} from "lucide-react";
import {
  generateWhatsAppDonorPledgeLink,
  generateTelEmergencyLink,
  calculateHaversineDistanceKm,
  getDistrictCoordinates
} from "../lib/bloodLogic";

interface DonatePledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
  onOpenDetails?: (req: EmergencyRequest) => void;
}

export const DonatePledgeModal: React.FC<DonatePledgeModalProps> = ({
  isOpen,
  onClose,
  request,
  onOpenDetails
}) => {
  const {
    language,
    userProfile,
    eligibility,
    respondToEmergencyRequest,
    triggerNotification,
    theme
  } = useApp();

  const isDark = theme === "dark";

  const [etaMinutes, setEtaMinutes] = useState<number>(30);
  const [donorNote, setDonorNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Reset state when a new request is opened
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
      setEtaMinutes(30);
      setDonorNote("");
    }
  }, [isOpen, request?.id]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  // Compute distance from donor
  const userCoords = userProfile.latitude && userProfile.longitude
    ? { lat: userProfile.latitude, lng: userProfile.longitude }
    : getDistrictCoordinates(userProfile.district);

  const reqCoords = request.latitude && request.longitude
    ? { lat: request.latitude, lng: request.longitude }
    : getDistrictCoordinates(request.district);

  const distanceKm = calculateHaversineDistanceKm(
    userCoords.lat,
    userCoords.lng,
    reqCoords.lat,
    reqCoords.lng
  );

  const handleConfirmPledge = async () => {
    if (!eligibility.isEligible) {
      triggerNotification(
        language === "bn"
          ? `⚠️ বিরতি সক্রিয়: পরবর্তী রক্তদান ${eligibility.nextEligibleDate}`
          : `⚠️ Cooldown active: Next donation ${eligibility.nextEligibleDate}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await respondToEmergencyRequest(request.id, "On The Way", {
        estimatedArrivalMinutes: etaMinutes,
        note: donorNote
      });
      setIsConfirmed(true);
      triggerNotification(
        language === "bn"
          ? "🎉 রক্তদানের অঙ্গীকার সফল হয়েছে! রোগীর কাছে আপনার তথ্য পাঠানো হয়েছে।"
          : "🎉 Donation pledge confirmed! Your donor details have been sent to the patient."
      );
    } catch (e) {
      console.error(e);
      triggerNotification(
        language === "bn" ? "অঙ্গীকার সংরক্ষণে সমস্যা হয়েছে।" : "Failed to record donation pledge."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDispatch = () => {
    const link = generateWhatsAppDonorPledgeLink(
      request.contactPhone,
      request,
      userProfile,
      etaMinutes,
      donorNote,
      language
    );
    window.open(link, "_blank");
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
        className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10 ${
          isDark
            ? "bg-slate-900/95 border-rose-800/80 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-rose-200 text-slate-900 shadow-rose-900/10"
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

        {!isConfirmed ? (
          /* ========================================================================= */
          /* STEP 1: CONFIRMATION & DETAILS TRANSMISSION FORM */
          /* ========================================================================= */
          <div>
            {/* Header / Target Overview */}
            <div className="flex items-start gap-4 mb-6 pr-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex flex-col items-center justify-center text-white shadow-lg shadow-red-900/40 shrink-0">
                <span className="text-lg font-black leading-none">{request.bloodGroup}</span>
                <span className="text-[10px] font-semibold opacity-90 mt-0.5">
                  {request.unitsNeeded} {language === "bn" ? "ব্যাগ" : "Bag"}
                </span>
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 text-[11px] font-extrabold uppercase tracking-wide inline-block mb-1">
                  {language === "bn" ? "🩸 রক্তদান নিশ্চিতকরণ (Donation Pledge)" : "🩸 Blood Donation Confirmation"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  {request.patientName}
                </h2>
                <p className={`text-xs mt-0.5 flex items-center gap-1 font-medium ${isDark ? "text-rose-300" : "text-rose-600"}`}>
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  {request.hospitalName}, {request.area}, {request.district} ({distanceKm} km)
                </p>
              </div>
            </div>

            {/* Cooldown Warning Notice if active */}
            {!eligibility.isEligible && (
              <div className="p-3.5 mb-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {language === "bn"
                    ? `⚠️ আপনি বর্তমানে মেডিকেল বিরতিতে আছেন। পরবর্তী রক্তদানের তারিখ: ${eligibility.nextEligibleDate} (${eligibility.daysLeft} দিন বাকি)`
                    : `⚠️ Medical cooldown active. Next eligible date: ${eligibility.nextEligibleDate} (${eligibility.daysLeft}d left).`}
                </span>
              </div>
            )}

            {/* Donor Identity Transmission Card */}
            <div className={`p-4 rounded-2xl border mb-5 ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-rose-50/70 border-rose-200"
            }`}>
              <span className="text-[11px] font-bold text-slate-400 block uppercase mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {language === "bn" ? "আপনার ডোনার প্রোফাইল তথ্য (রোগীর কাছে যাবে)" : "Your Donor Profile (Transmitted to Recipient)"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 block">{language === "bn" ? "রক্তদাতার নাম ও গ্রুপ" : "Donor Name & Group"}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs">
                      {userProfile.bloodGroup}
                    </span>
                    <strong className="text-slate-200 font-bold">{userProfile.name}</strong>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 block">{language === "bn" ? "ফোন ও বর্তমান এলাকা" : "Phone & Current Area"}</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{userProfile.phone}</span>
                    <span className="text-slate-400 font-normal text-[11px]">({userProfile.area})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Arrival Time (ETA) */}
            <div className="mb-5">
              <label className="text-xs font-bold block mb-2 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" />
                {language === "bn" ? "হাসপাতালে পৌঁছাতে আপনার কত সময় লাগবে? (ETA):" : "Estimated Time to Reach Hospital (ETA):"}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { val: 15, labelBn: "১৫ মিনিট", labelEn: "15 mins" },
                  { val: 30, labelBn: "৩০ মিনিট", labelEn: "30 mins" },
                  { val: 45, labelBn: "৪৫ মিনিট", labelEn: "45 mins" },
                  { val: 60, labelBn: "১ ঘণ্টা", labelEn: "1 hour" },
                  { val: 120, labelBn: "২ ঘণ্টা", labelEn: "2 hours" }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setEtaMinutes(item.val)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all border text-center active:scale-95 ${
                      etaMinutes === item.val
                        ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950"
                        : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        : "bg-white border-slate-200 text-slate-700 hover:border-rose-300"
                    }`}
                  >
                    {language === "bn" ? item.labelBn : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Note to Patient / Family */}
            <div className="mb-6">
              <label className="text-xs font-bold block mb-1.5">
                {language === "bn" ? "রোগী বা পরিবারের জন্য বিশেষ বার্তা / নোট (ঐচ্ছিক):" : "Message to Patient / Family (Optional):"}
              </label>
              <input
                type="text"
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value)}
                placeholder={
                  language === "bn"
                    ? "যেমন: আমি এখনই রওনা হচ্ছি, জরুরি ক্রস-ম্যাচিং রেডি রাখুন..."
                    : "e.g. I am leaving now, please keep cross-matching ready..."
                }
                className={`w-full px-4 py-3 rounded-2xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-rose-500"
                    : "bg-white border-slate-300 text-slate-900 focus:border-rose-500"
                }`}
              />
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmPledge}
                disabled={isSubmitting || !eligibility.isEligible}
                className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  eligibility.isEligible
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950"
                    : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Heart className="w-4 h-4 fill-white animate-pulse" />
                <span>
                  {isSubmitting
                    ? (language === "bn" ? "অঙ্গীকার গ্রহণ করা হচ্ছে..." : "Confirming Pledge...")
                    : (language === "bn" ? "রক্তদান নিশ্চিত করুন ও তথ্য পাঠান" : "Confirm Pledge & Send Details")}
                </span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleWhatsAppDispatch}
                  className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</span>
                </button>

                <a
                  href={generateTelEmergencyLink(request.contactPhone)}
                  className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  title="Call"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{language === "bn" ? "কল দিন" : "Call"}</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 2: INSTANT CONFIRMATION SUCCESS VIEW */
          /* ========================================================================= */
          <div className="text-center py-4 sm:py-6 animate-fade-in space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-black uppercase tracking-wider inline-block mb-2">
                ✓ {language === "bn" ? "অঙ্গীকার সফলভাবে গৃহীত হয়েছে" : "Pledge Confirmed"}
              </span>
              <h2 className="text-2xl font-black text-slate-100">
                {language === "bn" ? "🎉 ধন্যবাদ! আপনার রক্তদানের অঙ্গীকার নথিভুক্ত হয়েছে" : "🎉 Thank You! Your Donation Pledge is Confirmed"}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                {language === "bn"
                  ? `রোগী "${request.patientName}" এর জরুরি আবেদনে আপনার তথ্য ও আনুমানিক পৌঁছানোর সময় (${etaMinutes} মিনিট) যুক্ত করা হয়েছে।`
                  : `Your donor details and estimated arrival time (${etaMinutes} mins) have been sent to patient "${request.patientName}".`}
              </p>
            </div>

            {/* Transmission Summary Box */}
            <div className={`p-4 rounded-2xl border text-left text-xs max-w-md mx-auto ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">{language === "bn" ? "রোগী:" : "Patient:"}</span>
                  <strong className="text-rose-400 font-bold">{request.patientName} ({request.bloodGroup})</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">{language === "bn" ? "হাসপাতাল:" : "Hospital:"}</span>
                  <span className="text-slate-200 font-medium">{request.hospitalName}, {request.district}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">{language === "bn" ? "পৌঁছানোর সময় (ETA):" : "Estimated Arrival:"}</span>
                  <strong className="text-amber-400 font-bold">~ {etaMinutes} {language === "bn" ? "মিনিট" : "mins"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === "bn" ? "রোগীর ফোন নম্বর:" : "Patient Phone:"}</span>
                  <strong className="text-emerald-400 font-mono font-bold">{request.contactPhone}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions after Confirmation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleWhatsAppDispatch}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === "bn" ? "হোয়াটসঅ্যাপে তথ্য পাঠান" : "WhatsApp Details"}</span>
              </button>

              <a
                href={generateTelEmergencyLink(request.contactPhone)}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{language === "bn" ? "সরাসরি কল দিন" : "Call Patient"}</span>
              </a>
            </div>

            {/* Close / View Details */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenDetails) onOpenDetails(request);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold transition-colors"
              >
                {language === "bn" ? "রিকোয়েস্টের বিস্তারিত ও লাইভ স্ট্যাটাস দেখুন →" : "View Request Details & Live Status →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
