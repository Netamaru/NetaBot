import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import {
  fetchChannelBeatmapId,
  fetchMessageBeatmapId,
  fetchOsuDiscordLink,
  fetchOsuUser,
  fetchUserBeatmapScore,
  fetchUserBeatmapScoreCard,
} from "../../lib/osu-api3";
import { editMessageWithScore } from "../../lib/osu-score-reply";

function parseModAcronyms(token: string): string[] {
  const upper = token.toUpperCase().replace(/^\+/, "");
  if (!upper) return [];
  const mods: string[] = [];
  for (let i = 0; i < upper.length; i += 2) {
    const chunk = upper.slice(i, i + 2);
    if (chunk.length === 2) mods.push(chunk);
  }
  return mods;
}

function parseCompareArgs(
  args: string[],
  linkedUsername: string | undefined,
): { username?: string; mods: string[]; error?: string } {
  let username = linkedUsername;
  let mods: string[] = [];

  if (!args.length) {
    if (!username) {
      return {
        mods: [],
        error:
          "Provide an osu! username or use `osuset` to link your account",
      };
    }
    return { username, mods: [] };
  }

  if (args[0]!.includes("+")) {
    if (!username) {
      return {
        mods: [],
        error:
          "Provide an osu! username or use `osuset` to link your account",
      };
    }
    mods = parseModAcronyms(args[0]!);
    return { username, mods };
  }

  const nameParts: string[] = [];
  for (const part of args) {
    if (part.includes("+")) {
      mods = parseModAcronyms(part);
    } else {
      nameParts.push(part);
    }
  }

  const fromArgs = nameParts.join(" ").trim();
  username = fromArgs || username;
  if (!username) {
    return {
      mods: [],
      error:
        "Provide an osu! username or use `osuset` to link your account",
    };
  }

  return { username, mods };
}

async function resolveBeatmapId(
  message: Message,
  prefixHint: string,
): Promise<string | { error: string }> {
  if (message.reference?.messageId) {
    try {
      const linked = await fetchMessageBeatmapId(message.reference.messageId);
      return linked.beatmapId;
    } catch {
      return {
        error: `No map found on the replied message. Use \`${prefixHint}map\`, \`${prefixHint}rs\`, or reply to a score message.`,
      };
    }
  }

  try {
    const ch = await fetchChannelBeatmapId(message.channelId);
    if (ch.beatmapId) return ch.beatmapId;
  } catch {
    /* fall through */
  }

  return {
    error: `No map found for this channel. Use \`${prefixHint}map\`, \`${prefixHint}rs\`, or reply to a score message.`,
  };
}

const c: PrefixCommand = {
  name: "c",
  async execute(message: Message, args: string[]) {
    if (message.channel.isSendable()) {
      await message.channel.sendTyping();
    }

    const prefixHint = ";";

    let linkedUsername: string | undefined;
    try {
      const link = await fetchOsuDiscordLink(message.author.id);
      linkedUsername = link?.username;
    } catch {
      linkedUsername = undefined;
    }

    const beatmapResolved = await resolveBeatmapId(message, prefixHint);
    if (typeof beatmapResolved !== "string") {
      await message.reply(beatmapResolved.error);
      return;
    }

    const parsed = parseCompareArgs(args, linkedUsername);
    if (parsed.error) {
      await message.reply(parsed.error);
      return;
    }

    let username = parsed.username!;
    try {
      const user = await fetchOsuUser(username, "fruits");
      username = user.username;
    } catch {
      await message.reply(`User \`${parsed.username}\` is not found`);
      return;
    }

    const loading = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription("**Calculating score…**");
    const pending = await message.reply({ embeds: [loading] });

    try {
      const [score, cardPng] = await Promise.all([
        fetchUserBeatmapScore(username, beatmapResolved, parsed.mods),
        fetchUserBeatmapScoreCard(username, beatmapResolved, parsed.mods),
      ]);

      await editMessageWithScore(pending, message, score, cardPng, "c");
    } catch (e) {
      const text =
        e instanceof Error ? e.message : "An error occurred. Please try again";
      await pending.edit({
        content: text,
        embeds: [],
        components: [],
        files: [],
      });
    }
  },
};

export default c;
