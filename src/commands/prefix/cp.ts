import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Message } from "discord.js";
import type { PrefixCommand } from "../../lib/types";

interface CopypastaFile {
  quotes: Array<{ text: string }>;
}

const quotes = (
  JSON.parse(
    readFileSync(join(import.meta.dir, "../../files/copypasta.json"), "utf8"),
  ) as CopypastaFile
).quotes;

const cp: PrefixCommand = {
  name: "cp",
  async execute(message: Message) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)]!;
    await message.reply(quote.text);
  },
};

export default cp;
