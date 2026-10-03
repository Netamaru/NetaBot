import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { alignStrings } from "./align-strings";
import type { BeatmapInfoDto } from "./osu-api3";

/** Custom emojis from Netamaru guild (V14 osu-beatmap.js). */
const BLANK = "<:blank:956569551821209710>";
const EMOJI = {
  HD: "<:HD:956566684347547669>",
  HR: "<:HR:956566684666310838>",
  DT: "<:DT:956566684922175588>",
  EZ: "<:EZ:956566684775383040>",
  FL: "<:FL:956567772257738832>",
  total_length: "<:total_length:884833459720310874>",
  bpm: "<:bpm:884833460567552040>",
  circle_count: "<:circle_count:884833460454301776>",
  slider_count: "<:slider_count:884833460630474822>",
  spinner: "<:spinner:884833601273884732>",
} as const;

const PP_MOD_PREFIX: Record<string, string> = {
  NM: `${BLANK}${BLANK}`,
  HD: `${BLANK}${EMOJI.HD}`,
  HR: `${BLANK}${EMOJI.HR}`,
  HDHR: `${EMOJI.HD}${EMOJI.HR}`,
  DT: `${BLANK}${EMOJI.DT}`,
  HDDT: `${EMOJI.HD}${EMOJI.DT}`,
  EZ: `${BLANK}${EMOJI.EZ}`,
  EZFL: `${EMOJI.EZ}${EMOJI.FL}`,
  EZDT: `${EMOJI.EZ}${EMOJI.DT}`,
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function epoch(iso: string | null) {
  if (!iso) return null;
  return Math.floor(new Date(iso).getTime() / 1000);
}

function buildStatsFieldValue(info: BeatmapInfoDto) {
  const submitted = epoch(info.submittedAt);
  const updated = epoch(info.updatedAt);

  const statsKeys = alignStrings(
    ["Stars", "AR", "CS", "Max Combo", "Submitted", "Updated"],
    " ",
    "start",
  );
  const statsVals = alignStrings([
    info.stars.toFixed(2),
    String(info.ar),
    String(info.cs),
    info.maxCombo != null ? String(info.maxCombo) : "-",
  ]);

  return [
    `\`${statsKeys[0]}:\` \`${statsVals[0]}\``,
    `\`${statsKeys[1]}:\` \`${statsVals[1]}\``,
    `\`${statsKeys[2]}:\` \`${statsVals[2]}\``,
    `\`${statsKeys[3]}:\` \`${statsVals[3]}\``,
    submitted ? `\`${statsKeys[4]}:\` <t:${submitted}:R>` : null,
    updated ? `\`${statsKeys[5]}:\` <t:${updated}:R>` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildObjectsFieldValue(info: BeatmapInfoDto) {
  const statsVal2 = alignStrings([
    formatDuration(info.lengthSeconds),
    String(Math.round(info.bpm)),
    String(info.circles),
    String(info.sliders),
    String(info.spinners),
  ]);

  return [
    `${EMOJI.total_length} \`${statsVal2[0]}\``,
    `${EMOJI.bpm} \`${statsVal2[1]}\``,
    `${EMOJI.circle_count} \`${statsVal2[2]}\``,
    `${EMOJI.slider_count} \`${statsVal2[3]}\``,
    `${EMOJI.spinner} \`${statsVal2[4]}\``,
  ].join("\n");
}

function buildPpFieldValue(info: BeatmapInfoDto) {
  if (info.performance.length === 0) return "—";

  const ppAligned = alignStrings(
    info.performance.map((row) => `${row.pp.toFixed(2)}pp`),
  );

  return info.performance
    .map((row, i) => {
      const prefix = PP_MOD_PREFIX[row.label] ?? row.label;
      return `${prefix} \`${ppAligned[i]}\``;
    })
    .join("\n");
}

export function buildBeatmapInfoEmbed(info: BeatmapInfoDto) {
  const embed = new EmbedBuilder()
    .setColor(0xff69b4)
    .setAuthor({
      name: info.title,
      url: info.url,
      ...(info.coverList ? { iconURL: info.coverList } : {}),
    })
    .addFields(
      {
        name: "Stats",
        value: buildStatsFieldValue(info),
        inline: true,
      },
      {
        name: "\u200B",
        value: buildObjectsFieldValue(info),
        inline: true,
      },
      {
        name: "Performance point",
        value: buildPpFieldValue(info),
        inline: true,
      },
    )
    .setFooter({
      text: `Map by ${info.mapperUsername ?? info.creator} | ${info.status} | ❤️ ${info.favouriteCount}`,
      iconURL:
        info.mapperAvatar ??
        "https://osu.ppy.sh/images/layout/avatar-guest.png",
    });

  if (info.coverSlim) {
    embed.setImage(info.coverSlim);
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Beatmap link")
      .setStyle(ButtonStyle.Link)
      .setURL(info.url),
    new ButtonBuilder()
      .setLabel("Direct download")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://beatconnect.io/b/${info.beatmapsetId}`),
  );

  return { embeds: [embed], components: [row] };
}
