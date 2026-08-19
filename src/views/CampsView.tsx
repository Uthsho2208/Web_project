import React from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { Tent, Calendar, MapPin, Users, Phone, CheckCircle2, Share2, Clock } from "lucide-react";

export const CampsView: React.FC = () => {
  const { language, camps, registerCamp, triggerNotification } = useApp();
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 text-red-400 rounded-2xl">
            <Tent className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {t.campsTitle}
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black">
                {camps.length} Drives
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === "bn"
                ? "কোয়ান্টাম, রেড ক্রিসেন্ট ও বাঁধন আয়োজিত বিশ্ববিদ্যালয় ও জেলা ভিত্তিক রক্তদান ক্যাম্প"
                : "Scheduled voluntary blood drives & mobile collection camps across Bangladesh"}
            </p>
          </div>
        </div>
      </div>

      {/* Camps Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {camps.map((camp) => (
          <div
            key={camp.id}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-red-800/60 rounded-3xl shadow-xl transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-full bg-red-950 border border-red-800/60 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                  {camp.organizer}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {camp.date}
                </span>
              </div>

              <h3 className="font-bold text-base text-white mt-2 leading-snug">{camp.title}</h3>

              <div className="space-y-1.5 my-3 text-xs text-slate-300">
                <p className="flex items-center gap-1.5 text-rose-300">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {camp.location}, {camp.district}
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {camp.time}
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {camp.description}
              </p>

              {/* Progress Bar for Expected Donors */}
              <div className="pt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{t.registeredDonors}: {camp.registeredCount}</span>
                  <span className="font-bold text-amber-400">{t.expectedDonors}: {camp.expectedDonors}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (camp.registeredCount / camp.expectedDonors) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={`tel:${camp.contactPhone}`}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Hotline</span>
              </a>

              <button
                onClick={() => {
                  registerCamp(camp.id);
                  triggerNotification(
                    camp.isUserRegistered
                      ? (language === "bn" ? "ক্যাম্প বুকিং বাতিল করা হয়েছে।" : "Pre-registration cancelled.")
                      : (language === "bn" ? "ক্যাম্পে সফলভাবে প্রি-রেজিস্ট্রেশন সম্পন্ন হয়েছে!" : "Pre-registered for blood drive successfully!")
                  );
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                  camp.isUserRegistered
                    ? "bg-emerald-950 border border-emerald-600 text-emerald-300"
                    : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                }`}
              >
                {camp.isUserRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Registered</span>
                  </>
                ) : (
                  <span>{t.registerCampBtn}</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
