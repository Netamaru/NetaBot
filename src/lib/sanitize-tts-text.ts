const CUSTOM_EMOJI = /<a?:\w+:\d+>/g;
const HTTP_URL = /https?:\/\/\S+/gi;
const WWW_URL = /www\.\S+/gi;
const DISCORD_ANGLE_URL = /<https?:\/\/[^>]+>/gi;

export function sanitizeTextForTts(raw: string): string {
  let text = raw;
  text = text.replace(CUSTOM_EMOJI, " ");
  text = text.replace(DISCORD_ANGLE_URL, " ");
  text = text.replace(HTTP_URL, " ");
  text = text.replace(WWW_URL, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}
