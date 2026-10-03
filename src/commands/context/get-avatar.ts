import type { UserContextMenuCommandInteraction } from "discord.js";
import type { ContextCommand } from "../../lib/types";
import { buildGetAvatarReply } from "../../lib/build-get-avatar";

const getAvatar: ContextCommand = {
  id: "get-avatar",
  discordName: "Get Avatar",
  async execute(interaction: UserContextMenuCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) return;

    await interaction.deferReply();
    const payload = await buildGetAvatarReply(guild, interaction.targetUser);
    await interaction.editReply(payload);
  },
};

export default getAvatar;
