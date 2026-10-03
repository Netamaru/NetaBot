import {
  Events,
  MessageFlags,
  type Client,
  type Interaction,
  type InteractionReplyOptions,
} from "discord.js";
import { contextCommands, slashCommands } from "../handlers/commands";
import { handleButton } from "../handlers/buttons";
import { handleSelectMenu } from "../handlers/selectMenus";
import { fetchGuildEnabled } from "../lib/api3";

export const name = Events.InteractionCreate;

async function handleContext(interaction: Interaction) {
  if (
    !interaction.isUserContextMenuCommand() &&
    !interaction.isMessageContextMenuCommand()
  ) {
    return;
  }

  const command = contextCommands.get(interaction.commandName);
  if (!command) return;

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: "Guild only.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const enabled = await fetchGuildEnabled(guildId);
    if (!enabled.slash.includes(command.id)) {
      await interaction.reply({
        content: "Command not enabled in this guild.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await command.execute(interaction as never);
  } catch (err) {
    console.error(err);
    const payload: InteractionReplyOptions = {
      content: "Something went wrong.",
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}

async function handleSlash(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = slashCommands.get(interaction.commandName);
  if (!command) return;

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: "Guild only.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const enabled = await fetchGuildEnabled(guildId);
    if (!enabled.slash.includes(command.name)) {
      await interaction.reply({
        content: "Command not enabled in this guild.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    const payload: InteractionReplyOptions = {
      content: "Something went wrong.",
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}

export async function execute(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    await handleSlash(interaction);
    return;
  }

  if (
    interaction.isUserContextMenuCommand() ||
    interaction.isMessageContextMenuCommand()
  ) {
    await handleContext(interaction);
    return;
  }

  if (interaction.isButton()) {
    try {
      await handleButton(interaction);
    } catch (err) {
      console.error(err);
    }
    return;
  }

  if (interaction.isStringSelectMenu()) {
    try {
      await handleSelectMenu(interaction);
    } catch (err) {
      console.error(err);
    }
  }
}

export function register(client: Client) {
  client.on(name, execute);
}
