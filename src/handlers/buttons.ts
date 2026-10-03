import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
} from "discord.js";
import { handleRoleInteraction, isRoleInteractionKey } from "./roles";

export async function handleButton(interaction: ButtonInteraction) {
  if (interaction.customId === "test01") {
    return handleTestButton(interaction);
  }

  if (!interaction.inGuild() || !isRoleInteractionKey(interaction.customId)) {
    return;
  }

  const guild = interaction.guild;
  if (!guild) return;

  const member = await guild.members.fetch(interaction.user.id);
  await handleRoleInteraction(interaction, member, interaction.customId);
}

async function handleTestButton(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId("test02").setTitle("Test Title");
  const input = new TextInputBuilder()
    .setCustomId("test03")
    .setLabel("Test Label")
    .setStyle(TextInputStyle.Short);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  await interaction.showModal(modal);
}
