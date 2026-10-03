import { fetchRolePanels, type GuildRoleConfigDto } from "./api3";

export type { GuildRoleConfigDto };

const cache = new Map<string, { data: GuildRoleConfigDto; expires: number }>();
const TTL_MS = 30_000;

export async function getGuildRoleConfig(
  guildId: string,
): Promise<GuildRoleConfigDto> {
  const hit = cache.get(guildId);
  if (hit && hit.expires > Date.now()) return hit.data;

  const data = await fetchRolePanels(guildId);
  cache.set(guildId, { data, expires: Date.now() + TTL_MS });
  return data;
}

export function clearRolePanelCache(guildId?: string) {
  if (guildId) cache.delete(guildId);
  else cache.clear();
}

export function findRoleItem(
  config: GuildRoleConfigDto,
  interactionKey: string,
) {
  for (const panel of config.panels) {
    const item = panel.items.find((i) => i.interactionKey === interactionKey);
    if (item) return { panel, item };
  }
  return null;
}

export function allAssignableRoleIds(config: GuildRoleConfigDto) {
  const ids = new Set<string>();
  for (const panel of config.panels) {
    for (const item of panel.items) {
      if (item.roleId) ids.add(item.roleId);
    }
  }
  if (config.settings.nsfwAccessRoleId) {
    ids.add(config.settings.nsfwAccessRoleId);
  }
  return [...ids];
}

export function colorRoleIds(config: GuildRoleConfigDto) {
  const panel = config.panels.find((p) => p.exclusiveGroup === "color");
  if (!panel) return [];
  return panel.items
    .map((item) => item.roleId)
    .filter((id): id is string => Boolean(id));
}
