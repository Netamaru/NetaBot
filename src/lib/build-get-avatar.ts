import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Guild,
  type User,
} from "discord.js";
import { avatarCdnUrl, guildMemberAvatarCdnUrl } from "./discord-urls";

export async function buildGetAvatarReply(guild: Guild, target: User) {
  const embed = new EmbedBuilder().setTitle(`${target.displayName}'s avatar`);
  const row = new ActionRowBuilder<ButtonBuilder>();

  let member: import("discord.js").GuildMember | undefined =
    guild.members.cache.get(target.id);
  if (!member) {
    member =
      (await guild.members.fetch(target.id).catch(() => undefined)) ??
      undefined;
  }

  const globalHash = target.avatar;
  const globalUrl = avatarCdnUrl(target.id, globalHash);

  if (!member) {
    embed.setImage(globalUrl);
    row.addComponents(
      new ButtonBuilder()
        .setLabel("Main Avatar")
        .setURL(globalUrl)
        .setStyle(ButtonStyle.Link),
    );
    return { embeds: [embed], components: [row] };
  }

  const serverHash = member.avatar;

  if (serverHash) {
    const serverUrl = guildMemberAvatarCdnUrl(guild.id, target.id, serverHash);
    embed.setImage(serverUrl);
    row.addComponents(
      new ButtonBuilder()
        .setLabel("Main Avatar")
        .setURL(globalUrl)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel("Server Avatar")
        .setURL(serverUrl)
        .setStyle(ButtonStyle.Link),
    );
  } else {
    embed.setImage(globalUrl);
    row.addComponents(
      new ButtonBuilder()
        .setLabel("Main Avatar")
        .setURL(globalUrl)
        .setStyle(ButtonStyle.Link),
    );
  }

  return { embeds: [embed], components: [row] };
}
