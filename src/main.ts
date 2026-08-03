import Matter from 'matter-js';
import { Chat } from './chat';
import { EMOTE_REGISTRY } from './emotes';
import { cleanEmoteKey, emoteRegex } from './utils';

console.log('Hello VoidDrop 👋');

const chatManager = new Chat();
const EMOTES: string[] = [];
const EMOTES_NODE: HTMLImageElement[] = [];

const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

// DOM Elements
const form = document.querySelector('form#chat-form') as HTMLFormElement;
const formInput = document.querySelector(
  'input#chat-input',
) as HTMLInputElement;
const chatMessagesContainer = document.querySelector(
  'div#chat-messages',
) as HTMLDivElement;
const canvasContainer = document.querySelector(
  '#canvas-container',
) as HTMLDivElement;
const activeDropsSpan = document.querySelector(
  '#active-drops',
) as HTMLSpanElement;
const emotesContainer = document.querySelector(
  'div#emotes-container',
) as HTMLDivElement;

let activeDropCount = 0;

for (const name in EMOTE_REGISTRY) {
  const emotesImgSrc = Object(EMOTE_REGISTRY)[name];

  EMOTES.push(name);

  const emoteImageNode = document.createElement('img');
  emoteImageNode.src = emotesImgSrc;
  emoteImageNode.id = name;
  emoteImageNode.alt = `${name} emote`;
  emoteImageNode.classList.add('emote-icon');

  emoteImageNode.addEventListener('click', () => {
    if (formInput.value.startsWith('!drop')) {
      const textNodes = formInput.value.split(' ');

      textNodes.push(`:${name}:`);

      formInput.value = textNodes.join(' ');

      // if emotes container has the show class then remove it!
      if (emotesContainer.classList.contains('emotes-container-show')) {
        emotesContainer.classList.remove('emotes-container-show');
        formInput.focus();
      }
    }
  });

  EMOTES_NODE.push(emoteImageNode); // you can do somethign with this nodes later probably

  emotesContainer.appendChild(emoteImageNode);
}

function updateDropCount(delta: number) {
  activeDropCount += delta;
  if (activeDropsSpan) {
    activeDropsSpan.innerText = `DROPS: ${activeDropCount}`;
  }
}

// Collision Category Setup: Emojis won't collide with each other
const DEFAULT_CATEGORY = 0x0001; // Walls & Zones
const EMOJI_CATEGORY = 0x0002; // Emojis

// 1. Initialize Matter.js Engine with Zero Gravity for continuous floating
const engine = Engine.create({
  gravity: { x: 0, y: 0, scale: 0.001 },
});

// --- GLOBAL SPEED CONTROL ---
// 1.0 is normal speed. 0.5 is half-speed (slo-mo), 2.0 is double speed.
engine.timing.timeScale = 1;

// 2. Setup Canvas Renderer
const render = Render.create({
  element: canvasContainer,
  engine: engine,
  options: {
    background: 'transparent',
    width: canvasContainer.clientWidth,
    height: canvasContainer.clientHeight,
    wireframes: false,
  },
});

const width = canvasContainer.clientWidth;
const height = canvasContainer.clientHeight;

// 3. Create Ground, Walls, and Bins with 100% Elasticity (Restitution 1.0)
const wallOptions = {
  isStatic: true,
  restitution: 1.0, // Perfectly elastic bounce
  friction: 0.0, // No friction on walls
  collisionFilter: {
    category: DEFAULT_CATEGORY,
  },
  render: { fillStyle: '#1e293b' },
};

// Outer Boundaries
const leftWall = Bodies.rectangle(-10, height / 2, 20, height, {
  ...wallOptions,
  label: 'wall_left',
});
const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, {
  ...wallOptions,
  label: 'wall_right',
});

// Landing Bins
const zone1 = Bodies.rectangle(width * 0.15, height, width * 0.38, 1, {
  ...wallOptions,
  label: 'zone_1',
  render: { fillStyle: '#ef4444' },
});

const marsBaseZone = Bodies.rectangle(
  width * 0.5,
  height - 5,
  width * 0.31,
  20,
  {
    ...wallOptions,
    label: 'zone_mars_base',
    render: { fillStyle: 'green' },
  },
);

const zone2 = Bodies.rectangle(width * 0.85, height, width * 0.38, 1, {
  ...wallOptions,
  label: 'zone_2',
  render: { fillStyle: '#ef4444' },
});

// Add static bodies to the world
Composite.add(engine.world, [leftWall, rightWall, zone1, marsBaseZone, zone2]);

// 4. Function to Spawn Emojis with Infinite Bouncing Velocity
function spawnEmojiDrop(emoji: string) {
  // Randomise side (50/50 chance)
  const fromLeft = Math.random() < 0.5;

  // Randomise spawn X anywhere across top width (with margin)
  const spawnX = 40 + Math.random() * (width - 80);

  // Randomise Y near the top edge
  const spawnY = 15 + Math.random() * 30;

  // Wider horizontal speed variance (1.5 to 7.0) so bounce count differs per drop
  const speedX = 1.5 + Math.random() * 5.5;

  // Higher descent speed (0.6 to 1.4) so it reaches the bottom in fewer bounces
  const speedY = 0.6 + Math.random() * 0.8;

  const emojiCanvas = document.createElement('canvas');
  emojiCanvas.classList.add('drop');
  emojiCanvas.width = 40;
  emojiCanvas.height = 40;
  const ctx = emojiCanvas.getContext('2d');
  if (ctx) {
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 20, 20);
  }

  // Convert canvas to Image to ensure Matter.js loads the texture correctly
  const textureUrl = emojiCanvas.toDataURL();
  const img = new Image();
  img.src = textureUrl;
  img.classList.add('drop');

  const dropBody = Bodies.circle(spawnX, spawnY, 18, {
    restitution: 1.0, // Never lose energy on bounce
    friction: 0.0, // No surface friction
    frictionAir: 0.0, // No air drag
    inertia: Infinity, // Prevent spin energy drain
    label: 'emojiDrop',
    density: 10,
    collisionFilter: {
      category: EMOJI_CATEGORY,
      mask: DEFAULT_CATEGORY, // Passes through other emojis, collides with walls/zones
    },
    render: {
      sprite: {
        texture: textureUrl,
        xScale: 1,
        yScale: 1,
      },
    },
  });

  (dropBody as any).hasLanded = false;

  img.onload = () => {
    Composite.add(engine.world, dropBody);

    // Set velocity using both randomised components
    const velocityX = fromLeft ? speedX : -speedX;
    Body.setVelocity(dropBody, { x: velocityX, y: speedY });

    updateDropCount(1);
  };
}

// 5. Collision Event Handling
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    const bodyAIsEmoji = bodyA.label === 'emojiDrop';
    const bodyBIsEmoji = bodyB.label === 'emojiDrop';

    if (bodyAIsEmoji || bodyBIsEmoji) {
      const emojiBody = (bodyAIsEmoji ? bodyA : bodyB) as any;
      const targetBody = bodyAIsEmoji ? bodyB : bodyA;

      // Sticky Landing Handling
      if (targetBody.label.startsWith('zone_')) {
        if (emojiBody.hasLanded) return;

        // Freeze in place upon landing
        emojiBody.hasLanded = true;
        Body.setStatic(emojiBody, true);

        if (targetBody.label === 'zone_mars_base') {
          console.log('Landed on Mars Base! (+1000 pts)');
        } else {
          console.log('Landed outside Mars Base (0 pts)');
        }
      }
    }
  });
});

// 6. Chat Form Handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = formInput.value.trim();

  if (!text.length) return;

  if (!text.startsWith('!drop')) {
    formInput.classList.add('chat-input-error');

    setTimeout(() => {
      formInput.value = '';
      formInput.classList.remove('chat-input-error');
    }, 1200);

    return;
  }

  if (emotesContainer.classList.contains('emotes-container-show')) {
    emotesContainer.classList.remove('emotes-container-show');
  }

  const result = chatManager.addChat(text);

  // Append Chat Message
  const node = document.createElement('div');
  node.className = 'chat-message';
  node.id = result.id;

  // Split text into regular text fragments and :shortcodes:
  const parts = result.text.split(emoteRegex);

  parts.forEach((part) => {
    const cleanKey = cleanEmoteKey(part);

    // Check if the stripped key exists in the registry
    if (cleanKey in EMOTE_REGISTRY) {
      const img = document.createElement('img');
      img.className = 'chat-emote-img';
      img.src = EMOTE_REGISTRY[cleanKey as keyof typeof EMOTE_REGISTRY];
      img.alt = cleanKey;
      node.appendChild(img);
    } else if (part.length > 0) {
      // Standard text node for regular message parts
      const textSpan = document.createElement('span');
      textSpan.innerText = part;
      node.appendChild(textSpan);
    }
  });

  chatMessagesContainer.appendChild(node);
  node.scrollIntoView({ behavior: 'smooth' });

  // Trigger Drop
  spawnEmojiDrop(result.emote);

  formInput.value = '';
});

formInput.addEventListener('input', () => {
  const value = formInput.value.trim();

  if (value.startsWith('!drop')) {
    emotesContainer.classList.add('emotes-container-show');
  } else {
    emotesContainer.classList.remove('emotes-container-show');
  }
});

// 7. Start Engine and Renderer
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
