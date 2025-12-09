const express = require("express");
const cors = require("cors");
const { Ollama } = require('ollama');

const app = express();
app.use(cors());
app.use(express.json());

// ===== KONFIGURASI MODEL =====
const MODEL_NAME = "llama3.2:3b";  // MODEL BARU YANG DIDOWNLOAD
const DEFAULT_SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu dan ramah.

ATURAN UTAMA:
1. SELALU gunakan Bahasa Indonesia yang baik dan benar
2. Jawab dengan SINGKAT, JELAS, dan LANGSUNG ke inti
3. Jika tidak tahu jawabannya, katakan "Maaf, saya belum tahu tentang itu"
4. JANGAN pernah mengarang informasi
5. Bersikap SOPAN dan PROFESIONAL
6. Format jawaban dengan RAPI

CONTOH JAWABAN YANG BAIK:
User: Halo
AI: Hai! Ada yang bisa saya bantu?

User: Apa itu AI?
AI: AI (Artificial Intelligence) adalah kecerdasan buatan yang dibuat mesin untuk meniru kecerdasan manusia.

User: Siapa presiden pertama Indonesia?
AI: Presiden pertama Indonesia adalah Ir. Soekarno (1945-1967).`;

// Inisialisasi Ollama
const ollama = new Ollama({
  host: 'http://localhost:11434',
  timeout: 120000  // 2 menit timeout
});

// ===== ENDPOINT CHAT =====
app.post("/api/chat", async (req, res) => {
  const { 
    message, 
    history = [], 
    systemPrompt = DEFAULT_SYSTEM_PROMPT 
  } = req.body;

  console.log("👤 User:", message.substring(0, 100) + (message.length > 100 ? "..." : ""));

  try {
    // Format messages untuk Ollama
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-4),  // Ambil hanya 4 pesan terakhir sebagai konteks
      { role: "user", content: message }
    ];

    console.log(`🤖 Mengirim ke ${MODEL_NAME}...`);

    const response = await ollama.chat({
      model: MODEL_NAME,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.3,        // RENDAH: hasil lebih fokus dan konsisten
        num_predict: 400,        // Maksimal 400 token (cukup untuk jawaban singkat)
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,     // Kurangi pengulangan kata
        seed: 42                 // Untuk konsistensi
      }
    });

    const reply = response.message.content.trim();
    console.log(`✅ AI: ${reply.substring(0, 100)}...`);
    console.log(`📊 Panjang: ${reply.length} karakter`);
    
    res.json({ 
      reply: reply,
      model: MODEL_NAME,
      tokens: reply.length
    });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    
    // Error handling spesifik
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: "Ollama tidak berjalan",
        solution: "Buka terminal baru dan jalankan: ollama serve"
      });
    }
    
    if (error.message && error.message.includes('model')) {
      return res.status(404).json({
        error: `Model '${MODEL_NAME}' tidak ditemukan`,
        solution: `Jalankan: ollama pull ${MODEL_NAME}`
      });
    }

    res.status(500).json({
      error: "Terjadi kesalahan pada server",
      details: error.message
    });
  }
});

// ===== ENDPOINT UNTUK CEK MODEL =====
app.get("/api/models", async (req, res) => {
  try {
    const models = await ollama.list();
    
    console.log("📦 Model tersedia:");
    if (models.models && models.models.length > 0) {
      models.models.forEach(model => {
        const sizeGB = (model.size / 1024 / 1024 / 1024).toFixed(2);
        console.log(`   - ${model.name} (${sizeGB} GB)`);
      });
    }
    
    res.json({ 
      models: models.models || [],
      total: models.models?.length || 0,
      currentModel: MODEL_NAME
    });
  } catch (error) {
    console.error("❌ Tidak bisa mengambil daftar model:", error.message);
    res.status(500).json({ 
      error: "Tidak bisa terhubung ke Ollama",
      solution: "Pastikan Ollama berjalan"
    });
  }
});

// ===== ENDPOINT UNTUK CEK STATUS =====
app.get("/api/health", async (req, res) => {
  try {
    const models = await ollama.list();
    const hasModel = models.models?.some(m => m.name === MODEL_NAME);
    
    res.json({ 
      status: "SEHAT",
      server: "berjalan",
      ollama: "terhubung",
      model: MODEL_NAME,
      modelReady: hasModel ? "YA" : "TIDAK",
      totalModels: models.models?.length || 0,
      waktu: new Date().toLocaleTimeString('id-ID')
    });
  } catch (error) {
    res.status(503).json({ 
      status: "SAKIT",
      ollama: "terputus",
      error: error.message
    });
  }
});

// ===== ENDPOINT ROOT =====
app.get("/", (req, res) => {
  res.json({
    nama: "AI Chatbot Server",
    versi: "2.0",
    model: MODEL_NAME,
    endpoints: {
      chat: "POST /api/chat",
      health: "GET /api/health",
      models: "GET /api/models"
    },
    contohRequest: {
      method: "POST",
      url: "/api/chat",
      body: {
        message: "Halo",
        history: []
      }
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("🚀 AI CHATBOT SERVER - LLAMA 3.2 3B");
  console.log("=".repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🤖 Model: ${MODEL_NAME}`);
  console.log(`🌐 Ollama: http://localhost:11434`);
  console.log("-".repeat(60));
  console.log("🔗 Endpoints:");
  console.log(`   • http://localhost:${PORT}/api/chat    (POST - Chat)`);
  console.log(`   • http://localhost:${PORT}/api/health  (GET - Status)`);
  console.log(`   • http://localhost:${PORT}/api/models  (GET - Daftar Model)`);
  console.log("=".repeat(60));
  console.log("✅ Server siap! Buka http://localhost:3000 untuk chatbot");
});