import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";

const invite: PrefixCommand = {
  name: "invite",
  async execute(message: Message) {
    const invite = message.guild?.vanityURLCode
      ? `https://discord.gg/${message.guild.vanityURLCode}`
      : "No vanity invite — ask an admin.";
    await message.reply(invite);
  },
};

export default invite;
