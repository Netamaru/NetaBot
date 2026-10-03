import {
  AttachmentBuilder,
  EmbedBuilder,
  Events,
  type Client,
  type GuildMember,
  type PartialGuildMember,
} from "discord.js";
import { fetchWelcomeCard } from "../lib/api3";
import { avatarCdnUrl } from "../lib/discord-urls";
import { getGuildRoleConfig } from "../lib/role-panels";

const welcomeDisabled = () =>
  process.env.WELCOME_CARDS_ENABLED === "0" ||
  process.env.NODE_ENV === "development";

async function resolveMember(
  member: GuildMember | PartialGuildMember,
): Promise<GuildMember | null> {
  if (member.partial) {
    try {
      return await member.fetch();
    } catch {
      return null;
    }
  }
  return member;
}

async function sendWelcomeCard(
  member: GuildMember,
  kind: "join" | "leave",
) {
  if (welcomeDisabled()) return;

  const config = await getGuildRoleConfig(member.guild.id);
  const channelId =
    kind === "join"
      ? config.settings.welcomeChannelId
      : config.settings.leaveChannelId;

  if (!channelId) return;

  const channel = await member.guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased() || channel.isDMBased()) return;

  const user = member.user;
  const avatarUrl = avatarCdnUrl(user.id, user.avatar, 512);

  const png = await fetchWelcomeCard({
    kind,
    userId: user.id,
    username: user.displayName,
    avatarUrl,
    memberCount: kind === "join" ? member.guild.memberCount : undefined,
    joinedAt: member.joinedTimestamp ?? undefined,
    userTag: kind === "leave" ? `@${user.username}` : undefined,
  });

  const fileName = `welcome-${user.id}.png`;
  const attachment = new AttachmentBuilder(png, { name: fileName });

  const embed =
    kind === "join"
      ? new EmbedBuilder()
          .setColor(0x17a168)
          .setDescription(
            `Welcome to **${member.guild.name}**, <@${user.id}>!`,
          )
          .setAuthor({
            name: "Welcome!",
            iconURL:
              "https://cdn.discordapp.com/emojis/643818277176606720.png",
          })
          .setImage(`attachment://${fileName}`)
      : new EmbedBuilder()
          .setColor(0xdc4e4e)
          .setDescription(`We're sorry to see you go, <@${user.id}>`)
          .setAuthor({
            name: "Goodbye!",
            iconURL:
              "https://cdn.discordapp.com/emojis/643818277230870528.png",
          })
          .setImage(`attachment://${fileName}`);

  await channel.send({ embeds: [embed], files: [attachment] });
}

export const name = Events.GuildMemberAdd;

export async function onMemberAdd(member: GuildMember | PartialGuildMember) {
  const full = await resolveMember(member);
  if (!full) return;

  try {
    await sendWelcomeCard(full, "join");
  } catch (err) {
    console.error("guildMemberAdd welcome card failed:", err);
  }
}

export async function onMemberRemove(member: GuildMember | PartialGuildMember) {
  const full = await resolveMember(member);
  if (!full) return;

  try {
    await sendWelcomeCard(full, "leave");
  } catch (err) {
    console.error("guildMemberRemove leave card failed:", err);
  }
}

export function register(client: Client) {
  client.on(Events.GuildMemberAdd, onMemberAdd);
  client.on(Events.GuildMemberRemove, onMemberRemove);
}
