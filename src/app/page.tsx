"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("My ODIA key");
  const [limit, setLimit] = useState<number>(120);
  const [minted, setMinted] = useState<{id?: string; api_key?: string; last4?: string} | null>(null);
  const [text, setText] = useState("Hello Nigeria! This is ODIA Voice AI.");
  const [voice, setVoice] = useState("female");
  const [status, setStatus] = useState<string | null>(null);

  async function createKey() {
    setStatus("Creating key");
    setMinted(null);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rate_limit: limit })
    });
    const data = await res.json();
    if (!res.ok) { setStatus(`Error: ${data?.error ?? "unknown"}`); return; }
    // data may be an object or a single-row array depending on PostgRPC
    const row = Array.isArray(data) ? data[0] : data;
    setMinted(row);
    setStatus("Key created. Copy it nowwill only be shown once.");
  }

  async function testTTS() {
    if (!minted?.api_key) { setStatus("Create a key first."); return; }
    setStatus("Calling gateway");
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_GATEWAY_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": minted.api_key
        },
        body: JSON.stringify({ text, voice })  // your gateway forwards this
      });
      if (!res.ok) {
        const msg = await res.text();
        setStatus(`Gateway error (${res.status}): ${msg}`);
        return;
      }
      // assume audio/mpeg returned
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      setStatus(" Played response audio.");
    } catch (e:any) {
      setStatus(`Request failed: ${e?.message ?? e}`);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0F1222]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-[#4A4AC1]">ODIA Voice AI</h1>
        <p className="mt-1 opacity-75">Mint an API key and test Text-to-Speech through the Supabase gateway.</p>

        <section className="mt-8 rounded-2xl border border-[#D9DDF5] p-6">
          <h2 className="text-lg font-medium mb-3">1) Create API key</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Key Name
              <input value={name} onChange={e=>setName(e.target.value)}
                     className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="text-sm">Rate limit (req/min)
              <input type="number" value={limit} onChange={e=>setLimit(parseInt(e.target.value||"0"))}
                     className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
          </div>
          <button onClick={createKey}
                  className="mt-4 rounded-xl bg-[#5B5BD6] px-4 py-2 text-white hover:bg-[#4A4AC1]">
            Create key
          </button>

          {minted?.api_key && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="text-sm font-medium">Save this key now (shown once):</div>
              <code className="mt-1 block break-all text-sm">{minted.api_key}</code>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-[#D9DDF5] p-6">
          <h2 className="text-lg font-medium mb-3">2) Test TTS</h2>
          <label className="text-sm block">Text
            <textarea value={text} onChange={e=>setText(e.target.value)}
                      rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <div className="mt-3">
            <label className="text-sm">Voice
              <select value={voice} onChange={e=>setVoice(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
          </div>
          <button onClick={testTTS}
                  className="mt-4 rounded-xl bg-[#00B3A4] px-4 py-2 text-white hover:opacity-90">
            Play test
          </button>
        </section>

        {status && <p className="mt-6 text-sm opacity-80">Status: {status}</p>}
      </div>
    </main>
  );
}
