import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { SlashCommand } from "../../lib/types";

const test: SlashCommand = {
  name: "test",
  async execute(interaction: ChatInputCommandInteraction) {
    const button = new ButtonBuilder()
      .setCustomId("test01")
      .setLabel("test")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    await interaction.reply({ content: "test", components: [row] });
  },
};

export default test;
