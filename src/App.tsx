import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { EmergencyAlertBanner } from "./components/EmergencyAlertBanner";
import { EmergencyRequestModal } from "./components/EmergencyRequestModal";
import { RequestDetailModal } from "./components/RequestDetailModal";
import { CreateProfileModal } from "./components/CreateProfileModal";
import { DonatePledgeModal } from "./components/DonatePledgeModal";
import { AIChatModal } from "./components/AIChatModal";
import { BiometricModal } from "./components/BiometricModal";
import { PaymentModal } from "./components/PaymentModal";
import { MessageSquare, Sparkles } from "lucide-react";

import { EmergencyFeedView } from "./views/EmergencyFeedView";
import { DonorDirectoryView } from "./views/DonorDirectoryView";
import { BloodBankView } from "./views/BloodBankView";
import { GamificationView } from "./views/GamificationView";
import { EligibilityCheckerCard } from "./views/EligibilityCheckerCard";
import { CampsView } from "./views/CampsView";
import { GuidelinesView } from "./views/GuidelinesView";
import { ProfileDashboardView } from "./views/ProfileDashboardView";

function MainContent() {
  const {
    theme,
    selectedDetailRequest,
    openRequestDetail,
    closeRequestDetail,
    selectedPledgeRequest,
    closePledgeModal,
    isCreateProfileOpen,
    closeCreateProfileModal,
  } = useApp();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<string>("emergency");

  // Modal triggers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  return (
    <div
      className={`min-h-screen font-sans selection:bg-rose-600 selection:text-white flex flex-col transition-colors relative overflow-x-hidden ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-gradient-to-br from-slate-100 via-rose-50/40 to-slate-100 text-slate-900"
      }`}
    >
      {/* Frosted Glass Ambient Lighting Orbs in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-all duration-1000 ${
            isDark ? "bg-red-600/25" : "bg-rose-300/60"
          }`}
        />
        <div
          className={`absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full blur-[140px] opacity-35 transition-all duration-1000 ${
            isDark ? "bg-indigo-600/20" : "bg-indigo-200/50"
          }`}
        />
        <div
          className={`absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full blur-[160px] opacity-30 transition-all duration-1000 ${
            isDark ? "bg-rose-700/20" : "bg-amber-200/40"
          }`}
        />
      </div>

      {/* Header Navigation with Frosted Glass */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenBiometric={() => setIsBiometricOpen(true)}
        onOpenPayment={() => setIsPaymentOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {activeTab === "emergency" && (
          <>
            <HeroSection
              onRequestBlood={() => setIsCreateModalOpen(true)}
              onBecomeDonor={() => setActiveTab("profile")}
            />
            <EmergencyFeedView />
          </>
        )}
        {activeTab === "donors" && <DonorDirectoryView />}
        {activeTab === "blood-banks" && <BloodBankView />}
        {activeTab === "gamification" && <GamificationView />}
        {activeTab === "eligibility" && <EligibilityCheckerCard />}
        {activeTab === "camps" && <CampsView />}
        {activeTab === "guidelines" && <GuidelinesView />}
        {activeTab === "profile" && <ProfileDashboardView />}
      </main>

      {/* Floating AI Chat Assistant Trigger with Frosted Glass Ring */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white shadow-2xl shadow-red-600/50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white/50 backdrop-blur-xl group relative cursor-pointer"
          title="AI Emergency Assistant"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>
          <MessageSquare className="w-6 h-6 fill-white text-white group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Real-time Notification Alert Banner */}
      <EmergencyAlertBanner />

      {/* Top-level Root Modals (Stacked above all headers) */}
      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={closeCreateProfileModal}
      />

      {selectedDetailRequest && (
        <RequestDetailModal
          request={selectedDetailRequest}
          onClose={closeRequestDetail}
        />
      )}

      {selectedPledgeRequest && (
        <DonatePledgeModal
          isOpen={!!selectedPledgeRequest}
          request={selectedPledgeRequest}
          onClose={closePledgeModal}
          onOpenDetails={(req) => {
            openRequestDetail(req);
          }}
        />
      )}

      <EmergencyRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <BiometricModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* Footer with Frosted Glass styling */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors backdrop-blur-2xl relative ${
          isDark
            ? "border-white/10 bg-slate-950/60 text-slate-400"
            : "border-white/60 bg-white/60 text-slate-600 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center">
            <span>© {new Date().getFullYear()}</span>
            <strong className="text-rose-500">BloodMate AI</strong>
            <span>• Emergency Blood Network • Frosted Glass Theme</span>
          </p>
          <div className="flex items-center space-x-4 text-[11px] opacity-85">
            <span>24/7 Hotline: 999</span>
            <span>•</span>
            <span>Quantum Blood Center: 01714010869</span>
            <span>•</span>
            <span>Red Crescent: 01811458524</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
