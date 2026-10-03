import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { SlashCommand } from "../../lib/types";
import { guildChannelUrl } from "../../lib/discord-urls";
import { getGuildRoleConfig } from "../../lib/role-panels";

const DEFAULT_IMAGE =
  "https://cdn.discordapp.com/attachments/857674223295266886/1011983270289883156/welcome.png";
const DEFAULT_THUMB =
  "https://cdn.discordapp.com/attachments/857674223295266886/885217724626792508/ava.png";

const welcome: SlashCommand = {
  name: "welcome",
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const config = await getGuildRoleConfig(guildId);
    const { settings } = config;

    const cmdRoleId = settings.welcomeCmdRoleId;
    if (cmdRoleId) {
      const member = interaction.member;
      const hasRole =
        member &&
        "roles" in member &&
        typeof member.roles !== "string" &&
        !Array.isArray(member.roles) &&
        member.roles.cache.has(cmdRoleId);
      if (!hasRole) {
        await interaction.reply({
          content: "You do not have permission to use this command.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    const rulesId = settings.rulesChannelId;
    const rolesId = settings.rolesChannelId;

    const description = [
      rulesId
        ? `Please read <#${rulesId}>`
        : "Please read the rules channel",
      rolesId
        ? `Get your roles in <#${rolesId}>`
        : "Get your roles in the roles channel",
      "Enjoy your stay!",
    ].join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle("Welcome to Netamaru's server")
      .setImage(settings.welcomeImageUrl ?? DEFAULT_IMAGE)
      .setThumbnail(settings.welcomeThumbnailUrl ?? DEFAULT_THUMB)
      .setDescription(description);

    const row = new ActionRowBuilder<ButtonBuilder>();
    if (rulesId) {
      row.addComponents(
        new ButtonBuilder()
          .setLabel("📖 Rules Channel")
          .setStyle(ButtonStyle.Link)
          .setURL(guildChannelUrl(guildId, rulesId)),
      );
    }
    if (rolesId) {
      row.addComponents(
        new ButtonBuilder()
          .setLabel("📝 Roles Channel")
          .setStyle(ButtonStyle.Link)
          .setURL(guildChannelUrl(guildId, rolesId)),
      );
    }

    await interaction.reply({
      embeds: [embed],
      components: row.components.length ? [row] : [],
    });
  },
};

export default welcome;
