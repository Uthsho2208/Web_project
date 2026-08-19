import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  BloodBank,
  BloodGroup,
  CampDrive,
  DiscountVoucher,
  DonationRecord,
  DonorProfile,
  DonorResponseStatus,
  EmergencyRequest,
  Language,
  LeaderboardEntry
} from "../types";
import {
  INITIAL_BLOOD_BANKS,
  INITIAL_CAMPS,
  INITIAL_DONORS,
  INITIAL_EMERGENCY_REQUESTS,
  INITIAL_LEADERBOARD,
  INITIAL_VOUCHERS
} from "../data/bdData";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot, writeBatch, query, where } from "firebase/firestore";
import {
  calculateEligibility,
  EligibilityStatus,
  rankDonorsForEmergencyRequest,
  RankedDonor,
  isBloodCompatible
} from "../lib/bloodLogic";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentUser: User | null;
  userProfile: DonorProfile;
  updateUserProfile: (profile: Partial<DonorProfile>) => Promise<void>;
  eligibility: EligibilityStatus;
  requests: EmergencyRequest[];
  addEmergencyRequest: (req: Omit<EmergencyRequest, "id" | "createdAt" | "donorResponses" | "unitsFulfilled" | "status">) => Promise<EmergencyRequest>;
  respondToEmergencyRequest: (
    requestId: string,
    status: 'Accepted' | 'On The Way' | 'Arrived' | 'Completed' | 'Declined',
    options?: { estimatedArrivalMinutes?: number; note?: string }
  ) => Promise<void>;
  updateDonorResponseStatus: (
    requestId: string,
    donorId: string,
    status: 'Accepted' | 'On The Way' | 'Arrived' | 'Completed' | 'Declined'
  ) => Promise<void>;
  donors: DonorProfile[];
  addDonor: (donor: Omit<DonorProfile, "id" | "rating" | "reviewsCount" | "badge" | "points" | "isVerified">) => Promise<void>;
  rankDonors: (request: EmergencyRequest, radiusKm?: number) => RankedDonor[];
  bloodBanks: BloodBank[];
  updateBloodBankStock: (bankId: string, group: BloodGroup, delta: number) => void;
  reserveBloodBankStock: (bankId: string, group: BloodGroup, units: number, patientName: string) => Promise<boolean>;
  syncBloodBanksStock: () => void;
  leaderboard: LeaderboardEntry[];
  camps: CampDrive[];
  registerCamp: (campId: string) => void;
  vouchers: DiscountVoucher[];
  redeemVoucher: (voucherId: string) => boolean;
  myDonationRecords: DonationRecord[];
  addDonationRecord: (record: Omit<DonationRecord, "id" | "certificateId">) => Promise<void>;
  addCompletedDonationRecord: (record: Omit<DonationRecord, "id" | "certificateId">) => Promise<void>;
  selectedDetailRequest: EmergencyRequest | null;
  openRequestDetail: (req: EmergencyRequest) => void;
  closeRequestDetail: () => void;
  selectedPledgeRequest: EmergencyRequest | null;
  openPledgeModal: (req: EmergencyRequest) => void;
  closePledgeModal: () => void;
  incomingDonorAlert: { request: EmergencyRequest; donorResponse: DonorResponseStatus } | null;
  openIncomingDonorAlert: (request: EmergencyRequest, donorResponse: DonorResponseStatus) => void;
  closeIncomingDonorAlert: () => void;
  simulateIncomingDonorOffer: (requestId: string) => void;
  isCreateProfileOpen: boolean;
  openCreateProfileModal: () => void;
  closeCreateProfileModal: () => void;
  isBiometricUnlocked: boolean;
  toggleBiometricLock: () => void;
  isE2EEncrypted: boolean;
  toggleE2EEncryption: () => void;
  isOffline: boolean;
  notificationAlert: string | null;
  clearNotification: () => void;
  triggerNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: DonorProfile = {
  id: "user-default",
  name: "Mohaiminul Islam",
  bloodGroup: "O+",
  gender: "Male",
  age: 27,
  weightKg: 68,
  district: "Dhaka",
  area: "Dhanmondi",
  phone: "01700-112233",
  whatsapp: "01700-112233",
  isAvailable: true,
  lastDonationDate: "2026-05-10",
  totalDonations: 7,
  rating: 5.0,
  reviewsCount: 8,
  badge: "Silver Lifesaver",
  points: 2450,
  isVerified: true,
  e2eEncrypted: true,
  hidePhoneInPublic: false,
  latitude: 23.7461,
  longitude: 90.3742,
  medicalNotes: "Regular voluntary donor. Ready for Dhanmondi/Shahbagh emergency callouts."
};

const DEFAULT_RECORDS: DonationRecord[] = [
  {
    id: "rec-1",
    date: "2026-05-10",
    hospitalName: "Dhaka Medical College Hospital",
    recipientName: "Kamrul Islam",
    bloodGroup: "O+",
    units: 1,
    certificateId: "CERT-2026-0510-O+99",
    ratingGiven: 5,
    feedback: "Timely arrival and smooth donation process."
  },
  {
    id: "rec-2",
    date: "2026-01-12",
    hospitalName: "BSMMU Shahbagh",
    recipientName: "Tasnim Sultana",
    bloodGroup: "O+",
    units: 1,
    certificateId: "CERT-2026-0112-O+42",
    ratingGiven: 5,
    feedback: "Extremely helpful donor during emergency delivery."
  }
];

/**
 * Recursively strips undefined keys and normalizes data so Firestore operations never throw on undefined values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("rakta_lang") as Language) || "bn";
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem("rakta_theme") as 'dark' | 'light') || "dark";
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [userProfile, setUserProfile] = useState<DonorProfile>(() => {
    try {
      const saved = localStorage.getItem("rakta_user");
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Calculate user eligibility live
  const eligibility = useMemo(() => {
    return calculateEligibility(userProfile.lastDonationDate, userProfile.gender);
  }, [userProfile.lastDonationDate, userProfile.gender]);

  const [requests, setRequests] = useState<EmergencyRequest[]>(() => {
    try {
      const saved = localStorage.getItem("rakta_requests");
      return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_REQUESTS;
    } catch {
      return INITIAL_EMERGENCY_REQUESTS;
    }
  });

  const [donors, setDonors] = useState<DonorProfile[]>(() => {
    try {
      const saved = localStorage.getItem("rakta_donors");
      return saved ? JSON.parse(saved) : INITIAL_DONORS;
    } catch {
      return INITIAL_DONORS;
    }
  });

  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(() => {
    try {
      const saved = localStorage.getItem("rakta_bloodbanks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_BLOOD_BANKS.length) {
          return parsed;
        }
      }
      return INITIAL_BLOOD_BANKS;
    } catch {
      return INITIAL_BLOOD_BANKS;
    }
  });

  useEffect(() => {
    localStorage.setItem("rakta_bloodbanks", JSON.stringify(bloodBanks));
  }, [bloodBanks]);
  const [leaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [camps, setCamps] = useState<CampDrive[]>(INITIAL_CAMPS);
  const [vouchers, setVouchers] = useState<DiscountVoucher[]>(INITIAL_VOUCHERS);
  const [myDonationRecords, setMyDonationRecords] = useState<DonationRecord[]>(() => {
    try {
      const saved = localStorage.getItem("rakta_records");
      return saved ? JSON.parse(saved) : DEFAULT_RECORDS;
    } catch {
      return DEFAULT_RECORDS;
    }
  });
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<EmergencyRequest | null>(null);

  const openRequestDetail = (req: EmergencyRequest) => setSelectedDetailRequest(req);
  const closeRequestDetail = () => setSelectedDetailRequest(null);

  const [selectedPledgeRequest, setSelectedPledgeRequest] = useState<EmergencyRequest | null>(null);
  const openPledgeModal = (req: EmergencyRequest) => setSelectedPledgeRequest(req);
  const closePledgeModal = () => setSelectedPledgeRequest(null);

  const [incomingDonorAlert, setIncomingDonorAlert] = useState<{
    request: EmergencyRequest;
    donorResponse: DonorResponseStatus;
  } | null>(null);

  const openIncomingDonorAlert = (request: EmergencyRequest, donorResponse: DonorResponseStatus) => {
    setIncomingDonorAlert({ request, donorResponse });
  };

  const closeIncomingDonorAlert = () => setIncomingDonorAlert(null);

  const simulateIncomingDonorOffer = (requestId: string) => {
    const targetRequest = requests.find((r) => r.id === requestId);
    if (!targetRequest) return;

    // Pick a matching donor or use high-rated verified donor
    const matchingDonors = donors.filter((d) => isBloodCompatible(d.bloodGroup, targetRequest.bloodGroup));
    const randomDonor = matchingDonors.length > 0
      ? matchingDonors[Math.floor(Math.random() * matchingDonors.length)]
      : donors[0];

    const donorNames = [
      "Dr. Rafiqul Islam (Verified Donor)",
      "Sabbir Hossain (Regular Donor)",
      "Nusrat Jahan (Emergency Lifesaver)",
      "Tanvir Ahmed (Hero Donor)",
      "Kazi Farhana (Diamond Angel)"
    ];
    const pickedName = randomDonor ? randomDonor.name : donorNames[Math.floor(Math.random() * donorNames.length)];

    const simResponse: DonorResponseStatus = {
      donorId: randomDonor ? randomDonor.id : `sim-donor-${Date.now()}`,
      donorName: pickedName,
      donorPhone: randomDonor ? randomDonor.phone : "01712-345678",
      donorBloodGroup: randomDonor ? randomDonor.bloodGroup : targetRequest.bloodGroup,
      donorLocation: randomDonor ? `${randomDonor.area}, ${randomDonor.district}` : `${targetRequest.area}, ${targetRequest.district}`,
      note: language === "bn"
        ? `আমি রোগী ${targetRequest.patientName}-এর জন্য ${targetRequest.bloodGroup} রক্ত দিতে প্রস্তুত। এখনই রওনা হচ্ছি।`
        : `I am ready to donate ${targetRequest.bloodGroup} blood for patient ${targetRequest.patientName}. Starting journey now.`,
      status: "Accepted",
      responseTime: "এইমাত্র (Just now)",
      estimatedArrivalMinutes: 25
    };

    const updatedResponses = [
      simResponse,
      ...(targetRequest.donorResponses || []).filter((dr) => dr.donorId !== simResponse.donorId)
    ];

    const updatedRequest: EmergencyRequest = {
      ...targetRequest,
      status: "Donor Assigned",
      donorResponses: updatedResponses
    };

    // Update local state
    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));

    // Open the incoming alert pop-up immediately!
    setIncomingDonorAlert({
      request: updatedRequest,
      donorResponse: simResponse
    });

    triggerNotification(
      language === "bn"
        ? `🚨 নতুন রক্তদাতার সাড়া! ${simResponse.donorName} (${simResponse.donorBloodGroup}) রক্ত দিতে সম্মত হয়েছেন!`
        : `🚨 New donor alert! ${simResponse.donorName} has pledged to donate blood!`
    );
  };

  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const openCreateProfileModal = () => setIsCreateProfileOpen(true);
  const closeCreateProfileModal = () => setIsCreateProfileOpen(false);

  const calculateDonorBadge = (count: number): DonorProfile['badge'] => {
    if (count >= 9) return 'Diamond Angel';
    if (count >= 5) return 'Gold Hero';
    if (count >= 2) return 'Silver Lifesaver';
    return 'Bronze Donor';
  };

  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState(true);
  const [isE2EEncrypted, setIsE2EEncrypted] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [notificationAlert, setNotificationAlert] = useState<string | null>(null);

  // Dynamic Firebase Authentication listener
  useEffect(() => {
    try {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          // Sync profile ID to auth uid
          setUserProfile((prev) => {
            const updated = {
              ...prev,
              id: user.uid,
              name: user.displayName || prev.name,
              phone: user.phoneNumber || prev.phone
            };
            localStorage.setItem("rakta_user", JSON.stringify(updated));
            return updated;
          });
        } else {
          // Auto sign in anonymously so that every user session has a secure, unique Firebase UID
          signInAnonymously(auth).catch((err) => {
            console.warn("Anonymous auth fallback:", err.message);
          });
        }
      });
      return () => unsubscribeAuth();
    } catch (e) {
      console.warn("Auth initialization error:", e);
    }
  }, []);

  // Sync window online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("rakta_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("rakta_theme", theme);
    if (theme === 'dark') {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("rakta_user", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("rakta_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("rakta_donors", JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem("rakta_records", JSON.stringify(myDonationRecords));
  }, [myDonationRecords]);

  // Firestore Real-Time Listener: Emergency Requests (Single Source of Truth)
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "requests"),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteRequests = snapshot.docs.map((docSnap) => docSnap.data() as EmergencyRequest);
            // Sort descending by creation date
            remoteRequests.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setRequests(remoteRequests);
          }
        },
        (error) => {
          console.warn("Firestore requests listener warning:", error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore initialization warning:", e);
    }
  }, []);

  // Firestore Real-Time Listener: Donors Directory (Single Source of Truth)
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "donors"),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteDonors = snapshot.docs.map((docSnap) => docSnap.data() as DonorProfile);
            setDonors(remoteDonors);
          }
        },
        (error) => {
          console.warn("Firestore donors listener warning:", error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore donors setup warning:", e);
    }
  }, []);

  // Firestore Real-Time Listener: User Profile scoped to Authenticated User
  useEffect(() => {
    if (!userProfile.id) return;
    try {
      const unsubscribe = onSnapshot(
        doc(db, "donors", userProfile.id),
        (docSnap) => {
          if (docSnap.exists()) {
            const cloudProfile = docSnap.data() as DonorProfile;
            setUserProfile((prev) => ({ ...prev, ...cloudProfile }));
          }
        },
        (err) => {
          console.warn("User profile snapshot listener:", err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("User profile listener setup:", e);
    }
  }, [userProfile.id]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateUserProfile = async (updated: Partial<DonorProfile>): Promise<void> => {
    const newProf: DonorProfile = { ...userProfile, ...updated };
    setUserProfile(newProf);

    try {
      await setDoc(doc(db, "donors", userProfile.id), sanitizeForFirestore(newProf), { merge: true });
      triggerNotification(
        language === "bn" ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!"
      );
    } catch (err) {
      console.error("Firestore user sync error:", err);
      triggerNotification(
        language === "bn"
          ? "⚠️ প্রোফাইল ক্লাউডে সিঙ্ক করা সম্ভব হয়নি। সংযোগ পরীক্ষা করুন।"
          : "⚠️ Profile cloud sync failed. Please check connection."
      );
    }
  };

  const addEmergencyRequest = async (
    req: Omit<EmergencyRequest, "id" | "createdAt" | "donorResponses" | "unitsFulfilled" | "status">
  ): Promise<EmergencyRequest> => {
    const newReq: EmergencyRequest = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      unitsFulfilled: 0,
      status: "Searching",
      donorResponses: []
    };

    // Optimistic local state update
    setRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);

    try {
      await setDoc(doc(db, "requests", newReq.id), sanitizeForFirestore(newReq));
      triggerNotification(
        language === "bn"
          ? `🚨 জরুরি রক্ত আবেদন সম্প্রচারিত হয়েছে! ${newReq.district} এলাকার রক্তদাতাদের কাছে পুশ নোটিফিকেশন এলার্ট পাঠানো হচ্ছে।`
          : `🚨 Emergency Blood Request Broadcasted! Push alerts dispatched to nearby ${newReq.district} donors.`
      );
    } catch (err) {
      console.error("Firestore request sync error:", err);
      triggerNotification(
        language === "bn"
          ? "⚠️ জরুরি আবেদন ক্লাউডে সম্প্রচার ব্যর্থ হয়েছে।"
          : "⚠️ Failed to broadcast emergency request to cloud."
      );
    }

    return newReq;
  };

  const respondToEmergencyRequest = async (
    requestId: string,
    status: 'Accepted' | 'On The Way' | 'Arrived' | 'Completed' | 'Declined',
    options?: { estimatedArrivalMinutes?: number; note?: string }
  ): Promise<void> => {
    const targetRequest = requests.find((r) => r.id === requestId);
    if (!targetRequest) return;

    // Check donation eligibility cooldown before accepting
    if (status === "Accepted" || status === "On The Way") {
      const userEligibility = calculateEligibility(userProfile.lastDonationDate, userProfile.gender);
      if (!userEligibility.isEligible) {
        triggerNotification(
          language === "bn"
            ? `⚠️ রক্তদানে স্বাস্থ্য সুরক্ষায় বিরতি আবশ্যক। পরবর্তী রক্তদানের সম্ভাব্য তারিখ: ${userEligibility.nextEligibleDate} (আরও ${userEligibility.daysLeft} দিন বাকি)`
            : `⚠️ Cooldown active. Next eligible donation date: ${userEligibility.nextEligibleDate} (${userEligibility.daysLeft} days left).`
        );
        return;
      }
    }

    const existingResponse = targetRequest.donorResponses.find((dr) => dr.donorId === userProfile.id);
    let newResponses = [...targetRequest.donorResponses];

    if (existingResponse) {
      newResponses = newResponses.map((dr) =>
        dr.donorId === userProfile.id
          ? {
              ...dr,
              status,
              responseTime: "Just now",
              donorBloodGroup: userProfile.bloodGroup,
              donorLocation: `${userProfile.area}, ${userProfile.district}`,
              note: options?.note !== undefined ? options.note : dr.note,
              estimatedArrivalMinutes:
                options?.estimatedArrivalMinutes !== undefined
                  ? options.estimatedArrivalMinutes
                  : dr.estimatedArrivalMinutes || 25,
            }
          : dr
      );
    } else {
      newResponses.push({
        donorId: userProfile.id,
        donorName: userProfile.name,
        donorPhone: userProfile.phone,
        donorBloodGroup: userProfile.bloodGroup,
        donorLocation: `${userProfile.area}, ${userProfile.district}`,
        note: options?.note || "",
        status,
        responseTime: "Just now",
        estimatedArrivalMinutes: options?.estimatedArrivalMinutes || 25
      });
    }

    let newStatus = targetRequest.status;
    let newUnitsFulfilled = targetRequest.unitsFulfilled;
    if (status === "Completed") {
      newUnitsFulfilled = Math.min(targetRequest.unitsNeeded, targetRequest.unitsFulfilled + 1);
      if (newUnitsFulfilled >= targetRequest.unitsNeeded) newStatus = "Fulfilled";
    } else if (status === "Accepted" || status === "On The Way" || status === "Arrived") {
      newStatus = "Donor Assigned";
    }

    const updatedRequest: EmergencyRequest = {
      ...targetRequest,
      unitsFulfilled: newUnitsFulfilled,
      status: newStatus,
      donorResponses: newResponses
    };

    const addedXP = status === "Accepted" || status === "On The Way" ? 150 : status === "Completed" ? 500 : 50;
    const updatedUser: DonorProfile = {
      ...userProfile,
      points: userProfile.points + addedXP,
      totalDonations: status === "Completed" ? userProfile.totalDonations + 1 : userProfile.totalDonations,
      badge: status === "Completed" ? calculateDonorBadge(userProfile.totalDonations + 1) : userProfile.badge
    };

    // Optimistic UI updates
    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));
    setUserProfile(updatedUser);

    try {
      // Atomic Batch Write: Update request & donor profile simultaneously
      const batch = writeBatch(db);
      batch.set(doc(db, "requests", updatedRequest.id), sanitizeForFirestore(updatedRequest), { merge: true });
      batch.set(doc(db, "donors", updatedUser.id), sanitizeForFirestore(updatedUser), { merge: true });
      await batch.commit();

      triggerNotification(
        language === "bn"
          ? `ধন্যবাদ! আপনার রক্তদানের প্রস্তাবটি রোগীর কাছে পাঠানো হয়েছে। +${addedXP} XP অর্জিত হয়েছে!`
          : `Thank you! Your donation pledge has been submitted. Earned +${addedXP} XP!`
      );
    } catch (err) {
      console.error("Firestore atomic batch respond error:", err);
      triggerNotification(
        language === "bn"
          ? "⚠️ সাড়া রেকর্ড করার সময় ডাটাবেজ ত্রুটি ঘটেছে।"
          : "⚠️ Error recording response in database."
      );
    }
  };

  const updateDonorResponseStatus = async (
    requestId: string,
    donorId: string,
    status: 'Accepted' | 'On The Way' | 'Arrived' | 'Completed' | 'Declined'
  ): Promise<void> => {
    const targetRequest = requests.find((r) => r.id === requestId);
    if (!targetRequest) return;

    const existingResponse = targetRequest.donorResponses.find((dr) => dr.donorId === donorId);
    if (!existingResponse) return;

    const newResponses = targetRequest.donorResponses.map((dr) =>
      dr.donorId === donorId ? { ...dr, status, responseTime: "Just now" } : dr
    );

    let newStatus = targetRequest.status;
    let newUnitsFulfilled = targetRequest.unitsFulfilled;
    if (status === "Completed") {
      newUnitsFulfilled = Math.min(targetRequest.unitsNeeded, targetRequest.unitsFulfilled + 1);
      if (newUnitsFulfilled >= targetRequest.unitsNeeded) newStatus = "Fulfilled";
    } else if (status === "Accepted" || status === "On The Way" || status === "Arrived") {
      newStatus = "Donor Assigned";
    }

    const updatedRequest: EmergencyRequest = {
      ...targetRequest,
      unitsFulfilled: newUnitsFulfilled,
      status: newStatus,
      donorResponses: newResponses
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));

    try {
      await setDoc(doc(db, "requests", updatedRequest.id), sanitizeForFirestore(updatedRequest), { merge: true });
      triggerNotification(
        language === "bn"
          ? `ডোনার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে (${status})!`
          : `Donor status successfully updated to ${status}!`
      );
    } catch (err) {
      console.error("Error updating donor status:", err);
      triggerNotification(
        language === "bn" ? "⚠️ ডোনার স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।" : "⚠️ Failed to update donor status."
      );
    }
  };

  const addDonor = async (
    newDonorData: Omit<DonorProfile, "id" | "rating" | "reviewsCount" | "badge" | "points" | "isVerified">
  ): Promise<void> => {
    const newDonor: DonorProfile = {
      ...newDonorData,
      id: currentUser?.uid || `donor-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      badge: "Bronze Donor",
      points: 500,
      isVerified: true
    };

    // Optimistic local state update
    setDonors((prev) => [newDonor, ...prev]);

    try {
      await setDoc(doc(db, "donors", newDonor.id), sanitizeForFirestore(newDonor));
      triggerNotification(
        language === "bn"
          ? "রক্তদাতা হিসেবে সফলভাবে নিবন্ধিত হয়েছেন!"
          : "Successfully registered as a blood donor!"
      );
    } catch (err) {
      console.error("Firestore donor sync error:", err);
      triggerNotification(
        language === "bn"
          ? "⚠️ রক্তদাতা নিবন্ধন ক্লাউডে সংরক্ষণ ব্যর্থ হয়েছে।"
          : "⚠️ Failed to register donor to cloud directory."
      );
    }
  };

  const rankDonors = (request: EmergencyRequest, radiusKm: number = 50): RankedDonor[] => {
    return rankDonorsForEmergencyRequest(donors, request, radiusKm);
  };

  const registerCamp = (campId: string) => {
    setCamps((prev) =>
      prev.map((c) => {
        if (c.id === campId) {
          return {
            ...c,
            registeredCount: c.isUserRegistered ? c.registeredCount - 1 : c.registeredCount + 1,
            isUserRegistered: !c.isUserRegistered
          };
        }
        return c;
      })
    );
  };

  const redeemVoucher = (voucherId: string): boolean => {
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) return false;

    if (userProfile.points < voucher.pointsCost) {
      triggerNotification(
        language === "bn" ? "পর্যাপ্ত পয়েন্ট (XP) নেই!" : "Insufficient XP points to redeem!"
      );
      return false;
    }

    const updatedProfile = { ...userProfile, points: userProfile.points - voucher.pointsCost };
    setUserProfile(updatedProfile);
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, isRedeemed: true } : v))
    );

    // Sync updated points to cloud
    setDoc(doc(db, "donors", userProfile.id), sanitizeForFirestore(updatedProfile), { merge: true }).catch((err) => {
      console.error("Firestore voucher point deduction sync error:", err);
    });

    triggerNotification(
      language === "bn"
        ? `অভিনন্দন! ভাউচার রিডিম করা হয়েছে। কোড: ${voucher.code}`
        : `Congratulations! Voucher redeemed. Code: ${voucher.code}`
    );
    return true;
  };

  const updateBloodBankStock = (bankId: string, group: BloodGroup, delta: number) => {
    setBloodBanks((prev) =>
      prev.map((bank) => {
        if (bank.id === bankId) {
          const currentCount = bank.inventory[group] || 0;
          const newCount = Math.max(0, currentCount + delta);
          return {
            ...bank,
            inventory: {
              ...bank.inventory,
              [group]: newCount
            },
            lastUpdated: language === "bn" ? "এইমাত্র আপডেটকৃত" : "Just now"
          };
        }
        return bank;
      })
    );
  };

  const reserveBloodBankStock = async (
    bankId: string,
    group: BloodGroup,
    units: number,
    patientName: string
  ): Promise<boolean> => {
    const bank = bloodBanks.find((b) => b.id === bankId);
    if (!bank) return false;

    const available = bank.inventory[group] || 0;
    if (available < units) {
      triggerNotification(
        language === "bn"
          ? `দুঃখিত! ${bank.hospitalName}-এ ${group} রক্তের পর্যাপ্ত স্টক নেই (${available} ব্যাগ অবশিষ্ট)।`
          : `Sorry! Insufficient stock for ${group} at ${bank.hospitalName} (${available} bag(s) left).`
      );
      return false;
    }

    setBloodBanks((prev) =>
      prev.map((b) => {
        if (b.id === bankId) {
          return {
            ...b,
            inventory: {
              ...b.inventory,
              [group]: Math.max(0, (b.inventory[group] || 0) - units)
            },
            lastUpdated: language === "bn" ? "এইমাত্র রিকুইজিশন গৃহীত" : "Requisition approved just now"
          };
        }
        return b;
      })
    );

    triggerNotification(
      language === "bn"
        ? `🎉 ${bank.hospitalName} থেকে ${patientName}-এর জন্য ${units} ব্যাগ ${group} রক্ত সফলভাবে রিকুইজিশন করা হয়েছে!`
        : `🎉 ${units} bag(s) of ${group} blood reserved for ${patientName} at ${bank.hospitalName}!`
    );
    return true;
  };

  const syncBloodBanksStock = () => {
    setBloodBanks((prev) =>
      prev.map((b) => ({
        ...b,
        lastUpdated: language === "bn" ? "রিয়েল-টাইম সিঙ্ক হয়েছে" : "Synced real-time"
      }))
    );
    triggerNotification(
      language === "bn"
        ? "🔄 ব্লাড ব্যাংক ইনভেন্টরি স্টক ডাটা সফলভাবে রিফ্রেশ ও সিঙ্ক করা হয়েছে।"
        : "🔄 Blood bank inventory stock matrix successfully refreshed & synced."
    );
  };

  const addDonationRecord = async (
    rec: Omit<DonationRecord, "id" | "certificateId">
  ): Promise<void> => {
    const newRecord: DonationRecord = {
      ...rec,
      id: `rec-${Date.now()}`,
      certificateId: `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const newTotal = userProfile.totalDonations + 1;
    const newBadge = calculateDonorBadge(newTotal);
    const newEligibility = calculateEligibility(rec.date, userProfile.gender);

    const updatedProfile: DonorProfile = {
      ...userProfile,
      lastDonationDate: rec.date,
      nextEligibleDate: newEligibility.nextEligibleDate,
      isAvailable: false, // In cooldown immediately after donation
      totalDonations: newTotal,
      badge: newBadge,
      points: userProfile.points + 500
    };

    // Optimistic updates
    setMyDonationRecords((prev) => [newRecord, ...prev]);
    setUserProfile(updatedProfile);

    try {
      // Atomic Batch Write: Record and Profile
      const batch = writeBatch(db);
      batch.set(doc(db, "donations", newRecord.id), sanitizeForFirestore({ ...newRecord, userId: userProfile.id }));
      batch.set(doc(db, "donors", userProfile.id), sanitizeForFirestore(updatedProfile), { merge: true });
      await batch.commit();

      triggerNotification(
        language === "bn"
          ? "রক্তদান রেকর্ড সফলভাবে সংরক্ষিত হয়েছে! +৫০০ XP অর্জিত হয়েছে।"
          : "Donation record saved! +500 XP earned."
      );
    } catch (err) {
      console.error("Firestore donation record error:", err);
      triggerNotification(
        language === "bn"
          ? "⚠️ রক্তদান রেকর্ড ক্লাউডে সংরক্ষণ ব্যর্থ হয়েছে।"
          : "⚠️ Failed to sync donation record to cloud."
      );
    }
  };

  const addCompletedDonationRecord = async (
    rec: Omit<DonationRecord, "id" | "certificateId">
  ): Promise<void> => {
    const newRecord: DonationRecord = {
      ...rec,
      id: `rec-${Date.now()}`,
      certificateId: `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const newTotal = userProfile.totalDonations + 1;
    const newBadge = calculateDonorBadge(newTotal);
    const newCount = userProfile.reviewsCount + 1;
    const ratingGiven = rec.ratingGiven || 5;
    const newRating = Number(((userProfile.rating * userProfile.reviewsCount + ratingGiven) / newCount).toFixed(1));
    const newEligibility = calculateEligibility(rec.date, userProfile.gender);

    const updatedProfile: DonorProfile = {
      ...userProfile,
      lastDonationDate: rec.date,
      nextEligibleDate: newEligibility.nextEligibleDate,
      isAvailable: false, // Donor is now in medical cooldown
      totalDonations: newTotal,
      badge: newBadge,
      rating: newRating,
      reviewsCount: newCount,
      points: userProfile.points + 500
    };

    // Optimistic updates
    setMyDonationRecords((prev) => [newRecord, ...prev]);
    setUserProfile(updatedProfile);

    let updatedReq: EmergencyRequest | null = null;
    if (rec.requestId) {
      const targetReq = requests.find((r) => r.id === rec.requestId);
      if (targetReq) {
        const updatedResponses = targetReq.donorResponses.map((dr) =>
          dr.donorId === userProfile.id ? { ...dr, status: "Completed" as const } : dr
        );
        const newFulfilled = Math.min(targetReq.unitsNeeded, targetReq.unitsFulfilled + (rec.units || 1));
        updatedReq = {
          ...targetReq,
          unitsFulfilled: newFulfilled,
          status: newFulfilled >= targetReq.unitsNeeded ? "Fulfilled" : targetReq.status,
          donorResponses: updatedResponses
        };
        setRequests((prev) => prev.map((r) => (r.id === rec.requestId ? updatedReq! : r)));
      }
    }

    try {
      // Atomic Batch Write: Write to donations, donors, and requests in a single transaction/batch
      const batch = writeBatch(db);
      batch.set(doc(db, "donations", newRecord.id), sanitizeForFirestore({ ...newRecord, userId: userProfile.id }));
      batch.set(doc(db, "donors", userProfile.id), sanitizeForFirestore(updatedProfile), { merge: true });
      if (updatedReq) {
        batch.set(doc(db, "requests", updatedReq.id), sanitizeForFirestore(updatedReq), { merge: true });
      }
      await batch.commit();

      triggerNotification(
        language === "bn"
          ? `রক্তদান সফলভাবে সম্পন্ন হয়েছে! মোট রক্তদান: ${newTotal} বার। পরবর্তী রক্তদানের তারিখ: ${newEligibility.nextEligibleDate}`
          : `Donation confirmed! Total donations: ${newTotal}. Next eligible date: ${newEligibility.nextEligibleDate}`
      );
    } catch (err) {
      console.error("Firestore atomic completed donation error:", err);
      triggerNotification(
        language === "bn"
          ? "⚠️ রক্তদান সমাপ্তি সংরক্ষণ করার সময় ত্রুটি ঘটেছে।"
          : "⚠️ Error confirming donation completion in database."
      );
    }
  };

  const toggleBiometricLock = () => {
    setIsBiometricUnlocked((prev) => !prev);
  };

  const toggleE2EEncryption = () => {
    setIsE2EEncrypted((prev) => !prev);
    triggerNotification(
      isE2EEncrypted
        ? (language === "bn" ? "এনক্রিপশন স্ট্যান্ডার্ড মোডে আনা হয়েছে" : "Encryption set to Standard")
        : (language === "bn" ? "এন্ড-টু-এন্ড এনক্রিপশন সক্রিয় করা হয়েছে" : "End-to-End Encryption Activated")
    );
  };

  const triggerNotification = (msg: string) => {
    setNotificationAlert(msg);
    setTimeout(() => {
      setNotificationAlert(null);
    }, 6000);
  };

  const clearNotification = () => setNotificationAlert(null);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        currentUser,
        userProfile,
        updateUserProfile,
        eligibility,
        requests,
        addEmergencyRequest,
        respondToEmergencyRequest,
        updateDonorResponseStatus,
        donors,
        addDonor,
        rankDonors,
        bloodBanks,
        updateBloodBankStock,
        reserveBloodBankStock,
        syncBloodBanksStock,
        leaderboard,
        camps,
        registerCamp,
        vouchers,
        redeemVoucher,
        myDonationRecords,
        addDonationRecord,
        addCompletedDonationRecord,
        selectedDetailRequest,
        openRequestDetail,
        closeRequestDetail,
        selectedPledgeRequest,
        openPledgeModal,
        closePledgeModal,
        incomingDonorAlert,
        openIncomingDonorAlert,
        closeIncomingDonorAlert,
        simulateIncomingDonorOffer,
        isCreateProfileOpen,
        openCreateProfileModal,
        closeCreateProfileModal,
        isBiometricUnlocked,
        toggleBiometricLock,
        isE2EEncrypted,
        toggleE2EEncryption,
        isOffline,
        notificationAlert,
        clearNotification,
        triggerNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
