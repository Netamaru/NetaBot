import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { register as registerReady } from "./events/ready";
import { register as registerInteraction } from "./events/interactionCreate";
import { register as registerMessage } from "./events/messageCreate";
import { register as registerGuildMembers } from "./events/guildMembers";
import { register as registerTtsVoiceState } from "./events/tts-voice-state";
import sodium from "libsodium-wrappers";
import "./handlers/commands";

await sodium.ready;

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("DISCORD_TOKEN missing");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

registerReady(client);
registerInteraction(client);
registerMessage(client);
registerGuildMembers(client);
registerTtsVoiceState(client);

await client.login(token);
