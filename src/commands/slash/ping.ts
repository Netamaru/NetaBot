import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";

const ping: SlashCommand = {
  name: "ping",
  async execute(interaction: ChatInputCommandInteraction) {
    const start = Date.now();
    await interaction.reply("Pinging...");
    const latency = Date.now() - start;
    await interaction.editReply(
      `Pong — WS ${interaction.client.ws.ping}ms · RTT ${latency}ms`,
    );
  },
};

export default ping;
