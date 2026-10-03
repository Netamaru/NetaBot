const API3_URL = process.env.API3_URL || "http://localhost:5000";
const API3_KEY = process.env.API3_KEY || "";

export type OsuUserDto = {
  id: number;
  username: string;
  avatarUrl: string;
};

export type OsuProfileDto = {
  id: number;
  username: string;
  avatarUrl: string;
  coverUrl: string | null;
  profileUrl: string;
  countryCode: string;
  globalRank: number | null;
  countryRank: number | null;
  peakRank: number | null;
  peakRankAtUnix: number | null;
  level: number;
  levelProgress: number;
  pp: number;
  accuracy: number;
  playCount: number;
  playTimeSeconds: number;
  rankedScore: number;
  totalScore: number;
  maxCombo: number;
  firstPlaces: number;
  replaysWatched: number;
  replaysWatchedThisMonth: number;
  followers: number;
  grades: { ssh: number; ss: number; sh: number; s: number; a: number };
  isActive: boolean;
  isSupporter: boolean;
  pmFriendsOnly: boolean;
  joinDate: string;
  kudosuTotal: number;
  kudosuAvailable: number;
  previousUsernames: string[];
  title: string | null;
  groups: string[];
  badges: string[];
};

export type BeatmapInfoDto = {
  beatmapId: string;
  title: string;
  url: string;
  status: string;
  ar: number;
  cs: number;
  stars: number;
  bpm: number;
  lengthSeconds: number;
  circles: number;
  sliders: number;
  spinners: number;
  maxCombo: number | null;
  coverList: string | null;
  coverSlim: string | null;
  beatmapsetId: number;
  favouriteCount: number;
  creator: string;
  mapperUsername: string | null;
  mapperAvatar: string | null;
  submittedAt: string | null;
  updatedAt: string | null;
  performance: Array<{
    label: string;
    pp: number;
    stars: number;
    maxCombo: number;
  }>;
};

export type OsuDiscordLink = {
  username: string;
  id: number;
};

export type RecentScoreDto = {
  osuUserId: number;
  username: string;
  avatarUrl: string;
  beatmapId: number;
  beatmapVersion: string;
  beatmapStatus: string;
  artist: string;
  title: string;
  mods: string[];
  modDisplay: string;
  rank: string;
  pp: number;
  stars: number;
  maxCombo: number;
  scoreCombo: number;
  accuracyPercent: number;
  missCount: number;
  dropletMiss: number;
  scoreDisplay: string;
  great: number;
  tickHit: number;
  endedAt: string;
  endedAtUnix: number;
  coverList: string | null;
  tryOnMap: number;
  globalRank: number | null;
  ppIfFc: number | null;
  ppIf100Fc: number | null;
  profileUrl: string;
  beatmapUrl: string;
  ar: number;
  cs: number;
  bpm: number;
  mapper: string;
  coverBg: string | null;
};

async function osuGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API3_URL}${path}`, {
    headers: { "x-api-key": API3_KEY },
  });

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data: T;
  };

  if (!res.ok || json.status === false) {
    throw new Error(json.message || `osu API3 ${res.status}`);
  }

  return json.data;
}

export function fetchOsuUser(username: string, mode = "fruits") {
  const q = mode !== "fruits" ? `?mode=${encodeURIComponent(mode)}` : "";
  return osuGet<OsuUserDto>(
    `/api/osu/users/${encodeURIComponent(username)}${q}`,
  );
}

export function fetchOsuUserProfile(username: string, mode: string) {
  const params = new URLSearchParams({ mode });
  return osuGet<OsuProfileDto>(
    `/api/osu/users/${encodeURIComponent(username)}/profile?${params}`,
  );
}

export function fetchBeatmapInfoForMessage(messageId: string) {
  return osuGet<BeatmapInfoDto>(
    `/api/osu/messages/${messageId}/beatmap-info`,
  );
}

export function fetchBeatmapInfo(beatmapId: string) {
  return osuGet<BeatmapInfoDto>(
    `/api/osu/beatmaps/${encodeURIComponent(beatmapId)}`,
  );
}

export function fetchOsuDiscordLink(discordUserId: string) {
  return osuGet<OsuDiscordLink | null>(
    `/api/osu/discord-links/${discordUserId}`,
  );
}

export async function putOsuDiscordLink(
  discordUserId: string,
  username: string,
) {
  return osuPut<OsuDiscordLink>(
    `/api/osu/discord-links/${discordUserId}`,
    { username },
  );
}

export async function putChannelBeatmap(channelId: string, beatmapId: string) {
  return osuPut<{ channelId: string; beatmapId: string }>(
    `/api/osu/beatmapdb/channels/${channelId}`,
    { beatmapId },
  );
}

export function fetchUserRecentScore(username: string, index: number) {
  return osuGet<RecentScoreDto>(
    `/api/osu/users/${encodeURIComponent(username)}/recent/${index}`,
  );
}

function modsQuery(mods: string[]) {
  return mods.length ? `?mods=${encodeURIComponent(mods.join(","))}` : "";
}

export function fetchChannelBeatmapId(channelId: string) {
  return osuGet<{ channelId: string; beatmapId: string | null }>(
    `/api/osu/beatmapdb/channels/${channelId}`,
  );
}

export function fetchMessageBeatmapId(messageId: string) {
  return osuGet<{ messageId: string; beatmapId: string }>(
    `/api/osu/messages/${messageId}/beatmap-id`,
  );
}

export function fetchUserBeatmapScore(
  username: string,
  beatmapId: string,
  mods: string[] = [],
) {
  return osuGet<RecentScoreDto>(
    `/api/osu/beatmaps/${beatmapId}/users/${encodeURIComponent(username)}/score${modsQuery(mods)}`,
  );
}

export async function fetchUserBeatmapScoreCard(
  username: string,
  beatmapId: string,
  mods: string[] = [],
): Promise<Buffer> {
  const res = await fetch(
    `${API3_URL}/api/osu/beatmaps/${beatmapId}/users/${encodeURIComponent(username)}/score/card${modsQuery(mods)}`,
    { headers: { "x-api-key": API3_KEY } },
  );
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message || `osu score card ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function fetchUserRecentScoreCard(
  username: string,
  index: number,
): Promise<Buffer> {
  const res = await fetch(
    `${API3_URL}/api/osu/users/${encodeURIComponent(username)}/recent/${index}/card`,
    { headers: { "x-api-key": API3_KEY } },
  );
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message || `osu score card ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function putMessageBeatmap(messageId: string, beatmapId: string) {
  return osuPut<{ messageId: string; beatmapId: string }>(
    `/api/osu/beatmapdb/messages/${messageId}`,
    { beatmapId },
  );
}

async function osuPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API3_URL}${path}`, {
    method: "PUT",
    headers: {
      "x-api-key": API3_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data: T;
  };

  if (!res.ok || json.status === false) {
    throw new Error(json.message || `osu API3 ${res.status}`);
  }

  return json.data;
}
