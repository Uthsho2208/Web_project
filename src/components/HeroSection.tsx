import React from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { Sparkles, Heart, Navigation, Radio, MapPin, Zap, ShieldCheck, Users, Search, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onRequestBlood: () => void;
  onBecomeDonor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRequestBlood,
  onBecomeDonor,
}) => {
  const { language, theme, donors, requests } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden mb-8 rounded-3xl transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isDark ? "bg-red-900/20" : "bg-rose-200/50"
      }`} />
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isDark ? "bg-rose-950/20" : "bg-red-100/60"
      }`} />

      <div className={`relative z-10 p-6 sm:p-10 lg:p-12 rounded-3xl border shadow-xl ${
        isDark
          ? "bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-red-950/30 border-slate-800 text-slate-100 shadow-slate-950/80"
          : "bg-gradient-to-br from-white via-slate-50/80 to-rose-50/40 border-slate-200/80 text-slate-900 shadow-slate-200/60"
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-red-950/80 border border-rose-200 dark:border-red-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 fill-rose-500 animate-pulse" />
              <span>{language === "bn" ? "এআই-পাওয়ার্ড ইমার্জেন্সি ম্যাচিং" : "AI-Powered Emergency Matching"}</span>
            </div>

            {/* Bold Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black font-sans tracking-tight leading-[1.15]">
              {language === "bn" ? (
                <>
                  জীবন বাঁচান <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-500">রিয়েল-টাইম</span> রক্তদানের মাধ্যমে
                </>
              ) : (
                <>
                  Save Lives with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-500">Real-Time</span> Blood Donation
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-lg max-w-xl font-normal leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              {language === "bn"
                ? "জরুরি মুহূর্তে মুহূর্তেই ম্যাচিং রক্তদাতা খুঁজুন। আমাদের কমিউনিটিতে যোগ দিন এবং আজই একজন রক্ষক হয়ে উঠুন।"
                : "Instantly locate matching blood donors during emergencies. Join the community and become a hero today."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onRequestBlood}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center gap-2.5 active:scale-95 border border-red-400/30"
              >
                <Heart className="w-5 h-5 fill-white animate-pulse" />
                <span>{language === "bn" ? "রক্তের অনুরোধ করুন" : "Request Blood"}</span>
              </button>

              <button
                onClick={onBecomeDonor}
                className={`px-6 py-3.5 rounded-2xl border font-extrabold text-sm sm:text-base transition-all flex items-center gap-2.5 active:scale-95 shadow-md ${
                  isDark
                    ? "bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-slate-100"
                    : "bg-white border-slate-200/90 hover:bg-slate-50 text-slate-900 shadow-slate-200/60"
                }`}
              >
                <span className="text-base">🩸</span>
                <span>{language === "bn" ? "রক্তদাতা হন" : "Become a Donor"}</span>
              </button>
            </div>

            {/* Mini Features List */}
            <div className={`pt-4 border-t grid grid-cols-3 gap-4 text-xs font-semibold ${
              isDark ? "border-slate-800/80 text-slate-400" : "border-slate-200 text-slate-500"
            }`}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{language === "bn" ? "১০০% ভেরিফাইড" : "100% Verified"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === "bn" ? "দ্রুত সাড়া" : "< 5 Min Match"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{language === "bn" ? "৬৪ জেলা কভারেজ" : "64 Districts"}</span>
              </div>
            </div>
          </div>

          {/* Right Live Radar Animation Graphic */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Radar Box Card Container */}
            <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-xl relative overflow-hidden transition-colors ${
              isDark
                ? "bg-slate-950/90 border-slate-800"
                : "bg-white/90 border-slate-200 shadow-slate-200/70"
            }`}>
              
              {/* Radar Card Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-4 shadow-sm">
                <Navigation className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{language === "bn" ? "আশেপাশের রক্তদাতা সার্চ হচ্ছে..." : "Locating nearby donors..."}</span>
              </div>

              {/* Radar Circle Container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center my-2">
                
                {/* Concentric Radar Rings */}
                <div className="absolute inset-0 rounded-full border border-rose-500/20 dark:border-rose-500/15 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-2 rounded-full border border-rose-500/30 dark:border-rose-500/20" />
                <div className="absolute inset-12 rounded-full border border-rose-500/25 dark:border-rose-500/20" />
                <div className="absolute inset-24 rounded-full border border-rose-500/20 dark:border-rose-500/20" />

                {/* Radar Rotating Sweep Beam */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div
                    className="w-full h-full bg-gradient-to-tr from-rose-500/25 via-red-500/5 to-transparent origin-center animate-spin"
                    style={{ animationDuration: '5s', animationTimingFunction: 'linear' }}
                  />
                </div>

                {/* Center Patient Location Dot (Blue) */}
                <div className="relative z-10 w-5 h-5 rounded-full bg-sky-500 ring-4 ring-sky-300/50 dark:ring-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/50">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>

                {/* Pulsating Donor Dots around Radar */}
                {/* Donor 1: Top Right */}
                <div className="absolute top-12 right-12 flex items-center gap-1 group cursor-pointer">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-white shadow-md"></span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg">
                    O- (0.8 km)
                  </span>
                </div>

                {/* Donor 2: Left Mid */}
                <div className="absolute top-28 left-8 flex items-center gap-1 group cursor-pointer">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 border border-white shadow-md"></span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg">
                    A+ (1.2 km)
                  </span>
                </div>

                {/* Donor 3: Bottom Left */}
                <div className="absolute bottom-12 left-16 flex items-center gap-1 group cursor-pointer">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-white shadow-md"></span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg">
                    B+ (2.0 km)
                  </span>
                </div>

                {/* Donor 4: Bottom Right */}
                <div className="absolute bottom-20 right-10 flex items-center gap-1 group cursor-pointer">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 border border-white shadow-md"></span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg">
                    AB+ (3.1 km)
                  </span>
                </div>

              </div>

              {/* Floating Stat Overlay Badges */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>{donors.filter(d => d.isAvailable).length}+ Active Donors</span>
                </div>

                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <span>⚡ Match Avg: 4.2 mins</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
