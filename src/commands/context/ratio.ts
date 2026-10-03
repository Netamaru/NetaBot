import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import type { ContextCommand } from "../../lib/types";
import { avatarCdnUrl } from "../../lib/discord-urls";

const RATIO_COPY =
  "don’t care + didn’t ask + cry about it + stay mad + get real + L + mald seethe cope harder + hoes mad + basic + skill issue + ratio + you fell off + the audacity + triggered + any askers + redpilled + get a life + ok and? + cringe + touch grass + donowalled + not based + your’re a full time discordian + not funny didn’t laugh + you’re* + grammar issue + go outside + get good + your gay + reported + ad hominem + GG! + ur mom + unknown + random + biased + racially motivated";

const ratio: ContextCommand = {
  id: "ratio",
  discordName: "Ratio",
  async execute(interaction: MessageContextMenuCommandInteraction) {
    const target = interaction.targetMessage;
    const msgLink = `https://discord.com/channels/${target.guildId}/${target.channelId}/${target.id}`;
    const attachment = target.attachments.first()?.url;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: target.author.displayName,
        iconURL: avatarCdnUrl(target.author.id, target.author.avatar, 128),
        url: msgLink,
      })
      .setDescription(`**[Reply to:](${msgLink})** ${target.content}`)
      .setImage(attachment ?? null);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Open Original Message")
        .setStyle(ButtonStyle.Link)
        .setURL(msgLink),
    );

    await interaction.reply({
      content: RATIO_COPY,
      embeds: [embed],
      components: [row],
    });
  },
};

export default ratio;
