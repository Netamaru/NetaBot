import { EmbedBuilder, type Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { fetchLethalProfile, updateLethalProfile } from "../../lib/api3";
import { isOwner } from "../../lib/owner";

const lethal: PrefixCommand = {
  name: "lethal",
  async execute(message: Message, args: string[]) {
    if (args.length === 0) {
      const data = await fetchLethalProfile();
      const embed = new EmbedBuilder()
        .setTitle("Lethal Company Mods")
        .setImage(
          "https://cdn.discordapp.com/attachments/857674223295266886/1179695947341635614/T4s1c4b.png",
        )
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/932350279003824239/1179030166677246014/t1wXpzG.png",
        )
        .setDescription(
          data
            ? `1. Download & install r2modman https://cdn.discordapp.com/attachments/857674223295266886/1179693096305434664/dKxGsgQ.exe\n2. Open r2modman & select \`Lethal Company\`\n3. Select \`Import / Update \` -> \`Import new profile\` -> \`Import from code\`\n4. Paste __\`${data.id}\`__ and click \`Import\`\n5. Start modded to launch the game\n\nProfile updated: ${data.time}\n**Make sure to __update all__ your installed mods before play (if there any)**`
            : "Profile not configured yet.",
        );
      await message.reply({ embeds: [embed] });
      return;
    }

    if (!isOwner(message.author.id)) return;

    const profile = await updateLethalProfile(args[0]!);
    const embed = new EmbedBuilder().setDescription(
      `✅ Updated profile ID to \`${profile.id}\``,
    );
    await message.reply({ embeds: [embed] });
  },
};

export default lethal;
