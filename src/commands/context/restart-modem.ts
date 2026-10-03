import type { UserContextMenuCommandInteraction } from "discord.js";
import type { ContextCommand } from "../../lib/types";

const restartModem: ContextCommand = {
  id: "restart-modem",
  discordName: "Restart Modem",
  async execute(interaction: UserContextMenuCommandInteraction) {
    const target = interaction.targetUser;
    await interaction.reply({
      content: `Halo Kak <@${target.id}>,  kendala yang dialami Kami sarankan silakan restart modemnya selama 10 menit, jika masih berkendala silakan lakukan unplug/lepas-pasang kabel patch cord (kabel berwarna hitam/kuning dengan ujung biru) ke ONT (modem). Jika masih berkendala silakan informasikan nomor IndiHome nya, atas nama pemilik dan nomor HP yang aktif via Inbox ya Kakak. Terima kasih`,
    });
  },
};

export default restartModem;
