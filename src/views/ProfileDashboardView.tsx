import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { DonorProfile, DonationRecord } from "../types";
import { User, ShieldCheck, Award, Heart, Calendar, Phone, MapPin, Edit3, Lock, Unlock, Download, Plus, Star, CheckCircle2, X } from "lucide-react";
import { CertificateModal } from "../components/CertificateModal";
import { CreateProfileModal } from "../components/CreateProfileModal";
import { CircularCooldownWidget } from "../components/CircularCooldownWidget";

export const ProfileDashboardView: React.FC = () => {
  const {
    language,
    userProfile,
    updateUserProfile,
    myDonationRecords,
    addDonationRecord,
    isE2EEncrypted,
    toggleE2EEncryption,
    isBiometricUnlocked,
    openCreateProfileModal,
    theme
  } = useApp();

  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [district, setDistrict] = useState(userProfile.district);
  const [area, setArea] = useState(userProfile.area);
  const [phone, setPhone] = useState(userProfile.phone);
  const [whatsapp, setWhatsapp] = useState(userProfile.whatsapp || "");
  const [medicalNotes, setMedicalNotes] = useState(userProfile.medicalNotes || "");

  // Add donation record modal state
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [recHospital, setRecHospital] = useState("Square Hospital, Dhaka");
  const [recPatient, setRecPatient] = useState("Rafiq Uddin");
  const [recDate, setRecDate] = useState("2026-08-01");

  // Certificate Modal state
  const [selectedCertificateRecord, setSelectedCertificateRecord] = useState<DonationRecord | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      district,
      area,
      phone,
      whatsapp,
      medicalNotes
    });
    setIsEditing(false);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    addDonationRecord({
      date: recDate,
      hospitalName: recHospital,
      recipientName: recPatient,
      bloodGroup: userProfile.bloodGroup,
      units: 1,
      ratingGiven: 5,
      feedback: "Donation verified by hospital medical team."
    });
    setShowAddRecordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 transition-all duration-300 ${
        isDark ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/50" : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex flex-col items-center justify-center text-white shadow-xl shadow-red-600/30 font-black text-xl shrink-0">
              <span>{userProfile.bloodGroup}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight">{userProfile.name}</h2>
                {userProfile.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" title="Verified Donor" />
                )}
              </div>
              <p className={`text-xs font-medium flex items-center gap-1.5 mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {userProfile.area}, {userProfile.district} • {userProfile.phone}
              </p>
            </div>
          </div>

          {/* Action Group: Availability & Create New Profile */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={openCreateProfileModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 border border-red-400/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "bn" ? "নতুন প্রোফাইল তৈরি করুন" : "Create New Profile"}</span>
            </button>

            {/* Availability Toggle */}
            <div className={`flex items-center space-x-3 p-2 rounded-2xl border ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-right">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Availability
                </span>
                <span className={`text-xs font-black ${userProfile.isAvailable ? "text-emerald-500" : "text-amber-500"}`}>
                  {userProfile.isAvailable ? t.readyToDonate : t.restingMode}
                </span>
              </div>
              <button
                onClick={() => updateUserProfile({ isAvailable: !userProfile.isAvailable })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  userProfile.isAvailable ? "bg-emerald-600" : "bg-slate-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    userProfile.isAvailable ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.totalDonations}</span>
            <span className="text-xl font-black text-rose-500">{userProfile.totalDonations} {language === "bn" ? "বার" : "Times"}</span>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.livesSavedEstimate}</span>
            <span className="text-xl font-black text-emerald-500">~{userProfile.totalDonations * 3} Lives</span>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>Donor Badge</span>
            <span className="text-sm font-black text-amber-500 block mt-1">{userProfile.badge}</span>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.donorRating}</span>
            <span className="text-xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" />
              {userProfile.rating} ({userProfile.reviewsCount})
            </span>
          </div>
        </div>
      </div>

      {/* Circular Eligibility & Cooldown Tracker */}
      <CircularCooldownWidget />

      {/* Main Content: Edit Profile & Transfusion History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings Form */}
        <div className={`lg:col-span-1 p-6 border rounded-3xl shadow-xl space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <h3 className="font-bold text-base flex items-center gap-2">
              <User className="w-4 h-4 text-rose-500" />
              Donor Details
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 opacity-80">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 opacity-80">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 opacity-80">Area / Address</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 opacity-80">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 opacity-80">Medical Notes</label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 text-xs opacity-90">
              <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                <span className="opacity-70">Gender & Age:</span>
                <span className="font-semibold">{userProfile.gender}, {userProfile.age} Yrs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                <span className="opacity-70">Weight:</span>
                <span className="font-semibold">{userProfile.weightKg} kg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                <span className="opacity-70">Last Donation Date:</span>
                <span className="font-semibold text-amber-500">{userProfile.lastDonationDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                <span className="opacity-70">Security Encryption:</span>
                <button
                  onClick={toggleE2EEncryption}
                  className="text-emerald-500 font-bold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isE2EEncrypted ? "E2E Active" : "Standard"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Donation History Log & Certificates */}
        <div className={`lg:col-span-2 p-6 border rounded-3xl shadow-xl space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {language === "bn" ? "রক্তসঞ্চালনের ইতিহাস (Donation History Log)" : "Blood Donation History Log"}
              </h3>
            </div>
            <button
              onClick={() => setShowAddRecordModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {myDonationRecords.length === 0 ? (
              <p className="text-xs text-center py-6 opacity-60">
                {language === "bn" ? "এখনও কোনো রক্তদানের রেকর্ড জমা হয়নি।" : "No donation history recorded yet."}
              </p>
            ) : (
              myDonationRecords.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                    isDark ? "bg-slate-950/80 border-slate-800 hover:border-red-900/50" : "bg-slate-50 border-slate-200 hover:border-rose-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs">
                        {rec.bloodGroup} ({rec.units} Bag)
                      </span>
                      <h4 className="font-bold text-sm">{rec.hospitalName}</h4>
                    </div>

                    <button
                      onClick={() => setSelectedCertificateRecord(rec)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto border ${
                        isDark ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40" : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>{language === "bn" ? "সার্টিফিকেট দেখুন" : "View Certificate"}</span>
                    </button>
                  </div>

                  {/* Recipient Details */}
                  <div className="text-xs space-y-1 opacity-90 pt-1 border-t border-slate-700/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p>
                        <strong>{language === "bn" ? "গ্রহীতা / রোগী:" : "Recipient Patient:"}</strong>{" "}
                        <span className="font-semibold text-rose-500">{rec.recipientName}</span>
                      </p>
                      <p className="opacity-75">
                        📅 {rec.date} {rec.district && `• 📍 ${rec.district}`}
                      </p>
                    </div>

                    {rec.ratingGiven && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-semibold text-amber-500 flex items-center gap-1">
                          {[...Array(rec.ratingGiven)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          ({rec.ratingGiven}.0)
                        </span>
                        {rec.feedback && (
                          <span className="italic opacity-80 text-[11px]">"{rec.feedback}"</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecordModal && (
        <div
          onClick={() => setShowAddRecordModal(false)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 pt-16 sm:pt-24 pb-16 flex justify-center items-start animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 mt-2 sm:mt-4 mb-10 border frosted-glass-card ring-1 ring-white/10 ${
              isDark
                ? "bg-slate-900/95 border-red-800/60 text-slate-100 shadow-slate-950/90"
                : "bg-white/95 border-red-200 text-slate-900 shadow-red-950/20"
            }`}
          >
            <button
              onClick={() => setShowAddRecordModal(false)}
              type="button"
              aria-label="Close modal"
              title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/50 pr-10">
              <div className="p-2.5 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">
                  {language === "bn" ? "অতীত রক্তদানের তথ্য যোগ করুন" : "Log Past Blood Donation"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn" ? "আপনার প্রোফাইলে পূর্বের রক্তদানের ইতিহাস লিপিবদ্ধ করুন" : "Record your verified past blood donations"}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs sm:text-sm pt-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === "bn" ? "হাসপাতালের নাম *" : "Hospital Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={recHospital}
                  onChange={(e) => setRecHospital(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                  }`}
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === "bn" ? "রোগীর নাম *" : "Recipient Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={recPatient}
                  onChange={(e) => setRecPatient(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                  }`}
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === "bn" ? "রক্তদানের তারিখ *" : "Donation Date *"}
                </label>
                <input
                  type="date"
                  required
                  value={recDate}
                  onChange={(e) => setRecDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold transition-all cursor-pointer"
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl font-extrabold text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer"
                >
                  {language === "bn" ? "সংরক্ষণ করুন" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Honor Certificate Modal */}
      <CertificateModal
        isOpen={Boolean(selectedCertificateRecord)}
        onClose={() => setSelectedCertificateRecord(null)}
        record={selectedCertificateRecord}
      />
    </div>
  );
};
