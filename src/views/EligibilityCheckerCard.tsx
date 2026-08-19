import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import {
  Clock,
  CheckCircle2,
  AlertOctagon,
  HeartPulse,
  Calendar,
  ShieldAlert,
  Sparkles,
  Zap,
  Check
} from "lucide-react";
import { CircularCooldownWidget } from "../components/CircularCooldownWidget";

export const EligibilityCheckerCard: React.FC = () => {
  const { language, userProfile, eligibility, theme } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  // Interactive Health Quiz State
  const [weight, setWeight] = useState(userProfile.weightKg || 68);
  const [age, setAge] = useState(userProfile.age || 27);
  const [hb, setHb] = useState(13.2);
  const [hasFever, setHasFever] = useState(false);
  const [hasTattooOrSurgery, setHasTattooOrSurgery] = useState(false);
  const [hasAlcohol24h, setHasAlcohol24h] = useState(false);

  const [quizResult, setQuizResult] = useState<{
    passed: boolean;
    reasons: string[];
  } | null>(null);

  const handleRunChecker = (e: React.FormEvent) => {
    e.preventDefault();
    const reasons: string[] = [];

    if (weight < 50) {
      reasons.push(
        language === "bn"
          ? "ওজন কমপক্ষে ৫০ কেজি হতে হবে।"
          : "Minimum donor weight requirement is 50 kg."
      );
    }
    if (age < 18 || age > 65) {
      reasons.push(
        language === "bn"
          ? "বয়স ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে।"
          : "Donor age must be strictly between 18 and 65 years."
      );
    }
    if (hb < 12.0) {
      reasons.push(
        language === "bn"
          ? "হিমোগ্লোবিন লেভেল কমপক্ষে ১২.০ g/dL হতে হবে।"
          : "Hemoglobin concentration must be at least 12.0 g/dL."
      );
    }
    if (hasFever) {
      reasons.push(
        language === "bn"
          ? "জ্বর, অ্যান্টিবায়োটিক বা অসুস্থতা থাকলে রক্তদান করা যাবে না।"
          : "No active fever, viral symptoms, or antibiotic course permitted."
      );
    }
    if (hasTattooOrSurgery) {
      reasons.push(
        language === "bn"
          ? "গত ৬ মাসের মধ্যে সার্জারি বা ট্যাটু আকানো থাকলে রক্তদানে সাময়িক বিরত থাকতে হবে।"
          : "No major surgical intervention or tattoo/piercing within last 6 months."
      );
    }
    if (hasAlcohol24h) {
      reasons.push(
        language === "bn"
          ? "রক্তদানের ২৪ ঘণ্টা পূর্বে অ্যালকোহল গ্রহণ করা যাবে না।"
          : "No alcohol or sedative consumption within 24 hours prior to donation."
      );
    }
    if (!eligibility.isEligible) {
      reasons.push(
        language === "bn"
          ? `পূর্ববর্তী রক্তদানের বিরতি পূর্ণ হতে আরও ${eligibility.daysLeft} দিন বাকি (পরবর্তী রক্তদান: ${eligibility.nextEligibleDate})।`
          : `Cooldown interval active: ${eligibility.daysLeft} days remaining (Next eligible donation date: ${eligibility.nextEligibleDate}).`
      );
    }

    setQuizResult({
      passed: reasons.length === 0,
      reasons,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Visual Circular Cooldown Ring Widget */}
      <CircularCooldownWidget />

      {/* Automated Health & Medical Eligibility Checker Form */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-all duration-300 ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/50"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
        }`}
      >
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 bg-rose-600/15 border border-rose-500/30 text-rose-500 rounded-2xl shrink-0 shadow-sm">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black font-sans tracking-tight">
                {t.eligibilityTitle}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
                WHO Standard
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "bn"
                ? "আপনার বর্তমান স্বাস্থ্য ও শারীরিক তথ্য ইনপুট দিয়ে তাৎক্ষণিক মেডিকেল স্ক্রীনিং রিপোর্ট পান"
                : "Enter your health vitals for instant medical validation and safety certification"}
            </p>
          </div>
        </div>

        <form onSubmit={handleRunChecker} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t.weightLabel} (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className={`w-full px-4 py-3 border rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t.ageLabel} (Years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className={`w-full px-4 py-3 border rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-black uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t.hbLabel} (g/dL)
              </label>
              <input
                type="number"
                step="0.1"
                value={hb}
                onChange={(e) => setHb(Number(e.target.value))}
                className={`w-full px-4 py-3 border rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Quick Screening Toggle Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-4 border rounded-2xl flex items-center space-x-3 cursor-pointer transition-all ${
                isDark
                  ? "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={hasFever}
                onChange={(e) => setHasFever(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-bold">
                {language === "bn" ? "জ্বর বা ফ্লু অসুস্থতা?" : "Active Fever or Flu?"}
              </span>
            </label>

            <label
              className={`p-4 border rounded-2xl flex items-center space-x-3 cursor-pointer transition-all ${
                isDark
                  ? "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={hasTattooOrSurgery}
                onChange={(e) => setHasTattooOrSurgery(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-bold">
                {language === "bn" ? "৬ মাসে সার্জারি / ট্যাটু?" : "Surgery or Tattoo in 6 mos?"}
              </span>
            </label>

            <label
              className={`p-4 border rounded-2xl flex items-center space-x-3 cursor-pointer transition-all ${
                isDark
                  ? "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={hasAlcohol24h}
                onChange={(e) => setHasAlcohol24h(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-bold">
                {language === "bn" ? "২৪ ঘণ্টায় অ্যালকোহল?" : "Alcohol in past 24h?"}
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-400/30"
          >
            <HeartPulse className="w-5 h-5" />
            <span>{t.checkEligibilityBtn}</span>
          </button>
        </form>

        {/* Screening Result Output */}
        {quizResult && (
          <div
            className={`p-6 rounded-2xl border space-y-3 animate-fade-in ${
              quizResult.passed
                ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-200"
                : "bg-red-950/70 border-red-500/60 text-rose-200"
            }`}
          >
            <div className="flex items-center space-x-3 font-black text-base">
              {quizResult.passed ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>{t.fitToDonate}</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
                  <span>{t.notFitToDonate}</span>
                </>
              )}
            </div>

            {!quizResult.passed && (
              <ul className="list-disc list-inside text-xs space-y-1.5 pt-1 opacity-90 leading-relaxed font-sans">
                {quizResult.reasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
