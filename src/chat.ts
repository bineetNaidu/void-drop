export interface ChatResult {
  id: string;
  text: string;
  emoji: string;
}

export class Chat {
  private generateShortId(length: number = 8): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  }

  public parseEmoji(text: string): string {
    const parts = text.split(' ');
    // If user typed !drop 🚀, return the emoji; default to 🚀 if none provided
    return parts.length > 1 && parts[1].trim() !== '' ? parts[1] : '🚀';
  }

  public addChat(text: string): ChatResult {
    return {
      id: `msg-${this.generateShortId(6)}`,
      text: text,
      emoji: this.parseEmoji(text),
    };
  }
}
