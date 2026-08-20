import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { BloodGroup, Gender } from "../types";
import { BD_DISTRICTS_BY_DIVISION } from "../data/bdData";
import { User, Heart, ShieldCheck, MapPin, Phone, Calendar, X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language, userProfile, updateUserProfile, addDonor, triggerNotification, theme } = useApp();
  const t = TRANSLATIONS[language];
  const isDark = theme === "dark";

  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [gender, setGender] = useState<Gender>("Male");
  const [age, setAge] = useState<string>("24");
  const [weightKg, setWeightKg] = useState<string>("62");
  const [district, setDistrict] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isNeverDonated, setIsNeverDonated] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState("2026-05-01");
  const [isAvailable, setIsAvailable] = useState(true);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [facebookProfile, setFacebookProfile] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state whenever modal opens or userProfile changes
  useEffect(() => {
    if (isOpen) {
      setName(userProfile?.name || "");
      setBloodGroup(userProfile?.bloodGroup || "O+");
      setGender(userProfile?.gender || "Male");
      setAge(userProfile?.age ? String(userProfile.age) : "24");
      setWeightKg(userProfile?.weightKg ? String(userProfile.weightKg) : "62");
      setDistrict(userProfile?.district || "Dhaka");
      setArea(userProfile?.area || "");
      setPhone(userProfile?.phone || "");
      setWhatsapp(userProfile?.whatsapp || userProfile?.phone || "");
      setIsAvailable(userProfile?.isAvailable ?? true);
      
      const prevLastDate = userProfile?.lastDonationDate;
      if (prevLastDate === "Never Donated Yet") {
        setIsNeverDonated(true);
        setLastDonationDate("");
      } else {
        setIsNeverDonated(false);
        setLastDonationDate(prevLastDate || "2026-05-01");
      }
      setMedicalNotes(userProfile?.medicalNotes || "");
      setBio(userProfile?.bio || "");
      setProfession(userProfile?.profession || "");
      setFacebookProfile(userProfile?.facebookProfile || "");
      setFormErrors({});
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = language === "bn" ? "আপনার সম্পূর্ণ নাম লিখুন" : "Please enter your full name";
    }

    if (!phone.trim()) {
      errors.phone = language === "bn" ? "মোবাইল নম্বর লিখুন" : "Please enter phone number";
    } else if (phone.trim().length < 10) {
      errors.phone = language === "bn" ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" : "Valid mobile number required";
    }

    if (!area.trim()) {
      errors.area = language === "bn" ? "আপনার এলাকা বা থানার নাম লিখুন" : "Please enter area/location";
    }

    const parsedAge = Number(age);
    if (!age || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
      errors.age = language === "bn" ? "বয়স ১৮ থেকে ৬৫ বছর হতে হবে" : "Age must be between 18-65";
    }

    const parsedWeight = Number(weightKg);
    if (!weightKg || isNaN(parsedWeight) || parsedWeight < 50) {
      errors.weightKg = language === "bn" ? "সর্বনিম্ন ওজন ৫০ কেজি আবশ্যক" : "Min weight is 50 kg";
    }

    if (!isNeverDonated && !lastDonationDate) {
      errors.lastDonationDate = language === "bn" ? "সর্বশেষ রক্তদানের তারিখ দিন অথবা চেকবক্সে টিক দিন" : "Select date or check 'Never donated'";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerNotification(
        language === "bn"
          ? "দয়া করে ফর্মে লাল চিহ্নিত স্থানসমূহ সঠিকভাবে পূরণ করুন।"
          : "Please fix the highlighted errors in the form."
      );
      return;
    }

    const calculatedLastDate = isNeverDonated ? "Never Donated Yet" : lastDonationDate;
    const numAge = Number(age) || 24;
    const numWeight = Number(weightKg) || 62;

    // 1. Update global user profile
    updateUserProfile({
      name,
      bloodGroup,
      gender,
      age: numAge,
      weightKg: numWeight,
      district,
      area,
      phone,
      whatsapp: whatsapp || phone,
      isAvailable,
      lastDonationDate: calculatedLastDate,
      totalDonations: isNeverDonated ? 0 : (userProfile?.totalDonations || 3),
      rating: 5.0,
      reviewsCount: 1,
      badge: "BloodMate Lifesaver",
      points: userProfile?.points ? userProfile.points + 100 : 500,
      isVerified: true,
      bio: bio || (language === "bn" ? "রক্তদানই মানবতার শ্রেষ্ঠ উপহার ❤️" : "Proud voluntary blood donor."),
      profession: profession || (language === "bn" ? "রক্তদাতা স্বেচ্ছাসেবক" : "Volunteer Donor"),
      facebookProfile: facebookProfile || "",
      medicalNotes: medicalNotes || (language === "bn" ? "জরুরি প্রয়োজনে রক্তদানে সম্পূর্ণ ইচ্ছুক ও প্রস্তুত।" : "Voluntary donor ready for emergency calls.")
    });

    // 2. Add as active donor to directory
    addDonor({
      name,
      bloodGroup,
      gender,
      age: numAge,
      weightKg: numWeight,
      district,
      area,
      phone,
      whatsapp: whatsapp || phone,
      isAvailable,
      lastDonationDate: calculatedLastDate,
      totalDonations: isNeverDonated ? 0 : (userProfile?.totalDonations || 3),
      e2eEncrypted: true,
      hidePhoneInPublic: false,
      bio: bio || (language === "bn" ? "রক্তদানই মানবতার শ্রেষ্ঠ উপহার ❤️" : "Proud voluntary blood donor."),
      profession: profession || (language === "bn" ? "রক্তদাতা স্বেচ্ছাসেবক" : "Volunteer Donor"),
      facebookProfile: facebookProfile || "",
      medicalNotes: medicalNotes || (language === "bn" ? "BloodMate রেজিস্ট্রেশনকৃত প্রস্তুত রক্তদাতা।" : "Verified BloodMate registered donor.")
    });

    triggerNotification(
      language === "bn"
        ? `অভিনন্দন ${name}! BloodMate-এ আপনার ডোনার প্রোফাইল সফলভাবে তৈরি ও ভেরিফাই করা হয়েছে।`
        : `Congratulations ${name}! Your BloodMate donor profile has been created and verified.`
    );

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 pt-20 sm:pt-28 pb-16 flex justify-center items-start animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl mt-2 sm:mt-4 mb-10 border transition-all duration-200 frosted-glass-card ring-1 ring-white/10 ${
          isDark
            ? "bg-slate-900/95 border-red-800/80 text-slate-100 shadow-slate-950/90"
            : "bg-white/95 border-red-200 text-slate-900 shadow-red-950/20"
        }`}
      >
        {/* Prominent Cross (✖) Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
          title={language === "bn" ? "বন্ধ করুন (Close)" : "Close Modal"}
          aria-label="Close"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        {/* Header Title */}
        <div className={`flex items-center space-x-3 pb-5 border-b pr-10 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-950 shrink-0 text-white font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold font-sans">
                {language === "bn" ? "রক্তদাতা প্রোফাইল তৈরি / আপডেট করুন" : "Create / Update Donor Profile"}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800/60 text-[10px] font-bold">
                BloodMate
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "bn"
                ? "জরুরি রক্তদানে অংশ নিতে ও জাতীয় রক্তদাতা ডিরেক্টরিতে নাম যুক্ত করতে সঠিক তথ্য প্রদান করুন।"
                : "Register yourself as an active blood donor in the national BloodMate emergency network."}
            </p>
          </div>
        </div>

        {/* Form Body - noValidate prevents opaque native browser popups */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4 pt-5 text-xs sm:text-sm">
          {/* Row 1: Name & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "আপনার পূর্ণ নাম *" : "Full Name *"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: "" }));
                }}
                placeholder={language === "bn" ? "যেমন: তানভীর আহমেদ" : "e.g., Tanvir Ahmed"}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                } ${
                  formErrors.name ? "border-rose-500 ring-1 ring-rose-500" : isDark ? "border-slate-700" : "border-slate-300"
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "রক্তের গ্রুপ *" : "Blood Group *"}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-rose-400 border-slate-700" : "bg-slate-50 text-rose-600 border-slate-300"
                }`}
              >
                {(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as BloodGroup[]).map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Gender, Age & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "লিঙ্গ *" : "Gender *"}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                }`}
              >
                <option value="Male">{language === "bn" ? "পুরুষ (Male)" : "Male"}</option>
                <option value="Female">{language === "bn" ? "মহিলা (Female)" : "Female"}</option>
                <option value="Other">{language === "bn" ? "অন্যান্য (Other)" : "Other"}</option>
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "বয়স (বছর) *" : "Age (Years) *"}
              </label>
              <input
                type="number"
                min="18"
                max="65"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (formErrors.age) setFormErrors(prev => ({ ...prev, age: "" }));
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                } ${
                  formErrors.age ? "border-rose-500 ring-1 ring-rose-500" : isDark ? "border-slate-700" : "border-slate-300"
                }`}
              />
              {formErrors.age && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.age}
                </p>
              )}
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "ওজন (কেজি) *" : "Weight (kg) *"}
              </label>
              <input
                type="number"
                min="50"
                max="150"
                value={weightKg}
                onChange={(e) => {
                  setWeightKg(e.target.value);
                  if (formErrors.weightKg) setFormErrors(prev => ({ ...prev, weightKg: "" }));
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                } ${
                  formErrors.weightKg ? "border-rose-500 ring-1 ring-rose-500" : isDark ? "border-slate-700" : "border-slate-300"
                }`}
              />
              {formErrors.weightKg && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.weightKg}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: District & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "জেলা *" : "District *"}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                }`}
              >
                {Object.values(BD_DISTRICTS_BY_DIVISION)
                  .flat()
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "থানা / এলাকা / ঠিকানা *" : "Area / Upazila / Address *"}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  if (formErrors.area) setFormErrors(prev => ({ ...prev, area: "" }));
                }}
                placeholder={language === "bn" ? "যেমন: ধানমন্ডি ২৭ / মিরপুর ১০" : "e.g., Dhanmondi / Mirpur"}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                } ${
                  formErrors.area ? "border-rose-500 ring-1 ring-rose-500" : isDark ? "border-slate-700" : "border-slate-300"
                }`}
              />
              {formErrors.area && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.area}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "মোবাইল নম্বর *" : "Phone Number *"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: "" }));
                }}
                placeholder="017XXXXXXXX"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                } ${
                  formErrors.phone ? "border-rose-500 ring-1 ring-rose-500" : isDark ? "border-slate-700" : "border-slate-300"
                }`}
              />
              {formErrors.phone && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)" : "WhatsApp Number (Optional)"}
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="017XXXXXXXX"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                }`}
              />
            </div>
          </div>

          {/* Row 5: Last Donation Date & Never Donated Checkbox */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "সর্বশেষ রক্তদানের তারিখ" : "Last Donation Date"}
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNeverDonated}
                  onChange={(e) => {
                    setIsNeverDonated(e.target.checked);
                    if (e.target.checked) {
                      setLastDonationDate("");
                      if (formErrors.lastDonationDate) setFormErrors(prev => ({ ...prev, lastDonationDate: "" }));
                    } else {
                      setLastDonationDate("2026-05-01");
                    }
                  }}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <span className="text-xs font-bold text-rose-400">
                  {language === "bn" ? "প্রথমবার রক্তদাতা (আগে রক্ত দেইনি)" : "First time donor (Never donated yet)"}
                </span>
              </label>
            </div>

            {!isNeverDonated && (
              <div>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => {
                    setLastDonationDate(e.target.value);
                    if (formErrors.lastDonationDate) setFormErrors(prev => ({ ...prev, lastDonationDate: "" }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900"
                  } ${
                    formErrors.lastDonationDate ? "border-rose-500 ring-1 ring-rose-500" : isDark ? "border-slate-700" : "border-slate-300"
                  }`}
                />
                {formErrors.lastDonationDate && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.lastDonationDate}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Availability Switch */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            isDark ? "bg-slate-950/90 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div>
              <span className={`font-bold block ${isDark ? "text-white" : "text-slate-900"}`}>
                {language === "bn" ? "জরুরি রক্তদানে প্রস্তুত আছেন?" : "Ready for Emergency Donation?"}
              </span>
              <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "bn"
                  ? "সক্রিয় রাখলে রক্তের প্রয়োজন দেখা দিলে আপনাকে নোটিফিকেশন পাঠানো হবে।"
                  : "Allow nearby hospitals & emergency requestors to contact you for matching alerts."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${
                isAvailable ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAvailable ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Social Community Bio & Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "পেশা / পদবী (ঐচ্ছিক)" : "Profession / Title (Optional)"}
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder={language === "bn" ? "যেমন: সফটওয়্যার ইঞ্জিনিয়ার / ছাত্র" : "e.g. Student / Teacher / Volunteer"}
                className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                }`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {language === "bn" ? "ফেসবুক প্রোফাইল / ইউজারনেম (ঐচ্ছিক)" : "Facebook Profile / Username (Optional)"}
              </label>
              <input
                type="text"
                value={facebookProfile}
                onChange={(e) => setFacebookProfile(e.target.value)}
                placeholder={language === "bn" ? "যেমন: fb.com/yourname" : "e.g. facebook.com/username"}
                className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {language === "bn" ? "কমিউনিটি বায়ো / প্রিয় উক্তি (ঐচ্ছিক)" : "Community Bio / Motto (Optional)"}
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={language === "bn" ? "যেমন: রক্তদানই মানবতার শ্রেষ্ঠ উপহার ❤️" : "e.g. Blood donation is the gift of life ❤️"}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
              }`}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {language === "bn" ? "আপনার স্বাস্থ্যবিষয়ক বা যোগাযোগের নোট" : "Medical & Availability Notes"}
            </label>
            <textarea
              rows={2}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder={language === "bn" ? "যেমন: ঢাকা বিশ্ববিদ্যালয় এলাকায় বিকেলে উপলব্ধ থাকি।" : "e.g., Available for Dhanmondi/Shahbagh emergency callouts."}
              className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isDark ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
              }`}
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-950/80 transition-all flex items-center justify-center gap-2 border border-red-500/30 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{language === "bn" ? "প্রোফাইল রেজিস্ট্রেশন নিশ্চিত করুন" : "Confirm Profile Registration"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
