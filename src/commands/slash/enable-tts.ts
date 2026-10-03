import { ChannelType, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";
import { setTtsEnabled } from "../../lib/api3-tts";
import { isOwner } from "../../lib/owner";

const enableTts: SlashCommand = {
  name: "enable_tts",
  async execute(interaction: ChatInputCommandInteraction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        content: "Only the bot owner can use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.channel;
    if (
      !channel ||
      (channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.GuildAnnouncement)
    ) {
      await interaction.reply({
        content: "Run this command in a text channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await setTtsEnabled(channel.id, interaction.guild.id, true, interaction.user.id);
    await interaction.reply({
      content: `TTS enabled for ${channel}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default enableTts;
