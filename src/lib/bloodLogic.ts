import { BloodBank, BloodGroup, DonorProfile, EmergencyRequest, Gender, Language } from "../types";

/**
 * Bangladesh District Coordinates for Distance Matching
 */
export const BANGLADESH_DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "Dhaka": { lat: 23.8103, lng: 90.4125 },
  "Chittagong": { lat: 22.3569, lng: 91.7832 },
  "Chattogram": { lat: 22.3569, lng: 91.7832 },
  "Sylhet": { lat: 24.8949, lng: 91.8687 },
  "Rajshahi": { lat: 24.3745, lng: 88.6042 },
  "Khulna": { lat: 22.8456, lng: 89.5403 },
  "Barishal": { lat: 22.7010, lng: 90.3535 },
  "Rangpur": { lat: 25.7439, lng: 89.2752 },
  "Mymensingh": { lat: 24.7471, lng: 90.4203 },
  "Comilla": { lat: 23.4682, lng: 91.1788 },
  "Cumilla": { lat: 23.4682, lng: 91.1788 },
  "Gazipur": { lat: 23.9999, lng: 90.4203 },
  "Narayanganj": { lat: 23.6238, lng: 90.5000 },
  "Bogura": { lat: 24.8465, lng: 89.3777 },
  "Bogra": { lat: 24.8465, lng: 89.3777 },
  "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
  "Jessore": { lat: 23.1664, lng: 89.2081 },
  "Jashore": { lat: 23.1664, lng: 89.2081 },
  "Dinajpur": { lat: 25.6217, lng: 88.6355 },
  "Tangail": { lat: 24.2513, lng: 89.9167 },
  "Faridpur": { lat: 23.6071, lng: 89.8429 },
  "Pabna": { lat: 24.0064, lng: 89.2372 },
  "Kushtia": { lat: 23.9013, lng: 89.1204 },
  "Feni": { lat: 23.0186, lng: 91.3966 },
  "Noakhali": { lat: 22.8696, lng: 91.0993 },
  "Brahmanbaria": { lat: 23.9571, lng: 91.1119 }
};

export const BD_DISTRICT_COORDINATES = BANGLADESH_DISTRICT_COORDS;

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Gets approximate coordinates for a district name or falls back to Dhaka
 */
export function getDistrictCoordinates(district: string): { lat: number; lng: number } {
  return BANGLADESH_DISTRICT_COORDS[district] || BANGLADESH_DISTRICT_COORDS["Dhaka"];
}

/**
 * Safely parses any date input (string, Date, number, null, undefined)
 * Returns a valid Date object or null if parsing fails.
 */
export function safeParseDate(dateInput?: Date | string | number | null): Date | null {
  if (!dateInput) return null;
  try {
    const d = typeof dateInput === "object" && dateInput instanceof Date ? dateInput : new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Safely formats date to ISO string (e.g. 2026-08-20T02:38:00.000Z)
 * Never throws RangeError; falls back to current Date or provided fallback.
 */
export function safeToISOString(dateInput?: Date | string | number | null, fallbackDate?: Date | string): string {
  try {
    const parsed = safeParseDate(dateInput);
    if (parsed) return parsed.toISOString();
    const fallback = safeParseDate(fallbackDate) || new Date();
    return fallback.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Safely formats date to YYYY-MM-DD
 * Never throws RangeError; falls back to today or provided fallback.
 */
export function safeToISODateString(dateInput?: Date | string | number | null, fallbackDate?: Date | string): string {
  try {
    const iso = safeToISOString(dateInput, fallbackDate);
    return iso.split("T")[0] || new Date().toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Medical Donation Eligibility Calculation
 * Male: 90 days (3 months), Female: 120 days (4 months), Other: 90 days
 */
export interface EligibilityStatus {
  isEligible: boolean;
  requiredIntervalDays: number;
  daysPassed: number;
  daysLeft: number;
  progressPercent: number;
  nextEligibleDate: string; // YYYY-MM-DD
}

export function calculateEligibility(
  lastDonationDate: string | undefined,
  gender: Gender = "Male"
): EligibilityStatus {
  const requiredIntervalDays = gender === "Female" ? 120 : 90;
  const today = new Date();
  const todayStr = safeToISODateString(today);

  const lastDate = safeParseDate(lastDonationDate);

  if (!lastDate) {
    return {
      isEligible: true,
      requiredIntervalDays,
      daysPassed: 999,
      daysLeft: 0,
      progressPercent: 100,
      nextEligibleDate: todayStr
    };
  }

  const diffMs = today.getTime() - lastDate.getTime();
  const daysPassed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, requiredIntervalDays - daysPassed);
  const progressPercent = Math.min(100, Math.floor((daysPassed / requiredIntervalDays) * 100));

  const nextTimestamp = lastDate.getTime() + requiredIntervalDays * 24 * 60 * 60 * 1000;
  const nextEligibleDate = safeToISODateString(new Date(nextTimestamp), today);

  return {
    isEligible: daysLeft === 0,
    requiredIntervalDays,
    daysPassed,
    daysLeft,
    progressPercent,
    nextEligibleDate
  };
}

/**
 * Blood Group Compatibility Matrix
 */
export const BLOOD_COMPATIBILITY: Record<BloodGroup, { canReceiveFrom: BloodGroup[]; canDonateTo: BloodGroup[] }> = {
  "O-": {
    canReceiveFrom: ["O-"],
    canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] // Universal Donor
  },
  "O+": {
    canReceiveFrom: ["O+", "O-"],
    canDonateTo: ["O+", "A+", "B+", "AB+"]
  },
  "A-": {
    canReceiveFrom: ["A-", "O-"],
    canDonateTo: ["A-", "A+", "AB-", "AB+"]
  },
  "A+": {
    canReceiveFrom: ["A+", "A-", "O+", "O-"],
    canDonateTo: ["A+", "AB+"]
  },
  "B-": {
    canReceiveFrom: ["B-", "O-"],
    canDonateTo: ["B-", "B+", "AB-", "AB+"]
  },
  "B+": {
    canReceiveFrom: ["B+", "B-", "O+", "O-"],
    canDonateTo: ["B+", "AB+"]
  },
  "AB-": {
    canReceiveFrom: ["AB-", "A-", "B-", "O-"],
    canDonateTo: ["AB-", "AB+"]
  },
  "AB+": {
    canReceiveFrom: ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"], // Universal Recipient
    canDonateTo: ["AB+"]
  }
};

/**
 * Gets compatibility details object for a blood group
 */
export function getBloodCompatibilityDetails(group: BloodGroup) {
  return BLOOD_COMPATIBILITY[group] || { canReceiveFrom: [group], canDonateTo: [group] };
}

/**
 * Checks if a donor can donate to a recipient
 */
export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  return BLOOD_COMPATIBILITY[recipientGroup].canReceiveFrom.includes(donorGroup);
}

/**
 * Gets list of donor blood groups compatible with recipient
 */
export function getCompatibleDonorBloodGroups(recipientGroup: BloodGroup): BloodGroup[] {
  return BLOOD_COMPATIBILITY[recipientGroup]?.canReceiveFrom || [recipientGroup];
}

/**
 * Gets list of recipient blood groups donor can donate to
 */
export function getCompatibleRecipientBloodGroups(donorGroup: BloodGroup): BloodGroup[] {
  return BLOOD_COMPATIBILITY[donorGroup]?.canDonateTo || [donorGroup];
}

/**
 * Smart Priority Donor Ranking Algorithm
 * Ranks donors based on Compatibility (40%), Proximity (30%), Eligibility (20%), and Rating (10%)
 */
export interface RankedDonor extends DonorProfile {
  distanceKm: number;
  matchScore: number; // 0 - 100
  isExactMatch: boolean;
  isCompatible: boolean;
  eligibility: EligibilityStatus;
}

export function rankDonorsForEmergencyRequest(
  donors: DonorProfile[],
  request: EmergencyRequest,
  maxRadiusKm: number = 50
): RankedDonor[] {
  const reqCoords = request.latitude && request.longitude
    ? { lat: request.latitude, lng: request.longitude }
    : getDistrictCoordinates(request.district);

  return donors
    .map((donor) => {
      const donorCoords = donor.latitude && donor.longitude
        ? { lat: donor.latitude, lng: donor.longitude }
        : getDistrictCoordinates(donor.district);

      const distanceKm = calculateHaversineDistanceKm(
        reqCoords.lat,
        reqCoords.lng,
        donorCoords.lat,
        donorCoords.lng
      );

      const isExactMatch = donor.bloodGroup === request.bloodGroup;
      const isCompatible = isBloodCompatible(donor.bloodGroup, request.bloodGroup);
      const eligibility = calculateEligibility(donor.lastDonationDate, donor.gender);

      // Score components
      let compatibilityScore = 0;
      if (isExactMatch) compatibilityScore = 100;
      else if (isCompatible) compatibilityScore = 75;
      else compatibilityScore = 0;

      // Distance score (max 100 at 0km, decays with distance)
      const proximityScore = Math.max(0, 100 - distanceKm * 1.5);

      // Eligibility score
      const eligibilityScore = donor.isAvailable && eligibility.isEligible ? 100 : 20;

      // Rating score
      const ratingScore = (donor.rating / 5) * 100;

      // Weighted total score
      const matchScore = Math.round(
        compatibilityScore * 0.4 +
        proximityScore * 0.3 +
        eligibilityScore * 0.2 +
        ratingScore * 0.1
      );

      return {
        ...donor,
        distanceKm,
        matchScore,
        isExactMatch,
        isCompatible,
        eligibility
      };
    })
    .filter((d) => d.isCompatible && (maxRadiusKm <= 0 || d.distanceKm <= maxRadiusKm))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Direct Communication Intent Generator
 */
export function generateWhatsAppEmergencyLink(
  phone: string,
  request: EmergencyRequest,
  language: Language = "bn"
): string {
  // Clean phone number
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const intlPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone.replace(/^0+/, "")}`;

  const messageBn = `🚨 জরুরি রক্তদান সহায়তার জন্য যোগাযোগ
রোগীর নাম: ${request.patientName}
রক্তের গ্রুপ: ${request.bloodGroup} (${request.unitsNeeded} ব্যাগ)
হাসপাতাল: ${request.hospitalName}, ${request.district} (${request.area})
জরুরি মাত্রা: ${request.urgencyLevel} (${request.isICU ? "ICU/CCU" : "জরুরি"})
কারণ: ${request.reason}
যোগাযোগ: ${request.contactPhone}

BloodMate AI অ্যাপের মাধ্যমে মেসেজটি পাঠানো হয়েছে। আপনি কি এই মুমূর্ষু রোগীকে রক্ত দিতে পারবেন?`;

  const messageEn = `🚨 Emergency Blood Donation Assistance
Patient: ${request.patientName}
Blood Group: ${request.bloodGroup} (${request.unitsNeeded} Bag/Unit)
Hospital: ${request.hospitalName}, ${request.district} (${request.area})
Urgency: ${request.urgencyLevel} (${request.isICU ? "ICU/CCU" : "Emergency"})
Reason: ${request.reason}
Contact: ${request.contactPhone}

Dispatched via BloodMate AI Network. Are you available to donate?`;

  const message = language === "bn" ? messageBn : messageEn;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct WhatsApp Donor Pledge Generator (Donor Sending details to Requester)
 */
export function generateWhatsAppDonorPledgeLink(
  recipientPhone: string,
  request: EmergencyRequest,
  donor: DonorProfile,
  etaMinutes: number = 30,
  donorNote?: string,
  language: Language = "bn"
): string {
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
  const intlPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone.replace(/^0+/, "")}`;

  const messageBn = `🩸 আসসালামু আলাইকুম!
আমি BloodMate AI থেকে রক্তদাতা ${donor.name}। আপনার জরুরি রক্তের আবেদন দেখে যোগাযোগ করছি।

📋 আমার রক্তদাতার বিবরণ:
• নাম: ${donor.name}
• রক্তের গ্রুপ: ${donor.bloodGroup} (ম্যাচিং ডোনার)
• মোবাইল নম্বর: ${donor.phone}
• বর্তমান লোকেশন: ${donor.area}, ${donor.district}
• হাসপাতালে পৌঁছানোর সম্ভাব্য সময়: প্রায় ${etaMinutes} মিনিট
${donorNote ? `• বার্তা/নোট: ${donorNote}\n` : ""}
আমি রোগী (${request.patientName})-এর জন্য ${request.hospitalName}-এ রক্ত দিতে রওনা হতে প্রস্তুত। অনুগ্রহ করে কনফার্ম করুন।`;

  const messageEn = `🩸 Hello!
I am verified donor ${donor.name} from BloodMate AI. I saw your emergency blood request for patient ${request.patientName} at ${request.hospitalName}.

📋 My Donor Details:
• Name: ${donor.name}
• Blood Group: ${donor.bloodGroup}
• Contact Phone: ${donor.phone}
• Location: ${donor.area}, ${donor.district}
• Estimated Arrival (ETA): Approx. ${etaMinutes} minutes
${donorNote ? `• Note: ${donorNote}\n` : ""}
I am ready to donate blood. Please call or confirm.`;

  const message = language === "bn" ? messageBn : messageEn;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct WhatsApp Blood Bank Stock Requisition Generator
 */
export function generateWhatsAppBloodBankRequisitionLink(
  bank: BloodBank,
  bloodGroup: BloodGroup,
  unitsNeeded: number = 1,
  patientName: string = "Emergency Patient",
  hospitalInfo: string = "",
  language: Language = "bn"
): string {
  const cleanPhone = bank.emergencyHotline.replace(/[^0-9]/g, "");
  const intlPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone.replace(/^0+/, "")}`;

  const messageBn = `🏥 আসসালামু আলাইকুম!
আমি ${bank.hospitalName} ব্লাড ব্যাংক থেকে জরুরি রক্তের ব্যাগ রিকুইজিশন করতে চাচ্ছি।

📋 রিকুইজিশন বিবরণ:
• রক্তের গ্রুপ: ${bloodGroup}
• প্রয়োজনীয় ব্যাগ: ${unitsNeeded} ব্যাগ
• রোগীর নাম: ${patientName}
${hospitalInfo ? `• রোগী যে হাসপাতালে চিকিৎসাধীন: ${hospitalInfo}\n` : ""}
আপনার সেন্টারে এই গ্রুপের ব্লাড ব্যাগের প্রাপ্যতা ও ক্রস-ম্যাচিং প্রক্রিয়া সম্পর্কে জানতে চাচ্ছি। অনুগ্রহ করে জানাবেন।`;

  const messageEn = `🏥 Hello!
I would like to inquire/requisition emergency blood bags from ${bank.hospitalName} Blood Bank.

📋 Requisition Details:
• Blood Group: ${bloodGroup}
• Units Needed: ${unitsNeeded} Bag(s)
• Patient Name: ${patientName}
${hospitalInfo ? `• Hospital/Ward: ${hospitalInfo}\n` : ""}
Please let us know the current stock availability and requisition steps.`;

  const message = language === "bn" ? messageBn : messageEn;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

export function generateTelEmergencyLink(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  return `tel:${cleanPhone}`;
}
