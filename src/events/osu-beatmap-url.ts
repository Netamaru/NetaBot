import type { Message } from "discord.js";
import { buildBeatmapInfoEmbed } from "../lib/build-beatmap-info-embed";
import { extractFruitsBeatmapId } from "../lib/osu-beatmap-url";
import {
  fetchBeatmapInfo,
  putChannelBeatmap,
  putMessageBeatmap,
} from "../lib/osu-api3";

/**
 * Auto-reply with beatmap embed when a CTB beatmap URL is posted (V14 osu-beatmap.js).
 * @returns true if this message was handled
 */
export async function tryOsuBeatmapUrlEmbed(message: Message): Promise<boolean> {
  if (message.author.bot || !message.guild) return false;

  const beatmapId = extractFruitsBeatmapId(message.content);
  if (!beatmapId) return false;

  if ("sendTyping" in message.channel) {
    await message.channel.sendTyping();
  }
  const pending = await message.reply("## Calculating map...");

  try {
    const info = await fetchBeatmapInfo(beatmapId);
    const payload = buildBeatmapInfoEmbed(info);

    await pending.edit({ content: "", ...payload });

    await putChannelBeatmap(message.channelId, beatmapId);
    await putMessageBeatmap(message.id, beatmapId);
    await putMessageBeatmap(pending.id, beatmapId);

    return true;
  } catch (err) {
    console.error("osu beatmap url embed:", err);
    await pending.delete().catch(() => undefined);
    return true;
  }
}
