import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";

const changelog: SlashCommand = {
  name: "changelog",
  async execute(interaction: ChatInputCommandInteraction) {
    const ts = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
      .setColor(0xadd8e6)
      .setDescription(
        `<t:${ts}:f> **|** <t:${ts}:R>\n\n**Changelog:**\n> - Bot rewrite in progress (NetaBot + API3 + FE)`,
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default changelog;
