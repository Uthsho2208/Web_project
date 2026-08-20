import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { DonorProfile, BloodGroup } from "../types";
import {
  Users,
  Heart,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  Search,
  Filter,
  Share2,
  Award,
  Calendar,
  CheckCircle2,
  Star,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Flame,
  Activity,
  ThumbsUp,
  X,
  Copy,
  Check
} from "lucide-react";

export const CommunityProfilesView: React.FC = () => {
  const {
    language,
    theme,
    donors,
    userProfile,
    likeDonorProfile,
    openCreateProfileModal,
    triggerNotification
  } = useApp();

  const isDark = theme === "dark";

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "TOP_DONORS" | "VERIFIED">("ALL");
  const [sortBy, setSortBy] = useState<"MOST_DONATIONS" | "HIGHEST_XP" | "MOST_LIKES" | "NEWEST">("MOST_DONATIONS");
  const [selectedMember, setSelectedMember] = useState<DonorProfile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Combine userProfile and donors uniquely
  const allMembers = useMemo(() => {
    const list: DonorProfile[] = [...donors];
    const exists = list.some((d) => d.id === userProfile.id || (d.name === userProfile.name && d.phone === userProfile.phone));
    if (!exists && userProfile.id) {
      list.unshift(userProfile);
    }
    return list;
  }, [donors, userProfile]);

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return allMembers
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name?.toLowerCase().includes(q);
          const matchDistrict = m.district?.toLowerCase().includes(q);
          const matchArea = m.area?.toLowerCase().includes(q);
          const matchBlood = m.bloodGroup?.toLowerCase().includes(q);
          const matchProfession = m.profession?.toLowerCase().includes(q);
          const matchBio = m.bio?.toLowerCase().includes(q);
          if (!matchName && !matchDistrict && !matchArea && !matchBlood && !matchProfession && !matchBio) {
            return false;
          }
        }

        // Blood group
        if (selectedGroup !== "ALL" && m.bloodGroup !== selectedGroup) {
          return false;
        }

        // Status filter
        if (statusFilter === "AVAILABLE" && !m.isAvailable) return false;
        if (statusFilter === "TOP_DONORS" && (m.totalDonations || 0) < 3) return false;
        if (statusFilter === "VERIFIED" && !m.isVerified) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "MOST_DONATIONS") {
          return (b.totalDonations || 0) - (a.totalDonations || 0);
        }
        if (sortBy === "HIGHEST_XP") {
          return (b.points || 0) - (a.points || 0);
        }
        if (sortBy === "MOST_LIKES") {
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
        return 0;
      });
  }, [allMembers, searchQuery, selectedGroup, statusFilter, sortBy]);

  // Story highlights (Top lifesavers & newly joined)
  const topHeroes = useMemo(() => {
    return [...allMembers]
      .sort((a, b) => (b.totalDonations || 0) - (a.totalDonations || 0))
      .slice(0, 8);
  }, [allMembers]);

  // Overall community stats
  const totalDonationsSum = useMemo(() => {
    return allMembers.reduce((acc, m) => acc + (m.totalDonations || 0), 0);
  }, [allMembers]);

  const totalAvailableCount = useMemo(() => {
    return allMembers.filter((m) => m.isAvailable).length;
  }, [allMembers]);

  const uniqueDistrictsCount = useMemo(() => {
    return new Set(allMembers.map((m) => m.district)).size;
  }, [allMembers]);

  // Handle Like/Cheer
  const handleLike = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeDonorProfile(memberId);
    setLikedMap((prev) => ({ ...prev, [memberId]: true }));
  };

  // Handle Share Profile
  const handleShare = (member: DonorProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🩸 BloodMate রক্তযোদ্ধা প্রোফাইল: ${member.name} (${member.bloodGroup})\nএলাকা: ${member.area}, ${member.district}\nমোট রক্তদান: ${member.totalDonations} বার।\nBloodMate অ্যাপে ডোনারের বিস্তারিত প্রোফাইল দেখুন:`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(member.id);
      triggerNotification(
        language === "bn" ? "প্রোফাইল বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!" : "Profile link & details copied!"
      );
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 🌟 Community Hero Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden backdrop-blur-2xl shadow-xl transition-all ${
        isDark
          ? "bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-red-950/40 border-white/10 shadow-slate-950/80"
          : "bg-gradient-to-br from-white/95 via-rose-50/80 to-white/90 border-rose-100 shadow-rose-950/5"
      }`}>
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/20">
              <Users className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "সোশ্যাল রক্তযোদ্ধা হাব" : "Social Blood Heroes Hub"}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              {language === "bn" ? "আমাদের রক্তদাতা কমিউনিটি ও মেম্বারস" : "BloodMate Registered Members & Heroes"}
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              {language === "bn"
                ? "আমাদের প্ল্যাটফর্মে যারা যারা প্রোফাইল তৈরি করেছেন তাদের সবার সোশ্যাল প্রোফাইল এখানে সংরক্ষিত। একে অপরকে সম্মাননা পাঠান, রক্তদানের গল্প জানুন এবং জরুরি প্রয়োজনে সরাসরি যুক্ত হোন।"
                : "Explore everyone who has created a donor profile on BloodMate. Send appreciation, explore stories, and connect directly for lifesaving causes."}
            </p>
          </div>

          {/* Action Button: Create/Edit My Profile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={openCreateProfileModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === "bn" ? "আমার প্রোফাইল যুক্ত / আপডেট করুন" : "Join / Update My Profile"}</span>
            </button>
          </div>
        </div>

        {/* Community Live Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className={`p-3.5 rounded-2xl border text-center ${
            isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-rose-100 shadow-sm"
          }`}>
            <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent block">
              {allMembers.length}
            </span>
            <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "bn" ? "নিবন্ধিত মেম্বার" : "Total Members"}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-center ${
            isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-rose-100 shadow-sm"
          }`}>
            <span className="text-2xl font-black text-emerald-500 block flex items-center justify-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              {totalAvailableCount}
            </span>
            <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "bn" ? "রক্তদানে প্রস্তুত" : "Available Now"}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-center ${
            isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-rose-100 shadow-sm"
          }`}>
            <span className="text-2xl font-black text-rose-500 block">
              {totalDonationsSum}+
            </span>
            <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "bn" ? "মোট রক্তদান সংখ্যা" : "Donations Given"}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-center ${
            isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-rose-100 shadow-sm"
          }`}>
            <span className="text-2xl font-black text-sky-500 block">
              {uniqueDistrictsCount}
            </span>
            <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "bn" ? "সক্রিয় জেলা" : "Districts Covered"}
            </span>
          </div>
        </div>
      </div>

      {/* 📸 Top Heroes / Story Highlights Bar (Instagram/Facebook Style) */}
      <div className={`p-4 rounded-3xl border backdrop-blur-xl ${
        isDark ? "bg-slate-900/50 border-white/10" : "bg-white/60 border-white/80 shadow-sm"
      }`}>
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}>
              {language === "bn" ? "টপ রক্তযোদ্ধা ও নতুন মেম্বার স্পটলাইট" : "Top Lifesavers & Member Spotlights"}
            </h3>
          </div>
          <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "bn" ? "প্রোফাইল দেখতে ক্লিক করুন" : "Click to view profile"}
          </span>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2 px-1">
          {topHeroes.map((hero) => {
            const isOnline = hero.isAvailable;
            return (
              <div
                key={hero.id}
                onClick={() => setSelectedMember(hero)}
                className="flex flex-col items-center space-y-1.5 shrink-0 cursor-pointer group select-none"
              >
                {/* Story Ring */}
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-red-600/20">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 flex items-center justify-center ${
                    isDark ? "bg-slate-950" : "bg-white"
                  }`}>
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex flex-col items-center justify-center text-white shadow-inner font-black">
                      <span className="text-xs sm:text-sm font-extrabold leading-none">{hero.bloodGroup}</span>
                      <span className="text-[9px] opacity-80 mt-0.5 font-bold">{hero.totalDonations}x</span>
                    </div>
                  </div>
                  {/* Status dot */}
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                    isDark ? "border-slate-950" : "border-white"
                  } ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                </div>
                <span className={`text-[11px] font-bold max-w-[70px] truncate group-hover:text-red-500 transition-colors ${
                  isDark ? "text-slate-300" : "text-slate-800"
                }`}>
                  {hero.name.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔍 Search & Filter Toolbar */}
      <div className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-xl space-y-4 ${
        isDark ? "bg-slate-900/60 border-white/10" : "bg-white/70 border-white/80 shadow-md shadow-rose-950/5"
      }`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "bn" ? "মেম্বারের নাম, এলাকা, রক্তের গ্রুপ বা পেশা দিয়ে খুঁজুন..." : "Search members by name, district, blood group, profession..."}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                isDark
                  ? "bg-slate-950/80 border-white/10 text-white placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer ${
                isDark ? "bg-slate-950 border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <option value="MOST_DONATIONS">{language === "bn" ? "রক্তদান সংখ্যা (সর্বোচ্চ)" : "Most Donations"}</option>
              <option value="HIGHEST_XP">{language === "bn" ? "পয়েন্ট ও র‍্যাঙ্ক (XP)" : "Highest XP"}</option>
              <option value="MOST_LIKES">{language === "bn" ? "জনপ্রিয়তা (❤️ লাইক)" : "Most Popular (Likes)"}</option>
            </select>
          </div>
        </div>

        {/* Blood Group Chips & Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10">
          <span className={`text-xs font-extrabold mr-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {language === "bn" ? "রক্তের গ্রুপ:" : "Group:"}
          </span>
          {["ALL", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedGroup === bg
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : isDark
                  ? "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-white/10"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {bg}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block" />

          {/* Status Quick Filters */}
          <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
            {[
              { id: "ALL", label: language === "bn" ? "সকল মেম্বার" : "All" },
              { id: "AVAILABLE", label: language === "bn" ? "🟢 প্রস্তুত ডোনার" : "🟢 Ready" },
              { id: "TOP_DONORS", label: language === "bn" ? "🏆 টপ হিরো" : "🏆 Top Donors" },
              { id: "VERIFIED", label: language === "bn" ? "🛡️ ভেরিফাইড" : "🛡️ Verified" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  statusFilter === st.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 👥 Social Member Profiles Grid */}
      {filteredMembers.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border backdrop-blur-xl ${
          isDark ? "bg-slate-900/40 border-white/10" : "bg-white/60 border-slate-200"
        }`}>
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {language === "bn" ? "কোনো মেম্বার প্রোফাইল পাওয়া যায়নি" : "No member profiles found"}
          </h3>
          <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "bn"
              ? "ফিল্টার পরিবর্তন করুন অথবা প্রথম রক্তদাতা হিসেবে প্রোফাইল তৈরি করুন!"
              : "Try adjusting your search criteria or register as a new blood donor!"}
          </p>
          <button
            onClick={openCreateProfileModal}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30"
          >
            {language === "bn" ? "নতুন প্রোফাইল তৈরি করুন" : "Create New Profile"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => {
            const isMe = member.id === userProfile.id || (member.name === userProfile.name && member.phone === userProfile.phone);
            const isLiked = !!likedMap[member.id];
            const likesCount = (member.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`group rounded-3xl border overflow-hidden backdrop-blur-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                  isDark
                    ? "bg-slate-900/70 border-white/10 hover:border-red-500/40 shadow-slate-950/80"
                    : "bg-white/80 border-white/80 hover:border-rose-300 shadow-lg shadow-rose-950/5"
                }`}
              >
                <div>
                  {/* Top Cover Banner */}
                  <div className="h-20 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-800 relative p-3 flex items-start justify-between">
                    {/* Badge Pill */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-300" />
                      <span>{member.badge || "Bronze Donor"}</span>
                    </span>

                    {/* Quick Share / Like Action */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleShare(member, e)}
                        className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
                        title="Share Profile"
                      >
                        {copiedId === member.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Profile Info Header (Avatar overlapping cover) */}
                  <div className="px-5 pt-0 pb-4 relative">
                    <div className="flex items-end justify-between -mt-10 mb-3">
                      {/* Avatar Circle */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-red-950 p-1 ring-4 ring-white dark:ring-slate-900 shadow-xl flex items-center justify-center text-white">
                          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex flex-col items-center justify-center">
                            <span className="text-base font-black leading-none">{member.bloodGroup}</span>
                            <span className="text-[8px] font-extrabold uppercase mt-0.5 opacity-90">{member.gender || "Donor"}</span>
                          </div>
                        </div>
                        {/* Verified badge */}
                        {member.isVerified && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm" title="Verified Member">
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Ready status badge */}
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border ${
                          member.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.isAvailable ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                          <span>{member.isAvailable ? (language === "bn" ? "প্রস্তুত" : "Available") : (language === "bn" ? "বিশ্রামে" : "Resting")}</span>
                        </span>
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-black text-base tracking-tight truncate group-hover:text-red-500 transition-colors ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}>
                          {member.name}
                        </h4>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-red-500/20 text-red-500 border border-red-500/30">
                            {language === "bn" ? "আপনি" : "You"}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {member.profession || (language === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা" : "Blood Donor Volunteer")}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{member.area}, {member.district}</span>
                    </div>

                    {/* Bio / Quote */}
                    <div className={`mt-3 p-2.5 rounded-2xl text-xs italic line-clamp-2 ${
                      isDark ? "bg-slate-950/60 text-slate-300 border border-white/5" : "bg-rose-50/50 text-slate-700 border border-rose-100"
                    }`}>
                      "{member.bio || (language === "bn" ? "রক্তদানই মানবতার শ্রেষ্ঠ উপহার ❤️" : "Proud voluntary blood donor ready to help.")}"
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                      <div>
                        <span className={`text-sm font-black block ${isDark ? "text-white" : "text-slate-900"}`}>
                          {member.totalDonations || 0}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {language === "bn" ? "রক্তদান" : "Donations"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-black text-amber-500 block">
                          {member.points || 500}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          XP
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-black text-rose-500 block">
                          {likesCount}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {language === "bn" ? "❤️ সম্মাননা" : "❤️ Cheers"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Social Actions Row */}
                <div className={`p-3 border-t flex items-center justify-between gap-2 ${
                  isDark ? "bg-slate-950/40 border-white/10" : "bg-slate-50/80 border-slate-100"
                }`}>
                  {/* Like/Cheer Button */}
                  <button
                    onClick={(e) => handleLike(member.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-90 ${
                      isLiked
                        ? "bg-rose-500/20 text-rose-500 border border-rose-500/30 font-black"
                        : isDark
                        ? "bg-slate-900 text-slate-300 hover:text-rose-400 hover:bg-slate-800 border border-white/10"
                        : "bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{likesCount}</span>
                  </button>

                  {/* WhatsApp Quick Connect */}
                  {member.whatsapp && (
                    <a
                      href={`https://wa.me/880${member.whatsapp.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${member.name}, BloodMate অ্যাপ থেকে আপনার সাথে জরুরি রক্তদান বিষয়ে যোগাযোগ করছি।`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all active:scale-95"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  {/* Call Quick Connect */}
                  {member.phone && !member.hidePhoneInPublic && (
                    <a
                      href={`tel:${member.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all active:scale-95"
                      title="Call Donor"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  {/* View Full Card */}
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>{language === "bn" ? "প্রোফাইল" : "Profile"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 👤 Social Member Full Profile Modal (Instagram/Facebook Style) */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 pt-20 sm:pt-28 pb-16 flex justify-center items-start animate-fade-in"
          role="dialog"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl relative my-auto animate-scale-up ${
              isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Modal Cover Header */}
            <div className="h-28 bg-gradient-to-r from-red-600 via-rose-600 to-red-800 relative p-4 flex items-start justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>{selectedMember.badge || "Bronze Donor"}</span>
              </span>

              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Info */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex items-end justify-between -mt-12 mb-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-slate-950 to-red-950 p-1.5 ring-4 ring-white dark:ring-slate-900 shadow-2xl flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-black">{selectedMember.bloodGroup}</span>
                    <span className="text-[10px] font-extrabold uppercase mt-0.5 opacity-90">{selectedMember.gender || "Donor"}</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleLike(selectedMember.id, e)}
                    className="px-3.5 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>{(selectedMember.likesCount || 0) + (likedMap[selectedMember.id] ? 1 : 0)} {language === "bn" ? "সম্মাননা" : "Cheers"}</span>
                  </button>
                </div>
              </div>

              {/* Name & Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">{selectedMember.name}</h3>
                  {selectedMember.isVerified && (
                    <span className="p-0.5 rounded-full bg-sky-500 text-white" title="Verified Donor">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {selectedMember.profession || (language === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা" : "Volunteer Blood Donor")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{selectedMember.area}, {selectedMember.district}</span>
                </p>
              </div>

              {/* Bio Banner */}
              <div className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed ${
                isDark ? "bg-slate-950/80 border-white/10 text-slate-300" : "bg-rose-50/80 border-rose-100 text-slate-800"
              }`}>
                <p className="font-medium">
                  "{selectedMember.bio || (language === "bn" ? "রক্তদানই মানবতার শ্রেষ্ঠ উপহার ❤️" : "Proud voluntary blood donor.")}"
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/50 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-base font-black block">{selectedMember.totalDonations || 0}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{language === "bn" ? "রক্তদান" : "Donations"}</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/50 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-base font-black text-amber-500 block">{selectedMember.points || 500}</span>
                  <span className="text-[10px] text-slate-400 font-bold">XP</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/50 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-base font-black text-emerald-500 block">{selectedMember.age || 24}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{language === "bn" ? "বয়স" : "Age"}</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/50 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-base font-black text-sky-500 block">{selectedMember.weightKg || 60}kg</span>
                  <span className="text-[10px] text-slate-400 font-bold">{language === "bn" ? "ওজন" : "Weight"}</span>
                </div>
              </div>

              {/* Medical / Availability Notes */}
              {selectedMember.medicalNotes && (
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    {language === "bn" ? "মেডিকেল ও প্রাপ্যতা নোট:" : "Medical & Availability Notes:"}
                  </span>
                  <p>{selectedMember.medicalNotes}</p>
                </div>
              )}

              {/* Direct Connect Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/10">
                {selectedMember.phone && !selectedMember.hidePhoneInPublic ? (
                  <a
                    href={`tel:${selectedMember.phone}`}
                    className="py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{language === "bn" ? "সরাসরি কল দিন" : "Direct Call"}</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="py-3 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 opacity-70"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{language === "bn" ? "নম্বর গোপন রাখা হয়েছে" : "Phone Protected"}</span>
                  </button>
                )}

                {selectedMember.whatsapp ? (
                  <a
                    href={`https://wa.me/880${selectedMember.whatsapp.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${selectedMember.name}, BloodMate অ্যাপ থেকে আপনার সাথে জরুরি রক্তদান বিষয়ে যোগাযোগ করছি।`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button
                    onClick={(e) => handleShare(selectedMember, e)}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{language === "bn" ? "প্রোফাইল শেয়ার" : "Share"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
