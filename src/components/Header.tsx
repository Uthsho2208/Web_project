import React from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { Heart, ShieldCheck, Moon, Sun, Globe, Lock, Unlock, Bot, CreditCard, Radio, User, Sparkles, ChevronRight } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  onOpenChat: () => void;
  onOpenBiometric: () => void;
  onOpenPayment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenChat,
  onOpenBiometric,
  onOpenPayment,
}) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    userProfile,
    isBiometricUnlocked,
    isE2EEncrypted,
    isOffline,
    requests,
    openRequestDetail,
  } = useApp();

  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const handleTickerClick = () => {
    if (requests && requests.length > 0) {
      openRequestDetail(requests[0]);
    } else {
      setActiveTab("emergency");
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-2xl transition-all duration-300 ${
      isDark
        ? "border-white/10 bg-slate-950/65 text-slate-100 shadow-2xl shadow-slate-950/80"
        : "border-white/60 bg-white/75 text-slate-900 shadow-lg shadow-rose-950/5"
    }`}>
      {/* Top Emergency Ticker Bar with Frosted Translucency */}
      <div
        onClick={handleTickerClick}
        className="bg-gradient-to-r from-red-700/90 via-rose-600/90 to-red-800/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white flex items-center justify-between overflow-hidden cursor-pointer hover:brightness-110 transition-all group border-b border-white/10"
        title={language === "bn" ? "জরুরি রিকোয়েস্টের বিস্তারিত দেখুন" : "Click to view emergency request details"}
      >
        <div className="flex items-center space-x-2 animate-pulse truncate max-w-2xl">
          <span className="p-1 rounded-md bg-white/20 text-amber-300 shrink-0 backdrop-blur-sm">
            <Radio className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          </span>
          <span className="truncate tracking-wide">{t.emergencyTicker}</span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 hover:bg-amber-400 hover:text-slate-950 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-sm backdrop-blur-sm border border-white/20">
            <span>{language === "bn" ? "বিস্তারিত ➔" : "View Details"}</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-[11px] shrink-0 pl-4 font-medium">
          <span className="bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            {isE2EEncrypted ? t.e2eBadge : "Standard Encrypted"}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 border backdrop-blur-sm ${
            isOffline
              ? "bg-amber-500/80 text-amber-950 border-amber-300/40"
              : "bg-emerald-500/80 text-emerald-950 border-emerald-300/40"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-amber-900" : "bg-emerald-900"} animate-ping`}></span>
            {isOffline ? t.offlineMode : t.onlineMode}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab("emergency")}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 ring-2 ring-white/30 group-hover:scale-105 transition-all">
              <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-black tracking-tight flex items-center gap-1.5 ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                <span>BloodMate</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm border border-white/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 fill-white" />
                  AI
                </span>
              </h1>
            </div>
            <p className={`text-[11px] font-medium hidden sm:block ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Post Emergency Request Button */}
          <button
            onClick={onOpenCreateModal}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center gap-2 active:scale-95 border border-white/30 backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="whitespace-nowrap tracking-wide">{t.createRequestBtn}</span>
          </button>

          {/* AI Chatbox Trigger */}
          <button
            onClick={onOpenChat}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold backdrop-blur-xl ${
              isDark
                ? "bg-slate-900/60 border-white/10 hover:bg-slate-800/80 text-rose-400"
                : "bg-white/70 border-white/60 hover:bg-white text-rose-600 shadow-sm"
            }`}
            title="AI Health Assistant"
          >
            <Bot className="w-4 h-4 text-rose-500 animate-bounce" />
            <span className="hidden lg:inline">{t.aiChatBtn}</span>
          </button>

          {/* Biometric Security Button */}
          <button
            onClick={onOpenBiometric}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl ${
              isBiometricUnlocked
                ? isDark
                  ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50"
                  : "bg-emerald-50/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : isDark
                ? "bg-amber-950/50 border-amber-500/30 text-amber-400 hover:bg-amber-900/50"
                : "bg-amber-50/80 border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
            title="Biometric Security Lock"
          >
            {isBiometricUnlocked ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span className="hidden xl:inline">{t.biometricLockBtn}</span>
          </button>

          {/* Emergency Fund / Ambulance */}
          <button
            onClick={onOpenPayment}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold backdrop-blur-xl ${
              isDark
                ? "bg-slate-900/60 border-white/10 hover:bg-slate-800/80 text-amber-300"
                : "bg-white/70 border-white/60 hover:bg-white text-amber-800 shadow-sm"
            }`}
            title="Emergency Ambulance Fund"
          >
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline">{t.fundDonationBtn}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border text-xs font-black transition-all flex items-center gap-1.5 backdrop-blur-xl ${
              isDark
                ? "bg-slate-900/60 border-white/10 hover:bg-slate-800 text-slate-200"
                : "bg-white/70 border-white/60 hover:bg-white text-slate-800 shadow-sm"
            }`}
          >
            <Globe className="w-4 h-4 text-sky-500" />
            <span>{language === "bn" ? "EN" : "বাংলা"}</span>
          </button>

          {/* Theme Toggle (Frosted Glass Dark / Light) */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border transition-all backdrop-blur-xl ${
              isDark
                ? "bg-slate-900/60 border-white/10 text-amber-400 hover:bg-slate-800"
                : "bg-white/70 border-white/60 text-indigo-600 hover:bg-white shadow-sm"
            }`}
            title={theme === "dark" ? "Frosted Glass: Light Mode" : "Frosted Glass: Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Profile Quick Button */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-1.5 sm:px-3 sm:py-2 rounded-2xl border transition-all flex items-center gap-2 backdrop-blur-xl ${
              isDark
                ? "bg-slate-900/60 border-red-500/30 hover:border-red-500 text-white"
                : "bg-white/70 border-rose-200 hover:border-rose-400 text-slate-900 shadow-sm"
            }`}
          >
            <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center font-black text-xs text-white shadow-sm">
              {userProfile.bloodGroup}
            </div>
            <span className="hidden md:inline text-xs font-bold max-w-[100px] truncate">
              {userProfile.name}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Tab Bar with Translucent Frosted Glass Tabs */}
      <nav className={`border-t px-3 overflow-x-auto no-scrollbar transition-colors backdrop-blur-xl ${
        isDark ? "bg-slate-950/40 border-white/10" : "bg-white/40 border-white/50"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 py-2 min-w-max text-xs sm:text-sm font-bold">
          {[
            { id: "emergency", label: t.tabEmergencyFeed, icon: "🚨" },
            { id: "community", label: (t as any).tabCommunityHub || (language === "bn" ? "কমিউনিটি হাব" : "Community Hub"), icon: "👥" },
            { id: "donors", label: t.tabFindDonors, icon: "🩸" },
            { id: "blood-banks", label: t.tabBloodBanks, icon: "🏥" },
            { id: "gamification", label: t.tabGamification, icon: "🏆" },
            { id: "eligibility", label: t.tabEligibility, icon: "🩺" },
            { id: "camps", label: t.tabCamps, icon: "🏕️" },
            { id: "guidelines", label: t.tabGuidelines, icon: "📘" },
            { id: "profile", label: t.tabProfile, icon: "👤" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap active:scale-95 backdrop-blur-md ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold shadow-lg shadow-red-600/30 border border-white/20"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/60 border border-transparent hover:border-white/40"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
