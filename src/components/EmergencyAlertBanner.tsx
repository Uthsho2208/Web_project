import React from "react";
import { useApp } from "../context/AppContext";
import { Bell, X, AlertTriangle, ExternalLink } from "lucide-react";

export const EmergencyAlertBanner: React.FC = () => {
  const { notificationAlert, clearNotification, language, requests, openRequestDetail } = useApp();

  if (!notificationAlert) return null;

  const handleBannerClick = () => {
    if (requests && requests.length > 0) {
      openRequestDetail(requests[0]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-slide-up">
      <div className="bg-gradient-to-r from-red-900 via-rose-950 to-slate-900 border-2 border-red-500/80 rounded-2xl p-4 shadow-2xl text-white backdrop-blur-md flex items-start gap-3 cursor-pointer group hover:border-red-400 transition-all">
        <div
          onClick={handleBannerClick}
          className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 animate-bounce"
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm" onClick={handleBannerClick}>
          <div className="flex items-center justify-between font-bold text-rose-300 mb-0.5">
            <span className="flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              {language === "bn" ? "BloodMate রিয়েল-টাইম এলার্ট" : "BloodMate Real-Time Alert"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearNotification();
              }}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-100 leading-relaxed font-sans">{notificationAlert}</p>
          <div className="mt-2 text-[11px] font-bold text-rose-300 underline flex items-center gap-1 group-hover:text-amber-300">
            <span>{language === "bn" ? "বিস্তারিত ও রোগীর লোকেশন দেখতে ক্লিক করুন ➔" : "Click to view patient details & location ➔"}</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
