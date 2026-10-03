import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { fetchOsuUser } from "../../lib/osu-api3";

const ava: PrefixCommand = {
  name: "ava",
  async execute(message: Message, args: string[]) {
    if (!args.length) {
      await message.reply("Please provide osu username");
      return;
    }

    const username = args.join(" ");
    if (message.channel.isSendable()) {
      await message.channel.sendTyping();
    }

    try {
      const user = await fetchOsuUser(username, "fruits");
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(`osu! avatar for ${user.username}`)
        .setImage(user.avatarUrl);

      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply("osu account not found");
    }
  },
};

export default ava;
