# AI Chatbot dengan Ollama

Chatbot AI lokal yang menggunakan Ollama dengan model Llama 3.2 3B. Project ini terdiri dari frontend React.js dan backend Node.js.

## Fitur Utama
- Chat AI lokal (tanpa API key berbayar)
- Model Llama 3.2 3B (ringan dan cepat)
- Frontend modern dengan React.js
- Backend dengan Node.js + Express
- Integrasi langsung dengan Ollama
- UI responsif dan user-friendly

## Teknologi yang Digunakan
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **AI Engine:** Ollama dengan Llama 3.2 3B
- **Package Manager:** npm

## Prasyarat
Sebelum memulai, pastikan Anda telah menginstall:
1. [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
2. [Ollama](https://ollama.com/) (untuk model AI lokal)
3. [Git](https://git-scm.com/) (untuk clone repository)

## Cara Menjalankan

### 1. Clone Repository
\\\ash
git clone https://github.com/DhioAndreas/ai-chatbot.git
cd ai-chatbot
\\\

### 2. Setup Ollama
\\\ash
# Download model Llama 3.2 3B
ollama pull llama3.2:3b

# Jalankan Ollama server (di terminal terpisah)
ollama serve
\\\

### 3. Install Dependencies
\\\ash
# Install dependencies untuk backend
cd server
npm install

# Install dependencies untuk frontend
cd ../client
npm install
\\\

### 4. Jalankan Aplikasi
\\\ash
# Terminal 1: Jalankan backend server
cd server
npm start

# Terminal 2: Jalankan frontend
cd client
npm start
\\\

### 5. Akses Aplikasi
- **Chatbot UI:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Ollama API:** http://localhost:11434

## Struktur Project
\\\
ai-chatbot/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Komponen React
│   │   └── AIChatbot.jsx
│   ├── public/           # Static files
│   └── package.json      # Frontend dependencies
├── server/                # Backend Node.js
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
└── README.md             # Dokumentasi ini
\\\

## API Endpoints
### \POST /api/chat\
Mengirim pesan ke AI.

**Request:**
\\\json
{
  "message": "Halo, siapa kamu?",
  "history": []
}
\\\

**Response:**
\\\json
{
  "reply": "Hai! Saya adalah asisten AI yang siap membantu Anda.",
  "model": "llama3.2:3b"
}
\\\

### \GET /api/health\
Memeriksa status server dan koneksi Ollama.

### \GET /api/models\
Mendapatkan daftar model yang tersedia di Ollama.

## Konfigurasi
### Mengganti Model AI
Edit file \server/server.js\:
\\\javascript
const MODEL_NAME = "llama3.2:3b"; // Ganti dengan model lain
\\\

### Mengubah Port
- Frontend: Port 3000 (bisa diubah di client/package.json)
- Backend: Port 3001 (bisa diubah di server/server.js)
- Ollama: Port 11434

## Troubleshooting
### 1. Ollama tidak berjalan
\\\ash
# Pastikan Ollama service berjalan
ollama serve

# Cek di browser: http://localhost:11434
\\\

### 2. Model tidak ditemukan
\\\ash
# Download model
ollama pull llama3.2:3b

# Cek model yang tersedia
ollama list
\\\

### 3. Port sudah digunakan
Ubah port di \server/server.js\:
\\\javascript
const PORT = 3001; // Ganti dengan port lain
\\\

### 4. Error dependency
\\\ash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
\\\

## Referensi
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Llama 3.2 Model](https://llama.meta.com/llama3.2/)
- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)

## Kontribusi
Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat branch fitur (\git checkout -b feature/AmazingFeature\)
3. Commit perubahan (\git commit -m 'Add AmazingFeature'\)
4. Push ke branch (\git push origin feature/AmazingFeature\)
5. Buat Pull Request

## Lisensi
Distribusi di bawah lisensi MIT.

## Author
**Dhio Andreas**
- GitHub: [@DhioAndreas](https://github.com/DhioAndreas)

## Acknowledgments
- Terima kasih kepada [Ollama](https://ollama.com/) untuk AI engine
- Terima kasih kepada [Meta](https://meta.ai/) untuk model Llama
- Komunitas open source untuk semua tools yang digunakan

---
Jika project ini membantu, jangan lupa beri star di GitHub!
