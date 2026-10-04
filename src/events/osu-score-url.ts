import { EmbedBuilder, type Message } from "discord.js";
import { buildScoreLinkReply } from "../lib/build-score-link-embed";
import { extractFruitsScoreId } from "../lib/osu-score-url";
import {
  fetchScoreById,
  fetchScoreRankingPanel,
  putChannelBeatmap,
  putMessageBeatmap,
} from "../lib/osu-api3";

/**
 * Score URL → classic embed + 1920×1080 ranking panel (NetaBot-V14 osu-score.js).
 */
export async function tryOsuScoreUrlReply(message: Message): Promise<boolean> {
  if (message.author.bot || !message.guild) return false;

  const scoreId = extractFruitsScoreId(message.content);
  if (!scoreId) return false;

  if ("sendTyping" in message.channel) {
    await message.channel.sendTyping();
  }

  const loading = new EmbedBuilder()
    .setColor(0x2f3136)
    .setDescription("**Calculating score…**");
  const pending = await message.reply({ embeds: [loading] });

  try {
    const [score, panelPng] = await Promise.all([
      fetchScoreById(scoreId),
      fetchScoreRankingPanel(scoreId),
    ]);

    const attachmentName = `score-${scoreId}.png`;
    await pending.edit(
      buildScoreLinkReply(score, panelPng, attachmentName),
    );

    const beatmapId = String(score.beatmapId);
    await putChannelBeatmap(message.channelId, beatmapId);
    await putMessageBeatmap(message.id, beatmapId);
    await putMessageBeatmap(pending.id, beatmapId);

    return true;
  } catch (err) {
    console.error("osu score url:", err);
    const text =
      err instanceof Error ? err.message : "Could not load that score.";
    await pending.edit({
      content: text,
      embeds: [],
      components: [],
      files: [],
    });
    return true;
  }
}
