import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import {
  fetchOsuDiscordLink,
  putOsuDiscordLink,
} from "../../lib/osu-api3";

const osuset: PrefixCommand = {
  name: "osuset",
  async execute(message: Message, args: string[]) {
    if (!args.length) {
      try {
        const link = await fetchOsuDiscordLink(message.author.id);
        if (!link) {
          await message.reply("Please provide osu username");
          return;
        }
        await message.reply(`Your current osu! username is \`${link.username}\``);
      } catch {
        await message.reply("Please provide osu username");
      }
      return;
    }

    const username = args.join(" ");
    try {
      const link = await putOsuDiscordLink(message.author.id, username);
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(
          `Successfully set osu! username to \`${link.username}\``,
        );
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply("osu account not found");
    }
  },
};

export default osuset;
