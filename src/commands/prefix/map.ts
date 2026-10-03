import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { putChannelBeatmap } from "../../lib/osu-api3";

/** Sets default CTB beatmap for channel (fruits beatmapset URL). Silent like V14. */
const map: PrefixCommand = {
  name: "map",
  async execute(message: Message, args: string[]) {
    if (!args.length || !message.channelId) return;

    const text = args[0]!;
    if (!text.startsWith("https://osu.ppy.sh/beatmapsets/")) return;
    if (!text.includes("#fruits")) return;

    const beatmapPart = text.substring(text.indexOf("#") + 8);
    const cleanBeatmapId = beatmapPart.split(" ")[0]!.replace(/\D/g, "");
    if (!cleanBeatmapId) return;

    try {
      await putChannelBeatmap(message.channelId, cleanBeatmapId);
    } catch (err) {
      console.error("map command failed:", err);
    }
  },
};

export default map;
