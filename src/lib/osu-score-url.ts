/** osu! score links: /scores/123 or /scores/fruits/123 */
const OSU_SCORE_URL =
  /https?:\/\/osu\.ppy\.sh\/scores\/(?:(osu|taiko|fruits|mania)\/)?(\d+)/gi;

/**
 * First CTB score id in message content (skips explicit non-fruits ruleset links).
 */
export function extractFruitsScoreId(content: string): string | null {
  for (const m of content.matchAll(OSU_SCORE_URL)) {
    const ruleset = m[1]?.toLowerCase();
    if (ruleset && ruleset !== "fruits") continue;
    const id = m[2];
    if (id) return id;
  }
  return null;
}
