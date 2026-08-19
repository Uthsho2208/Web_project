import React from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { Heart, Clock, Sparkles, CheckCircle2, ShieldCheck, Zap, Calendar } from "lucide-react";

interface CircularCooldownWidgetProps {
  onOpenEligibilityModal?: () => void;
}

export const CircularCooldownWidget: React.FC<CircularCooldownWidgetProps> = ({
  onOpenEligibilityModal,
}) => {
  const { language, userProfile, eligibility, theme } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (eligibility.cooldownPercentage / 100) * circumference;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 shadow-xl ${
        isDark
          ? "bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-red-950/20 border-slate-800 text-slate-100 shadow-slate-950/60"
          : "bg-gradient-to-br from-white via-slate-50 to-rose-50/50 border-slate-200 text-slate-900 shadow-slate-200/60"
      }`}
    >
      {/* Background radial highlight */}
      <div
        className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
          eligibility.isEligible ? "bg-emerald-500/20" : "bg-rose-500/20"
        }`}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Side: Text & Status */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md bg-white/5 border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              {language === "bn" ? "মেডিকেল বিরতি ট্র্যাকার" : "Medical Interval Tracker"}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight font-sans">
            {eligibility.isEligible
              ? language === "bn"
                ? "আপনি এখন রক্তদানে প্রস্তুত!"
                : "You Are Ready to Save a Life!"
              : language === "bn"
              ? "পরবর্তী রক্তদানের বিরতি"
              : "Donation Cooldown Interval"}
          </h3>

          <p className={`text-xs max-w-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {eligibility.isEligible
              ? language === "bn"
                ? `আপনার রক্তের গ্রুপ ${userProfile.bloodGroup}। যে কোনো জরুরি আহ্বানে সাড়া দিয়ে একজন মুমূর্ষু রোগীর পাশে দাঁড়ান।`
                : `Your blood group is ${userProfile.bloodGroup}. You can now safely respond to emergency SOS requests.`
              : language === "bn"
              ? `${userProfile.gender === "Female" ? "মহিলাদের জন্য ১২০ দিন" : "পুরুষদের জন্য ৯০ দিন"} বিরতির নিয়ম। পরবর্তী সম্ভাব্য তারিখ: ${eligibility.nextEligibleDate}`
              : `${userProfile.gender === "Female" ? "120-day female" : "90-day male"} recovery window. Next eligible date: ${eligibility.nextEligibleDate}`}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {eligibility.isEligible ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.eligibleNow}</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {eligibility.daysLeft} {language === "bn" ? "দিন বাকি" : "days left"} ({eligibility.cooldownPercentage}% completed)
                </span>
              </div>
            )}

            {userProfile.lastDonationDate && (
              <span className={`text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-xl ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                <Calendar className="w-3 h-3 text-rose-400" />
                {language === "bn" ? "সর্বশেষ দান:" : "Last:"} {userProfile.lastDonationDate}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Circular Progress Gauge */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className={isDark ? "text-slate-800" : "text-slate-200"}
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#cooldownGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="cooldownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                {eligibility.isEligible ? (
                  <>
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#E11D48" />
                    <stop offset="100%" stopColor="#10B981" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            {eligibility.isEligible ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-1">
                  <Heart className="w-5 h-5 fill-emerald-500 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  {language === "bn" ? "প্রস্তুত" : "READY"}
                </span>
                <span className="text-xs font-extrabold text-white">100%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-amber-400 font-mono">
                  {eligibility.daysLeft}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "bn" ? "দিন বাকি" : "Days left"}
                </span>
                <span className="text-[9px] font-medium text-slate-500 mt-0.5">
                  {eligibility.cooldownPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
