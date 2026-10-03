export function guildChannelUrl(guildId: string, channelId: string) {
  return `https://discord.com/channels/${guildId}/${channelId}`;
}

export function avatarCdnUrl(
  userId: string,
  hash: string | null | undefined,
  size = 4096,
) {
  if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=${size}`;
}

export function guildMemberAvatarCdnUrl(
  guildId: string,
  userId: string,
  hash: string,
  size = 4096,
) {
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${hash}.${ext}?size=${size}`;
}
