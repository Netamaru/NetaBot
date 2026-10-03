import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";
import { fetchGuildEnabled } from "../../lib/api3";

const help: SlashCommand = {
  name: "help",
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: "Guild only.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const enabled = await fetchGuildEnabled(guildId);
    const lines = [
      "**Slash:** " + (enabled.slash.join(", ") || "(none)"),
      "**Prefix** (`" + enabled.prefix + "`): " +
        (enabled.prefixCommands.join(", ") || "(none)"),
    ];
    await interaction.reply({
      content: lines.join("\n"),
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default help;
