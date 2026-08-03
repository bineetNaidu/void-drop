// Regex to capture emote shortcodes like ":rocket:"
export const emoteRegex = /(:[a-zA-Z0-9_-]+:)/g;

// Strip surrounding colons to match the registry keys (e.g., ":rocket:" -> "rocket")
export const cleanEmoteKey = (str: string) => str.replace(/^:|:$/g, '');
