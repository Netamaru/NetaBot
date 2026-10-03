import { EdgeTTS } from "edge-tts-universal";

const DEFAULT_EDGE_VOICE = "id-ID-GadisNeural";
const DEFAULT_9ROUTER_MODEL = "google-tts/id";

function speechUrl(): string | null {
  const url =
    process.env.TTS_SPEECH_URL?.trim() ||
    process.env.TTS_API_URL?.trim() ||
    "";
  return url || null;
}

function use9Router(): boolean {
  const provider = process.env.TTS_PROVIDER?.trim().toLowerCase();
  if (provider === "edge") return false;
  if (provider === "9router") return true;
  return Boolean(speechUrl());
}

async function synthesize9Router(text: string): Promise<Buffer> {
  const url = speechUrl();
  const key = process.env.TTS_API_KEY?.trim();
  if (!url) {
    throw new Error("TTS_SPEECH_URL or TTS_API_URL not configured");
  }
  if (!key) {
    throw new Error("TTS_API_KEY not configured");
  }

  const model =
    process.env.TTS_MODEL?.trim() ||
    process.env.TTS_VOICE?.trim() ||
    DEFAULT_9ROUTER_MODEL;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, input: text }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS API ${res.status}: ${errText.slice(0, 500)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function synthesizeEdge(text: string): Promise<Buffer> {
  const voice =
    process.env.TTS_VOICE?.trim() || DEFAULT_EDGE_VOICE;
  const synth = new EdgeTTS(text, voice);
  const result = await synth.synthesize();
  return Buffer.from(await result.audio.arrayBuffer());
}

export async function synthesizeTtsAudio(text: string): Promise<Buffer> {
  if (use9Router()) {
    return synthesize9Router(text);
  }
  return synthesizeEdge(text);
}
