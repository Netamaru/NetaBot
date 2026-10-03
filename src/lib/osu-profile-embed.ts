import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import type { OsuProfileDto } from "./osu-api3";

const EMBED_COLOR = 0xff69b4;

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function playTimeHours(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  return `${fmt(hours)} Hrs`;
}

function rankLine(p: OsuProfileDto) {
  if (p.globalRank == null) {
    return "`#-`";
  }
  const cc = p.countryCode.toLowerCase();
  const country =
    p.countryRank != null ? `\`#${fmt(p.countryRank)}\`` : "`#-`";
  return `\`#${fmt(p.globalRank)}\`｜:flag_${cc}: ${country}`;
}

function peakRankLine(p: OsuProfileDto) {
  if (p.peakRank == null) {
    return "`#-`";
  }
  if (p.peakRankAtUnix != null) {
    return `\`#${fmt(p.peakRank)}\` (<t:${p.peakRankAtUnix}:R>)`;
  }
  return `\`#${fmt(p.peakRank)}\``;
}

function gradesLine(p: OsuProfileDto) {
  const g = p.grades;
  return `◈ **SSH** \`${fmt(g.ssh)}\`｜**SS** \`${fmt(g.ss)}\`｜**SH** \`${fmt(g.sh)}\`｜**S** \`${fmt(g.s)}\`｜**A** \`${fmt(g.a)}\``;
}

function coreStatsLines(p: OsuProfileDto, compact: boolean) {
  const lines = [
    `◈ **Rank:** ${rankLine(p)}`,
    `◈ **Peak Rank:** ${peakRankLine(p)}`,
    `◈ **Level:** \`${p.level}\` \`(${p.levelProgress}% EXP)\``,
    `◈ **PP:** \`${fmt(Math.round(p.pp))}\` **Accuracy:** \`${p.accuracy.toFixed(2)}%\``,
    `◈ **Playcount:** \`${fmt(p.playCount)}\` **Playtime:** \`${playTimeHours(p.playTimeSeconds)}\``,
  ];
  if (!compact) {
    lines.push(
      `◈ **Ranked Score:** \`${fmt(p.rankedScore)}\``,
      `◈ **Total Score:** \`${fmt(p.totalScore)}\``,
      `◈ **Max Combo:** \`${fmt(p.maxCombo)}\``,
      `◈ **First Place:** \`${fmt(p.firstPlaces)}\``,
      `◈ **Replay Watched:** \`${fmt(p.replaysWatched)}\` \`(${fmt(p.replaysWatchedThisMonth)} this month)\``,
      `◈ **Follower:** \`${fmt(p.followers)}\``,
    );
  }
  lines.push(gradesLine(p));
  return lines.join("\n");
}

function miscYaml(p: OsuProfileDto, includeBadges: boolean) {
  const history =
    p.previousUsernames.length > 0
      ? p.previousUsernames.join(", ")
      : "none";
  const groups = p.groups.length > 0 ? p.groups.join(", ") : "none";
  const title = p.title ?? "none";
  let yaml = [
    `Id: ${p.id}`,
    `Active: ${p.isActive}`,
    `Supporter: ${p.isSupporter}`,
    `PM Friends Only: ${p.pmFriendsOnly}`,
    `Join Date: ${p.joinDate}`,
    `Kudosu: (total: ${fmt(p.kudosuTotal)}, available: ${fmt(p.kudosuAvailable)})`,
    `Username History: ${history}`,
    `Title: ${title}`,
    `Group: ${groups}`,
  ].join("\n");

  if (includeBadges) {
    const badgeBlock =
      p.badges.length === 0
        ? "none"
        : p.badges.map((d, i) => `${i + 1}. ${d}`).join("\n");
    yaml += `\nBadge:\n${badgeBlock}`;
  }

  return yaml;
}

export function buildOsuProfileReply(
  p: OsuProfileDto,
  size: "default" | "compact" | "full",
) {
  const compact = size === "compact";
  const embed = new EmbedBuilder()
    .setTitle(`Stats user for ${p.username}`)
    .setColor(EMBED_COLOR)
    .setURL(p.profileUrl)
    .setDescription(coreStatsLines(p, compact))
    .setThumbnail(p.avatarUrl);

  if (!compact && p.coverUrl) {
    embed.setImage(p.coverUrl);
  }

  if (size === "full") {
    const misc = miscYaml(p, true);
    const fieldValue = `\`\`\`yaml\n${misc.slice(0, 1000)}\n\`\`\``;
    embed.addFields({ name: "Misc", value: fieldValue, inline: true });
    if (misc.length > 1000) {
      embed.setFooter({
        text: "Badge list truncated — open osu! profile for full list",
      });
    }
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(`${p.username}'s profile`)
      .setStyle(ButtonStyle.Link)
      .setURL(p.profileUrl),
  );

  return { embeds: [embed], components: [row] };
}
