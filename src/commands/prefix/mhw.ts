import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";

interface MhwMonster {
  name: string;
  description: string;
  type: string;
  species: string;
  elements: string[];
  locations: Array<{ name: string }>;
  weaknesses: Array<{ element: string; stars: number }>;
  resistances: Array<{ element: string }>;
  ailments: Array<{
    name: string;
    description: string;
    recovery: { actions: string[]; items: Array<{ name: string }> };
    protection: { skills: Array<{ name: string }>; items: Array<{ name: string }> };
  }>;
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/(^\w{1})|(\s{1}\w{1})/g, (match) =>
    match.toUpperCase(),
  );
}

function getElementIcon(name: string) {
  const key = name.toLowerCase();
  const icons: Record<string, string> = {
    fire: "<:fireblight:1083825665264058400> Fire",
    water: "<:waterblight:1083825659140378716> Water",
    ice: "<:Iceblight:1083825655646531604> Ice",
    thunder: "<:thunderblight:1083825663368249405> Thunder",
    dragon: "<:DragonBlight:1083825652022653069> Dragon",
    blast: "<:Blastblight:1083825637158035578> Blast",
    poison: "<:Poison:1083825650076504115> Poison",
    sleep: "<:Sleep:1083825641062936686> Sleep",
    paralysis: "<:Paralysis:1083825643248173147> Paralysis",
    stun: "<:Stun:1083825646901411840> Stun",
    blastblight: "<:Blastblight:1083825637158035578> Blastblight",
    bleeding: "<:Bleeding:1083825633420914821> Bleeding",
    dragonblight: "<:DragonBlight:1083825652022653069> Dragonblight",
    "effluvial buildup":
      "<:EffluvialBuildup:1083825631508303952> Effluvial buildup",
    fireblight: "<:fireblight:1083825665264058400> Fireblight",
    iceblight: "<:Iceblight:1083825655646531604> Iceblight",
    thunderblight: "<:thunderblight:1083825663368249405> Thunderblight",
    waterblight: "<:waterblight:1083825659140378716> Waterblight",
    "wind pressure": "<:WindPressure:1083831977767092324> Wind pressure",
    "defense down": "<:DefenseDown:1083831974340341891> Defense down",
    muddy: "💩 Muddy",
  };
  return icons[key] ?? name;
}

const mhw: PrefixCommand = {
  name: "mhw",
  async execute(message: Message, args: string[]) {
    if (!args.length) {
      await message.reply("Provide a monster name.");
      return;
    }

    const query = args.join(" ").toLowerCase();
    if (!message.channel.isTextBased() || message.channel.isDMBased()) return;
    await message.channel.sendTyping();

    try {
      const res = await fetch("https://mhw-db.com/monsters");
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as MhwMonster[];
      const monster = data.find((entry) => entry.name.toLowerCase() === query);
      if (!monster) {
        await message.reply("Monster not found.");
        return;
      }

      const star = "⭐";
      const embed = new EmbedBuilder()
        .setTitle(monster.name)
        .setColor(0x2b2d31)
        .setDescription(monster.description)
        .addFields(
          {
            name: "Stats 🗒️",
            value: `**Type:** \`${titleCase(monster.type)}\`\n**Species:** \`${titleCase(monster.species)}\``,
            inline: true,
          },
          {
            name: "Elements 🌟",
            value:
              monster.elements.length === 0
                ? "none"
                : monster.elements.map((el) => getElementIcon(el)).join("\n"),
            inline: true,
          },
          {
            name: "Locations 📍",
            value: monster.locations.map((loc) => loc.name).join("\n"),
            inline: false,
          },
          {
            name: "Weaknesses ⚔️",
            value:
              monster.weaknesses.length === 0
                ? "none"
                : monster.weaknesses
                    .map(
                      (item) =>
                        `${getElementIcon(item.element)} \`${star.repeat(item.stars)}\``,
                    )
                    .join("\n"),
            inline: true,
          },
          {
            name: "Resistances 🛡️",
            value:
              monster.resistances.length === 0
                ? "none"
                : monster.resistances
                    .map((item) => getElementIcon(item.element))
                    .join("\n"),
            inline: true,
          },
          {
            name: "Ailments ☢️",
            value:
              monster.ailments.length === 0
                ? "none"
                : monster.ailments
                    .map((item) => {
                      const recoveryActions =
                        item.recovery.actions.length === 0
                          ? ""
                          : `\n> **Recovery actions:** \`${item.recovery.actions.join(", ")}\``;
                      const recoveryItems =
                        item.recovery.items.length === 0
                          ? ""
                          : `\n> **Recovery items:** \`${item.recovery.items.map((i) => i.name).join(", ")}\``;
                      const protectionSkills =
                        item.protection.skills.length === 0
                          ? ""
                          : `\n> **Protection skills:** \`${item.protection.skills.map((i) => i.name).join(", ")}\``;
                      const protectionItems =
                        item.protection.items.length === 0
                          ? ""
                          : `\n> **Protection items:** \`${item.protection.items.map((i) => i.name).join(", ")}\``;
                      return `${getElementIcon(item.name)}:\n> *${item.description}*${recoveryActions}${recoveryItems}${protectionSkills}${protectionItems}`;
                    })
                    .join("\n"),
            inline: false,
          },
        )
        .setFooter({ text: "Data source: mhw-db.com" });

      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply("Something went wrong :(");
    }
  },
};

export default mhw;
