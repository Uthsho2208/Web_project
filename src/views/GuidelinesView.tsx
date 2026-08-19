import React from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { SAFE_DONATION_GUIDELINES } from "../data/bdData";
import { ShieldCheck, HeartPulse, CheckCircle2, AlertTriangle, HelpCircle, BookOpen, Sparkles } from "lucide-react";

export const GuidelinesView: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS[language];
  const guide = SAFE_DONATION_GUIDELINES[language];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 text-red-400 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t.tabGuidelines}</h2>
            <p className="text-xs text-slate-400">
              {language === "bn"
                ? "নিরাপদ রক্তদান নির্দেশিকা, স্বাস্থ্য নিরাপত্তা প্রটোকল এবং ভুল ধারণা খণ্ডন"
                : "Safe blood donation guidelines, medical safety protocols, and myth busters"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eligibility Rules */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            {language === "bn" ? "রক্তদানের প্রধান শর্তাবলী (Eligibility Rules)" : "Core Eligibility Matrix"}
          </h3>
          <ul className="space-y-2.5">
            {guide.eligibilityRules.map((rule, idx) => (
              <li key={idx} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pre & Post Donation Care */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400" />
            {language === "bn" ? "রক্তদানের পূর্বে ও পরবর্তী যত্ন" : "Pre & Post Donation Protocols"}
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-rose-900/40 space-y-2">
              <h4 className="font-bold text-xs text-rose-300 uppercase tracking-wider">
                1. Pre-Donation Preparation
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {guide.preDonationSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-950/90 rounded-2xl border border-emerald-900/40 space-y-2">
              <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-wider">
                2. Post-Donation Care
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {guide.postDonationSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Myths vs Facts Accordion Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          {language === "bn" ? "রক্তদান সম্পর্কিত কুসংস্কার ও সঠিক তথ্য (Myths vs Facts)" : "Myths vs Facts"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guide.mythsVsFacts.map((mf, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Myth: "{mf.myth}"</span>
              </div>
              <div className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                <strong className="text-emerald-400 block mb-0.5">Fact:</strong>
                {mf.fact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
