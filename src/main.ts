import Matter from 'matter-js';
import { Chat } from './chat';

console.log('Hello VoidDrop 👋');

const chatManager = new Chat();

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

let activeDropCount = 0;

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
  const fromLeft = Math.random() > 0.5;
  const spawnX = fromLeft ? 25 : width - 25;
  const spawnY = 0 + Math.random() * 0.2;

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

    // --- SPEED CONTROL HERE ---
    const velocityX = fromLeft ? 3.5 : -3.5; // Change 4.5 to adjust side-to-side speed (e.g., 2.0 for slower, 8.0 for faster)
    const velocityY = 0.55; // Change 0.35 to adjust downward descent speed (e.g., 0.1 for floatier, 1.0 for faster drop)

    Body.setVelocity(dropBody, { x: velocityX, y: velocityY });

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
      formInput.classList.remove('chat-input-error');
    }, 1200);

    return;
  }

  const result = chatManager.addChat(text);

  // Append Chat Message
  const node = document.createElement('div');
  node.className = 'chat-message';
  node.id = result.id;
  node.innerText = result.text;
  chatMessagesContainer.appendChild(node);
  node.scrollIntoView({ behavior: 'smooth' });

  // Trigger Drop
  spawnEmojiDrop(result.emoji);

  formInput.value = '';
});

// 7. Start Engine and Renderer
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
