import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TRANSLATIONS } from "../data/translations";
import { Bot, Send, X, Sparkles, User, RefreshCw, PhoneCall } from "lucide-react";

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const { language, userProfile } = useApp();
  const t = TRANSLATIONS[language];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: language === "bn"
        ? "আসসালামু আলাইকুম! আমি 'BloodMate AI' সহকারী। জরুরি রক্তের প্রয়োজন, রক্তের গ্রুপ ম্যাচিং, ব্লাড ব্যাংকের হটলাইন বা রক্তদানের প্রস্তুতি সম্পর্কে কী জানতে চান?"
        : "Hello! I am 'BloodMate AI'. How can I help you regarding blood emergencies, blood group compatibility, or hospital blood banks in Bangladesh?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync initial bot greeting dynamically when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.sender === "bot") {
        return [
          {
            sender: "bot",
            text: language === "bn"
              ? "আসসালামু আলাইকুম! আমি 'BloodMate AI' সহকারী। জরুরি রক্তের প্রয়োজন, রক্তের গ্রুপ ম্যাচিং, ব্লাড ব্যাংকের হটলাইন বা রক্তদানের প্রস্তুতি সম্পর্কে কী জানতে চান?"
              : "Hello! I am 'BloodMate AI'. How can I help you regarding blood emergencies, blood group compatibility, or hospital blood banks in Bangladesh?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      }
      return prev;
    });
  }, [language, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = language === "bn" ? [
    "O- (ও নেগেটিভ) রক্তগ্রুপ কাদের দেয়া যায়?",
    "ঢামেক ব্লাড ব্যাংকের ফোন নম্বর ও স্টক কত?",
    "রক্তদানের কতদিন পর আবার দেয়া যায়?",
    "থ্যালাসেমিয়া রোগীর রক্ত পাওয়ার সবচেয়ে দ্রুত উপায় কি?"
  ] : [
    "Who can receive O- Negative blood?",
    "What is the hotline for Quantum Blood Bank?",
    "What is the minimum weight requirement for blood donation?",
    "How to respond to an emergency blood alert?"
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language,
          userProfile
        })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "I am here to assist with blood emergency.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: language === "bn"
            ? "জরুরি সেবা ৯৯৯ এ সরাসরি ফোন করতে পারেন। এছাড়া নিকটবর্তী ব্লাড ব্যাংকের হটলাইনে যোগাযোগ করুন।"
            : "Please call emergency services 999 or check nearby blood bank hotlines directly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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
        className="relative w-full max-w-lg h-[620px] max-h-[85vh] bg-slate-900/95 border border-red-800/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 mt-2 sm:mt-4 mb-10 frosted-glass-card ring-1 ring-white/10"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-600/30 text-rose-400 border border-red-500/50">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                {t.chatHeaderTitle}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Gemini 3.6 Flash Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            title={language === "bn" ? "বন্ধ করুন (Esc)" : "Close (Esc)"}
            className="p-2.5 rounded-2xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-all duration-200 active:scale-90 group cursor-pointer"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 text-xs sm:text-sm">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-7 h-7 rounded-lg bg-red-600/30 border border-red-500/50 text-rose-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white rounded-tr-none font-sans"
                    : "bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none leading-relaxed"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[10px] text-right mt-1 opacity-60">
                  {msg.time}
                </span>
              </div>
              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-rose-300 italic p-2 bg-slate-800/50 rounded-xl max-w-max">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>{language === "bn" ? "চিন্তা করছে..." : "BloodMate AI is typing..."}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-200 border border-slate-700 text-[11px] whitespace-nowrap transition-all"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t.chatPlaceholder}
            className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
