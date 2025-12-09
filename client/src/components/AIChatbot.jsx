// Simple AI Chatbot (React)
// Single-file React component (default export) with Tailwind CSS styling.
// Includes: provider switch (OpenAI, Ollama, Generic proxy), conversation UI, provider config, and usage notes.
// ---------------------------
/*
INSTRUCTIONS:
1) Add this component to your React app (e.g., src/components/AIChatbot.jsx).
2) Tailwind should be available in the project (this component uses Tailwind classes).
3) The UI sends POST requests to /api/chat with a JSON body: { provider, message, history }
   - Implement a small server proxy that talks to the chosen AI (OpenAI, Ollama, Gemini, etc.).
4) Example server snippets (Node/Express) are included below this component in comments.
5) Set environment variables for API keys on your server, never in client code.

SECURITY NOTES:
- Do NOT put API keys in client-side code. Always proxy requests from a server.
- Rate-limit and authenticate your proxy if it's public.
*/

import React, { useState, useEffect, useRef } from "react";

export default function AIChatbot() {
  const [provider, setProvider] = useState("openai"); // openai | ollama | generic
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]); // {role: 'user'|'assistant'|'system', content}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    const userMsg = { role: "user", content: input.trim() };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, message: userMsg.content, history: newHistory, systemPrompt }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error: ${res.status} ${txt}`);
      }

      // Expect JSON { reply: '...' }
      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.reply };
      setHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setHistory(prev => [...prev, { role: "assistant", content: "(Terjadi kesalahan: lihat pesan error)" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      sendMessage();
    }
  };

  const clearChat = () => {
    setHistory([]);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-2">AI Chatbot</h2>
          <p className="text-sm text-gray-600 mb-4">Pilih provider AI dan atur prompt sistem.</p>

          <label className="block text-xs font-medium text-gray-700">Provider</label>
          <select value={provider} onChange={e => setProvider(e.target.value)} className="mt-1 block w-full rounded-md border p-2">
            <option value="openai">OpenAI (ChatGPT)</option>
            <option value="ollama">Ollama (local)</option>
            <option value="generic">Generic / Proxy</option>
          </select>

          <label className="block text-xs font-medium text-gray-700 mt-4">System prompt</label>
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="mt-1 block w-full rounded-md border p-2 text-sm" rows={4} />

          <div className="mt-4 flex gap-2">
            <button onClick={clearChat} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">Clear</button>
            <button onClick={() => { setHistory(prev => [...prev, { role: 'system', content: systemPrompt }]); }} className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:opacity-95">Apply Prompt</button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Tips: Tekan Ctrl/Cmd+Enter untuk kirim. API keys harus ada di server proxy.
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col">
          <div className="flex-1 h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl border">
            {history.length === 0 && (
              <div className="text-gray-500">Mulai percakapan dengan menulis pesan di bawah.</div>
            )}

            {history.map((m, i) => (
              <div key={i} className={`mb-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto text-right' : m.role === 'system' ? 'mx-auto text-center text-sm text-gray-500' : 'mr-auto'}`}>
                <div className={`inline-block p-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : m.role === 'assistant' ? 'bg-white border' : ''}`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? "Mengirim..." : "Tulis pesan... (Ctrl/Cmd+Enter untuk kirim)"}
              className="flex-1 rounded-xl border p-3 min-h-[56px] resize-none"
            />
            <button onClick={sendMessage} disabled={loading} className={`px-4 py-2 rounded-xl ${loading ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>
              {loading ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>

          {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}

        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <strong>Catatan teknis:</strong>
        <ul className="list-disc ml-5 mt-2">
          <li>Front-end hanya memanggil <code>/api/chat</code>; buat server proxy untuk tiap provider.</li>
          <li>Server wajib memegang API key, lakukan validasi input, sanitasi, dan rate limiting.</li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------
// Example Node/Express server (minimal) - save as server.js and run on server side
// ---------------------------
/*
const express = require('express');
const fetch = require('node-fetch'); // or global fetch in newer Node
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Example: proxy to OpenAI (Chat Completions or Responses)
app.post('/api/chat', async (req, res) => {
  const { provider, message, history, systemPrompt } = req.body;

  try {
    if (provider === 'openai') {
      // Use your OpenAI key from env: process.env.OPENAI_API_KEY
      const openAiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history
          ],
          max_tokens: 800,
        })
      });
      const j = await openAiResp.json();
      // Adjust path depending on API response shape
      const reply = j.choices?.[0]?.message?.content ?? (j.output?.[0]?.content ?? JSON.stringify(j));
      res.json({ reply });

    } else if (provider === 'ollama') {
      // Ollama local server example (http://localhost:11434) - adjust if different
      const ollamaResp = await fetch('http://localhost:11434/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral', messages: [{ role: 'system', content: systemPrompt }, ...history] })
      });
      const j = await ollamaResp.json();
      const reply = j.output?.[0]?.content ?? JSON.stringify(j);
      res.json({ reply });

    } else {
      // Generic provider: forward to an external proxy you control
      // Or implement other providers like Gemini behind your server.
      res.status(400).send('Provider not implemented on server.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log('Server listening on :3000'));

ENV EXAMPLE:
OPENAI_API_KEY=sk-...
NODE_ENV=production

*/