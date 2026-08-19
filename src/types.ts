export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Gender = 'Male' | 'Female' | 'Other';

export type Language = 'bn' | 'en';

export interface DonorProfile {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  weightKg: number;
  district: string;
  area: string;
  phone: string;
  whatsapp?: string;
  isAvailable: boolean;
  lastDonationDate: string; // YYYY-MM-DD
  totalDonations: number;
  rating: number;
  reviewsCount: number;
  badge: 'Bronze Donor' | 'Silver Lifesaver' | 'Gold Hero' | 'Diamond Angel';
  points: number;
  isVerified: boolean;
  e2eEncrypted: boolean;
  hidePhoneInPublic: boolean;
  latitude?: number;
  longitude?: number;
  medicalNotes?: string;
  nextEligibleDate?: string;
  isEligible?: boolean;
  distanceKm?: number;
}

export interface DonorResponseStatus {
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorBloodGroup?: BloodGroup;
  donorLocation?: string;
  note?: string;
  status: 'Accepted' | 'On The Way' | 'Arrived' | 'Completed' | 'Declined';
  responseTime: string; // ISO string or relative time
  estimatedArrivalMinutes?: number;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  hospitalName: string;
  district: string;
  area: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Standard';
  urgencyScore: number; // 1-100
  reason: string;
  isICU: boolean;
  contactPhone: string;
  altPhone?: string;
  latitude?: number;
  longitude?: number;
  status: 'Searching' | 'Donor Assigned' | 'Fulfilled' | 'Cancelled';
  createdAt: string;
  aiReasoningBn?: string;
  aiReasoningEn?: string;
  recommendedResponseTime?: string;
  actionPlanBn?: string;
  actionPlanEn?: string;
  donorResponses: DonorResponseStatus[];
}

export interface BloodBankInventory {
  'A+': number;
  'A-': number;
  'B+': number;
  'B-': number;
  'AB+': number;
  'AB-': number;
  'O+': number;
  'O-': number;
}

export interface BloodBank {
  id: string;
  hospitalName: string;
  district: string;
  address: string;
  phone: string;
  emergencyHotline: string;
  inventory: BloodBankInventory;
  lastUpdated: string;
  operates24x7: boolean;
  verifiedBadge: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  donorId: string;
  name: string;
  bloodGroup: BloodGroup;
  district: string;
  totalDonations: number;
  points: number;
  badgeTitle: string;
  avatarBg: string;
}

export interface CampDrive {
  id: string;
  title: string;
  organizer: string;
  location: string;
  district: string;
  date: string;
  time: string;
  expectedDonors: number;
  registeredCount: number;
  contactPhone: string;
  description: string;
  isUserRegistered?: boolean;
}

export interface DiscountVoucher {
  id: string;
  title: string;
  partnerName: string;
  category: 'Diagnostic' | 'Health Check' | 'Pharmacy' | 'Lifestyle';
  pointsCost: number;
  discountValue: string;
  code: string;
  expiresAt: string;
  isRedeemed?: boolean;
}

export interface DonationRecord {
  id: string;
  date: string;
  hospitalName: string;
  recipientName: string;
  district?: string;
  area?: string;
  contactPhone?: string;
  bloodGroup: BloodGroup;
  units: number;
  certificateId: string;
  ratingGiven?: number;
  feedback?: string;
  requestId?: string;
}

export interface RatingReview {
  id: string;
  fromName: string;
  role: 'Recipient' | 'Hospital Staff' | 'Donor';
  rating: number; // 1 to 5
  comment: string;
  date: string;
}
