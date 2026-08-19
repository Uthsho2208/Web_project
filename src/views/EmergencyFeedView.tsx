import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { BloodGroup, EmergencyRequest } from "../types";
import { BD_DISTRICTS_BY_DIVISION } from "../data/bdData";
import {
  AlertTriangle,
  Phone,
  Share2,
  Sparkles,
  MapPin,
  Activity,
  CheckCircle2,
  Clock,
  Navigation,
  Heart,
  Filter,
  MessageSquare,
  Copy,
  Eye,
  Award,
  Radio,
  Zap,
  Check,
  ShieldAlert,
  Send
} from "lucide-react";
import { DonationFeedbackModal } from "../components/DonationFeedbackModal";
import {
  calculateHaversineDistanceKm,
  generateWhatsAppEmergencyLink,
  generateTelEmergencyLink,
  getBloodCompatibilityDetails,
  BD_DISTRICT_COORDINATES
} from "../lib/bloodLogic";

export const EmergencyFeedView: React.FC = () => {
  const {
    language,
    requests,
    respondToEmergencyRequest,
    userProfile,
    triggerNotification,
    openRequestDetail,
    openPledgeModal,
    openIncomingDonorAlert,
    simulateIncomingDonorOffer,
    theme,
  } = useApp();

  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [filterBloodGroup, setFilterBloodGroup] = useState<string>("ALL");
  const [filterDistrict, setFilterDistrict] = useState<string>("ALL");
  const [onlyICU, setOnlyICU] = useState<boolean>(false);

  // Donation Feedback Modal state for completing a donation
  const [selectedRequestForFeedback, setSelectedRequestForFeedback] =
    useState<EmergencyRequest | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (filterBloodGroup !== "ALL" && r.bloodGroup !== filterBloodGroup) return false;
    if (filterDistrict !== "ALL" && r.district !== filterDistrict) return false;
    if (onlyICU && !r.isICU) return false;
    return true;
  });

  const getStatusBadge = (status: EmergencyRequest["status"]) => {
    switch (status) {
      case "Searching":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/40 text-red-500 text-[11px] font-black tracking-wider uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>Searching Donor</span>
          </span>
        );
      case "Donor Assigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-500 text-[11px] font-black tracking-wider uppercase shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Donor Assigned</span>
          </span>
        );
      case "Fulfilled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-[11px] font-black tracking-wider uppercase shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fulfilled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getDistanceTag = (req: EmergencyRequest) => {
    const userLat = userProfile.latitude || 23.8103;
    const userLng = userProfile.longitude || 90.4125;

    const reqCoords = req.latitude && req.longitude
      ? { lat: req.latitude, lng: req.longitude }
      : BD_DISTRICT_COORDINATES[req.district] || { lat: 23.8103, lng: 90.4125 };

    const distance = calculateHaversineDistanceKm(
      userLat,
      userLng,
      reqCoords.lat,
      reqCoords.lng
    );

    return `${distance} km away`;
  };

  const handleShare = (req: EmergencyRequest, platform: "whatsapp" | "facebook" | "copy") => {
    const textBn = `🚨 জরুরি রক্ত প্রয়োজন!
রক্তের গ্রুপ: ${req.bloodGroup} (${req.unitsNeeded} ব্যাগ)
রোগী: ${req.patientName}
হাসপাতাল: ${req.hospitalName}, ${req.district}
কারণ: ${req.reason}
জরুরি যোগাযোগ: ${req.contactPhone}
BloodMate AI ইমার্জেন্সি নেটওয়ার্কের মাধ্যমে শেয়ার করা হয়েছে।`;

    const textEn = `🚨 URGENT BLOOD NEEDED!
Blood Group: ${req.bloodGroup} (${req.unitsNeeded} Units)
Patient: ${req.patientName}
Hospital: ${req.hospitalName}, ${req.district}
Contact: ${req.contactPhone}
Shared via BloodMate AI Emergency Network 🇧🇩`;

    const text = language === "bn" ? textBn : textEn;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(text);
      triggerNotification(
        language === "bn"
          ? "জরুরি শেয়ার মেসেজ কপি করা হয়েছে!"
          : "Emergency request text copied to clipboard!"
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Header Bar */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/50"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
        }`}
      >
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 bg-red-600/15 border border-red-500/30 text-red-500 rounded-2xl shrink-0 shadow-sm">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 font-sans tracking-tight">
                {t.tabEmergencyFeed}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-sm">
                {filteredRequests.length} Live Alerts
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "bn"
                ? "এআই অগ্রাধিকার স্কোর ও ভৌগোলিক দূরত্বের ভিত্তিতে সজ্জিত লাইভ জরুরি আবেদন"
                : "Real-time emergency radar feed prioritized by AI urgency score & geo-proximity"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Blood group filter */}
          <select
            value={filterBloodGroup}
            onChange={(e) => setFilterBloodGroup(e.target.value)}
            className={`px-3.5 py-2.5 border rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
              isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="ALL">{language === "bn" ? "সকল রক্ত গ্রুপ" : "All Blood Groups"}</option>
            {(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as BloodGroup[]).map((bg) => (
              <option key={bg} value={bg}>
                Group {bg}
              </option>
            ))}
          </select>

          {/* District Filter */}
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className={`px-3.5 py-2.5 border rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
              isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="ALL">{language === "bn" ? "সকল জেলা" : "All Districts"}</option>
            {Object.values(BD_DISTRICTS_BY_DIVISION)
              .flat()
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>

          {/* ICU Only Toggle */}
          <button
            onClick={() => setOnlyICU(!onlyICU)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              onlyICU
                ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-red-950"
                : isDark
                ? "bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>ICU / CCU Only</span>
          </button>
        </div>
      </div>

      {/* Emergency Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((req) => {
          const userResponse = req.donorResponses.find((dr) => dr.donorId === userProfile.id);
          const distanceStr = getDistanceTag(req);
          const compatInfo = getBloodCompatibilityDetails(req.bloodGroup);

          return (
            <div
              key={req.id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden flex flex-col justify-between ${
                req.urgencyLevel === "Critical"
                  ? isDark
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 border-red-600/70 shadow-red-950/20"
                    : "bg-gradient-to-b from-white via-white to-rose-50/50 border-rose-300 shadow-rose-100"
                  : isDark
                  ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/40"
                  : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
              }`}
            >
              {/* Card Top Section */}
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3.5">
                    {/* High-Impact Blood Group Badge */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex flex-col items-center justify-center text-white shadow-lg shadow-red-600/40 shrink-0 ring-2 ring-red-400/20">
                      <span className="text-xl font-black leading-none tracking-tight">
                        {req.bloodGroup}
                      </span>
                      <span className="text-[10px] font-bold opacity-90 mt-1">
                        {req.unitsNeeded} Bag(s)
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-base sm:text-lg">{req.patientName}</h3>
                        {req.isICU && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                            ICU / CCU
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs font-semibold flex items-center gap-1.5 mt-1 ${
                          isDark ? "text-rose-300" : "text-rose-600"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{req.hospitalName}, {req.district}</span>
                      </p>

                      {/* Radial Distance Tag */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{distanceStr}</span>
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                  </div>

                  {/* AI Urgency Score Pill */}
                  <div className="text-right shrink-0">
                    <div
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-black shadow-sm ${
                        isDark
                          ? "bg-slate-950 border-red-500/40 text-rose-400"
                          : "bg-rose-50 border-rose-200 text-rose-700"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{req.urgencyScore}% Priority</span>
                    </div>
                    <span
                      className={`block text-[10px] font-bold mt-1 uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {req.urgencyLevel} Urgency
                    </span>
                  </div>
                </div>

                {/* Reason & Progress Container */}
                <div
                  className={`p-4 rounded-2xl border space-y-3 mb-4 ${
                    isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-xs leading-relaxed font-sans">
                    <strong className={isDark ? "text-rose-300 font-bold" : "text-rose-700 font-bold"}>
                      {language === "bn" ? "কারণ: " : "Medical Reason: "}
                    </strong>
                    {req.reason}
                  </p>

                  {/* Compatibility Info Pill */}
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>
                      Compatible Donors:{" "}
                      <span className="text-rose-400 font-bold">
                        {compatInfo.canReceiveFrom.join(", ")}
                      </span>
                    </span>
                  </div>

                  {/* AI Triage Reasoning */}
                  {(req.aiReasoningBn || req.aiReasoningEn) && (
                    <div
                      className={`text-[11px] font-medium italic p-2.5 rounded-xl border flex items-start gap-1.5 ${
                        isDark
                          ? "bg-amber-950/20 text-amber-200/90 border-amber-900/30"
                          : "bg-amber-50 text-amber-900 border-amber-200"
                      }`}
                    >
                      <span className="shrink-0 font-bold not-italic">🤖 AI Triage:</span>
                      <span>"{language === "bn" ? req.aiReasoningBn : req.aiReasoningEn}"</span>
                    </div>
                  )}

                  {/* Units Fulfillment Progress Bar */}
                  <div>
                    <div
                      className={`flex justify-between text-[11px] font-bold mb-1.5 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <span>
                        {language === "bn" ? "রক্তদান অগ্রগতি:" : "Fulfillment Status:"}{" "}
                        {req.unitsFulfilled}/{req.unitsNeeded} Bags
                      </span>
                      <span className="text-amber-500">{req.status}</span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${
                        isDark ? "bg-slate-800" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${Math.min(
                            100,
                            (req.unitsFulfilled / (req.unitsNeeded || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Responded Donors Feed */}
                {req.donorResponses && req.donorResponses.length > 0 && (
                  <div
                    className={`mb-4 p-3 rounded-2xl border text-xs space-y-1.5 ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-100/80 border-slate-200"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {language === "bn" ? "দাতাদের সাড়া (Responding Donors):" : "Responding Donors:"}
                    </span>
                    {req.donorResponses.map((dr, idx) => (
                      <div
                        key={idx}
                        onClick={() => openIncomingDonorAlert(req, dr)}
                        className={`flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-emerald-500/50 cursor-pointer transition-all ${
                          isDark ? "hover:bg-slate-800/80" : "hover:bg-emerald-50/70"
                        }`}
                        title={language === "bn" ? "রক্তদাতার অফার বিস্তারিত পপ-আপ দেখুন" : "Click to view donor alert popup"}
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {dr.donorName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">
                            {dr.status}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-extrabold underline">
                            {language === "bn" ? "পপ-আপ" : "View"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulate incoming donor offer helper */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => simulateIncomingDonorOffer(req.id)}
                    title={language === "bn" ? "টেস্ট করুন: ডোনার অফার দিলে কেমন পপ-আপ যাবে" : "Simulate incoming donor alert"}
                    className="text-[11px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>{language === "bn" ? "⚡ টেস্ট ডোনার অফার পপ-আপ দেখুন" : "⚡ Test Donor Alert Pop-up"}</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? "border-slate-800" : "border-slate-200"
                }`}
              >
                {/* Direct 1-Click Call & WhatsApp Intent Buttons */}
                <div className="flex items-center space-x-2">
                  <a
                    href={generateTelEmergencyLink(req.contactPhone)}
                    className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-extrabold text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{req.contactPhone}</span>
                  </a>

                  <a
                    href={generateWhatsAppEmergencyLink(req.contactPhone, req, language)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Direct WhatsApp Dispatch"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleShare(req, "copy")}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                    title="Copy details"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Actions: Details & Accept/Complete */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openRequestDetail(req)}
                    className={`px-3.5 py-2.5 rounded-2xl border text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                        : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "বিস্তারিত" : "Details"}</span>
                  </button>

                  {userResponse ? (
                    <button
                      onClick={() => setSelectedRequestForFeedback(req)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950 active:scale-95 border border-emerald-400/30"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{language === "bn" ? "দান সম্পন্ন করুন (+১০০ XP)" : "Complete (+100 XP)"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openPledgeModal(req)}
                      disabled={req.status === "Fulfilled"}
                      className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
                        req.status === "Fulfilled"
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                          : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950 border border-red-400/30"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
                      <span>{language === "bn" ? "সাহায্য করব" : "Accept SOS"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Donation Feedback Modal */}
      {selectedRequestForFeedback && (
        <DonationFeedbackModal
          isOpen={!!selectedRequestForFeedback}
          onClose={() => setSelectedRequestForFeedback(null)}
          request={selectedRequestForFeedback}
        />
      )}
    </div>
  );
};
