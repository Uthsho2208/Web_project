import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { EmergencyRequest, BloodGroup } from "../types";
import { TRANSLATIONS } from "../data/translations";
import {
  X,
  Phone,
  MapPin,
  AlertTriangle,
  Sparkles,
  Heart,
  Share2,
  CheckCircle2,
  Copy,
  Clock,
  User,
  ShieldCheck,
  Building,
  MessageCircle,
  Navigation,
  Check,
  AlertCircle,
  Car,
  Send,
  ThumbsUp,
  CheckCheck,
  XCircle,
  Radio,
  ArrowRight
} from "lucide-react";
import {
  generateWhatsAppEmergencyLink,
  generateWhatsAppDonorPledgeLink,
  generateTelEmergencyLink,
  isBloodCompatible,
  calculateHaversineDistanceKm,
  getDistrictCoordinates
} from "../lib/bloodLogic";

interface RequestDetailModalProps {
  isOpen?: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
  onOpenFeedbackModal?: (req: EmergencyRequest) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen = true,
  onClose,
  request,
  onOpenFeedbackModal,
}) => {
  const {
    language,
    userProfile,
    eligibility,
    respondToEmergencyRequest,
    updateDonorResponseStatus,
    triggerNotification,
    openPledgeModal,
    openIncomingDonorAlert,
    theme,
    rankDonors
  } = useApp();
  const t = TRANSLATIONS[language];

  const [copied, setCopied] = useState(false);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number>(30);
  const [donorNote, setDonorNote] = useState<string>("");
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);

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

  if (!isOpen || !request) return null;

  const isDark = theme === "dark";
  const userResponse = request.donorResponses.find((dr) => dr.donorId === userProfile.id);

  // Compute distance from current user
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

  const isUserBloodCompatible = isBloodCompatible(userProfile.bloodGroup, request.bloodGroup);
  const isExactGroup = userProfile.bloodGroup === request.bloodGroup;

  // Nearby ranked donors for this request
  const nearbyRankedDonors = rankDonors(request, 100).slice(0, 4);

  const handleShare = (platform: "whatsapp" | "facebook" | "copy") => {
    const textBn = `🚨 জরুরি রক্ত প্রয়োজন!
রক্তের গ্রুপ: ${request.bloodGroup} (${request.unitsNeeded} ব্যাগ)
রোগী: ${request.patientName}
হাসপাতাল: ${request.hospitalName}, ${request.district} (${request.area})
জরুরি মাত্রা: ${request.urgencyLevel}
কারণ: ${request.reason}
যোগাযোগ: ${request.contactPhone}
BloodMate AI অ্যাপের মাধ্যমে সাহায্য করুন।`;

    const textEn = `🚨 URGENT BLOOD NEEDED!
Blood Group: ${request.bloodGroup} (${request.unitsNeeded} Unit/Bags)
Patient: ${request.patientName}
Hospital: ${request.hospitalName}, ${request.district} (${request.area})
Urgency: ${request.urgencyLevel}
Reason: ${request.reason}
Contact: ${request.contactPhone}
Dispatched via BloodMate AI Emergency Network.`;

    const text = language === "bn" ? textBn : textEn;

    if (platform === "whatsapp") {
      window.open(generateWhatsAppEmergencyLink(request.contactPhone, request, language), "_blank");
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      triggerNotification(
        language === "bn"
          ? "জরুরি মেসেজ কপি করা হয়েছে!"
          : "Emergency request text copied to clipboard!"
      );
    }
  };

  const handleConfirmPledge = async () => {
    if (!eligibility.isEligible) {
      triggerNotification(
        language === "bn"
          ? `⚠️ বিরতি সক্রিয়: পরবর্তী রক্তদান ${eligibility.nextEligibleDate}`
          : `⚠️ Cooldown active: Next donation ${eligibility.nextEligibleDate}`
      );
      return;
    }

    setIsSubmittingPledge(true);
    try {
      await respondToEmergencyRequest(request.id, "On The Way", {
        estimatedArrivalMinutes: etaMinutes,
        note: donorNote
      });
      setShowPledgeForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingPledge(false);
    }
  };

  const handleSendWhatsAppPledge = () => {
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
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10 ${
          isDark
            ? "bg-slate-900/95 border-red-800/80 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-red-200 text-slate-900 shadow-rose-900/10"
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

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 pr-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex flex-col items-center justify-center text-white shadow-xl shadow-red-900/40 shrink-0">
            <span className="text-xl font-black leading-none">{request.bloodGroup}</span>
            <span className="text-[11px] font-semibold opacity-90 mt-0.5">
              {request.unitsNeeded} {language === "bn" ? "ব্যাগ" : "Bag(s)"}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                {request.patientName}
              </h2>
              {request.isICU && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
                  ICU / CCU
                </span>
              )}
            </div>

            <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${isDark ? "text-rose-300" : "text-rose-600"}`}>
              <Building className="w-3.5 h-3.5 shrink-0" />
              {request.hospitalName}, {request.area}, {request.district}
            </p>

            {/* Proximity & Compatibility Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1">
                <Navigation className="w-3 h-3 text-rose-400" />
                {distanceKm} km {language === "bn" ? "দূরে" : "away"}
              </span>

              {isExactGroup ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] font-bold">
                  ✓ {language === "bn" ? "হুবহু রক্তের গ্রুপ ম্যাচ" : "Exact Group Match"}
                </span>
              ) : isUserBloodCompatible ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 text-[11px] font-bold">
                  ★ {language === "bn" ? "সামঞ্জস্যপূর্ণ গ্রুপ" : "Compatible Group"}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[11px]">
                  {language === "bn" ? "গ্রুপ ভিন্ন" : "Different Group"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Priority & Urgency Bar */}
        <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-3 ${
          isDark ? "bg-slate-950/80 border-slate-800" : "bg-rose-50/80 border-rose-200"
        }`}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            <div>
              <span className="text-xs font-bold block">
                {language === "bn" ? "এআই ইমার্জেন্সি স্কোয়ার" : "AI Priority Score"}: {request.urgencyScore}%
              </span>
              <span className="text-[11px] opacity-75">
                {language === "bn" ? `জরুরি মাত্রা: ${request.urgencyLevel}` : `Urgency Level: ${request.urgencyLevel}`}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] block font-semibold">
              {language === "bn" ? "অবস্থা" : "Status"}: <strong className="text-rose-500">{request.status}</strong>
            </span>
            <span className="text-[11px] opacity-75">
              {language === "bn" ? "সংগৃহীত" : "Fulfilled"}: {request.unitsFulfilled} / {request.unitsNeeded} Bags
            </span>
          </div>
        </div>

        {/* Cooldown Warning Notice if active */}
        {!eligibility.isEligible && (
          <div className="p-3.5 mb-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              {language === "bn"
                ? `আপনি বর্তমানে ৯০/১২০ দিনের মেডিকেল বিরতিতে আছেন। পরবর্তী রক্তদানের তারিখ: ${eligibility.nextEligibleDate} (আরও ${eligibility.daysLeft} দিন বাকি)`
                : `Medical cooldown active. Next eligible donation date: ${eligibility.nextEligibleDate} (${eligibility.daysLeft} days remaining).`}
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DONOR PLEDGE & TRANSMISSION FORM (আমি রক্ত দিতে চাই ফ্লো) */}
        {/* ========================================================================= */}
        {showPledgeForm && (
          <div className={`p-5 mb-6 rounded-3xl border animate-fade-in shadow-xl ${
            isDark ? "bg-slate-950/90 border-rose-600/50" : "bg-rose-50/90 border-rose-300"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-600/20 text-rose-400 border border-red-500/40">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                    {language === "bn" ? "🩸 রক্তদানের প্রতিশ্রুতি ও তথ্য প্রেরণ" : "🩸 Confirm Donation Pledge & Details"}
                  </h3>
                  <p className="text-[11px] opacity-75">
                    {language === "bn"
                      ? "আপনার তথ্য সরাসরি রোগীর পরিবার ও হাসপাতালের কাছে পাঠানো হবে"
                      : "Your donor profile will be securely transmitted to the recipient."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPledgeForm(false)}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Donor Identity Card Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
              <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{language === "bn" ? "রক্তদাতার নাম ও গ্রুপ" : "Donor Name & Group"}</span>
                <p className="font-bold text-sm text-rose-400 mt-0.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-xs">{userProfile.bloodGroup}</span>
                  <span>{userProfile.name}</span>
                </p>
              </div>

              <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{language === "bn" ? "মোবাইল ও বর্তমান অবস্থান" : "Phone & Location"}</span>
                <p className="font-bold text-sm text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{userProfile.phone}</span>
                  <span className="text-slate-400 font-normal text-xs ml-1">({userProfile.area})</span>
                </p>
              </div>
            </div>

            {/* Estimated Arrival Time Selection */}
            <div className="mb-4">
              <label className="text-xs font-bold block mb-1.5 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" />
                {language === "bn" ? "হাসপাতালে পৌঁছানোর সম্ভাব্য সময় (ETA):" : "Estimated Arrival Time (ETA):"}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { val: 15, labelBn: "১৫ মিনিট", labelEn: "15 mins" },
                  { val: 30, labelBn: "৩০ মিনিট", labelEn: "30 mins" },
                  { val: 45, labelBn: "৪৫ মিনিট", labelEn: "45 mins" },
                  { val: 60, labelBn: "১ ঘণ্টা", labelEn: "1 hour" },
                  { val: 120, labelBn: "২ ঘণ্টা", labelEn: "2 hours" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setEtaMinutes(item.val)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
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

            {/* Donor Note */}
            <div className="mb-4">
              <label className="text-xs font-bold block mb-1.5">
                {language === "bn" ? "রোগী বা পরিবারের জন্য বিশেষ বার্তা / নোট (ঐচ্ছিক):" : "Message / Note to Recipient (Optional):"}
              </label>
              <input
                type="text"
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value)}
                placeholder={
                  language === "bn"
                    ? "যেমন: আমি এখনই রওনা হচ্ছি, জরুরি প্রস্তুতি রাখুন..."
                    : "e.g. I am leaving now, please keep the cross-match ready..."
                }
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-rose-500"
                    : "bg-white border-slate-300 text-slate-900 focus:border-rose-500"
                }`}
              />
            </div>

            {/* Actions for Sending Pledge */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmPledge}
                disabled={isSubmittingPledge}
                className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>
                  {isSubmittingPledge
                    ? (language === "bn" ? "প্রেরণ করা হচ্ছে..." : "Submitting...")
                    : (language === "bn" ? "রক্তদান নিশ্চিত করুন ও তথ্য পাঠান" : "Confirm Pledge & Transmit Details")}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppPledge}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all"
                title="Send via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === "bn" ? "হোয়াটসঅ্যাপে পাঠান" : "Send via WhatsApp"}</span>
              </button>

              <a
                href={generateTelEmergencyLink(request.contactPhone)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Call Recipient"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{language === "bn" ? "সরাসরি কল দিন" : "Call Directly"}</span>
              </a>
            </div>
          </div>
        )}

        {/* Detailed Info Grid */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Medical Reason */}
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {language === "bn" ? "রক্ত লাগার কারণ / ঘটনা" : "Medical Cause & Details"}
            </h4>
            <p className="leading-relaxed font-sans">{request.reason}</p>
          </div>

          {/* AI Reasoning & Action Plan */}
          {(request.aiReasoningBn || request.aiReasoningEn) && (
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-amber-950/30 border-amber-800/40 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-600">
                <Sparkles className="w-4 h-4" />
                {language === "bn" ? "এআই ট্রায়াজ দিকনির্দেশনা" : "AI Triage Recommendation"}
              </h4>
              <p className="italic leading-relaxed font-sans text-xs">
                "{language === "bn" ? request.aiReasoningBn : request.aiReasoningEn}"
              </p>
            </div>
          )}

          {/* Contact Numbers & Direct Intents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  {language === "bn" ? "রোগী / পরিবারের ফোন নম্বর" : "Patient / Family Phone"}
                </span>
                <span className="font-mono font-bold text-emerald-500 text-sm">
                  {request.contactPhone}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={generateTelEmergencyLink(request.contactPhone)}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 text-xs font-bold"
                  title="Direct Call"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={generateWhatsAppEmergencyLink(request.contactPhone, request, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900 shadow-sm flex items-center gap-1 text-xs font-bold"
                  title="WhatsApp Message"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {request.altPhone && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    {language === "bn" ? "বিকল্প ফোন নম্বর" : "Alternative Phone"}
                  </span>
                  <span className="font-mono font-bold text-emerald-500 text-sm">
                    {request.altPhone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={generateTelEmergencyLink(request.altPhone)}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                    title="Direct Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RESPONDING DONORS & RECIPIENT ACCEPTANCE WORKFLOW */}
          {/* ========================================================================= */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {language === "bn" ? "সাড়া দেওয়া রক্তদাতাগণ (Responding Donors)" : "Responding Donors & Pledges"}
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                  {request.donorResponses.length}
                </span>
              </h4>
            </div>

            {request.donorResponses.length > 0 ? (
              <div className="space-y-3">
                {request.donorResponses.map((dr, idx) => {
                  const isAccepted = dr.status === "Accepted";
                  const isOnTheWay = dr.status === "On The Way";
                  const isArrived = dr.status === "Arrived";
                  const isCompleted = dr.status === "Completed";
                  const isDeclined = dr.status === "Declined";

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                      }`}
                    >
                      {/* Donor Info Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {dr.donorBloodGroup && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-xs">
                              {dr.donorBloodGroup}
                            </span>
                          )}
                          <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-rose-400" />
                            {dr.donorName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {dr.donorPhone}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isCompleted ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-950 border border-purple-600 text-purple-300 font-bold text-[10px] flex items-center gap-1">
                              <CheckCheck className="w-3 h-3 text-purple-400" />
                              {language === "bn" ? "রক্তদান সম্পন্ন (Completed)" : "Completed"}
                            </span>
                          ) : isArrived ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold text-[10px] flex items-center gap-1 animate-pulse">
                              <Building className="w-3 h-3 text-emerald-400" />
                              {language === "bn" ? "হাসপাতালে উপস্থিত (Arrived)" : "Arrived at Hospital"}
                            </span>
                          ) : isOnTheWay ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-600 text-amber-300 font-bold text-[10px] flex items-center gap-1 animate-pulse">
                              <Car className="w-3 h-3 text-amber-400" />
                              {language === "bn" ? "রওয়ানা হয়েছেন (On The Way)" : "On The Way"}
                            </span>
                          ) : isAccepted ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-950 border border-blue-600 text-blue-300 font-bold text-[10px] flex items-center gap-1">
                              <Check className="w-3 h-3 text-blue-400" />
                              {language === "bn" ? "গৃহীত (Accepted)" : "Accepted"}
                            </span>
                          ) : isDeclined ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-400 font-bold text-[10px]">
                              {language === "bn" ? "বাতিল (Declined)" : "Declined"}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                              {dr.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ETA & Location & Notes */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mb-3 bg-slate-950/40 p-2.5 rounded-xl">
                        {dr.estimatedArrivalMinutes && (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            {language === "bn"
                              ? `পৌঁছানোর সময়: প্রায় ${dr.estimatedArrivalMinutes} মিনিট`
                              : `ETA: Approx. ${dr.estimatedArrivalMinutes} mins`}
                          </span>
                        )}
                        {dr.donorLocation && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            {dr.donorLocation}
                          </span>
                        )}
                        {dr.note && (
                          <span className="text-slate-300 italic w-full">
                            "{dr.note}"
                          </span>
                        )}
                      </div>

                      {/* Recipient / Patient Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                        {/* Direct Contact Tools */}
                        <div className="flex items-center gap-1.5">
                          <a
                            href={generateTelEmergencyLink(dr.donorPhone)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            title="Call Donor"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{language === "bn" ? "কল করুন" : "Call"}</span>
                          </a>
                          <a
                            href={generateWhatsAppEmergencyLink(dr.donorPhone, request, language)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900 font-bold text-[11px] flex items-center gap-1"
                            title="WhatsApp Donor"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{language === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => openIncomingDonorAlert(request, dr)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] flex items-center gap-1 border border-amber-500/30"
                            title={language === "bn" ? "পূর্ণ পপ-আপ দেখুন" : "View Full Alert Modal"}
                          >
                            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span>{language === "bn" ? "পপ-আপ দেখুন" : "Alert Modal"}</span>
                          </button>
                        </div>

                        {/* Acceptance / Status Transition Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {!isAccepted && !isOnTheWay && !isArrived && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => updateDonorResponseStatus(request.id, dr.donorId, "Accepted")}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{language === "bn" ? "ডোনার গ্রহণ করুন (Accept)" : "Accept Donor"}</span>
                            </button>
                          )}

                          {(isAccepted || isOnTheWay) && !isArrived && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => updateDonorResponseStatus(request.id, dr.donorId, "Arrived")}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <Building className="w-3 h-3" />
                              <span>{language === "bn" ? "হাসপাতালে এসেছেন" : "Mark Arrived"}</span>
                            </button>
                          )}

                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => {
                                updateDonorResponseStatus(request.id, dr.donorId, "Completed");
                                if (onOpenFeedbackModal) onOpenFeedbackModal(request);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-md shadow-emerald-950 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{language === "bn" ? "রক্ত নেওয়া সম্পন্ন (Received)" : "Blood Received / Complete"}</span>
                            </button>
                          )}

                          {!isCompleted && !isDeclined && (
                            <button
                              type="button"
                              onClick={() => updateDonorResponseStatus(request.id, dr.donorId, "Declined")}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-[10px]"
                              title={language === "bn" ? "অফার বাতিল করুন" : "Decline offer"}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs">
                <p className="mb-2">
                  {language === "bn"
                    ? "এখনও কোনো রক্তদাতা সাড়া দেননি। আপনি রক্ত দিতে চাইলে নিচের 'আমি রক্ত দান করতে চাই' বাটনে চাপুন।"
                    : "No donors have pledged yet. Click 'I Want to Donate' below to pledge blood."}
                </p>
              </div>
            )}
          </div>

          {/* AI-Ranked Compatible Donors Nearby */}
          {nearbyRankedDonors.length > 0 && (
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-2.5 text-rose-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === "bn" ? "এআই ম্যাচিং নিকটস্থ রক্তদাতা" : "AI Matched Nearby Donors"}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {language === "bn" ? "দূরত্ব ও রেটিং অনুযায়ী সাজানো" : "Ranked by distance & rating"}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nearbyRankedDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px]">
                          {donor.bloodGroup}
                        </span>
                        <span className="font-bold truncate">{donor.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-rose-400" />
                        {donor.area}, {donor.district} ({donor.distanceKm} km)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={generateTelEmergencyLink(donor.phone)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                        title="Call Donor"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={generateWhatsAppEmergencyLink(donor.phone, request, language)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900"
                        title="WhatsApp Donor"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Share Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleShare("whatsapp")}
              className="px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 font-bold text-xs transition-all flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
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
              className={`p-2.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1 ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title={t.copyAlertLink}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Direct Actions: Donate Blood / Open Pledge / Complete */}
          <div className="flex items-center space-x-2">
            {!userResponse ? (
              <button
                onClick={() => {
                  openPledgeModal(request);
                }}
                disabled={!eligibility.isEligible}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5 active:scale-95 ${
                  eligibility.isEligible
                    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950 animate-pulse"
                    : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>
                  {eligibility.isEligible
                    ? (language === "bn" ? "❤️ আমি রক্ত দান করতে চাই" : "❤️ I Want to Donate")
                    : (language === "bn" ? `বিরতিতে আছেন (${eligibility.daysLeft} দিন বাকি)` : `Cooldown Active (${eligibility.daysLeft}d)`)}
                </span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openPledgeModal(request)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Car className="w-4 h-4 text-amber-400" />
                  <span>{language === "bn" ? "আমার অফার আপডেট করুন" : "Update My Pledge"}</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenFeedbackModal) onOpenFeedbackModal(request);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === "bn" ? "রক্ত পেয়েছি / দান সম্পন্ন (Received)" : "Received / Complete Donation"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
