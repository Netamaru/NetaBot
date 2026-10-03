import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { parseMessageLink } from "../../lib/message-link";
import { isOwner } from "../../lib/owner";

const winner: PrefixCommand = {
  name: "winner",
  async execute(message: Message, args: string[]) {
    if (!isOwner(message.author.id)) return;

    const link = args[0];
    const winnerText = args.slice(1).join(" ");
    if (!link || !winnerText) {
      await message.reply("Usage: `winner <message-link> <winner mention/text>`");
      return;
    }

    const parsed = parseMessageLink(link);
    if (!parsed) {
      await message.reply("Invalid message link.");
      return;
    }

    const channel = await message.client.channels.fetch(parsed.channelId);
    if (!channel?.isTextBased() || channel.isDMBased()) {
      await message.reply("Channel not found.");
      return;
    }

    const msg = await channel.messages.fetch(parsed.messageId);
    const oldEmbed = msg.embeds[0];
    if (!oldEmbed) {
      await message.reply("Message has no embed.");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(oldEmbed.color ?? 0x2f3136)
      .setTitle(oldEmbed.title)
      .setDescription(`__**Winner:** ${winnerText}__\n${oldEmbed.description ?? ""}`)
      .setTimestamp(oldEmbed.timestamp ? new Date(oldEmbed.timestamp) : null);

    if (oldEmbed.footer) {
      embed.setFooter({
        text: oldEmbed.footer.text,
        iconURL: oldEmbed.footer.iconURL ?? undefined,
      });
    }

    await msg.edit({ embeds: [embed] });
    await message.reply("Giveaway embed updated.");
  },
};

export default winner;
