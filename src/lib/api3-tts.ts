const API3_URL = process.env.API3_URL || "http://localhost:5000";
const API3_KEY = process.env.API3_KEY || "";

const cache = new Map<string, { enabled: boolean; expires: number }>();
const TTL_MS = 30_000;

export function invalidateTtsChannelCache(channelId: string) {
  cache.delete(channelId);
}

export async function fetchTtsEnabled(channelId: string): Promise<boolean> {
  const hit = cache.get(channelId);
  if (hit && hit.expires > Date.now()) return hit.enabled;

  const res = await fetch(`${API3_URL}/api/tts/channels/${channelId}`, {
    headers: { "x-api-key": API3_KEY },
  });

  if (!res.ok) {
    throw new Error(`API3 TTS get failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    status: boolean;
    data: { enabled: boolean };
  };

  cache.set(channelId, {
    enabled: json.data.enabled,
    expires: Date.now() + TTL_MS,
  });
  return json.data.enabled;
}

export async function setTtsEnabled(
  channelId: string,
  guildId: string,
  enabled: boolean,
  enabledBy?: string,
): Promise<void> {
  const res = await fetch(`${API3_URL}/api/tts/channels/${channelId}`, {
    method: "PUT",
    headers: {
      "x-api-key": API3_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guildId, enabled, enabledBy }),
  });

  if (!res.ok) {
    throw new Error(`API3 TTS put failed: ${res.status} ${await res.text()}`);
  }

  invalidateTtsChannelCache(channelId);
}
