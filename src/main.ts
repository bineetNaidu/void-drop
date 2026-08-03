import { Chat } from './chat';

console.log('Hello VoidDrop 👋');

const chatManager = new Chat();

const form = document.querySelector('form#chat-form') as HTMLFormElement;
const formInput = document.querySelector(
  'input#chat-input',
) as HTMLInputElement;
const chatMessagesContainer = document.querySelector(
  'div#chat-messages',
) as HTMLDivElement;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = formInput.value.trim();

  if (!text.length) return;

  if (!text.startsWith('!drop')) {
    formInput.classList.add('chat-input-error');

    setTimeout(() => {
      formInput.classList.remove('chat-input-error');
    }, 1200);

    return;
  }

  const result = chatManager.addChat(text);

  const node = document.createElement('div');

  node.className = 'chat-message';
  node.id = result.id;
  node.innerText = result.text;

  chatMessagesContainer.appendChild(node);

  formInput.value = '';
});
