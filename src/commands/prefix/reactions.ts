import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { parseMessageLink } from "../../lib/message-link";

const reactions: PrefixCommand = {
  name: "reactions",
  async execute(message: Message, args: string[]) {
    const link = args[0];
    if (!link) {
      await message.reply("Paste a message link.");
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
    const reaction = msg.reactions.cache.get("🎉");
    if (!reaction) {
      await message.reply("No 🎉 reactions on that message.");
      return;
    }

    const users = await reaction.users.fetch();
    const botId = message.client.user.id;
    const names = users
      .filter((user) => user.id !== botId)
      .map((user) => user.displayName);

    await message.reply(
      `Total reactions: ${names.length}\n\n${names.join("\n") || "(none)"}`,
    );
  },
};

export default reactions;
