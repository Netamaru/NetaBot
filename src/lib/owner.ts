const ownerIds = new Set(
  (process.env.OWNER_DISCORD_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);

export const isOwner = (userId: string) => ownerIds.has(userId);
