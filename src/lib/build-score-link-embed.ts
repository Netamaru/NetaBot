import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import type { RecentScoreDto } from "./osu-api3";

function formatMapLength(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/(^\w)|(\s+\w)/g, (m) => m.toUpperCase());
}

/** Classic embed + ranking panel image (NetaBot-V14 osu-score.js). */
export function buildScoreLinkReply(
  score: RecentScoreDto,
  panelPng: Buffer,
  attachmentName: string,
) {
  const rankPrefix =
    score.globalRank != null && score.globalRank > 0
      ? `#${score.globalRank} `
      : "";

  const embed = new EmbedBuilder()
    .setColor(0xff69b4)
    .setAuthor({
      name: `${rankPrefix}${score.username} on ${score.title} [${score.beatmapVersion}]`,
      url: score.beatmapUrl,
      iconURL: score.coverList ?? undefined,
    })
    .setThumbnail(score.avatarUrl)
    .addFields(
      {
        name: "Map Details",
        value: [
          `\`SR:\` \`${score.stars.toFixed(2)}\``,
          `\`AR:\` \`${score.ar.toFixed(1)}\``,
          `\`CS:\` \`${score.cs.toFixed(1)}\``,
          `\`BPM:\` \`${score.bpm.toFixed(0)}\``,
          `\`Length:\` \`${formatMapLength(score.mapLengthSec)}\``,
        ].join("\n"),
        inline: true,
      },
      {
        name: "Score Details",
        value: [
          `\`Accuracy:\` \`${score.accuracyPercent.toFixed(2)}%\``,
          `\`Miss:\` \`${score.missCount}x\``,
          `\`Drop Miss:\` \`${score.dropletMiss}x\``,
          `\`Combo:\` \`${score.scoreCombo.toLocaleString()}/${score.maxCombo.toLocaleString()}x\``,
          `\`Mods:\` \`${score.modDisplay}\``,
          `\`PP:\` \`${score.pp.toFixed(2)}\``,
          `\`Submitted:\` <t:${score.endedAtUnix}:R>`,
        ].join("\n"),
        inline: true,
      },
    )
    .setFooter({
      text: `Mapped by ${score.mapper} | ${statusLabel(score.beatmapStatus)} | ${score.beatmapId}`,
    })
    .setImage(`attachment://${attachmentName}`);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(score.profileUrl)
      .setLabel(`${score.username}'s Profile`),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(score.beatmapUrl)
      .setLabel("Beatmap Link"),
  );

  const attachment = new AttachmentBuilder(panelPng, { name: attachmentName });

  return {
    content: null,
    embeds: [embed],
    components: [row],
    files: [attachment],
  };
}
