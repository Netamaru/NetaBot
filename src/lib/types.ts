export type SlashHandler = (interaction: import("discord.js").ChatInputCommandInteraction) => Promise<void>;
export type PrefixHandler = (message: import("discord.js").Message, args: string[]) => Promise<void>;
export type UserContextHandler = (
  interaction: import("discord.js").UserContextMenuCommandInteraction,
) => Promise<void>;
export type MessageContextHandler = (
  interaction: import("discord.js").MessageContextMenuCommandInteraction,
) => Promise<void>;

export interface SlashCommand {
  name: string;
  execute: SlashHandler;
}

export interface PrefixCommand {
  name: string;
  execute: PrefixHandler;
}

export interface ContextCommand {
  /** Catalog / enablement id */
  id: string;
  /** Discord application command name */
  discordName: string;
  execute: UserContextHandler | MessageContextHandler;
}
