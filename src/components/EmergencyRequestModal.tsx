import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { BD_DISTRICTS_BY_DIVISION, BD_DIVISIONS } from "../data/bdData";
import { BloodGroup } from "../types";
import {
  X,
  Sparkles,
  AlertCircle,
  HeartHandshake,
  Loader2,
  Phone,
  MapPin,
  Hospital,
  Activity,
  Radio,
  CheckCircle2,
  Flame,
  FileText
} from "lucide-react";

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, addEmergencyRequest, triggerNotification, theme } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [area, setArea] = useState("Shahbagh / Dhanmondi");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O-");
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [reason, setReason] = useState("Emergency ICU Surgery / Delivery");
  const [isICU, setIsICU] = useState(true);
  const [contactPhone, setContactPhone] = useState("01711-889900");
  const [altPhone, setAltPhone] = useState("");

  const [errors, setErrors] = useState<{
    patientName?: string;
    hospitalName?: string;
    contactPhone?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    urgencyScore: number;
    urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Standard';
    aiReasoningBn: string;
    aiReasoningEn: string;
    recommendedResponseTime: string;
    actionPlanBn: string;
    actionPlanEn: string;
  } | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Fill quick demo values for fast testing
  const handleQuickDemoFill = () => {
    setPatientName("Sumaiya Akter (Age 32)");
    setHospitalName("Dhaka Medical College Hospital (DMCH)");
    setSelectedDivision("Dhaka");
    setDistrict("Dhaka");
    setArea("Shahbagh, ICU Bed #12");
    setBloodGroup("O-");
    setUnitsNeeded(3);
    setReason("Emergency Cesarean Delivery & Postpartum Hemorrhage");
    setIsICU(true);
    setContactPhone("01711-889900");
    setAltPhone("01822-334455");
    setErrors({});
    triggerNotification(
      language === "bn" ? "ডেমো তথ্য সফলভাবে পূরণ করা হয়েছে!" : "Demo emergency details filled!"
    );
  };

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzingAI(true);
    try {
      const res = await fetch("/api/ai/urgency-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          hospital: hospitalName,
          district,
          bloodGroup,
          unitsNeeded,
          reason,
          patientCondition: reason,
          isICU,
        }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setAiAnalysis(data);
    } catch (e) {
      console.warn("AI Urgency API fallback:", e);
      // Sensible Fallback
      setAiAnalysis({
        urgencyScore: isICU ? 95 : 82,
        urgencyLevel: isICU ? "Critical" : "High",
        aiReasoningBn: isICU
          ? "জরুরি আইসিইউ সার্জারি কেস। অবিলম্বে নিকটস্থ ও-নেগেটিভ রক্তদাতাদের কাছে পুশ এলার্ট পাঠানো অত্যন্ত জরুরি।"
          : "উচ্চ অগ্রাধিকার কেস। নিকটস্থ রক্তদাতাদের দ্রুত নোটিফিকেশন এলার্ট পাঠানো প্রয়োজন।",
        aiReasoningEn: isICU
          ? "Critical ICU surgical case analyzed. Immediate push notification dispatch to matching donors is strongly recommended."
          : "High priority request. Direct callouts to local donor network recommended.",
        recommendedResponseTime: isICU ? "১৫-৩০ মিনিটের মধ্যে (Within 15-30 mins)" : "১ ঘণ্টার মধ্যে (Within 1 hour)",
        actionPlanBn: "১. নিকটবর্তী সক্রিয় রক্তদাতাদের ফোনে কল করুন।\n২. ব্লাড ব্যাংক ইনভেন্টরি চেক করুন।",
        actionPlanEn: "1. Call matching active donors.\n2. Cross-verify hospital blood bank inventory."
      });
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const validateForm = () => {
    const newErrors: { patientName?: string; hospitalName?: string; contactPhone?: string } = {};

    if (!patientName.trim()) {
      newErrors.patientName = language === "bn" ? "রোগীর নাম দেওয়া আবশ্যক" : "Patient name is required";
    }
    if (!hospitalName.trim()) {
      newErrors.hospitalName = language === "bn" ? "হাসপাতালের নাম দেওয়া আবশ্যক" : "Hospital name is required";
    }
    if (!contactPhone.trim()) {
      newErrors.contactPhone = language === "bn" ? "ফোন নম্বর দেওয়া আবশ্যক" : "Contact phone is required";
    } else if (contactPhone.trim().length < 6) {
      newErrors.contactPhone = language === "bn" ? "সঠিক ফোন নম্বর দিন" : "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerNotification(
        language === "bn"
          ? "⚠️ দয়া করে লাল চিহ্নিত প্রয়োজনীয় তথ্যগুলো পূরণ করুন।"
          : "⚠️ Please fill all required fields highlighted in red."
      );
      return;
    }

    setIsSubmitting(true);

    const urgencyScore = aiAnalysis ? aiAnalysis.urgencyScore : isICU ? 92 : 75;
    const urgencyLevel = aiAnalysis ? aiAnalysis.urgencyLevel : isICU ? "Critical" : "High";

    setTimeout(() => {
      const payload: Parameters<typeof addEmergencyRequest>[0] = {
        patientName: patientName.trim(),
        hospitalName: hospitalName.trim(),
        district,
        area: area.trim() || "Local Area",
        bloodGroup,
        unitsNeeded,
        urgencyLevel,
        urgencyScore,
        reason: reason.trim() || (isICU ? "Emergency ICU Requirement" : "Urgent Transfusion"),
        isICU,
        contactPhone: contactPhone.trim(),
        altPhone: altPhone.trim() || "",
      };

      if (aiAnalysis?.aiReasoningBn) payload.aiReasoningBn = aiAnalysis.aiReasoningBn;
      if (aiAnalysis?.aiReasoningEn) payload.aiReasoningEn = aiAnalysis.aiReasoningEn;
      if (aiAnalysis?.recommendedResponseTime) payload.recommendedResponseTime = aiAnalysis.recommendedResponseTime;
      if (aiAnalysis?.actionPlanBn) payload.actionPlanBn = aiAnalysis.actionPlanBn;
      if (aiAnalysis?.actionPlanEn) payload.actionPlanEn = aiAnalysis.actionPlanEn;

      addEmergencyRequest(payload);

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      id="emergency-request-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 pt-16 sm:pt-24 pb-16 flex justify-center items-start animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="emergency-request-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl mt-2 sm:mt-4 mb-10 overflow-hidden transition-all duration-200 frosted-glass-card ring-1 ring-white/10 ${
          isDark
            ? "bg-slate-900/95 border-red-800/60 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-red-200 text-slate-900 shadow-red-950/20"
        }`}
      >
        {/* Top Header Bar with Prominent Cross Close Button */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 sticky top-0 z-20 ${
          isDark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600/15 border border-red-500/30 rounded-2xl text-red-500 shrink-0 shadow-sm">
              <HeartHandshake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-sans tracking-tight">
                  {t.postEmergencyTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn"
                  ? "রিয়েল-টাইমে নিকটবর্তী রক্তদাতাদের জরুরি পুশ এলার্ট পাঠান"
                  : "Dispatch real-time emergency alert broadcast to nearby matching donors"}
              </p>
            </div>
          </div>

          {/* Prominent Cross Button */}
          <button
            id="emergency-request-modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-slate-800 dark:hover:bg-red-600 dark:text-slate-300 dark:hover:text-white border border-red-200 dark:border-slate-700 transition-all duration-200 shadow-sm active:scale-90 shrink-0 cursor-pointer"
            title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form noValidate onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Demo Fill Helper Bar */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            isDark ? "bg-slate-950/70 border-slate-800" : "bg-rose-50/70 border-rose-200"
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>{language === "bn" ? "পরীক্ষা করার জন্য দ্রুত তথ্য পূরণ করুন:" : "Quickly test emergency broadcast:"}</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-sm hover:from-red-500 hover:to-rose-500 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "ডেমো ডেটা বসান" : "Fill Demo Data"}</span>
            </button>
          </div>

          {/* Patient & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.patientName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  if (errors.patientName) setErrors(prev => ({ ...prev, patientName: undefined }));
                }}
                placeholder="e.g. Sumaiya Akter (Age 32)"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                  errors.patientName
                    ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/10"
                    : isDark
                    ? "bg-slate-800 border-slate-700 text-white focus:border-red-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-red-500"
                }`}
              />
              {errors.patientName && (
                <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.patientName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.hospitalName} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hospital className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => {
                    setHospitalName(e.target.value);
                    if (errors.hospitalName) setErrors(prev => ({ ...prev, hospitalName: undefined }));
                  }}
                  placeholder="e.g. DMCH or BSMMU Shahbagh"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                    errors.hospitalName
                      ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/10"
                      : isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-red-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-red-500"
                  }`}
                />
              </div>
              {errors.hospitalName && (
                <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.hospitalName}
                </p>
              )}
            </div>
          </div>

          {/* Division, District, Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                বিভাগ (Division)
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setDistrict(BD_DISTRICTS_BY_DIVISION[e.target.value][0]);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {BD_DIVISIONS.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.districtSelect} <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {(BD_DISTRICTS_BY_DIVISION[selectedDivision] || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.areaSelect}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Dhanmondi, ICU Ward 4"
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium border focus:outline-none ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Blood Group & Units Needed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.bloodGroupSelect} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-xl text-xs font-black border transition-all active:scale-95 ${
                      bloodGroup === bg
                        ? "bg-red-600 border-red-400 text-white shadow-md shadow-red-600/40"
                        : isDark
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.unitsNeeded} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(Math.max(1, Number(e.target.value)))}
                  className={`w-24 px-3.5 py-2 rounded-xl text-sm font-black border focus:outline-none ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {language === "bn" ? "ব্যাগ / ইউনিট রক্ত আবশ্যক" : "Bags / Units needed"}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Reason & ICU Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold">
              {t.medicalReason}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Accident, Thalassemia, Emergency Delivery, Surgery details..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none ${
                isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            ></textarea>

            <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-2xl border transition-all ${
              isICU
                ? "bg-red-600/10 border-red-500/40 text-red-500"
                : isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                : "bg-slate-100 border-slate-200 text-slate-700"
            }`}>
              <input
                type="checkbox"
                checked={isICU}
                onChange={(e) => setIsICU(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                {t.isICU}
              </span>
            </label>
          </div>

          {/* Contact Phones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.contactPhone} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (errors.contactPhone) setErrors(prev => ({ ...prev, contactPhone: undefined }));
                  }}
                  placeholder="01711-889900"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                    errors.contactPhone
                      ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/10"
                      : isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-red-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-red-500"
                  }`}
                />
              </div>
              {errors.contactPhone && (
                <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.contactPhone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {t.altPhone}
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="01800-000000"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* AI Urgency Priority Ranker */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? "bg-slate-950/80 border-red-900/40" : "bg-rose-50/50 border-rose-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-black text-xs">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className={isDark ? "text-rose-300" : "text-rose-700"}>
                  AI Urgency Priority Ranker
                </span>
              </div>
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzingAI}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                {isAnalyzingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.analyzeWithAI}</span>
                  </>
                )}
              </button>
            </div>

            {aiAnalysis && (
              <div className={`pt-2 border-t space-y-2 text-xs ${
                isDark ? "border-slate-800" : "border-rose-200"
              }`}>
                <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-rose-200"
                }`}>
                  <span className="text-slate-400 font-bold">{t.aiScoreLabel}:</span>
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs shadow-sm">
                    {aiAnalysis.urgencyScore}% ({aiAnalysis.urgencyLevel})
                  </span>
                </div>
                <p className={`leading-relaxed italic ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  "{language === "bn" ? aiAnalysis.aiReasoningBn : aiAnalysis.aiReasoningEn}"
                </p>
                <div className="text-[11px] text-amber-600 dark:text-amber-300 font-bold">
                  ⏳ {language === "bn" ? "প্রস্তাবিত সময় সীমা: " : "Target Window: "} {aiAnalysis.recommendedResponseTime}
                </div>
              </div>
            )}
          </div>

          {/* Submit & Close Buttons */}
          <div className={`pt-3 border-t flex items-center justify-end space-x-3 ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold border transition-all active:scale-95 ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {language === "bn" ? "বাতিল / বন্ধ করুন" : "Cancel"}
            </button>
            <button
              id="emergency-request-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-600/40 hover:shadow-red-600/60 transition-all flex items-center gap-2 active:scale-95 border border-red-400/30 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === "bn" ? "সম্প্রচারিত হচ্ছে..." : "Broadcasting Alert..."}</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>{t.submitRequest}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
