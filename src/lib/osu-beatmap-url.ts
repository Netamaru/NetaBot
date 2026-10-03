/** CTB beatmapset links: .../beatmapsets/123#fruits/456 */
export const OSU_FRUITS_BEATMAP_URL =
  /https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#fruits\/(\d+)/;

export function extractFruitsBeatmapId(content: string): string | null {
  const m = content.match(OSU_FRUITS_BEATMAP_URL);
  return m?.[1] ?? null;
}
