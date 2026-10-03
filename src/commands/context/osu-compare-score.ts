import { EmbedBuilder, type MessageContextMenuCommandInteraction } from "discord.js";
import type { ContextCommand } from "../../lib/types";
import { applyScoreReply } from "../../lib/osu-score-reply";
import {
  fetchMessageBeatmapId,
  fetchOsuDiscordLink,
  fetchOsuUser,
  fetchUserBeatmapScore,
  fetchUserBeatmapScoreCard,
  putChannelBeatmap,
  putMessageBeatmap,
} from "../../lib/osu-api3";

const osuCompareScore: ContextCommand = {
  id: "osu-compare-score",
  discordName: "Compare score",
  async execute(interaction: MessageContextMenuCommandInteraction) {
    await interaction.deferReply();

    let link;
    try {
      link = await fetchOsuDiscordLink(interaction.user.id);
    } catch {
      link = null;
    }

    if (!link?.username) {
      await interaction.editReply({
        content: "Please set your username with `;osuset <username>`",
      });
      return;
    }

    let beatmapId: string;
    try {
      const row = await fetchMessageBeatmapId(interaction.targetMessage.id);
      beatmapId = row.beatmapId;
    } catch {
      await interaction.editReply({ content: "No maps found in the message." });
      return;
    }

    let username = link.username;
    try {
      const user = await fetchOsuUser(username, "fruits");
      username = user.username;
    } catch {
      await interaction.editReply({
        content: `User \`${link.username}\` is not found`,
      });
      return;
    }

    const loading = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription("**Calculating score…**");
    await interaction.editReply({ embeds: [loading] });

    try {
      const [score, cardPng] = await Promise.all([
        fetchUserBeatmapScore(username, beatmapId, []),
        fetchUserBeatmapScoreCard(username, beatmapId, []),
      ]);

      await applyScoreReply(
        (options) => interaction.editReply(options),
        score,
        cardPng,
        "compare",
      );

      const bm = String(score.beatmapId);
      await putChannelBeatmap(interaction.channelId, bm);
      await putMessageBeatmap(interaction.targetMessage.id, bm);
      const reply = await interaction.fetchReply();
      if (reply.id) {
        await putMessageBeatmap(reply.id, bm);
      }
    } catch (e) {
      const text =
        e instanceof Error ? e.message : "An error occurred. Please try again";
      await interaction.editReply({
        content: text,
        embeds: [],
        components: [],
        files: [],
      });
    }
  },
};

export default osuCompareScore;
