import { Collection } from "discord.js";
import type { ContextCommand, PrefixCommand, SlashCommand } from "../lib/types";
import ping from "../commands/slash/ping";
import help from "../commands/slash/help";
import lirik from "../commands/slash/lirik";
import giveaway from "../commands/slash/giveaway";
import test from "../commands/slash/test";
import roles from "../commands/slash/roles";
import welcome from "../commands/slash/welcome";
import announcement from "../commands/slash/announcement";
import changelog from "../commands/slash/changelog";
import osu from "../commands/slash/osu";
import enableTts from "../commands/slash/enable-tts";
import disableTts from "../commands/slash/disable-tts";
import getAvatar from "../commands/context/get-avatar";
import getAvatarEphemeral from "../commands/context/get-avatar-ephemeral";
import kontolUser from "../commands/context/kontol-user";
import restartModem from "../commands/context/restart-modem";
import ratio from "../commands/context/ratio";
import lgbt from "../commands/context/lgbt";
import osuShowBeatmapInfo from "../commands/context/osu-show-beatmap-info";
import osuCompareScore from "../commands/context/osu-compare-score";
import invite from "../commands/prefix/invite";
import ava from "../commands/prefix/ava";
import osuset from "../commands/prefix/osuset";
import map from "../commands/prefix/map";
import rs from "../commands/prefix/rs";
import c from "../commands/prefix/c";
import prefixCmd from "../commands/prefix/prefix";
import cp from "../commands/prefix/cp";
import sysCmd from "../commands/prefix/sys";
import purge from "../commands/prefix/purge";
import reactions from "../commands/prefix/reactions";
import winner from "../commands/prefix/winner";
import hok from "../commands/prefix/hok";
import lethal from "../commands/prefix/lethal";
import hutRi from "../commands/prefix/hut-ri";
import mhw from "../commands/prefix/mhw";
import cam from "../commands/prefix/cam";

export const slashCommands = new Collection<string, SlashCommand>();
export const prefixCommands = new Collection<string, PrefixCommand>();
export const contextCommands = new Collection<string, ContextCommand>();

for (const cmd of [
  ping,
  help,
  lirik,
  giveaway,
  test,
  roles,
  welcome,
  announcement,
  changelog,
  osu,
  enableTts,
  disableTts,
]) {
  slashCommands.set(cmd.name, cmd);
}

for (const cmd of [
  getAvatar,
  getAvatarEphemeral,
  kontolUser,
  restartModem,
  ratio,
  lgbt,
  osuShowBeatmapInfo,
  osuCompareScore,
]) {
  contextCommands.set(cmd.discordName, cmd);
}

for (const cmd of [
  invite,
  prefixCmd,
  cp,
  sysCmd,
  purge,
  reactions,
  winner,
  hok,
  lethal,
  hutRi,
  mhw,
  cam,
  ava,
  osuset,
  map,
  rs,
  c,
]) {
  prefixCommands.set(cmd.name, cmd);
}
