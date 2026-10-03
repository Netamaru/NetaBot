import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { isOwner } from "../../lib/owner";

const hutRi: PrefixCommand = {
  name: "hut-ri",
  async execute(message: Message) {
    if (!isOwner(message.author.id)) return;
    if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0x36393f)
      .setTitle("Dirgahayu Republik Indonesia 🇮🇩")
      .setDescription("Happy 77th Independence Day Indonesia")
      .setImage(
        "https://cdn.discordapp.com/attachments/857674223295266886/1009326561947820083/merah_putih_copy_2.png",
      );

    await message.delete().catch(() => undefined);
    await message.channel.send({ embeds: [embed] });
  },
};

export default hutRi;
