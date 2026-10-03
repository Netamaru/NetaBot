import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  type Message,
  type MessageEditOptions,
} from "discord.js";
import type { RecentScoreDto } from "./osu-api3";
import { putChannelBeatmap, putMessageBeatmap } from "./osu-api3";

function buildFcPpLines(score: RecentScoreDto): string {
  if (score.missCount === 0 && score.dropletMiss === 0) {
    return "";
  }
  const lines: string[] = [];
  if (score.ppIfFc != null) {
    lines.push(`◈ **${score.ppIfFc}pp** if FC`);
  }
  if (
    score.ppIf100Fc != null &&
    (score.dropletMiss > 0 || score.ppIf100Fc !== score.ppIfFc)
  ) {
    lines.push(`◈ **${score.ppIf100Fc}pp** if 100% FC`);
  }
  return lines.length ? lines.join("\n") : "";
}

export function buildScoreDescription(score: RecentScoreDto): string {
  const global =
    score.globalRank != null ? `🌐 #${score.globalRank} ▸ ` : "";
  return (
    `${global}<t:${score.endedAtUnix}:R>\n` +
    `◈ **${score.pp}pp** ▸ ${score.accuracyPercent}% ▸ Miss: ${score.missCount}, Dropmiss: ${score.dropletMiss}\n` +
    `◈ ${score.scoreDisplay} ▸ ${score.scoreCombo}/${score.maxCombo}x ▸ ` +
    `[${score.great}/${score.tickHit}/${score.missCount}]`
  );
}

export function buildScoreButtons(
  score: RecentScoreDto,
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(score.profileUrl)
      .setLabel(`${score.username}'s Profile`),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(score.beatmapUrl)
      .setLabel("Beatmap Link"),
  );
}

function beatmapStatusLabel(beatmapStatus: string) {
  return beatmapStatus
    .toLowerCase()
    .replace(/(^\w)|(\s+\w)/g, (m) => m.toUpperCase());
}

/** Components V2 layout for ;rs / ;c (score card PNG as File component). */
export function buildScoreComponentsV2(
  score: RecentScoreDto,
  cardFileName: string,
): Pick<MessageEditOptions, "flags" | "components"> {
  const container = new ContainerBuilder().setAccentColor(0x2b2d31);

  const mapLine = `${score.title} [${score.beatmapVersion}] +${score.modDisplay} [★${score.stars.toFixed(2)}]`;
  const headerThumb =
    score.coverList ??
    `https://osu.ppy.sh/images/chosen/${score.rank}.png`;

  const header = new SectionBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${mapLine}`),
      new TextDisplayBuilder().setContent(buildScoreDescription(score)),
    )
    .setThumbnailAccessory(new ThumbnailBuilder().setURL(headerThumb));

  container.addSectionComponents(header);

  container.addMediaGalleryComponents(
    new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL(`attachment://${cardFileName}`),
    ),
  );

  const fcPpText = buildFcPpLines(score);
  if (fcPpText) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(fcPpText),
    );
  }

  const statusLabel = beatmapStatusLabel(score.beatmapStatus);
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# Try #${score.tryOnMap} · ${statusLabel} · Beatmap \`${score.beatmapId}\``,
    ),
  );
  container.addActionRowComponents(buildScoreButtons(score));

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

export function buildScoreEditPayload(
  score: RecentScoreDto,
  cardPng: Buffer,
  filePrefix: string,
): MessageEditOptions {
  const cardName = `${filePrefix}-${score.beatmapId}.png`;
  const attachment = new AttachmentBuilder(cardPng, { name: cardName });
  return {
    content: null,
    embeds: [],
    files: [attachment],
    ...buildScoreComponentsV2(score, cardName),
  };
}

type ScoreReplyEditor = (
  options: MessageEditOptions,
) => Promise<unknown>;

/** CV2 score card + FC lines below gallery (;rs, ;c, Compare score). */
export async function applyScoreReply(
  edit: ScoreReplyEditor,
  score: RecentScoreDto,
  cardPng: Buffer,
  filePrefix: string,
): Promise<void> {
  await edit(buildScoreEditPayload(score, cardPng, filePrefix));
}

export async function editMessageWithScore(
  pending: Message,
  triggerMessage: Message,
  score: RecentScoreDto,
  cardPng: Buffer,
  filePrefix: string,
): Promise<void> {
  await applyScoreReply(
    (options) => pending.edit(options),
    score,
    cardPng,
    filePrefix,
  );

  const beatmapId = String(score.beatmapId);
  await putChannelBeatmap(triggerMessage.channelId, beatmapId);
  await putMessageBeatmap(triggerMessage.id, beatmapId);
  await putMessageBeatmap(pending.id, beatmapId);
}
