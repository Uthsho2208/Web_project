import { BloodBank, CampDrive, DiscountVoucher, DonorProfile, EmergencyRequest, LeaderboardEntry } from "../types";

export const BD_DIVISIONS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"
];

export const BD_DISTRICTS_BY_DIVISION: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Narsingdi", "Faridpur", "Manikganj", "Munshiganj"],
  Chittagong: ["Chittagong", "Cox's Bazar", "Comilla", "Feni", "Noakhali", "Brahmanbaria", "Rangamati"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rajshahi: ["Rajshahi", "Bogra", "Pabna", "Natore", "Naogaon", "Sirajganj"],
  Khulna: ["Khulna", "Jhenaidah", "Jessore", "Kushtia", "Satkhira"],
  Barisal: ["Barisal", "Bhola", "Patuakhali", "Pirojpur"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
};

export const INITIAL_DONORS: DonorProfile[] = [
  {
    id: "donor-101",
    name: "Dr. Rafiqul Islam",
    bloodGroup: "O-",
    gender: "Male",
    age: 32,
    weightKg: 74,
    district: "Dhaka",
    area: "Dhanmondi, Road 27",
    phone: "01712-345678",
    whatsapp: "01712-345678",
    isAvailable: true,
    lastDonationDate: "2026-04-10",
    totalDonations: 14,
    rating: 4.9,
    reviewsCount: 18,
    badge: "Gold Hero",
    points: 4200,
    isVerified: true,
    e2eEncrypted: true,
    hidePhoneInPublic: false,
    medicalNotes: "Universal Donor (O Negative). Willing to donate anywhere in Dhaka for critical emergencies."
  },
  {
    id: "donor-102",
    name: "Nusrat Jahan",
    bloodGroup: "A+",
    gender: "Female",
    age: 26,
    weightKg: 58,
    district: "Dhaka",
    area: "Mirpur 10",
    phone: "01823-987654",
    whatsapp: "01823-987654",
    isAvailable: true,
    lastDonationDate: "2026-03-01",
    totalDonations: 8,
    rating: 5.0,
    reviewsCount: 12,
    badge: "Silver Lifesaver",
    points: 2600,
    isVerified: true,
    e2eEncrypted: true,
    hidePhoneInPublic: false,
    medicalNotes: "Regular donor at DMCH & BSMMU. Fast responder to emergency alerts."
  },
  {
    id: "donor-103",
    name: "Tanvir Ahmed Bhuiyan",
    bloodGroup: "B+",
    gender: "Male",
    age: 28,
    weightKg: 69,
    district: "Chittagong",
    area: "Agrabad",
    phone: "01911-223344",
    whatsapp: "01911-223344",
    isAvailable: true,
    lastDonationDate: "2026-01-15",
    totalDonations: 11,
    rating: 4.8,
    reviewsCount: 15,
    badge: "Gold Hero",
    points: 3500,
    isVerified: true,
    e2eEncrypted: true,
    hidePhoneInPublic: false,
    medicalNotes: "Available for Chittagong Medical College emergencies."
  },
  {
    id: "donor-104",
    name: "Mahmud Hasan",
    bloodGroup: "AB-",
    gender: "Male",
    age: 29,
    weightKg: 72,
    district: "Sylhet",
    area: "Zindabazar",
    phone: "01755-667788",
    whatsapp: "01755-667788",
    isAvailable: true,
    lastDonationDate: "2026-02-20",
    totalDonations: 6,
    rating: 4.9,
    reviewsCount: 9,
    badge: "Silver Lifesaver",
    points: 2100,
    isVerified: true,
    e2eEncrypted: true,
    hidePhoneInPublic: false,
    medicalNotes: "Rare AB Negative group. Ready for emergency callouts in Sylhet."
  },
  {
    id: "donor-105",
    name: "Shahnaz Parveen",
    bloodGroup: "B-",
    gender: "Female",
    age: 27,
    weightKg: 56,
    district: "Rajshahi",
    area: "Kazla, RU Area",
    phone: "01877-112233",
    whatsapp: "01877-112233",
    isAvailable: true,
    lastDonationDate: "2025-11-10",
    totalDonations: 9,
    rating: 5.0,
    reviewsCount: 11,
    badge: "Gold Hero",
    points: 2900,
    isVerified: true,
    e2eEncrypted: true,
    hidePhoneInPublic: false,
    medicalNotes: "B Negative rare group volunteer."
  },
  {
    id: "donor-106",
    name: "Sabbir Hossain",
    bloodGroup: "O+",
    gender: "Male",
    age: 24,
    weightKg: 65,
    district: "Dhaka",
    area: "Uttara, Sector 4",
    phone: "01633-445566",
    whatsapp: "01633-445566",
    isAvailable: true,
    lastDonationDate: "2026-04-01",
    totalDonations: 19,
    rating: 5.0,
    reviewsCount: 22,
    badge: "Diamond Angel",
    points: 6100,
    isVerified: true,
    e2eEncrypted: true,
    hidePhoneInPublic: false,
    medicalNotes: "Emergency responder with 19 donations."
  }
];

export const INITIAL_EMERGENCY_REQUESTS: EmergencyRequest[] = [
  {
    id: "req-201",
    patientName: "Sumaiya Akter (Age 34)",
    hospitalName: "Dhaka Medical College Hospital (DMCH)",
    district: "Dhaka",
    area: "Bakshibazar",
    bloodGroup: "O-",
    unitsNeeded: 3,
    unitsFulfilled: 1,
    urgencyLevel: "Critical",
    urgencyScore: 96,
    reason: "Road Traffic Accident Emergency - Severe Internal Bleeding",
    isICU: true,
    contactPhone: "01711-998877",
    altPhone: "01819-223344",
    status: "Searching",
    createdAt: "2026-08-11T07:15:00Z",
    aiReasoningBn: "জরুরি আইসিইউ কেস। O- রক্তের বিরলতার কারণে AI এটিকে সর্বোচ্চ অগ্রাধিকার (৯৬%) দিয়েছে। অনতিবিলম্বে ৩ ব্যাগ রক্ত প্রয়োজন।",
    aiReasoningEn: "Critical ICU trauma case with rare O- Negative blood requirement. Assigned maximum priority score (96/100).",
    recommendedResponseTime: "১৫-৩০ মিনিট (Within 15-30 mins)",
    actionPlanBn: "১. ধানমন্ডি/মিরপুর এলাকার O- রক্তদাতাদের বিশেষ পুশ নোটিফিকেশন এলার্ট পাঠানো হয়েছে।\n২. কোয়ান্টাম ফাউন্ডেশন সেন্ট্রাল ল্যাবে অতিরিক্ত স্টকের খোঁজ করা হচ্ছে।",
    actionPlanEn: "1. Priority alert dispatched to O- Negative donors in Central Dhaka.\n2. Quantum Blood Bank central inventory cross-referenced.",
    donorResponses: [
      {
        donorId: "donor-101",
        donorName: "Dr. Rafiqul Islam",
        donorPhone: "01712-345678",
        status: "On The Way",
        responseTime: "10 mins ago",
        estimatedArrivalMinutes: 20
      }
    ]
  },
  {
    id: "req-202",
    patientName: "Advocate Karim Ullah (Age 58)",
    hospitalName: "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
    district: "Dhaka",
    area: "Shahbagh",
    bloodGroup: "A+",
    unitsNeeded: 2,
    unitsFulfilled: 1,
    urgencyLevel: "High",
    urgencyScore: 88,
    reason: "Open Heart Bypass Surgery scheduled at 11:00 AM",
    isICU: false,
    contactPhone: "01912-334455",
    status: "Donor Assigned",
    createdAt: "2026-08-11T06:30:00Z",
    aiReasoningBn: "ওপেন হার্ট সার্জারি কেস। অতিরিক্ত রক্তপাতের ঝুঁকি এড়াতে দ্রুত ২ ব্যাগ A+ রক্ত লাগবে।",
    aiReasoningEn: "Open heart surgery requiring 2 units of A+ blood before 11:00 AM.",
    recommendedResponseTime: "১ ঘণ্টার মধ্যে (Within 1 hour)",
    actionPlanBn: "১. A+ দাতা নুসরাত জাহান সাড়া দিয়েছেন।\n২. ২য় রক্তদাতার জন্য অনুসন্ধান চলছে।",
    actionPlanEn: "1. Donor Nusrat Jahan accepted and confirmed.\n2. Seeking second matching donor.",
    donorResponses: [
      {
        donorId: "donor-102",
        donorName: "Nusrat Jahan",
        donorPhone: "01823-987654",
        status: "Arrived",
        responseTime: "25 mins ago",
        estimatedArrivalMinutes: 0
      }
    ]
  },
  {
    id: "req-203",
    patientName: "Baby Aayan (8 months)",
    hospitalName: "Chittagong Medical College Hospital",
    district: "Chittagong",
    area: "Panchlaish",
    bloodGroup: "B+",
    unitsNeeded: 1,
    unitsFulfilled: 0,
    urgencyLevel: "High",
    urgencyScore: 84,
    reason: "Thalassemia Monthly Transfusion - Hb level dropped to 5.2 g/dL",
    isICU: false,
    contactPhone: "01815-556677",
    status: "Searching",
    createdAt: "2026-08-11T05:45:00Z",
    aiReasoningBn: "থ্যালাসেমিয়া আক্রান্ত শিশুর রক্তকণিকা সংকট। হিমোগ্লোবিন মাত্র ৫.২, অতিসত্বর ১ ব্যাগ নতুন রক্তের প্রয়োজন।",
    aiReasoningEn: "Pediatric Thalassemia case with critical Hb drop to 5.2 g/dL. Requires 1 bag fresh B+ blood.",
    recommendedResponseTime: "১ - ২ ঘণ্টা (Within 1-2 hours)",
    actionPlanBn: "১. চট্টগ্রাম মেডিকেল সংলগ্ন B+ দাতাদের এলার্ট পাঠানো হয়েছে।",
    actionPlanEn: "1. Broadcast alert active for Chittagong area donors.",
    donorResponses: []
  }
];

export const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: "bank-301",
    hospitalName: "BSMMU Central Blood Bank",
    district: "Dhaka",
    address: "Block-D, 3rd Floor, Shahbagh, Dhaka-1000",
    phone: "02-9661058",
    emergencyHotline: "01711-593300",
    inventory: {
      "A+": 18, "A-": 3, "B+": 24, "B-": 4, "AB+": 9, "AB-": 1, "O+": 31, "O-": 2
    },
    lastUpdated: "5 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-302",
    hospitalName: "Quantum Foundation Blood Lab",
    district: "Dhaka",
    address: "31/V, Shilpacharya Zainul Abedin Sarak, Shantinagar, Dhaka",
    phone: "01714-010869",
    emergencyHotline: "01714-010869",
    inventory: {
      "A+": 42, "A-": 8, "B+": 55, "B-": 9, "AB+": 16, "AB-": 4, "O+": 68, "O-": 7
    },
    lastUpdated: "2 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-303",
    hospitalName: "Red Crescent Blood Center",
    district: "Dhaka",
    address: "7/5, Aurangzeb Road, Mohammadpur, Dhaka",
    phone: "02-9139988",
    emergencyHotline: "01811-458524",
    inventory: {
      "A+": 28, "A-": 5, "B+": 32, "B-": 2, "AB+": 11, "AB-": 2, "O+": 45, "O-": 3
    },
    lastUpdated: "12 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-304",
    hospitalName: "Dhaka Medical College Hospital (DMCH) Blood Transfusion Dept",
    district: "Dhaka",
    address: "Secretariat Road, Ramna, Dhaka-1000",
    phone: "02-55165088",
    emergencyHotline: "01715-998877",
    inventory: {
      "A+": 35, "A-": 6, "B+": 48, "B-": 5, "AB+": 14, "AB-": 3, "O+": 52, "O-": 4
    },
    lastUpdated: "8 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-305",
    hospitalName: "Chittagong Medical College (CMCH) Blood Bank",
    district: "Chittagong",
    address: "KB Fazlul Kader Road, Panchlaish, Chittagong",
    phone: "031-619400",
    emergencyHotline: "01819-382211",
    inventory: {
      "A+": 22, "A-": 3, "B+": 29, "B-": 4, "AB+": 8, "AB-": 1, "O+": 34, "O-": 2
    },
    lastUpdated: "15 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-306",
    hospitalName: "Sylhet MAG Osmani Medical Hospital Blood Center",
    district: "Sylhet",
    address: "Medical Road, Medical Area, Sylhet-3100",
    phone: "0821-713289",
    emergencyHotline: "01711-908070",
    inventory: {
      "A+": 16, "A-": 2, "B+": 20, "B-": 2, "AB+": 6, "AB-": 1, "O+": 25, "O-": 2
    },
    lastUpdated: "18 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-307",
    hospitalName: "Rajshahi Medical College Hospital Blood Bank",
    district: "Rajshahi",
    address: "Laxmipur, Rajshahi-6000",
    phone: "0721-772150",
    emergencyHotline: "01712-887766",
    inventory: {
      "A+": 19, "A-": 3, "B+": 25, "B-": 3, "AB+": 7, "AB-": 1, "O+": 28, "O-": 2
    },
    lastUpdated: "20 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-308",
    hospitalName: "Khulna Medical College Hospital Blood Transfusion Unit",
    district: "Khulna",
    address: "Boyra Main Road, Khulna-9000",
    phone: "041-760350",
    emergencyHotline: "01713-776655",
    inventory: {
      "A+": 14, "A-": 2, "B+": 18, "B-": 2, "AB+": 5, "AB-": 0, "O+": 21, "O-": 1
    },
    lastUpdated: "25 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-309",
    hospitalName: "Barisal Sher-e-Bangla Medical College (SBMC) Blood Bank",
    district: "Barisal",
    address: "Band Road, Barisal-8200",
    phone: "0431-217354",
    emergencyHotline: "01714-665544",
    inventory: {
      "A+": 12, "A-": 1, "B+": 15, "B-": 1, "AB+": 4, "AB-": 0, "O+": 17, "O-": 1
    },
    lastUpdated: "30 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-310",
    hospitalName: "Rangpur Medical College Hospital Blood Center",
    district: "Rangpur",
    address: "Medical East Gate, Rangpur-5400",
    phone: "0521-62288",
    emergencyHotline: "01715-554433",
    inventory: {
      "A+": 15, "A-": 2, "B+": 17, "B-": 2, "AB+": 6, "AB-": 1, "O+": 20, "O-": 1
    },
    lastUpdated: "22 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-311",
    hospitalName: "Mymensingh Medical College Hospital Blood Bank",
    district: "Mymensingh",
    address: "Charpara, Mymensingh-2200",
    phone: "091-66063",
    emergencyHotline: "01716-443322",
    inventory: {
      "A+": 17, "A-": 2, "B+": 21, "B-": 3, "AB+": 7, "AB-": 1, "O+": 26, "O-": 2
    },
    lastUpdated: "14 mins ago",
    operates24x7: true,
    verifiedBadge: true
  },
  {
    id: "bank-312",
    hospitalName: "Shaheed Ziaur Rahman Medical College (SZMCH) Blood Bank",
    district: "Bogra",
    address: "Silimpur, Bogra-5800",
    phone: "051-69004",
    emergencyHotline: "01717-332211",
    inventory: {
      "A+": 13, "A-": 1, "B+": 16, "B-": 2, "AB+": 5, "AB-": 0, "O+": 19, "O-": 1
    },
    lastUpdated: "16 mins ago",
    operates24x7: true,
    verifiedBadge: true
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, donorId: "donor-106", name: "Sabbir Hossain", bloodGroup: "O+", district: "Dhaka", totalDonations: 19, points: 6100, badgeTitle: "Diamond Angel", avatarBg: "bg-red-600" },
  { rank: 2, donorId: "donor-101", name: "Dr. Rafiqul Islam", bloodGroup: "O-", district: "Dhaka", totalDonations: 14, points: 4200, badgeTitle: "Gold Hero", avatarBg: "bg-amber-600" },
  { rank: 3, donorId: "donor-103", name: "Tanvir Ahmed Bhuiyan", bloodGroup: "B+", district: "Chittagong", totalDonations: 11, points: 3500, badgeTitle: "Gold Hero", avatarBg: "bg-emerald-600" },
  { rank: 4, donorId: "donor-105", name: "Shahnaz Parveen", bloodGroup: "B-", district: "Rajshahi", totalDonations: 9, points: 2900, badgeTitle: "Gold Hero", avatarBg: "bg-purple-600" },
  { rank: 5, donorId: "donor-102", name: "Nusrat Jahan", bloodGroup: "A+", district: "Dhaka", totalDonations: 8, points: 2600, badgeTitle: "Silver Lifesaver", avatarBg: "bg-blue-600" },
  { rank: 6, donorId: "donor-104", name: "Mahmud Hasan", bloodGroup: "AB-", district: "Sylhet", totalDonations: 6, points: 2100, badgeTitle: "Silver Lifesaver", avatarBg: "bg-teal-600" }
];

export const INITIAL_CAMPS: CampDrive[] = [
  {
    id: "camp-401",
    title: "National Blood Donation Drive @ Dhaka University TSC",
    organizer: "Quantum Foundation & BADHAN DU",
    location: "TSC Auditorium, Dhaka University Campus",
    district: "Dhaka",
    date: "2026-08-15",
    time: "09:00 AM - 05:00 PM",
    expectedDonors: 300,
    registeredCount: 184,
    contactPhone: "01714-010869",
    description: "Annual voluntary blood donation drive for Thalassemia patients and emergency ICU stocks in Dhaka hospitals. Free health checkup and hemoglobin test provided."
  },
  {
    id: "camp-402",
    title: "Chittagong Youth LifeSaver Camp",
    organizer: "Red Crescent Youth Chittagong",
    location: "Chittagong Press Club Hall, Jamal Khan",
    district: "Chittagong",
    date: "2026-08-20",
    time: "10:00 AM - 04:00 PM",
    expectedDonors: 150,
    registeredCount: 92,
    contactPhone: "01811-458524",
    description: "Emergency blood collection drive to rebuild hospital blood bank stocks after recent monsoon floods."
  },
  {
    id: "camp-403",
    title: "Sylhet University Blood Donation Camp",
    organizer: "SUST Blood Donors Club",
    location: "SUST Main Auditorium, Kumargaon",
    district: "Sylhet",
    date: "2026-08-25",
    time: "10:00 AM - 04:00 PM",
    expectedDonors: 100,
    registeredCount: 65,
    contactPhone: "01711-908070",
    description: "Join SUST students in donating blood to save critical surgery patients at Osmani Medical College Hospital."
  }
];

export const INITIAL_VOUCHERS: DiscountVoucher[] = [
  {
    id: "vouch-1",
    title: "25% Discount on Complete Blood Count (CBC) & Health Check",
    partnerName: "Popular Diagnostic Centre BD",
    category: "Diagnostic",
    pointsCost: 500,
    discountValue: "25% OFF",
    code: "POPULAR-BLOOD-25",
    expiresAt: "2026-12-31"
  },
  {
    id: "vouch-2",
    title: "Free Lipid Profile & Diabetes Screening Pass",
    partnerName: "LabAid Diagnostic & Hospital",
    category: "Health Check",
    pointsCost: 1000,
    discountValue: "FREE PASS",
    code: "LABAID-HERO-FREE",
    expiresAt: "2026-12-31"
  },
  {
    id: "vouch-3",
    title: "15% Off All Prescribed Medicines",
    partnerName: "Lazz Pharma Chain",
    category: "Pharmacy",
    pointsCost: 300,
    discountValue: "15% OFF",
    code: "LAZZ-LIFESAVER-15",
    expiresAt: "2026-12-31"
  },
  {
    id: "vouch-4",
    title: "Free Coffee & Snack Treat for Donors",
    partnerName: "Crimson Cup Coffee BD",
    category: "Lifestyle",
    pointsCost: 400,
    discountValue: "FREE DRINK",
    code: "CRIMSON-BLOOD-HERO",
    expiresAt: "2026-12-31"
  }
];

export const SAFE_DONATION_GUIDELINES = {
  bn: {
    eligibilityRules: [
      "বয়স: ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে।",
      "ওজন: কমপক্ষে ৫০ কেজি (১১০ পাউন্ড) হতে হবে।",
      "হিমোগ্লোবিন: পুরুষদের জন্য ১২.৫ g/dL এবং মহিলাদের জন্য ১২.০ g/dL বা তার বেশি।",
      "রক্তদানের ব্যবধান: পূর্ববর্তী রক্তদানের পর অন্তত ৯০ দিন (৩ মাস) অতিবাহিত হতে হবে।",
      "শারীরিক সুস্থতা: জ্বর, সর্দি, অ্যান্টিবায়োটিক সেবন বা উচ্চ রক্তচাপ অনিয়ন্ত্রিত থাকা যাবে না।",
      "ট্যাটু বা সার্জারি: গত ৬ মাসের মধ্যে কোনো বড় সার্জারি বা ট্যাটু আকানো থাকা যাবে না।"
    ],
    preDonationSteps: [
      "রক্তদানের আগের রাতে অন্তত ৭-৮ ঘণ্টা পর্যাপ্ত ঘুমান।",
      "রক্তদানের ৩-৪ ঘণ্টা আগে পুষ্টিকর খাবার ও প্রচুর পানি/ফলের রস পান করুন।",
      "রক্তদানের আগের ২৪ ঘণ্টায় অ্যালকোহল বা ধূমপান পরিহার করুন।",
      "লৌহসমৃদ্ধ খাবার (যেমন: পালং শাক, কলিজা, কলার মোচা) গ্রহণ স্বাস্থ্যকর।"
    ],
    postDonationSteps: [
      "রক্তদানের পর অন্তত ১০-১৫ মিনিট বিশ্রাম কক্ষে শুয়ে থাকুন।",
      "প্রচুর পরিমাণ পানি, ডাবের পানি বা স্যালাইন পান করুন।",
      "পরবর্তী ৪-৫ ঘণ্টার মধ্যে ভারী ওজন তোলা বা কঠোর ব্যায়াম করবেন না।",
      "মাথা ঘোরানো বোধ হলে সঙ্গে সঙ্গে শুয়ে পা সামান্য উঁচুতে রাখুন।"
    ],
    mythsVsFacts: [
      { myth: "রক্ত দিলে শরীর দুর্বল হয়ে পড়ে বা স্থায়ী ক্ষতি হয়।", fact: "মিথ্যা! রক্তদানের কয়েক ঘণ্টার মধ্যেই শরীর তরল তৈরি করে এবং ২১ দিনের মধ্যে লোহিত রক্তকণিকা সম্পূর্ণ পুনরায় তৈরি হয়।" },
      { myth: "মহিলারা রক্ত দিতে পারেন না।", fact: "ভুল ধারণা! উপযুক্ত ওজন (৫০+ কেজি) ও হিমোগ্লোবিন থাকলে মহিলারা প্রতি ৪ মাস পর পর নিরাপদে রক্ত দিতে পারেন।" },
      { myth: "রক্তদানের সময় রোগ সংক্রমিত হতে পারে।", fact: "সম্পূর্ণ সুরক্ষিত! রক্তদানে প্রতিটি দাতার জন্য ওয়ান-টাইম স্টেরাইল সুই ও ব্যাগ ব্যবহার করা হয়।" }
    ]
  },
  en: {
    eligibilityRules: [
      "Age: Between 18 and 65 years.",
      "Weight: Minimum 50 kg (110 lbs).",
      "Hemoglobin: At least 12.5 g/dL for males and 12.0 g/dL for females.",
      "Donation Interval: Minimum 90 days (3 months) since last blood donation.",
      "Health Status: No active fever, flu, infection, or uncontrolled hypertension.",
      "Tattoos & Surgery: No major surgery, blood transfusion, or tattoo within last 6 months."
    ],
    preDonationSteps: [
      "Get 7-8 hours of sound sleep the night before donation.",
      "Drink plenty of water/juices and eat a healthy meal 3 hours prior.",
      "Avoid smoking or alcohol for at least 24 hours before donating.",
      "Eat iron-rich foods like spinach, lentils, dates, and pomegranates."
    ],
    postDonationSteps: [
      "Rest lying down for 10-15 minutes immediately after donation.",
      "Drink fluids (coconut water, saline, juices) to replace volume.",
      "Avoid heavy physical strain, lifting, or vigorous exercise for 5 hours.",
      "If feeling dizzy, lie down immediately and elevate your legs."
    ],
    mythsVsFacts: [
      { myth: "Donating blood makes you physically weak forever.", fact: "Myth! Fluid volume replenishes within hours, and red blood cells fully regenerate within 21 days." },
      { myth: "Women cannot donate blood.", fact: "Myth! Any female with 50+ kg weight and healthy Hb level can safely donate every 4 months." },
      { myth: "You can catch infections while donating blood.", fact: "Myth! Sterile, single-use disposable needles and collection bags are used for every single donor." }
    ]
  }
};
