import type { Message } from "discord.js";

const CUSTOM_EMOJI = /<a?:\w+:\d+>/g;
const HTTP_URL = /https?:\/\/\S+/gi;
const WWW_URL = /www\.\S+/gi;
const DISCORD_ANGLE_URL = /<https?:\/\/[^>]+>/gi;
const MENTION_USER = /<@!?(\d{17,20})>/g;
const MENTION_ROLE = /<@&(\d{17,20})>/g;
const MENTION_CHANNEL = /<#(\d{17,20})>/g;
const SLASH_COMMAND = /<\/([^:\s>]+):\d+>/g;
const DISCORD_TIMESTAMP = /<t:(\d{10,13})(?::[tTdDfFR])?>/g;
const SPOILER = /\|\|([^|]+)\|\|/g;
const UNICODE_EMOJI = /\p{Extended_Pictographic}+/gu;

function displayNameForUser(message: Message, userId: string): string {
  const user = message.mentions.users.get(userId);
  const member =
    message.mentions.members?.get(userId) ??
    message.guild?.members.cache.get(userId);
  if (member) return member.displayName;
  if (user) return user.globalName ?? user.username;
  const cached = message.client.users.cache.get(userId);
  if (cached) return cached.globalName ?? cached.username;
  return "";
}

function replaceMentions(message: Message, raw: string): string {
  let text = raw;

  for (const [id, user] of message.mentions.users) {
    const name = displayNameForUser(message, id) || user.username;
    text = text.replaceAll(`<@${id}>`, name);
    text = text.replaceAll(`<@!${id}>`, name);
  }

  for (const [id, role] of message.mentions.roles) {
    text = text.replaceAll(`<@&${id}>`, role.name);
  }

  for (const [id, channel] of message.mentions.channels) {
    const channelName =
      "name" in channel && channel.name ? channel.name : "channel";
    text = text.replaceAll(`<#${id}>`, channelName);
  }

  text = text.replace(MENTION_USER, (_, id) => displayNameForUser(message, id));
  text = text.replace(MENTION_ROLE, (_, id) => {
    const role =
      message.mentions.roles.get(id) ??
      message.guild?.roles.cache.get(id);
    return role?.name ?? "";
  });
  text = text.replace(MENTION_CHANNEL, (_, id) => {
    const ch = message.client.channels.cache.get(id);
    return ch && "name" in ch && ch.name ? ch.name : "";
  });

  text = text.replace(/@everyone/gi, "everyone");
  text = text.replace(/@here/gi, "here");

  return text;
}

function formatTimestampForSpeech(raw: string): string {
  const sec = raw.length >= 13 ? Math.floor(Number(raw) / 1000) : Number(raw);
  if (!Number.isFinite(sec)) return "";
  try {
    return new Date(sec * 1000).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function stripMarkdown(text: string): string {
  let out = text;
  out = out.replace(/```[\s\S]*?```/g, (block) => {
    const inner = block.slice(3, -3).replace(/^[\w-]*\n?/, "").trim();
    return inner ? ` ${inner} ` : " ";
  });
  out = out.replace(/`([^`]+)`/g, "$1");
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/\*([^*]+)\*/g, "$1");
  out = out.replace(/__([^_]+)__/g, "$1");
  out = out.replace(/~~([^~]+)~~/g, "$1");
  out = out.replace(/_{1,2}([^_]+)_{1,2}/g, "$1");
  return out;
}

export function sanitizeTextForTts(raw: string): string {
  let text = raw;
  text = text.replace(SPOILER, "$1");
  text = text.replace(SLASH_COMMAND, "$1");
  text = text.replace(DISCORD_TIMESTAMP, (_, ts) =>
    formatTimestampForSpeech(ts),
  );
  text = text.replace(CUSTOM_EMOJI, " ");
  text = text.replace(DISCORD_ANGLE_URL, " ");
  text = text.replace(HTTP_URL, " ");
  text = text.replace(WWW_URL, " ");
  text = text.replace(UNICODE_EMOJI, " ");
  text = stripMarkdown(text);
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

/** Plain text for TTS: resolve @user/@role to names, then strip URLs/emojis. */
export function sanitizeMessageForTts(message: Message): string {
  return sanitizeTextForTts(replaceMentions(message, message.content));
}

/** Sticker / attachment-only messages have nothing worth speaking. */
export function messageIsNonSpeakable(message: Message): boolean {
  const hasText = Boolean(message.content?.trim());
  if (hasText) return false;
  return message.stickers.size > 0 || message.attachments.size > 0;
}
