import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CreditCard, Heart, CheckCircle2, Loader2, X, ShieldCheck } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { language, triggerNotification } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Card'>('bKash');
  const [amount, setAmount] = useState(500);
  const [accountNumber, setAccountNumber] = useState("01700112233");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trxId, setTrxId] = useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const generatedTrx = `TRX-${selectedMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setTrxId(generatedTrx);
      triggerNotification(
        language === "bn"
          ? `ধন্যবাদ! ৳${amount} টাকা অনুদান সফল হয়েছে। TrxID: ${generatedTrx}`
          : `Thank you! ৳${amount} support received. TrxID: ${generatedTrx}`
      );
    }, 1800);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 pt-16 sm:pt-24 pb-16 flex justify-center items-start animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-slate-900/95 border border-amber-600/50 rounded-3xl p-6 shadow-2xl text-slate-100 mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10"
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {language === "bn" ? "জরুরি অ্যাম্বুলেন্স ও ব্লাড ফান্ড সাপোর্ট" : "Emergency Ambulance & Blood Fund"}
            </h3>
            <p className="text-xs text-slate-400">
              {language === "bn" ? "স্বেচ্ছায় অনটনগ্রস্ত রোগীর রক্ত পরিবহনে সাহায্য করুন" : "Voluntary micro-support for emergency blood transport"}
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {language === "bn" ? "অনুদানের জন্য ধন্যবাদ!" : "Payment Successful!"}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {language === "bn"
                  ? `আপনার ৳${amount} টাকা সাহায্য সফলভাবে BloodMate জরুরি তহবিলে জমা হয়েছে।`
                  : `Your contribution of ৳${amount} BDT was credited to the emergency fund.`}
              </p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Transaction ID:</span>
                <span className="font-mono text-amber-300 font-bold">{trxId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Method:</span>
                <span className="text-white font-semibold">{selectedMethod}</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4 pt-4">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === "bn" ? "অনুদানের পরিমাণ (৳ BDT)" : "Amount (৳ BDT)"}
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      amount === amt
                        ? "bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-950"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === "bn" ? "পেমেন্ট গেটওয়ে নির্বাচন করুন" : "Select Payment Gateway"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bKash', name: 'bKash', color: 'bg-pink-900/60 border-pink-500/60 text-pink-300' },
                  { id: 'Nagad', name: 'Nagad', color: 'bg-orange-900/60 border-orange-500/60 text-orange-300' },
                  { id: 'Rocket', name: 'Rocket', color: 'bg-purple-900/60 border-purple-500/60 text-purple-300' },
                  { id: 'Card', name: 'Card', color: 'bg-blue-900/60 border-blue-500/60 text-blue-300' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                      selectedMethod === m.id
                        ? `${m.color} ring-2 ring-amber-400`
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === "bn" ? `${selectedMethod} মোবাইল নম্বর` : `${selectedMethod} Account Number`}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === "bn"
                  ? "২৫৬-বিট এসএসএল এনক্রিপ্টেড সুরক্ষিত ডেমো গেটওয়ে"
                  : "Protected via 256-bit SSL encrypted gateway sandbox"}
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === "bn" ? "পেমেন্ট প্রসেসিং হচ্ছে..." : "Processing Payment..."}
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  {language === "bn" ? `৳${amount} টাকা নিশ্চিত করুন` : `Confirm ৳${amount} BDT`}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
