import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { fetchGuildEnabled, updateGuildPrefix } from "../../lib/api3";
import { isOwner } from "../../lib/owner";

const prefixCmd: PrefixCommand = {
  name: "prefix",
  async execute(message: Message, args: string[]) {
    if (!isOwner(message.author.id)) return;
    if (!message.guild) return;

    const enabled = await fetchGuildEnabled(message.guild.id);

    if (args.length) {
      const next = args[0]!;
      await updateGuildPrefix(message.guild.id, next);
      await message.reply(`Prefix set to \`${next}\``);
      return;
    }

    await message.reply(`Prefix is \`${enabled.prefix}\``);
  },
};

export default prefixCmd;
