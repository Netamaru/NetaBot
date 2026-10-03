import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../../lib/types";
import { fetchOsuUserProfile } from "../../lib/osu-api3";
import { buildOsuProfileReply } from "../../lib/osu-profile-embed";

const osu: SlashCommand = {
  name: "osu",
  async execute(interaction: ChatInputCommandInteraction) {
    const mode = interaction.options.getString("mode", true);
    const user = interaction.options.getString("user", true);
    const sizeOpt = interaction.options.getString("size");
    const size =
      sizeOpt === "compact" || sizeOpt === "full" ? sizeOpt : "default";

    await interaction.deferReply();

    try {
      const profile = await fetchOsuUserProfile(user, mode);
      const payload = buildOsuProfileReply(profile, size);
      await interaction.editReply(payload);
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes("not found")
          ? "User not found."
          : "Something went wrong!";
      await interaction.editReply(msg);
    }
  },
};

export default osu;
