/** Pad strings to equal length (V14 alignString.js). */
export function alignStrings(
  strings: string[],
  trail = " ",
  type: "start" | "end" = "end",
): string[] {
  const maxLength = strings.reduce(
    (max, str) => Math.max(max, str.length),
    0,
  );
  if (type === "start") {
    return strings.map((str) => str.padStart(maxLength, trail));
  }
  return strings.map((str) => str.padEnd(maxLength, trail));
}
