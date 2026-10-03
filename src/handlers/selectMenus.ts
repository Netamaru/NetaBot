import { type StringSelectMenuInteraction } from "discord.js";
import { handleRoleInteraction } from "./roles";

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;

  const interactionKey = interaction.values[0];
  if (!interactionKey) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const handled = await handleRoleInteraction(interaction, member, interactionKey);
  if (!handled) return;
}
