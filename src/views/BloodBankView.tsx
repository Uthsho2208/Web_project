import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { BloodBank, BloodGroup } from "../types";
import { BD_DISTRICTS_BY_DIVISION, BD_DIVISIONS } from "../data/bdData";
import {
  Hospital,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
  Navigation,
  Search,
  AlertCircle,
  Activity,
  Sparkles,
  Layers,
  RefreshCw,
  Filter,
  CheckCircle2,
  Calendar,
  Send,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { generateTelEmergencyLink } from "../lib/bloodLogic";
import { BloodBankRequisitionModal } from "../components/BloodBankRequisitionModal";

export const BloodBankView: React.FC = () => {
  const {
    language,
    bloodBanks,
    syncBloodBanksStock,
    theme
  } = useApp();

  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("ALL");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modal State
  const [requisitionBank, setRequisitionBank] = useState<BloodBank | null>(null);
  const [requisitionGroup, setRequisitionGroup] = useState<BloodGroup>("O+");

  const bloodGroupKeys: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Filter blood banks
  const filteredBanks = bloodBanks.filter((bank) => {
    if (selectedDistrict !== "ALL" && bank.district !== selectedDistrict) return false;
    if (
      search &&
      !bank.hospitalName.toLowerCase().includes(search.toLowerCase()) &&
      !bank.address.toLowerCase().includes(search.toLowerCase()) &&
      !bank.district.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (selectedBloodGroup !== "ALL") {
      const count = bank.inventory[selectedBloodGroup as BloodGroup] || 0;
      if (inStockOnly && count <= 0) return false;
    }
    return true;
  });

  const getStockStatus = (count: number) => {
    if (count >= 10) {
      return {
        label: language === "bn" ? "পর্যাপ্ত" : "Sufficient",
        badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        barClass: "bg-emerald-500",
        countClass: "text-emerald-600 dark:text-emerald-400",
        status: "Sufficient",
      };
    } else if (count >= 4) {
      return {
        label: language === "bn" ? "স্বল্প স্টক" : "Low Stock",
        badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        barClass: "bg-amber-500",
        countClass: "text-amber-600 dark:text-amber-400",
        status: "Low",
      };
    } else if (count > 0) {
      return {
        label: language === "bn" ? "চরম সংকট" : "Critical Shortage",
        badgeClass: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse",
        barClass: "bg-rose-600 animate-pulse",
        countClass: "text-rose-600 dark:text-rose-400 font-black",
        status: "Critical",
      };
    } else {
      return {
        label: language === "bn" ? "স্টক শেষ" : "Out of Stock",
        badgeClass: "bg-slate-500/20 text-slate-500 border-slate-500/30",
        barClass: "bg-slate-700",
        countClass: "text-slate-500",
        status: "Empty",
      };
    }
  };

  const handleSyncStock = () => {
    setIsSyncing(true);
    syncBloodBanksStock();
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Calculate total blood bags available across all banks
  const totalBagsAvailable = bloodBanks.reduce((total, bank) => {
    return total + (Object.values(bank.inventory) as number[]).reduce((a, b) => a + (b || 0), 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with Real-Time Stock Analytics */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/50"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
        }`}
      >
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 bg-red-600/15 border border-red-500/30 text-red-500 rounded-2xl shrink-0 shadow-sm">
            <Hospital className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight">
                {t.bloodBankTitle}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-sm">
                {bloodBanks.length} {language === "bn" ? "টি ভেরিফাইড সেন্টার" : "Verified Centers"}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-black shadow-sm">
                {totalBagsAvailable} {language === "bn" ? "ব্যাগ লাইভ স্টক" : "Bags Live Stock"}
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "bn"
                ? "বাংলাদেশের প্রধান হাসপাতাল, রেড ক্রিসেন্ট ও কোয়ান্টাম ব্লাড ব্যাংক ইনভেন্টরি স্টক মেট্রিক্স। যেকোনো গ্রুপে ক্লিক করে সরাসরি রিকুইজিশন বা বুকিং স্লিপ তৈরি করুন।"
                : "Real-time blood stock inventory matrix across verified hospital blood banks in Bangladesh. Click on any blood group bag to reserve or generate requisition."}
            </p>
          </div>
        </div>

        {/* Real-time Sync Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncStock}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md border flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{language === "bn" ? "লাইভ স্টক রিফ্রেশ" : "Refresh Stock"}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Search, Districts, Blood Group selector, In-Stock Toggle */}
      <div
        className={`p-5 rounded-3xl border shadow-lg space-y-4 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "bn" ? "হাসপাতাল, এলাকা বা জেলার নাম দিয়ে খুঁজুন..." : "Search hospital, area, or district..."}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          {/* District Selector (All Divisions & Districts) */}
          <div className="w-full md:w-64">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="ALL">
                {language === "bn" ? "📍 সকল জেলা (All Districts)" : "📍 All Districts"}
              </option>
              {BD_DIVISIONS.map((division) => (
                <optgroup key={division} label={`--- ${division} Division ---`}>
                  {(BD_DISTRICTS_BY_DIVISION[division] || []).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* In-Stock Only Toggle */}
          <button
            type="button"
            onClick={() => setInStockOnly((prev) => !prev)}
            className={`w-full md:w-auto px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              inStockOnly
                ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950"
                : isDark
                ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "শুধুমাত্র পর্যাপ্ত স্টক আছে" : "In Stock Only"}</span>
          </button>
        </div>

        {/* Blood Group Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            {language === "bn" ? "গ্রুপ ফিল্টার:" : "Group Filter:"}
          </span>
          <button
            type="button"
            onClick={() => setSelectedBloodGroup("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
              selectedBloodGroup === "ALL"
                ? "bg-rose-600 border-rose-500 text-white shadow-sm"
                : isDark
                ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:border-rose-300"
            }`}
          >
            {language === "bn" ? "সব গ্রুপ (All)" : "All Groups"}
          </button>
          {bloodGroupKeys.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setSelectedBloodGroup(bg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border shrink-0 ${
                selectedBloodGroup === bg
                  ? "bg-rose-600 border-rose-500 text-white shadow-sm"
                  : isDark
                  ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:border-rose-300"
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Inventory Cards Grid */}
      <div className="space-y-6">
        {filteredBanks.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl border ${
              isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            <AlertCircle className="w-10 h-10 mx-auto text-rose-500 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-200">
              {language === "bn" ? "কোনো ব্লাড ব্যাংক পাওয়া যায়নি" : "No Blood Banks Found"}
            </h3>
            <p className="text-xs mt-1">
              {language === "bn"
                ? "আপনার সার্চ বা জেলা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।"
                : "Try adjusting your search query or district filter."}
            </p>
          </div>
        ) : (
          filteredBanks.map((bank) => (
            <div
              key={bank.id}
              className={`p-6 sm:p-7 rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-300 space-y-6 ${
                isDark
                  ? "bg-slate-900/90 border-slate-800 hover:border-rose-600/50 text-slate-100 shadow-slate-950/40"
                  : "bg-white border-slate-200 hover:border-rose-300 text-slate-900 shadow-slate-200/50"
              }`}
            >
              {/* Top Bank Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold font-sans tracking-tight">
                      {bank.hospitalName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 text-[10px] font-black uppercase">
                      📍 {bank.district}
                    </span>
                    {bank.verifiedBadge && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                    {bank.operates24x7 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                        24/7 Service
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs font-medium flex items-center gap-1.5 mt-1.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {bank.address}
                  </p>
                </div>

                {/* Call Hotline & Requisition Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setRequisitionBank(bank);
                      setRequisitionGroup(selectedBloodGroup !== "ALL" ? (selectedBloodGroup as BloodGroup) : "O+");
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 border border-red-400/30 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{language === "bn" ? "ব্যাগ রিকুইজিশন / বুকিং" : "Reserve / Requisition"}</span>
                  </button>

                  <a
                    href={generateTelEmergencyLink(bank.emergencyHotline)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all shadow-md"
                    title={language === "bn" ? "জরুরি হটলাইনে কল দিন" : "Call Emergency Hotline"}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{bank.emergencyHotline}</span>
                  </a>
                </div>
              </div>

              {/* Real-Time Live Inventory Matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-rose-500" />
                    <span>{language === "bn" ? "লাইভ ব্লাড গ্রুপ স্টক ম্যাট্রিক্স (ব্যাগ সংখ্যা):" : "Live Blood Group Stock Matrix (Units in Bag):"}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{bank.lastUpdated || "Real-time Sync"}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {bloodGroupKeys.map((bg) => {
                    const count = bank.inventory[bg] || 0;
                    const stockMeta = getStockStatus(count);
                    const maxCap = 30; // standard bag scale
                    const percent = Math.min(100, Math.round((count / maxCap) * 100));
                    const isHighlighted = selectedBloodGroup === bg;

                    return (
                      <div
                        key={bg}
                        onClick={() => {
                          setRequisitionBank(bank);
                          setRequisitionGroup(bg);
                        }}
                        title={language === "bn" ? `${bg} রক্তের ব্যাগ বুকিং করতে ক্লিক করুন` : `Click to requisition ${bg} blood bags`}
                        className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all cursor-pointer group hover:scale-[1.03] active:scale-95 ${
                          isHighlighted
                            ? "bg-rose-600/15 border-rose-500 ring-2 ring-rose-500/50"
                            : isDark
                            ? "bg-slate-950/80 border-slate-800 hover:border-rose-500/50"
                            : "bg-slate-50 border-slate-200 hover:border-rose-300"
                        }`}
                      >
                        {/* Blood Group Badge */}
                        <div className="flex items-center justify-center gap-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs shadow-sm group-hover:bg-rose-500 transition-colors">
                            {bg}
                          </span>
                        </div>

                        {/* Stock Count */}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-xl font-black font-mono ${stockMeta.countClass}`}>
                            {count}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {language === "bn" ? "ব্যাগ" : "Bags"}
                          </span>
                        </div>

                        {/* Capacity Bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${stockMeta.barClass}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Status Tag */}
                        <span
                          className={`block text-[9px] font-black uppercase tracking-wider py-0.5 rounded-md border ${stockMeta.badgeClass}`}
                        >
                          {stockMeta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Blood Bank Requisition & Stock Booking Modal */}
      {requisitionBank && (
        <BloodBankRequisitionModal
          isOpen={!!requisitionBank}
          bank={requisitionBank}
          initialGroup={requisitionGroup}
          onClose={() => setRequisitionBank(null)}
        />
      )}
    </div>
  );
};
