import { EmbedBuilder } from "discord.js";
import { setTimeout as wait } from "node:timers/promises";
import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { isOwner } from "../../lib/owner";

const purge: PrefixCommand = {
  name: "purge",
  async execute(message: Message, args: string[]) {
    if (!isOwner(message.author.id)) return;
    if (!message.guild || !message.channel.isTextBased() || message.channel.isDMBased()) {
      return;
    }

    if (!args.length) {
      await message.reply("Specify how many messages to delete (1–1000).");
      return;
    }

    const count = Number(args[0]);
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      await message.reply("Pick a number between 1 and 1000.");
      return;
    }

    const channel = message.channel;
    if (!channel.isTextBased() || !("bulkDelete" in channel)) return;

    await channel.sendTyping();

    let remaining = count + 1;
    let deleted = 0;

    try {
      while (remaining > 0) {
        const batch = Math.min(remaining, 100);
        const removed = await channel.bulkDelete(batch, true);
        deleted += removed.size;
        remaining -= batch;
        if (removed.size === 0) break;
      }

      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(`Deleted \`${Math.max(deleted - 1, 0)}\` messages`);

      const notice = await channel.send({ embeds: [embed] });
      await wait(5_000);
      await notice.delete().catch(() => undefined);
    } catch {
      // bulkDelete fails on messages older than 14 days
    }
  },
};

export default purge;
