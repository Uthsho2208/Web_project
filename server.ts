import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Urgency Ranking & Priority Analysis Endpoint
app.post("/api/ai/urgency-rank", async (req, res) => {
  try {
    const { patientName, hospital, district, bloodGroup, unitsNeeded, reason, patientCondition, isICU } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback algorithmic scoring if API key not available
      let score = 70;
      if (isICU) score += 15;
      if (reason?.toLowerCase().includes("accident") || reason?.toLowerCase().includes("bleeding")) score += 10;
      if (Number(unitsNeeded) >= 3) score += 5;
      score = Math.min(score, 99);

      return res.json({
        urgencyScore: score,
        urgencyLevel: score >= 85 ? "Critical" : score >= 70 ? "High" : "Medium",
        aiReasoningBn: `রক্তগ্রহীতা ${patientName || "রোগীর"} জন্য ${unitsNeeded || 1} ব্যাগ ${bloodGroup || ""} রক্তের জরুরি প্রয়োজন। ${hospital || "হাসপাতালে"} চিকিৎসাধীন।`,
        aiReasoningEn: `Urgent blood required for patient ${patientName || "Patient"}: ${unitsNeeded || 1} bag(s) of ${bloodGroup || ""} at ${hospital || "Hospital"}.`,
        recommendedResponseTime: isICU || score >= 85 ? "৩০ - ৪৫ মিনিট (Within 30-45 mins)" : "১ - ২ ঘণ্টা (Within 1-2 hours)",
        actionPlanBn: "১. নিকটবর্তী রক্তের গ্রুপের দাতাদের পুশ নোটিফিকেশন এলার্ট পাঠানো হচ্ছে।\n২. জরুরি রক্তের ব্যাংকের স্টক যাচাই করা হচ্ছে।\n৩. সোশ্যাল মিডিয়ায় শেয়ার করুন।",
        actionPlanEn: "1. Broadcasting real-time alerts to nearby donors.\n2. Verifying hospital blood bank inventory.\n3. Share emergency request link on Facebook/WhatsApp.",
      });
    }

    const prompt = `You are an expert AI Triage Doctor for emergency blood donation in Bangladesh.
Evaluate this blood emergency request and provide a detailed priority analysis in both Bengali and English.

Details:
- Patient Name: ${patientName || "Anonymous"}
- Hospital: ${hospital || "Hospital"}
- District: ${district || "Dhaka"}
- Blood Group Required: ${bloodGroup || "A+"}
- Units (Bags) Needed: ${unitsNeeded || 1}
- Medical Reason / Diagnosis: ${reason || "Urgent Surgery"}
- ICU/CCU Admission: ${isICU ? "Yes (Critical)" : "No"}
- Patient Condition Details: ${patientCondition || "Severe condition"}

Return a VALID JSON object (and strictly NO markdown codeblocks or extra text) with this exact schema:
{
  "urgencyScore": number (1 to 100, where 90+ is extreme life threat/ICU),
  "urgencyLevel": "Critical" | "High" | "Medium" | "Standard",
  "aiReasoningBn": string (Explain why this level was assigned in Bengali),
  "aiReasoningEn": string (Explain why this level was assigned in English),
  "recommendedResponseTime": string (e.g., "১৫-৩০ মিনিট" or " Within 30 mins"),
  "actionPlanBn": string (3 bullet points in Bengali for requestor),
  "actionPlanEn": string (3 bullet points in English for requestor)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("AI Urgency Analysis Error:", err);
    return res.status(500).json({
      error: "Failed to analyze urgency with AI",
      urgencyScore: 80,
      urgencyLevel: "High",
      aiReasoningBn: "জরুরি রক্তদান অনুরোধ। দয়া করে দ্রুত রক্তদাতার সাহায্য নিন।",
      aiReasoningEn: "Emergency blood request. Please seek nearby blood donors quickly.",
      recommendedResponseTime: "১ ঘণ্টার মধ্যে (Within 1 hour)",
      actionPlanBn: "নিকটস্থ রক্তদাতাদের কল দিন বা অ্যাপ থেকে নোটিফিকেশন পাঠাতেন।",
      actionPlanEn: "Contact nearby matching donors or broadcast app alerts immediately.",
    });
  }
});

// AI BloodMate Emergency Chatbot Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, language, userProfile } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        reply: language === "bn"
          ? "আমি BloodMate AI সহকারী। যেকোনো জরুরি রক্তদান, ব্লাড ব্যাংকের হটলাইন, বা রক্তদানের যোগ্যতা সম্পর্কে প্রশ্ন করতে পারেন। জরুরি সেবা ৯৯৯ এ কল করতে পারেন।"
          : "I am BloodMate AI Assistant. Ask me anything about blood donation, eligibility, blood bank inventory, or emergency protocols in Bangladesh. Call 999 for medical emergency.",
      });
    }

    const systemInstruction = `You are "BloodMate AI", an empathetic, knowledgeable, and rapid-response emergency blood donation AI Assistant in Bangladesh.
You assist users in both Bengali (বাংলা) and English based on user preference.
Your core capabilities:
1. Guidance on blood compatibility (e.g. O- is universal donor, AB+ is universal recipient).
2. Eligibility check rules (Weight min 50kg, Age 18-65, Hb >= 12g/dL, 90-day cooldown between donations).
3. Emergency hospital blood bank contacts in Bangladesh (e.g. BSMMU, DMCH, Quantum Foundation hotline 01714010869, Red Crescent 01811458524).
4. Pre-donation & post-donation health care advice.
5. Calmly advising users dealing with critical blood shortage emergencies.

Always keep responses concise, practical, highly accurate, and friendly.
If user speaks Bengali, answer in warm natural Bengali. If English, answer in English.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text || "I am here to help with blood emergency." });
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    return res.status(500).json({
      reply: req.body?.language === "bn"
        ? "দুঃখিত, সংযোগে ত্রুটি হয়েছে। তবে আমাদের ব্লাড ব্যাংক ইনভেন্টরি ও সরাসরি দাতা তালিকায় কোনো প্রভাব পড়েনি।"
        : "Sorry, network error occurred. Please check the direct donor list or blood bank directory.",
    });
  }
});

// Start Server & Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
