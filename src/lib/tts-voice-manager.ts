import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import ffmpegStatic from "ffmpeg-static";
import { synthesizeTtsAudio } from "./tts-synthesize";
import { Readable } from "node:stream";
import type { Guild } from "discord.js";

if (ffmpegStatic) {
  process.env.FFMPEG_PATH = ffmpegStatic;
}

const DEFAULT_MAX_CHARS = 400;

type QueueItem = { text: string; voiceChannelId: string };

type GuildTtsState = {
  queue: QueueItem[];
  player: ReturnType<typeof createAudioPlayer>;
  voiceChannelId: string | null;
  processing: boolean;
};

const guildStates = new Map<string, GuildTtsState>();

function maxChars(): number {
  const n = Number(process.env.TTS_MAX_CHARS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MAX_CHARS;
}

function getState(guildId: string): GuildTtsState {
  let state = guildStates.get(guildId);
  if (!state) {
    state = {
      queue: [],
      player: createAudioPlayer(),
      voiceChannelId: null,
      processing: false,
    };
    guildStates.set(guildId, state);
  }
  return state;
}

async function voiceChannelHasHumanMembers(
  guild: Guild,
  channelId: string,
): Promise<boolean> {
  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isVoiceBased()) return false;
  return channel.members.some((m) => !m.user.bot);
}

/** Leave VC when queue is idle and no non-bot users remain in the connected channel. */
export async function maybeLeaveTtsVoiceIfEmpty(guild: Guild): Promise<void> {
  const state = guildStates.get(guild.id);
  if (!state?.voiceChannelId) return;
  if (state.processing || state.queue.length > 0) return;

  const hasHumans = await voiceChannelHasHumanMembers(
    guild,
    state.voiceChannelId,
  );
  if (hasHumans) return;

  getVoiceConnection(guild.id)?.destroy();
  state.voiceChannelId = null;
}

async function ensureConnection(
  guild: Guild,
  voiceChannelId: string,
  state: GuildTtsState,
) {
  const existing = getVoiceConnection(guild.id);
  if (existing && state.voiceChannelId === voiceChannelId) {
    return existing;
  }

  existing?.destroy();

  const connection = joinVoiceChannel({
    channelId: voiceChannelId,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  connection.subscribe(state.player);
  state.voiceChannelId = voiceChannelId;

  await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
  return connection;
}

async function drainQueue(guild: Guild) {
  const state = getState(guild.id);
  if (state.processing) return;

  state.processing = true;

  try {
    while (state.queue.length > 0) {
      const item = state.queue.shift()!;
      try {
        await ensureConnection(guild, item.voiceChannelId, state);
        const audio = await synthesizeTtsAudio(item.text);
        const resource = createAudioResource(Readable.from(audio));
        state.player.play(resource);
        await entersState(state.player, AudioPlayerStatus.Idle, 300_000);
      } catch (err) {
        console.error("[tts]", err);
      }
    }
  } finally {
    state.processing = false;
    if (state.queue.length > 0) {
      void drainQueue(guild);
    } else {
      void maybeLeaveTtsVoiceIfEmpty(guild);
    }
  }
}

export function enqueueTts(
  guild: Guild,
  voiceChannelId: string,
  text: string,
): void {
  const capped = text.slice(0, maxChars());
  const state = getState(guild.id);
  state.queue.push({ text: capped, voiceChannelId });
  void drainQueue(guild);
}
