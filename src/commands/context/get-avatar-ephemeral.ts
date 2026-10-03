import { MessageFlags, type UserContextMenuCommandInteraction } from "discord.js";
import type { ContextCommand } from "../../lib/types";
import { buildGetAvatarReply } from "../../lib/build-get-avatar";

const getAvatarEphemeral: ContextCommand = {
  id: "get-avatar-ephemeral",
  discordName: "Get Avatar --ephemeral",
  async execute(interaction: UserContextMenuCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const payload = await buildGetAvatarReply(guild, interaction.targetUser);
    await interaction.editReply(payload);
  },
};

export default getAvatarEphemeral;
