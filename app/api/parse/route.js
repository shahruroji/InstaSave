import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SOURCE_LENGTH = 2_000_000;

function safeMediaUrl(raw) {
  if (typeof raw !== "string") return null;
  let value = raw.trim().replaceAll("&amp;", "&").replaceAll("\\u0026", "&").replaceAll("\\/", "/");
  try {
    const parsed = new URL(value);
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    // Hanya URL media yang ditemukan dalam sumber yang dikirim pengguna.
    const host = parsed.hostname.toLowerCase();
    const looksLikeMedia =
      /\.(jpe?g|png|webp|gif|mp4|mov)(?:$|[?#])/i.test(parsed.pathname) ||
      /cdninstagram|fbcdn|instagram/i.test(host) ||
      /video|image|media/i.test(parsed.pathname);
    return looksLikeMedia ? parsed.href : null;
  } catch {
    return null;
  }
}

function extractCandidates(source) {
  const found = new Set();
  const patterns = [
    /https?:\\?\/\\?\/[^"'\\\s<>]+/gi,
    /https?:\/\/[^"'\\\s<>]+/gi
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const candidate = match[0]
        .replaceAll("\\u0026", "&")
        .replaceAll("\\/", "/")
        .replace(/[),;]+$/, "");
      const safe = safeMediaUrl(candidate);
      if (safe) found.add(safe);
    }
  }
  return [...found];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const source = body?.source;
    if (typeof source !== "string" || !source.trim()) {
      return NextResponse.json({ error: "Kode sumber kosong atau tidak valid." }, { status: 400 });
    }
    if (source.length > MAX_SOURCE_LENGTH) {
      return NextResponse.json({ error: "Kode sumber terlalu besar. Batas 2 MB." }, { status: 413 });
    }

    const urls = extractCandidates(source);
    const media = urls.map(url => ({
      url,
      type: /\.(mp4|mov)(?:$|[?#])/i.test(url) || /video/i.test(url) ? "video" : "image"
    }));

    return NextResponse.json({ media });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 });
  }
}