import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { EdgeTTS } from "edge-tts-universal";
import ffmpegStatic from "ffmpeg-static";
import { Readable } from "node:stream";
import type { Guild } from "discord.js";

if (ffmpegStatic) {
  process.env.FFMPEG_PATH = ffmpegStatic;
}

const DEFAULT_VOICE = "id-ID-GadisNeural";
const DEFAULT_MAX_CHARS = 400;
const IDLE_DISCONNECT_MS = 60_000;

type QueueItem = { text: string; voiceChannelId: string };

type GuildTtsState = {
  queue: QueueItem[];
  player: ReturnType<typeof createAudioPlayer>;
  voiceChannelId: string | null;
  processing: boolean;
  idleTimer: ReturnType<typeof setTimeout> | null;
};

const guildStates = new Map<string, GuildTtsState>();

function voiceId(): string {
  return process.env.TTS_VOICE?.trim() || DEFAULT_VOICE;
}

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
      idleTimer: null,
    };
    guildStates.set(guildId, state);
  }
  return state;
}

function clearIdleTimer(state: GuildTtsState) {
  if (state.idleTimer) {
    clearTimeout(state.idleTimer);
    state.idleTimer = null;
  }
}

function scheduleIdleDisconnect(guildId: string, state: GuildTtsState) {
  clearIdleTimer(state);
  state.idleTimer = setTimeout(() => {
    if (state.queue.length > 0 || state.processing) return;
    getVoiceConnection(guildId)?.destroy();
    state.voiceChannelId = null;
  }, IDLE_DISCONNECT_MS);
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

async function synthesizeToBuffer(text: string): Promise<Buffer> {
  const synth = new EdgeTTS(text, voiceId());
  const result = await synth.synthesize();
  return Buffer.from(await result.audio.arrayBuffer());
}

async function drainQueue(guild: Guild) {
  const state = getState(guild.id);
  if (state.processing) return;

  state.processing = true;
  clearIdleTimer(state);

  try {
    while (state.queue.length > 0) {
      const item = state.queue.shift()!;
      try {
        await ensureConnection(guild, item.voiceChannelId, state);
        const audio = await synthesizeToBuffer(item.text);
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
      scheduleIdleDisconnect(guild.id, state);
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
