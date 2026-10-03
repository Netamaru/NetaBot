import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { buildRolePanelMessage } from "../../lib/build-role-panel";
import { getGuildRoleConfig } from "../../lib/role-panels";

const hok: PrefixCommand = {
  name: "hok",
  async execute(message: Message) {
    const guildId = message.guildId;
    if (!guildId) return;

    const config = await getGuildRoleConfig(guildId);
    const panel = config.panels.find((p) => p.slug === "hok");
    if (!panel) {
      await message.reply("HoK role panel not configured.");
      return;
    }

    await message.reply(buildRolePanelMessage(panel));
  },
};

export default hok;
