import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import type { RolePanelDto } from "./api3";

function parseEmoji(emoji: string | null) {
  if (!emoji) return undefined;
  if (/^\d+$/.test(emoji)) return { id: emoji };
  return { name: emoji };
}

const SELECT_PLACEHOLDERS: Record<string, string> = {
  game: "Click to get roles",
  color: "Click to change your color",
  mention: "Click to get roles",
  supercell: "Click to get roles",
};

export function buildRolePanelEmbed(panel: RolePanelDto) {
  const embed = new EmbedBuilder();
  if (panel.title) embed.setTitle(panel.title);
  if (panel.description) embed.setDescription(panel.description);
  if (panel.embedColor != null) embed.setColor(panel.embedColor);
  if (panel.imageUrl) embed.setImage(panel.imageUrl);
  return embed;
}

export function buildRolePanelComponents(panel: RolePanelDto) {
  if (panel.interactionType === "button") {
    const buttons = panel.items.map((item) => {
      const button = new ButtonBuilder()
        .setCustomId(item.interactionKey)
        .setLabel(item.label)
        .setStyle((item.buttonStyle ?? ButtonStyle.Primary) as ButtonStyle);
      const emoji = parseEmoji(item.emoji);
      if (emoji) button.setEmoji(emoji);
      return button;
    });

    if (!buttons.length) return [];
    return [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)];
  }

  const options = panel.items.map((item) => {
    const option: {
      label: string;
      value: string;
      emoji?: { id: string } | { name: string };
    } = {
      label: item.label.slice(0, 100),
      value: item.interactionKey,
    };
    const emoji = parseEmoji(item.emoji);
    if (emoji) option.emoji = emoji;
    return option;
  });

  if (!options.length) return [];

  const menu = new StringSelectMenuBuilder()
    .setCustomId("select")
    .setPlaceholder(SELECT_PLACEHOLDERS[panel.slug] ?? "Click to get roles")
    .addOptions(options.slice(0, 25));

  return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
}

export function buildRolePanelMessage(panel: RolePanelDto) {
  const embed = buildRolePanelEmbed(panel);
  const components = buildRolePanelComponents(panel);
  return { embeds: [embed], components };
}
