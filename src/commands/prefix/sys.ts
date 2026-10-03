import os from "node:os";
import checkDiskSpace from "check-disk-space";
import type { Message } from "discord.js";
import si from "systeminformation";
import type { PrefixCommand } from "../../lib/types";

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d) parts.push(`${d} day${d === 1 ? "" : "s"}`);
  if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
  if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
  if (s) parts.push(`${s} second${s === 1 ? "" : "s"}`);
  return parts.join(", ") || "0 seconds";
}

const diskPath = process.platform === "win32" ? "C:" : "/";

const sysCmd: PrefixCommand = {
  name: "sys",
  async execute(message: Message) {
    const [mem, osInfo, cpu, disk] = await Promise.all([
      si.mem(),
      si.osInfo(),
      si.cpu(),
      checkDiskSpace(diskPath),
    ]);

    const lines = [
      `OS      | ${osInfo.distro}`,
      `CPU     | ${cpu.manufacturer} ${cpu.brand}`,
      `Memory  | ${(mem.used / 1_073_741_824).toFixed(1)}/${(mem.total / 1_073_741_824).toFixed(1)} GB`,
      `Storage | ${Math.trunc(disk.free / 1_073_741_824)}/${Math.trunc(disk.size / 1_073_741_824)} GB`,
      `Uptime  | ${formatUptime(os.uptime())}`,
    ];

    await message.reply(`\`\`\`yaml\n${lines.join("\n")}\n\`\`\``);
  },
};

export default sysCmd;
