import type { Message } from "discord.js";
import { fetchTtsEnabled } from "../lib/api3-tts";
import {
  messageIsNonSpeakable,
  sanitizeMessageForTts,
} from "../lib/sanitize-tts-text";
import { enqueueTts } from "../lib/tts-voice-manager";

export async function tryHandleTtsMessage(message: Message): Promise<boolean> {
  if (!message.guild || message.author.bot) return false;

  const enabled = await fetchTtsEnabled(message.channel.id);
  if (!enabled) return false;

  const member =
    message.member ??
    (await message.guild.members.fetch(message.author.id).catch(() => null));
  const voiceChannel = member?.voice.channel;
  if (!voiceChannel) return false;
  if (messageIsNonSpeakable(message)) return false;

  const text = sanitizeMessageForTts(message);
  if (!text) return false;

  enqueueTts(message.guild, voiceChannel.id, text);
  return true;
}
