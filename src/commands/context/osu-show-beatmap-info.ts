import { MessageFlags, type MessageContextMenuCommandInteraction } from "discord.js";
import type { ContextCommand } from "../../lib/types";
import { buildBeatmapInfoEmbed } from "../../lib/build-beatmap-info-embed";
import { fetchBeatmapInfoForMessage } from "../../lib/osu-api3";

const osuShowBeatmapInfo: ContextCommand = {
  id: "osu-show-beatmap-info",
  discordName: "Show beatmap info",
  async execute(interaction: MessageContextMenuCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const info = await fetchBeatmapInfoForMessage(interaction.targetMessage.id);
      const payload = buildBeatmapInfoEmbed(info);
      await interaction.editReply(payload);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unable to fetch beatmap info";
      await interaction.editReply({
        content: msg.includes("not found")
          ? "No maps found in the message."
          : msg,
      });
    }
  },
};

export default osuShowBeatmapInfo;
