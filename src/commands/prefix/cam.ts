import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";
import { fetchCamImage } from "../../lib/api3";
import { isOwner } from "../../lib/owner";

async function writeTempFile(prefix: string, ext: string, data: Buffer) {
  const dir = join(tmpdir(), "netabot-cam");
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${prefix}.${ext}`);
  await writeFile(path, data);
  return path;
}

const cam: PrefixCommand = {
  name: "cam",
  async execute(message: Message, args: string[]) {
    if (!isOwner(message.author.id)) return;

    if (!args.length) {
      await message.reply("Please input cam ID `0 - 8` (`0` = all channels grid).");
      return;
    }

    const id = Number(args[0]);
    if (!Number.isInteger(id) || id < 0 || id > 8) {
      await message.reply("Please input cam ID `0 - 8`.");
      return;
    }

    if (!message.channel.isTextBased() || message.channel.isDMBased()) return;
    await message.channel.sendTyping();

    let path: string | undefined;

    try {
      const image = await fetchCamImage(id);
      const ext = id === 0 ? "png" : "jpg";
      path = await writeTempFile(`${message.id}_${id}`, ext, image);
      const label = id === 0 ? "Camera 0 (All channels)" : `Camera ${id}`;
      await message.reply({ content: label, files: [path] });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Camera fetch failed.";
      await message.reply(text);
    } finally {
      if (path) await unlink(path).catch(() => undefined);
    }
  },
};

export default cam;
