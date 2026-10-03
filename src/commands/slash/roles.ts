import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";
import { buildRolePanelMessage } from "../../lib/build-role-panel";
import { getGuildRoleConfig } from "../../lib/role-panels";

/** @deprecated legacy subcommand names from V14 — slug is the subcommand now */
const LEGACY_SUBCOMMAND_SLUGS: Record<string, string> = {
  server_roles: "server",
  game_roles: "game",
  color_roles: "color",
  mention_roles: "mention",
  supercell_roles: "supercell",
};

const roles: SlashCommand = {
  name: "roles",
  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        content: "Guild only.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const slug = LEGACY_SUBCOMMAND_SLUGS[sub] ?? sub;

    const config = await getGuildRoleConfig(guildId);
    const panel = config.panels.find((p) => p.slug === slug);
    if (!panel) {
      await interaction.reply({
        content: `Role panel \`${slug}\` is not configured.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const payload = buildRolePanelMessage(panel);
    await interaction.reply(payload);
  },
};

export default roles;
