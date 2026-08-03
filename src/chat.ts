import { generateId } from './utils/uuid';

interface IChat {
  id: string;
  text: string;
}

export class Chat {
  public chat: IChat[] = [];

  constructor() {}

  public addChat(text: string): IChat {
    const data = {
      id: generateId(),
      text,
    } satisfies IChat;

    this.chat.push(data);

    return data;
  }
}
