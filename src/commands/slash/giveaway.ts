import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";

const PING_ROLE_ID = process.env.GIVEAWAY_PING_ROLE_ID ?? "";

function avatarUrl(user: { displayAvatarURL: () => string }) {
  return user.displayAvatarURL();
}

const giveaway: SlashCommand = {
  name: "giveaway",
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const note = interaction.options.getString("note") ?? "";
    const title = interaction.options.getString("title", true);
    const timestamp = interaction.options.getNumber("timestamp", true);
    const image = interaction.options.getString("imageurl") ?? "";

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle(title)
      .setDescription(
        `${note ? `**Note:** ${note}\n` : ""}**Ended:** <t:${timestamp}:R>\n\nReact this message with 🎉 to enter giveaway`,
      )
      .setTimestamp()
      .setFooter({
        text: user.username,
        iconURL: avatarUrl(user),
      });

    if (image) {
      embed.setImage(image);
    }

    const response = await interaction.reply({
      content: PING_ROLE_ID ? `<@&${PING_ROLE_ID}>` : undefined,
      embeds: [embed],
      withResponse: true,
    });

    const msg = response.resource?.message;
    if (msg) await msg.react("🎉");
  },
};

export default giveaway;
