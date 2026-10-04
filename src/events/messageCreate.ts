import { Events, type Client, type Message } from "discord.js";
import { prefixCommands } from "../handlers/commands";
import { fetchGuildEnabled } from "../lib/api3";
import { tryOsuBeatmapUrlEmbed } from "./osu-beatmap-url";
import { tryOsuScoreUrlReply } from "./osu-score-url";
import { tryHandleTtsMessage } from "./tts-message";

export const name = Events.MessageCreate;

export async function execute(message: Message) {
  if (message.author.bot || !message.guild) return;

  try {
    if (await tryOsuBeatmapUrlEmbed(message)) return;
    if (await tryOsuScoreUrlReply(message)) return;

    const enabled = await fetchGuildEnabled(message.guild.id);
    const prefix = enabled.prefix || ";";

    if (!message.content.startsWith(prefix)) {
      try {
        await tryHandleTtsMessage(message);
      } catch (err) {
        console.error("TTS message:", err);
      }
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    if (!name) return;

    if (!enabled.prefixCommands.includes(name)) return;

    const command = prefixCommands.get(name);
    if (!command) return;

    await command.execute(message, args);
  } catch (err) {
    console.error(err);
  }
}

export function register(client: Client) {
  client.on(name, execute);
}
