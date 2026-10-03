import type { UserContextMenuCommandInteraction } from "discord.js";
import type { ContextCommand } from "../../lib/types";

const kontolUser: ContextCommand = {
  id: "kontol-user",
  discordName: "Kontolin User",
  async execute(interaction: UserContextMenuCommandInteraction) {
    const target = interaction.targetUser;
    await interaction.reply({ content: `<@${target.id}> kontol` });
  },
};

export default kontolUser;
