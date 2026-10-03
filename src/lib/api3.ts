const API3_URL = process.env.API3_URL || "http://localhost:5000";
const API3_KEY = process.env.API3_KEY || "";

export interface GuildEnabled {
  guildId: string;
  prefix: string;
  slash: string[];
  prefixCommands: string[];
}

export interface LethalProfile {
  id: string;
  time: string;
}

export interface RolePanelItemDto {
  interactionKey: string;
  roleId: string | null;
  label: string;
  emoji: string | null;
  buttonStyle: number | null;
  sort: number;
  metadata: Record<string, unknown>;
}

export interface RolePanelDto {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  embedColor: number | null;
  interactionType: "button" | "select";
  requiredRoleId: string | null;
  exclusiveGroup: string | null;
  imageUrl: string | null;
  sort: number;
  items: RolePanelItemDto[];
}

export interface GuildRoleConfigDto {
  guildId: string;
  settings: {
    serverAccessRoleId: string | null;
    nsfwAccessRoleId: string | null;
    welcomeChannelId: string | null;
    leaveChannelId: string | null;
    rulesChannelId: string | null;
    rolesChannelId: string | null;
    welcomeCmdRoleId: string | null;
    welcomeImageUrl: string | null;
    welcomeThumbnailUrl: string | null;
  };
  panels: RolePanelDto[];
}

const cache = new Map<string, { data: GuildEnabled; expires: number }>();
const TTL_MS = 30_000;

export async function fetchGuildEnabled(guildId: string): Promise<GuildEnabled> {
  const hit = cache.get(guildId);
  if (hit && hit.expires > Date.now()) return hit.data;

  const res = await fetch(`${API3_URL}/api/guilds/${guildId}/enabled`, {
    headers: { "x-api-key": API3_KEY },
  });

  if (!res.ok) {
    throw new Error(`API3 enabled failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    status: boolean;
    data: GuildEnabled;
  };

  cache.set(guildId, { data: json.data, expires: Date.now() + TTL_MS });
  return json.data;
}

export function clearEnabledCache(guildId?: string) {
  if (guildId) cache.delete(guildId);
  else cache.clear();
}

export async function updateGuildPrefix(
  guildId: string,
  prefix: string,
): Promise<void> {
  const res = await fetch(`${API3_URL}/api/guilds/${guildId}/prefix`, {
    method: "PATCH",
    headers: {
      "x-api-key": API3_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix }),
  });

  if (!res.ok) {
    throw new Error(`API3 prefix update failed: ${res.status} ${await res.text()}`);
  }

  clearEnabledCache(guildId);
}

export async function fetchLethalProfile(): Promise<LethalProfile | null> {
  const res = await fetch(`${API3_URL}/api/lethal/profile`, {
    headers: { "x-api-key": API3_KEY },
  });

  if (!res.ok) {
    throw new Error(`API3 lethal profile failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    status: boolean;
    data: LethalProfile | null;
  };

  return json.data;
}

export async function updateLethalProfile(id: string): Promise<LethalProfile> {
  const res = await fetch(`${API3_URL}/api/lethal/profile`, {
    method: "PUT",
    headers: {
      "x-api-key": API3_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error(`API3 lethal update failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    status: boolean;
    data: LethalProfile;
  };

  return json.data;
}

export async function fetchCamImage(camId: number): Promise<Buffer> {
  const res = await fetch(`${API3_URL}/api/cam/${camId}`, {
    headers: { "x-api-key": API3_KEY },
  });

  if (!res.ok) {
    throw new Error(`API3 cam failed: ${res.status} ${await res.text()}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

export type WelcomeCardRequest = {
  kind: "join" | "leave";
  userId: string;
  username: string;
  avatarUrl: string;
  memberCount?: number;
  joinedAt?: number;
  userTag?: string;
};

export async function fetchWelcomeCard(
  payload: WelcomeCardRequest,
): Promise<Buffer> {
  const res = await fetch(`${API3_URL}/api/welcome-card`, {
    method: "POST",
    headers: {
      "x-api-key": API3_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `API3 welcome card failed: ${res.status} ${await res.text()}`,
    );
  }

  return Buffer.from(await res.arrayBuffer());
}

export async function fetchRolePanels(guildId: string): Promise<GuildRoleConfigDto> {
  const res = await fetch(`${API3_URL}/api/guilds/${guildId}/role-panels`, {
    headers: { "x-api-key": API3_KEY },
  });

  if (!res.ok) {
    throw new Error(`API3 role panels failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as {
    status: boolean;
    data: GuildRoleConfigDto;
  };

  return json.data;
}
