import { EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import Genius from "genius-lyrics";
import type { SlashCommand } from "../../lib/types";

const client = new Genius.Client();

const lirik: SlashCommand = {
  name: "lirik",
  async execute(interaction: ChatInputCommandInteraction) {
    const song = interaction.options.getString("song", true);
    await interaction.deferReply();

    try {
      const results = await client.songs.search(song);
      const first = results[0];
      if (!first) {
        await interaction.editReply("Lyric not found.");
        return;
      }

      const lyrics = await first.lyrics();
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setAuthor({
          name: first.fullTitle,
          url: first.url,
          iconURL: first.image,
        })
        .setDescription(`\`\`\`asciidoc\n${lyrics}\`\`\``);

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("Lyric not found.");
    }
  },
};

export default lirik;
