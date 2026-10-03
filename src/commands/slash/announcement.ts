import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { SlashCommand } from "../../lib/types";
import { guildChannelUrl } from "../../lib/discord-urls";
import { getGuildRoleConfig } from "../../lib/role-panels";

const announcement: SlashCommand = {
  name: "announcement",
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const config = await getGuildRoleConfig(guildId);
    const rolesId = config.settings.rolesChannelId;

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle("Color Roles Updated!")
      .setImage(
        "https://cdn.discordapp.com/attachments/857674223295266886/1031429489638518874/unknown.png",
      )
      .setDescription(
        rolesId
          ? `We've removed previous color roles for everyone, set your color in <#${rolesId}>.`
          : "We've removed previous color roles for everyone, set your color in the roles channel.",
      );

    const components = [];
    if (rolesId) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("📝 Roles Channel")
          .setStyle(ButtonStyle.Link)
          .setURL(guildChannelUrl(guildId, rolesId)),
      );
      components.push(row);
    }

    await interaction.reply({ embeds: [embed], components });
  },
};

export default announcement;
