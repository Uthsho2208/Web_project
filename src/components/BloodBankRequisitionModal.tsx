import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { BloodBank, BloodGroup } from "../types";
import {
  X,
  Hospital,
  Phone,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Send,
  Plus,
  Minus,
  CheckCheck,
  FileText
} from "lucide-react";
import {
  generateWhatsAppBloodBankRequisitionLink,
  generateTelEmergencyLink
} from "../lib/bloodLogic";

interface BloodBankRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BloodBank | null;
  initialGroup?: BloodGroup;
}

export const BloodBankRequisitionModal: React.FC<BloodBankRequisitionModalProps> = ({
  isOpen,
  onClose,
  bank,
  initialGroup = "O+"
}) => {
  const {
    language,
    userProfile,
    reserveBloodBankStock,
    updateBloodBankStock,
    theme
  } = useApp();

  const isDark = theme === "dark";

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>(initialGroup);
  const [unitsNeeded, setUnitsNeeded] = useState<number>(1);
  const [patientName, setPatientName] = useState<string>("");
  const [hospitalWard, setHospitalWard] = useState<string>("");
  const [urgencyReason, setUrgencyReason] = useState<string>("Emergency Surgery");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [reservationCode, setReservationCode] = useState<string>("");
  const [showStaffStockManager, setShowStaffStockManager] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedGroup(initialGroup || "O+");
      setUnitsNeeded(1);
      setPatientName("");
      setHospitalWard("");
      setIsSuccess(false);
      setShowStaffStockManager(false);
    }
  }, [isOpen, bank?.id, initialGroup]);

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

  if (!isOpen || !bank) return null;

  const currentAvailable = bank.inventory[selectedGroup] || 0;

  const handleConfirmReservation = async () => {
    if (!patientName.trim()) {
      alert(language === "bn" ? "অনুগ্রহ করে রোগীর নাম লিখুন।" : "Please enter patient name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const pName = patientName.trim() || userProfile.name;
      const success = await reserveBloodBankStock(bank.id, selectedGroup, unitsNeeded, pName);
      if (success) {
        const code = `REQ-BB-${Math.floor(100000 + Math.random() * 900000)}`;
        setReservationCode(code);
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRequisition = () => {
    const link = generateWhatsAppBloodBankRequisitionLink(
      bank,
      selectedGroup,
      unitsNeeded,
      patientName.trim() || userProfile.name,
      hospitalWard.trim() || `${bank.district} Hospital Ward`,
      language
    );
    window.open(link, "_blank");
  };

  const bloodGroupKeys: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-rose-900/10"
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

        {!isSuccess ? (
          /* ========================================================================= */
          /* STEP 1: REQUISITION FORM */
          /* ========================================================================= */
          <div className="space-y-5">
            {/* Header Info */}
            <div className="flex items-start gap-4 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-900/40 shrink-0">
                <Hospital className="w-6 h-6" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase tracking-wide inline-block mb-1">
                  {language === "bn" ? "🏥 ব্লাড ব্যাংক রিকুইজিশন ও স্টক বুকিং" : "🏥 Blood Bank Requisition & Stock Booking"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black">{bank.hospitalName}</h2>
                <p className={`text-xs mt-0.5 flex items-center gap-1.5 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {bank.address}
                </p>
              </div>
            </div>

            {/* Select Blood Group */}
            <div>
              <label className="text-xs font-bold block mb-2 text-slate-300 flex items-center justify-between">
                <span>{language === "bn" ? "প্রয়োজনীয় রক্তের গ্রুপ নির্বাচন করুন:" : "Select Required Blood Group:"}</span>
                <span className="text-[11px] font-semibold text-rose-400">
                  {language === "bn" ? `মওজুদ: ${currentAvailable} ব্যাগ` : `In Stock: ${currentAvailable} Bag(s)`}
                </span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {bloodGroupKeys.map((bg) => {
                  const count = bank.inventory[bg] || 0;
                  const isSelected = selectedGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedGroup(bg)}
                      className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 ${
                        isSelected
                          ? "bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950 ring-2 ring-rose-400/50"
                          : count > 0
                          ? isDark
                            ? "bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700"
                            : "bg-white border-slate-200 text-slate-800 hover:border-rose-300"
                          : "bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-60"
                      }`}
                    >
                      <span className="block font-black text-xs">{bg}</span>
                      <span className={`block text-[10px] font-bold ${
                        isSelected ? "text-rose-100" : count > 0 ? "text-emerald-400" : "text-slate-500"
                      }`}>
                        {count}b
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Units Needed & Current Stock Status */}
            <div className={`p-4 rounded-2xl border ${
              currentAvailable > 0
                ? isDark ? "bg-slate-950/80 border-slate-800" : "bg-emerald-50/70 border-emerald-200"
                : isDark ? "bg-rose-950/30 border-rose-800/50" : "bg-rose-50 border-rose-200"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    {language === "bn" ? "বর্তমান স্টক পরিস্থিতি" : "Current Stock Status"}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs">
                      {selectedGroup}
                    </span>
                    <span className={`text-sm font-extrabold ${
                      currentAvailable >= 10
                        ? "text-emerald-400"
                        : currentAvailable > 0
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}>
                      {currentAvailable > 0
                        ? `${currentAvailable} ${language === "bn" ? "ব্যাগ রক্ত রেডি আছে" : "Bags Ready"}`
                        : language === "bn" ? "⚠️ স্টক শেষ (জরুরি ডোনার কল করুন)" : "⚠️ Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Units Counter */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400">{language === "bn" ? "ব্যাগ:" : "Bags:"}</span>
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setUnitsNeeded((prev) => Math.max(1, prev - 1))}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-black text-xs text-white">{unitsNeeded}</span>
                    <button
                      type="button"
                      onClick={() => setUnitsNeeded((prev) => Math.min(5, Math.min(currentAvailable || 5, prev + 1)))}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient & Hospital Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">
                  {language === "bn" ? "রোগীর নাম *" : "Patient Name *"}
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={language === "bn" ? "যেমন: সুমাইয়া আক্তার" : "e.g. Sumaiya Akter"}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500" : "bg-white border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {language === "bn" ? "হাসপাতাল / কেবিন / ওয়ার্ড" : "Hospital / Cabin / Ward"}
                </label>
                <input
                  type="text"
                  value={hospitalWard}
                  onChange={(e) => setHospitalWard(e.target.value)}
                  placeholder={language === "bn" ? "যেমন: ঢাকা মেডিকেল, কেবিন ৪০২" : "e.g. DMCH, Ward 4"}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDark ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500" : "bg-white border-slate-300 text-slate-900 focus:border-rose-500"
                  }`}
                />
              </div>
            </div>

            {/* Urgency Reason */}
            <div>
              <label className="text-xs font-bold block mb-1.5">
                {language === "bn" ? "প্রয়োজনের ধরন / কারণ:" : "Medical Urgency Reason:"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: "Emergency Surgery", labelBn: "জরুরি অপারেশন", labelEn: "Emergency Surgery" },
                  { id: "ICU / CCU", labelBn: "আইসিইউ / সিসিইউ", labelEn: "ICU / CCU" },
                  { id: "Thalassemia", labelBn: "থ্যালাসেমিয়া রুটিন", labelEn: "Thalassemia" },
                  { id: "Accident / Trauma", labelBn: "দুর্ঘটনা / ট্রমা", labelEn: "Accident Trauma" },
                  { id: "Child Delivery", labelBn: "প্রসবকালীন / সিজার", labelEn: "Child Delivery" },
                  { id: "Platelet / Plasma", labelBn: "প্লাটিলেট / প্লাজমা", labelEn: "Platelet / Plasma" }
                ].map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setUrgencyReason(reason.id)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-[11px] border transition-all text-center ${
                      urgencyReason === reason.id
                        ? "bg-rose-600/20 border-rose-500 text-rose-300 font-black"
                        : isDark
                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300"
                    }`}
                  >
                    {language === "bn" ? reason.labelBn : reason.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={isSubmitting || currentAvailable < unitsNeeded}
                className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  currentAvailable >= unitsNeeded
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950"
                    : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <CheckCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (language === "bn" ? "বুকিং প্রসেস হচ্ছে..." : "Processing Requisition...")
                    : (language === "bn" ? "সরাসরি স্টক বুকিং / রিকুইজিশন কনফার্ম" : "Confirm Stock Requisition")}
                </span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleWhatsAppRequisition}
                  className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === "bn" ? "হোয়াটসঅ্যাপ স্লিপ" : "WhatsApp Slip"}</span>
                </button>

                <a
                  href={generateTelEmergencyLink(bank.emergencyHotline)}
                  className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  title="Call Hotline"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{language === "bn" ? "হটলাইন" : "Hotline"}</span>
                </a>
              </div>
            </div>

            {/* Volunteer / Staff Stock Adjuster Toggle */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowStaffStockManager((prev) => !prev)}
                className="text-slate-400 hover:text-rose-400 transition-colors font-medium flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "স্টাফ / ভলান্টিয়ার স্টক আপডেট কন্ট্রোল" : "Staff / Volunteer Stock Quick Update"}</span>
              </button>
              <span className="text-slate-500">24/7 Hotline: {bank.emergencyHotline}</span>
            </div>

            {showStaffStockManager && (
              <div className={`p-3.5 rounded-2xl border animate-fade-in ${
                isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"
              }`}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                  {language === "bn" ? `স্টক অ্যাডজাস্টমেন্ট (${bank.hospitalName}):` : `Stock Adjustment (${bank.hospitalName}):`}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroupKeys.map((bg) => (
                    <div key={bg} className="flex items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                      <span className="text-xs font-black text-rose-400 ml-1">{bg}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => updateBloodBankStock(bank.id, bg, -1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center font-bold"
                          title="-1"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white px-1">{bank.inventory[bg] || 0}</span>
                        <button
                          type="button"
                          onClick={() => updateBloodBankStock(bank.id, bg, 1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center font-bold"
                          title="+1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 2: REQUISITION CONFIRMED */
          /* ========================================================================= */
          <div className="text-center py-4 sm:py-6 animate-fade-in space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-black uppercase tracking-wider inline-block mb-1.5">
                ✓ {language === "bn" ? "রিকুইজিশন সফলভাবে গৃহীত হয়েছে" : "Requisition Confirmed"}
              </span>
              <h2 className="text-2xl font-black text-slate-100">
                {language === "bn" ? "🎉 রক্তের ব্যাগ বুকিং সফল হয়েছে!" : "🎉 Blood Bag Reservation Confirmed!"}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                {language === "bn"
                  ? `${bank.hospitalName} এ ${patientName} এর জন্য ${unitsNeeded} ব্যাগ (${selectedGroup}) রক্ত সংরক্ষিত হয়েছে।`
                  : `${unitsNeeded} Bag(s) of ${selectedGroup} blood reserved for ${patientName} at ${bank.hospitalName}.`}
              </p>
            </div>

            {/* Tracking Voucher Box */}
            <div className={`p-4 rounded-2xl border text-left text-xs max-w-md mx-auto ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">{language === "bn" ? "রিকুইজিশন কোড:" : "Tracking Code:"}</span>
                  <strong className="text-emerald-400 font-mono font-bold">{reservationCode}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">{language === "bn" ? "ব্লাড ব্যাংক:" : "Blood Center:"}</span>
                  <span className="text-slate-200 font-medium">{bank.hospitalName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">{language === "bn" ? "রক্তের গ্রুপ ও পরিমাণ:" : "Group & Quantity:"}</span>
                  <strong className="text-rose-400 font-bold">{selectedGroup} ({unitsNeeded} {language === "bn" ? "ব্যাগ" : "Bag"})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === "bn" ? "হটলাইন নম্বর:" : "Hotline:"}</span>
                  <strong className="text-amber-400 font-mono font-bold">{bank.emergencyHotline}</strong>
                </div>
              </div>
            </div>

            {/* Next actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleWhatsAppRequisition}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === "bn" ? "হোয়াটসঅ্যাপে স্লিপ পাঠান" : "Send WhatsApp Slip"}</span>
              </button>

              <a
                href={generateTelEmergencyLink(bank.emergencyHotline)}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{language === "bn" ? "হটলাইনে কল দিন" : "Call Hotline"}</span>
              </a>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold"
              >
                {language === "bn" ? "পপ-আপ বন্ধ করুন" : "Close Window"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
