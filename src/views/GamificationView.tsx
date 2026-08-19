import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import {
  Trophy,
  Award,
  Gift,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Star,
  Zap,
  Crown,
  Heart,
  ChevronRight,
  Share2,
  Check
} from "lucide-react";
import { motion } from "motion/react";

export const GamificationView: React.FC = () => {
  const { language, leaderboard, userProfile, vouchers, redeemVoucher, triggerNotification, theme } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  // Badge tier definitions with holographic styling
  const badgesList = [
    {
      name: "Bronze Donor",
      titleBn: "ব্রোঞ্জ দাতা",
      desc: "First Blood Donation Completed",
      descBn: "প্রথম স্বেচ্ছায় রক্তদান সম্পন্ন",
      icon: "🥉",
      gradient: "from-amber-700/80 via-amber-800/60 to-amber-950/80",
      border: "border-amber-600/50",
      glow: "shadow-amber-900/30",
      reqDonations: 1,
      xpTarget: 100,
      perk: "Certificate of Honor + Digital Badge"
    },
    {
      name: "Silver Lifesaver",
      titleBn: "সিলভার লাইফসেভার",
      desc: "5 Voluntary Donations Completed",
      descBn: "৫ বার স্বেচ্ছায় রক্তদান সম্পন্ন",
      icon: "🥈",
      gradient: "from-slate-400/80 via-slate-500/60 to-slate-800/80",
      border: "border-slate-400/50",
      glow: "shadow-slate-500/30",
      reqDonations: 5,
      xpTarget: 500,
      perk: "Priority Emergency Dispatch + Partner Health Checkup Discount"
    },
    {
      name: "Gold Hero",
      titleBn: "গোল্ড হিরো",
      desc: "10+ Lives Impacted in BD",
      descBn: "১০+ রোগীর জীবন বাঁচানো হয়েছে",
      icon: "🥇",
      gradient: "from-amber-400/80 via-yellow-500/60 to-amber-700/80",
      border: "border-amber-400/60",
      glow: "shadow-amber-500/40",
      reqDonations: 10,
      xpTarget: 1000,
      perk: "Free Annual Diagnostic Blood Panel + VIP Badge"
    },
    {
      name: "Diamond Angel",
      titleBn: "ডায়মন্ড এঞ্জেল",
      desc: "15+ Emergency ICU Responded",
      descBn: "১৫+ জরুরি আইসিইউ আহ্বান সফল",
      icon: "💎",
      gradient: "from-cyan-400/80 via-indigo-500/60 to-purple-800/80",
      border: "border-cyan-400/60",
      glow: "shadow-cyan-500/40",
      reqDonations: 15,
      xpTarget: 1500,
      perk: "National Hall of Fame Induction + Free Family Emergency Coverage"
    }
  ];

  // Calculate Next Tier XP Progress
  const currentXP = userProfile.points;
  let nextXPThreshold = 500;
  let nextBadgeName = "Silver Lifesaver";

  if (currentXP < 100) {
    nextXPThreshold = 100;
    nextBadgeName = "Bronze Donor";
  } else if (currentXP < 500) {
    nextXPThreshold = 500;
    nextBadgeName = "Silver Lifesaver";
  } else if (currentXP < 1000) {
    nextXPThreshold = 1000;
    nextBadgeName = "Gold Hero";
  } else if (currentXP < 1500) {
    nextXPThreshold = 1500;
    nextBadgeName = "Diamond Angel";
  } else {
    nextXPThreshold = currentXP;
    nextBadgeName = "Diamond Master";
  }

  const xpProgressPercent = Math.min(100, Math.round((currentXP / nextXPThreshold) * 100));

  // Top 3 Podium
  const top3 = leaderboard.slice(0, 3);
  const remainingLeaderboard = leaderboard.slice(3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Showcase Banner */}
      <div
        className={`relative overflow-hidden p-6 sm:p-10 rounded-3xl border shadow-2xl transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-red-950/40 border-indigo-500/30 text-white shadow-indigo-950/50"
            : "bg-gradient-to-br from-indigo-50/80 via-white to-rose-50/80 border-indigo-100 text-slate-900 shadow-indigo-100/60"
        }`}
      >
        {/* Holographic background particles glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-rose-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-xl shadow-indigo-950/40 shrink-0">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-amber-400">
                  <Trophy className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 mb-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{language === "bn" ? "জাতীয় জীবনরক্ষক র‍্যাংক ও গ্যামিফিকেশন" : "National Lifesavers Hub & Gamification"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                  {t.gamificationTitle}
                </h2>
                <p className={`text-xs mt-1 max-w-lg leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {language === "bn"
                    ? "স্বেচ্ছায় রক্তদানের মাধ্যমে জীবন বাঁচান, এক্সপি (XP) পয়েন্ট অর্জন করুন এবং পার্টনার স্বাস্থ্য সেবা আনলক করুন।"
                    : "Earn XP points and holographic badges for every blood donation, unlocking partner healthcare perks and vouchers."}
                </p>
              </div>
            </div>

            {/* User Stat Hub Card */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-xl shadow-xl shrink-0 ${
                isDark
                  ? "bg-slate-950/80 border-slate-800 text-white"
                  : "bg-white/90 border-slate-200 text-slate-900 shadow-slate-200/50"
              }`}
            >
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                    {t.yourXP}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-black font-mono text-amber-400">
                      {userProfile.points} <span className="text-xs text-slate-400 font-sans font-bold">XP</span>
                    </span>
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-700/60" />

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                    Current Tier
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 text-xs font-black inline-block">
                    {userProfile.badge}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar to Next Level */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md space-y-2.5 ${
              isDark ? "bg-slate-950/60 border-slate-800" : "bg-white/80 border-slate-200"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>
                  {language === "bn" ? `পরবর্তী ব্যাজ আনলক: ${nextBadgeName}` : `Next Tier Unlock: ${nextBadgeName}`}
                </span>
              </span>
              <span className="font-mono text-amber-400">
                {currentXP} / {nextXPThreshold} XP ({xpProgressPercent}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/30"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {language === "bn"
                ? `প্রতিটি সফল রক্তদানে +১০০ এক্সপি এবং জরুরি আইসিইউ সাড়া দিলে +১৫০ এক্সপি যোগ হয়।`
                : `+100 XP awarded per successful donation, +150 XP for critical ICU emergency response.`}
            </p>
          </div>

          {/* Tiered Holographic Badges Carousel */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "bn" ? "হলোগ্রাফিক ব্যাজ ও প্রিভিলেজ" : "Holographic Badges & Perks"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {badgesList.map((badge, idx) => {
                const isUnlocked = userProfile.totalDonations >= badge.reqDonations;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBadge(badge.name)}
                    className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.gradient} ${badge.border} ${badge.glow} shadow-xl hover:scale-[1.02]`
                        : isDark
                        ? "bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-90"
                        : "bg-slate-100 border-slate-200 opacity-60 hover:opacity-90"
                    }`}
                  >
                    {/* Shimmer light effect for unlocked cards */}
                    {isUnlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{badge.icon}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isUnlocked
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {isUnlocked ? "Unlocked" : `Req: ${badge.reqDonations} D`}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white">{badge.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-medium line-clamp-1">
                      {language === "bn" ? badge.descBn : badge.desc}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-amber-200 font-semibold flex items-center justify-between">
                      <span className="truncate pr-1">★ {badge.perk}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Top 3 Podium & Full Table */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black font-sans tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>{t.topDonorsBD}</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "bn"
                ? "বাংলাদেশের শীর্ষ স্বেচ্ছাসেবী রক্তদাতাদের জাতীয় সম্মাননা তালিকা"
                : "Top recognized voluntary lifesavers across Bangladesh ranked by verified donation impact"}
            </p>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {top3.map((entry, idx) => {
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            return (
              <div
                key={entry.donorId}
                className={`relative rounded-3xl p-6 border transition-all duration-300 shadow-xl flex flex-col justify-between ${
                  isFirst
                    ? isDark
                      ? "bg-gradient-to-b from-amber-950/80 via-slate-900/95 to-slate-950 border-amber-500/80 shadow-amber-950/40 md:-translate-y-2 ring-2 ring-amber-500/30"
                      : "bg-gradient-to-b from-amber-50 via-white to-white border-amber-400 shadow-amber-100 md:-translate-y-2 ring-2 ring-amber-400/30"
                    : isSecond
                    ? isDark
                      ? "bg-gradient-to-b from-slate-800/80 via-slate-900/95 to-slate-950 border-slate-400/60 shadow-slate-950/40"
                      : "bg-gradient-to-b from-slate-100 via-white to-white border-slate-300 shadow-slate-200"
                    : isDark
                    ? "bg-gradient-to-b from-amber-950/50 via-slate-900/95 to-slate-950 border-amber-700/50 shadow-amber-950/30"
                    : "bg-gradient-to-b from-orange-50 via-white to-white border-orange-200 shadow-orange-100"
                }`}
              >
                {/* Crown for 1st Place */}
                {isFirst && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" />
                    <span>#1 TOP LIFESAVER</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shadow-lg ${
                        isFirst
                          ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950"
                          : isSecond
                          ? "bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-950"
                          : "bg-gradient-to-tr from-amber-700 to-orange-600 text-white"
                      }`}
                    >
                      #{entry.rank}
                    </div>

                    {/* Blood Group Tag */}
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md">
                      {entry.bloodGroup}
                    </span>
                  </div>

                  <h4 className="text-lg font-black tracking-tight">{entry.name}</h4>
                  <p className={`text-xs mt-0.5 flex items-center gap-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span>{entry.district}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-bold">{entry.badge}</span>
                  </p>
                </div>

                {/* Score Stats */}
                <div className="mt-5 pt-4 border-t border-slate-700/40 grid grid-cols-2 gap-2 text-center">
                  <div className={`p-2.5 rounded-xl ${isDark ? "bg-slate-950/60" : "bg-slate-50"}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Donations</span>
                    <span className="text-base font-black text-rose-500">{entry.donationsCount}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${isDark ? "bg-slate-950/60" : "bg-slate-50"}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total XP</span>
                    <span className="text-base font-black text-amber-400 font-mono">{entry.points}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Remaining Leaderboard Table */}
        <div
          className={`p-6 rounded-3xl border shadow-xl space-y-3 transition-all ${
            isDark ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">
            National Honor Roll (Rank 4 – {leaderboard.length})
          </h4>

          <div className="space-y-2">
            {remainingLeaderboard.map((entry) => (
              <div
                key={entry.donorId}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isDark ? "bg-slate-950/70 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">
                    #{entry.rank}
                  </span>
                  <div>
                    <span className="font-extrabold text-sm block">{entry.name}</span>
                    <span className="text-xs text-slate-400">
                      {entry.district} • {entry.badge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold">
                    {entry.bloodGroup}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 font-mono block">{entry.points} XP</span>
                    <span className="text-[10px] text-slate-400">{entry.donationsCount} Donations</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Healthcare Vouchers & Discounts */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-all ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black font-sans tracking-tight">
                {language === "bn" ? "পার্টনার হেলথ ভাউচার ও রিওয়ার্ড" : "Partner Health Vouchers & Discounts"}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn"
                  ? "আপনার অর্জিত এক্সপি পয়েন্ট দিয়ে দেশের শীর্ষ ডায়াগনস্টিক ও ল্যাব ডিসকাউন্ট উপভোগ করুন"
                  : "Redeem XP points for verified diagnostic tests, free CBC checkups, and ambulance discounts"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vouchers.map((v) => {
            const canAfford = userProfile.points >= v.costXP;

            return (
              <div
                key={v.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  v.isRedeemed
                    ? "bg-emerald-950/40 border-emerald-600/50 opacity-80"
                    : isDark
                    ? "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {v.partner}
                    </span>
                    <span className="font-mono text-xs font-black text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {v.costXP} XP
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm">{v.title}</h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {v.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {v.isRedeemed ? "Code: " + v.code : v.discount}
                  </span>

                  <button
                    onClick={() => redeemVoucher(v.id)}
                    disabled={v.isRedeemed || !canAfford}
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 active:scale-95 shadow-sm ${
                      v.isRedeemed
                        ? "bg-emerald-600 text-white cursor-default"
                        : canAfford
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    }`}
                  >
                    {v.isRedeemed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Redeemed</span>
                      </>
                    ) : (
                      <span>Redeem Voucher</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
