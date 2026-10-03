import { EmbedBuilder, MessageFlags, type GuildMember } from "discord.js";
import {
  allAssignableRoleIds,
  colorRoleIds,
  findRoleItem,
  getGuildRoleConfig,
} from "../lib/role-panels";

const DENIED_ICON =
  "https://cdn.discordapp.com/attachments/840187448356241429/884396829037453342/x.png";
const ADDED_ICON =
  "https://cdn.discordapp.com/attachments/840187448356241429/884396826399227944/clipart289596.png";
const REMOVED_ICON =
  "https://cdn.discordapp.com/attachments/857674223295266886/1006978845418729604/checkmarkRed.png";

function deniedEmbed(message: string) {
  return new EmbedBuilder()
    .setColor(0xb80000)
    .setAuthor({ name: message, iconURL: DENIED_ICON });
}

function addedEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(0x19b800)
    .setAuthor({ name: "Added", iconURL: ADDED_ICON })
    .setDescription(description);
}

function removedEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(0xb80000)
    .setAuthor({ name: "Removed", iconURL: REMOVED_ICON })
    .setDescription(description);
}

function requiresServerAccess(
  interactionKey: string,
  metadata: Record<string, unknown>,
) {
  const kind = metadata.kind as string | undefined;
  return kind !== "server_access";
}

export async function handleRoleInteraction(
  interaction: {
    guildId: string | null;
    customId?: string;
    values?: readonly string[];
    reply: (options: {
      content?: string;
      embeds?: EmbedBuilder[];
      flags?: number;
    }) => Promise<unknown>;
    deferUpdate?: () => Promise<unknown>;
  },
  member: GuildMember,
  interactionKey: string,
) {
  if (!interaction.guildId) return false;

  const config = await getGuildRoleConfig(interaction.guildId);
  const match = findRoleItem(config, interactionKey);
  if (!match) return false;

  const { panel, item } = match;
  const kind = item.metadata.kind as string | undefined;

  if (kind === "cancel") {
    if (interaction.deferUpdate) await interaction.deferUpdate();
    return true;
  }

  const accessRoleId =
    panel.requiredRoleId ?? config.settings.serverAccessRoleId;

  if (
    accessRoleId &&
    requiresServerAccess(interactionKey, item.metadata) &&
    !member.roles.cache.has(accessRoleId)
  ) {
    const message =
      kind === "nsfw_access"
        ? "You need server access to get NSFW role"
        : "Server access is required";
    await interaction.reply({
      embeds: [deniedEmbed(message)],
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (kind === "server_access") {
    const roleId = item.roleId ?? config.settings.serverAccessRoleId;
    if (!roleId) return true;

    if (member.roles.cache.has(roleId)) {
      const revokeIds = allAssignableRoleIds(config).filter((id) =>
        member.roles.cache.has(id),
      );
      if (revokeIds.length) await member.roles.remove(revokeIds);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xb80000)
            .setAuthor({ name: "Access Revoked!", iconURL: REMOVED_ICON }),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }

    const role = member.guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x19b800)
          .setAuthor({ name: "Access Granted!", iconURL: ADDED_ICON }),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (kind === "remove_color") {
    const ids = colorRoleIds(config).filter((id) => member.roles.cache.has(id));
    if (ids.length) await member.roles.remove(ids);
    await interaction.reply({
      embeds: [removedEmbed("Removed color role(s)")],
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (!item.roleId) return true;

  const role = member.guild.roles.cache.get(item.roleId);
  if (!role) {
    await interaction.reply({
      content: "Target role not found.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (member.roles.cache.has(item.roleId)) {
    await member.roles.remove(role);
    await interaction.reply({
      embeds: [removedEmbed(`Removed <@&${item.roleId}> role`)],
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (panel.exclusiveGroup === "color") {
    const existing = colorRoleIds(config).filter((id) =>
      member.roles.cache.has(id),
    );
    if (existing.length) await member.roles.remove(existing);
  }

  await member.roles.add(role);
  await interaction.reply({
    embeds: [addedEmbed(`Added <@&${item.roleId}> role`)],
    flags: MessageFlags.Ephemeral,
  });
  return true;
}

export function isRoleInteractionKey(customId: string) {
  return customId !== "test01" && customId !== "test02";
}
