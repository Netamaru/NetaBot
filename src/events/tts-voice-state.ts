import { Events, type Client, type VoiceState } from "discord.js";
import { maybeLeaveTtsVoiceIfEmpty } from "../lib/tts-voice-manager";

export const name = Events.VoiceStateUpdate;

export async function execute(oldState: VoiceState, newState: VoiceState) {
  const guild = newState.guild ?? oldState.guild;
  if (!guild) return;

  try {
    await maybeLeaveTtsVoiceIfEmpty(guild);
  } catch (err) {
    console.error("TTS voice state:", err);
  }
}

export function register(client: Client) {
  client.on(name, execute);
}
