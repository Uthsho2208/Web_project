import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { EmergencyRequest } from "../types";
import { safeToISODateString } from "../lib/bloodLogic";
import { Star, Heart, CheckCircle2, X, Award, ShieldCheck } from "lucide-react";

interface DonationFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
}

export const DonationFeedbackModal: React.FC<DonationFeedbackModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { language, userProfile, addCompletedDonationRecord, triggerNotification, theme } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [hospitalName, setHospitalName] = useState<string>("");
  const [units, setUnits] = useState<number>(1);
  const [donationDate, setDonationDate] = useState<string>(
    safeToISODateString(new Date())
  );

  useEffect(() => {
    if (request) {
      setRecipientName(request.patientName || "");
      setHospitalName(`${request.hospitalName}, ${request.district}`);
      setUnits(request.unitsNeeded || 1);
      setFeedback(
        language === "bn"
          ? "জরুরি রক্তদান সফলভাবে সম্পন্ন হয়েছে। আলহামদুলিল্লাহ!"
          : "Emergency blood donation completed successfully!"
      );
    }
  }, [request, language]);

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

  const isDark = theme === "dark";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addCompletedDonationRecord({
      requestId: request.id,
      recipientName: recipientName || request.patientName,
      hospitalName: hospitalName || request.hospitalName,
      district: request.district,
      area: request.area,
      contactPhone: request.contactPhone,
      bloodGroup: request.bloodGroup,
      units: Number(units) || 1,
      date: donationDate,
      ratingGiven: rating,
      feedback: feedback || "Blood donation verified."
    });

    onClose();
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
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10 ${
          isDark
            ? "bg-slate-900/95 border-emerald-800/80 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-emerald-200 text-slate-900 shadow-emerald-900/10"
        }`}
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

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 rounded-2xl">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              {language === "bn" ? "রক্তদান সম্পন্ন করুন ও রেটিং দিন" : "Confirm Donation & Leave Review"}
            </h3>
            <p className="text-xs opacity-75">
              {language === "bn"
                ? "রক্তদান নিশ্চিত করলে আপনার প্রোফাইলে মোট সংখ্যা যোগ হবে এবং ব্যাজ আপডেট হবে।"
                : "Confirming updates total donation count, badge status & history log."}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Recipient & Hospital Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 opacity-80">
                {language === "bn" ? "রোগীর নাম" : "Recipient Name"}
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
            <div>
              <label className="font-bold block mb-1 opacity-80">
                {language === "bn" ? "হাসপাতাল ও জেলা" : "Hospital & District"}
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 opacity-80">
                {language === "bn" ? "রক্তদানের তারিখ" : "Donation Date"}
              </label>
              <input
                type="date"
                required
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
            <div>
              <label className="font-bold block mb-1 opacity-80">
                {language === "bn" ? "রক্তের ব্যাগ সংখ্যা" : "Bags / Units"}
              </label>
              <input
                type="number"
                min={1}
                max={4}
                required
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 ${
                  isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Star Rating Section */}
          <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-800" : "bg-amber-50/60 border-amber-200"}`}>
            <label className="font-extrabold text-xs uppercase tracking-wider block mb-2 text-amber-500">
              {language === "bn" ? "রক্তগ্রহীতার অভিজ্ঞতা রেটিং (Star Rating)" : "Rate the Donation Experience"}
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow"
                        : "text-slate-500 stroke-1"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-500 mt-1 block">
              {rating === 5 && (language === "bn" ? "অসাধারণ ও দ্রুত রক্তদান (5.0)" : "Outstanding & Timely (5.0)")}
              {rating === 4 && (language === "bn" ? "খুব ভালো রক্তদান (4.0)" : "Very Good Donation (4.0)")}
              {rating === 3 && (language === "bn" ? "সন্তোষজনক (3.0)" : "Satisfactory (3.0)")}
              {rating <= 2 && (language === "bn" ? "সাধারণ অভিজ্ঞতা (2.0)" : "Average Experience (2.0)")}
            </span>
          </div>

          {/* Review Comment */}
          <div>
            <label className="font-bold block mb-1 opacity-80">
              {language === "bn" ? "মন্তব্য / রিভিউ লিখুন" : "Feedback & Review Comment"}
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={language === "bn" ? "যেমন: হাসপাতালে নিরাপদে ১ ব্যাগ রক্ত প্রদান সম্পন্ন।" : "e.g., Safely donated 1 bag of blood at hospital."}
              className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 ${
                isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 border border-emerald-400/30 active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{language === "bn" ? "দান নিশ্চিত করুন ও প্রোফাইল আপডেট করুন" : "Confirm Donation & Update Profile"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
