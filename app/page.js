 "use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    if (!url.trim()) return setError("Masukkan URL Instagram terlebih dahulu.");
    try {
      await navigator.clipboard.writeText(url.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Browser tidak mengizinkan penyalinan otomatis. Salin URL secara manual.");
    }
  }

  async function processSource(e) {
    e.preventDefault();
    setError("");
    setResults([]);
    if (!source.trim()) return setError("Tempelkan kode sumber halaman terlebih dahulu.");
    setBusy(true);
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses sumber.");
      setResults(data.media || []);
      if (!data.media?.length) setError("Tidak ditemukan URL media. Respons halaman mungkin tidak memuat media, sudah kedaluwarsa, atau memerlukan akses lain.");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="brand"><span className="brandMark">◎</span> InstaSave</div>
        <span className="topLabel">MEDIA HELPER</span>
      </header>

      <main className="wrap">
        <section className="panel">
          <div className="eyebrow">INSTAGRAM MEDIA TOOL</div>
          <h1>Unduh Media Instagram</h1>
          <p className="intro">Proses foto dan video dari halaman yang dapat kamu akses.</p>

          <div className="notice">
            Gunakan hanya untuk media milikmu atau yang pemiliknya mengizinkan untuk disimpan.
            Jangan masukkan password, cookie, token, atau data autentikasi ke website ini.
            Parser ini tidak membobol akun privat dan tidak mengambil alih sesi Instagram.
          </div>

          <form onSubmit={processSource}>
            <div className="step">
              <div className="stepTitle"><span>1</span> Tempel URL Instagram</div>
              <input
                className="field"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <div className="buttonLine">
                <button className="secondary" type="button" onClick={copyUrl}> {copied ? "Tersalin!" : "Salin URL"} </button>
                {url && <a className="textLink" href={url} target="_blank" rel="noreferrer">Buka URL di tab baru ↗</a>}
              </div>
            </div>

            <div className="step">
              <div className="stepTitle"><span>2</span> Salin kode sumber halaman</div>
              <p className="help">
                Buka halaman yang memang bisa kamu akses. Jika browser menyediakan tampilan kode sumber,
                salin HTML/JSON yang relevan. Jangan menyalin atau membagikan cookie maupun token login.
              </p>
            </div>

            <div className="step">
              <div className="stepTitle"><span>3</span> Masukkan kode sumber</div>
              <textarea
                className="field source"
                placeholder="Tempel kode sumber halaman di sini..."
                value={source}
                onChange={e => setSource(e.target.value)}
                maxLength={2000000}
              />
              <div className="counter">{source.length.toLocaleString("id-ID")} / 2.000.000 karakter</div>
            </div>

            <button className="primary" type="submit" disabled={busy}>
              {busy ? "Memproses..." : "Proses Media"}
            </button>
          </form>

          {error && <div className="error" role="alert">{error}</div>}

          {results.length > 0 && (
            <section className="results">
              <h2>Media ditemukan ({results.length})</h2>
              {results.map((item, i) => (
                <div className="result" key={item.url}>
                  <div className="resultInfo">
                    <strong>{item.type === "video" ? "Video" : "Foto"} {i + 1}</strong>
                    <span>{item.url.length > 90 ? item.url.slice(0, 90) + "…" : item.url}</span>
                  </div>
                  <a className="download" href={item.url} target="_blank" rel="noreferrer">Buka / Simpan</a>
                </div>
              ))}
              <p className="help">Tautan media dibuka langsung dari sumbernya. Ketersediaan unduhan bergantung pada izin akses dan masa berlaku tautan.</p>
            </section>
          )}
        </section>
        <footer>InstaSave · Gunakan media secara bertanggung jawab</footer>
      </main>
    </>
  );
}