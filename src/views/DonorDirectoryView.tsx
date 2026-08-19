import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { BloodGroup } from "../types";
import { BD_DISTRICTS_BY_DIVISION } from "../data/bdData";
import { Search, Phone, MessageSquare, ShieldCheck, Star, MapPin, Award, CheckCircle2, Lock, Unlock, Sparkles, Filter, UserPlus } from "lucide-react";
import { CreateProfileModal } from "../components/CreateProfileModal";

export const DonorDirectoryView: React.FC = () => {
  const { language, donors, isBiometricUnlocked, theme } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [search, setSearch] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>("ALL");
  const [filterDistrict, setFilterDistrict] = useState<string>("ALL");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredDonors = donors.filter((d) => {
    if (filterBloodGroup !== "ALL" && d.bloodGroup !== filterBloodGroup) return false;
    if (filterDistrict !== "ALL" && d.district !== filterDistrict) return false;
    if (onlyAvailable && !d.isAvailable) return false;
    if (
      search &&
      !d.name.toLowerCase().includes(search.toLowerCase()) &&
      !d.district.toLowerCase().includes(search.toLowerCase()) &&
      !d.area.toLowerCase().includes(search.toLowerCase()) &&
      !d.phone.includes(search)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters Header */}
      <div className={`p-5 rounded-3xl border shadow-xl space-y-4 transition-all duration-300 ${
        isDark ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/50" : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2 font-sans tracking-tight">
              {t.donorDirectoryTitle}
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-sm">
                {filteredDonors.length} Verified
              </span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "bn"
                ? "বাংলাদেশের ৬৪ জেলার ভেরিফাইড রক্তদাতাদের রিয়েল-টাইম ডিরেক্টরি"
                : "Real-time verified blood donors directory across 64 districts in Bangladesh"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchDonorPlaceholder}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                  isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 shrink-0 border border-red-400/30 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === "bn" ? "ডোনার রেজিস্ট্রেশন" : "Register Profile"}</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className={`flex flex-wrap items-center gap-3 pt-3 border-t ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}>
          {/* Blood group selection */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setFilterBloodGroup("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filterBloodGroup === "ALL"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-md shadow-red-600/20"
                  : isDark
                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Groups
            </button>
            {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
              <button
                key={bg}
                onClick={() => setFilterBloodGroup(bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  filterBloodGroup === bg
                    ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-md shadow-red-600/20"
                    : isDark
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* District Select */}
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className={`px-3.5 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
              isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-200 text-slate-800"
            }`}
          >
            <option value="ALL">{language === "bn" ? "সকল জেলা" : "All Districts"}</option>
            {Object.values(BD_DISTRICTS_BY_DIVISION)
              .flat()
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>

          {/* Availability Toggle */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
              onlyAvailable
                ? "bg-emerald-600 border-emerald-500 text-white"
                : isDark
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyAvailable ? "bg-white animate-ping" : "bg-slate-400"}`}></span>
            <span>{t.onlyAvailable}</span>
          </button>
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonors.map((donor) => (
          <div
            key={donor.id}
            className={`p-6 rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 ${
              isDark
                ? "bg-slate-900/90 border-slate-800 hover:border-red-600/50 text-slate-100 shadow-slate-950/40"
                : "bg-white border-slate-200 hover:border-rose-300 text-slate-900 shadow-slate-200/50"
            }`}
          >
            <div>
              {/* Top Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-600/30 shrink-0">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-1.5">
                      <span>{donor.name}</span>
                      {donor.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title={t.verifiedDonor} />
                      )}
                    </h3>
                    <p className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {donor.area}, {donor.district}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                    donor.isAvailable
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                      : isDark
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-slate-100 text-slate-500 border-slate-300"
                  }`}
                >
                  {donor.isAvailable ? "Ready" : "Cooldown"}
                </span>
              </div>

              {/* Stats & Badge Box */}
              <div className={`grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl border text-center text-xs ${
                isDark ? "bg-slate-950/80 border-slate-800/80" : "bg-slate-50 border-slate-200"
              }`}>
                <div>
                  <span className={`block text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {t.totalDonations}
                  </span>
                  <span className="font-black text-sm">{donor.totalDonations} Times</span>
                </div>
                <div>
                  <span className={`block text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {t.donorRating}
                  </span>
                  <span className="font-black text-amber-500 text-sm flex items-center justify-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {donor.rating}
                  </span>
                </div>
                <div>
                  <span className={`block text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Badge
                  </span>
                  <span className="font-extrabold text-rose-500 text-[11px] truncate block">{donor.badge}</span>
                </div>
              </div>

              {/* Medical Note */}
              {donor.medicalNotes && (
                <p className={`text-xs italic line-clamp-2 p-2.5 rounded-xl border ${
                  isDark ? "bg-slate-950/50 border-slate-800 text-slate-300" : "bg-slate-100/60 border-slate-200 text-slate-700"
                }`}>
                  "{donor.medicalNotes}"
                </p>
              )}
            </div>

            {/* Contact Action Toolbar */}
            <div className={`pt-3.5 border-t flex items-center justify-between gap-2 ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}>
              <div className="flex items-center space-x-2">
                {/* Phone Call */}
                {isBiometricUnlocked ? (
                  <a
                    href={`tel:${donor.phone}`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{donor.phone}</span>
                  </a>
                ) : (
                  <div className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                    isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}>
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>01700-***-***</span>
                  </div>
                )}

                {/* WhatsApp */}
                {donor.whatsapp && isBiometricUnlocked && (
                  <a
                    href={`https://wa.me/88${donor.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    WhatsApp
                  </a>
                )}
              </div>

              <span className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {t.lastDonatedAgo}: {donor.lastDonationDate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Register / Create Donor Profile Modal */}
      <CreateProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
