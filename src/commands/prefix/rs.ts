import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import {
  fetchOsuDiscordLink,
  fetchOsuUser,
  fetchUserRecentScore,
  fetchUserRecentScoreCard,
} from "../../lib/osu-api3";
import { editMessageWithScore } from "../../lib/osu-score-reply";

function parseRsArgs(
  args: string[],
  linkedUsername: string | undefined,
): { username: string; index: number } | { error: string } {
  if (!args.length) {
    if (!linkedUsername) {
      return {
        error:
          "Provide an osu! username or use `osuset` to link your account",
      };
    }
    return { username: linkedUsername, index: 0 };
  }

  if (args[0]!.includes("#")) {
    if (!linkedUsername) {
      return {
        error:
          "Provide an osu! username or use `osuset` to link your account",
      };
    }
    const n = Number.parseInt(args[0]!.replace("#", ""), 10);
    if (!Number.isFinite(n) || n < 1) {
      return { error: "Invalid score number (use `#1`, `#2`, …)" };
    }
    return { username: linkedUsername, index: n - 1 };
  }

  let index = 0;
  const nameParts: string[] = [];
  for (const part of args) {
    if (part.includes("#")) {
      const n = Number.parseInt(part.replace("#", ""), 10);
      if (!Number.isFinite(n) || n < 1) {
        return { error: "Invalid score number (use `#1`, `#2`, …)" };
      }
      index += n - 1;
    } else {
      nameParts.push(part);
    }
  }

  const username = nameParts.join(" ").trim() || linkedUsername;
  if (!username) {
    return {
      error:
        "Provide an osu! username or use `osuset` to link your account",
    };
  }

  return { username, index };
}

const rs: PrefixCommand = {
  name: "rs",
  async execute(message: Message, args: string[]) {
    if (message.channel.isSendable()) {
      await message.channel.sendTyping();
    }

    let linkedUsername: string | undefined;
    try {
      const link = await fetchOsuDiscordLink(message.author.id);
      linkedUsername = link?.username;
    } catch {
      linkedUsername = undefined;
    }

    const parsed = parseRsArgs(args, linkedUsername);
    if ("error" in parsed) {
      await message.reply(parsed.error);
      return;
    }

    let username = parsed.username;
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
        fetchUserRecentScore(username, parsed.index),
        fetchUserRecentScoreCard(username, parsed.index),
      ]);

      await editMessageWithScore(pending, message, score, cardPng, "rs");
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

export default rs;
