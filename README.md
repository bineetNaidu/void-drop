# VoidDrop

An outer-space-themed physics drop game where chat inputs spawn emote that descend through a zero-gravity cosmos toward Mars.

## TODO

* **Phase 1: Project Setup & Environment**
* [x] Initialize project repository and version control
* [x] Install required dependencies (such as Matter.js for physics simulation)
* [x] Configure project folder structure (components, physics engine logic, assets, styles)

* **Phase 2: UI Layout & Theme Design**
* [x] Build the main application shell with a responsive 70/30 split-screen layout
* [x] Style the 70% left side as an outer space canvas container with a starry background
* [x] Style the 30% right side as a futuristic sci-fi live chat sidebar
* [x] Implement top dashboard status bars for metrics like active drops and score counters
* [x] Design and integrate visual assets for the bottom 50% curved Mars planet surface
* [x] Design emotes selectors
  * [ ] Show the selected emote on the input
  * [x] Show the selected emote on chat window after send

* **Phase 3: Chat Input & Command Parser**
* [x] Create the interactive chat sidebar component with a scrollable message history feed
* [x] Build an input form simulating chat submissions for local testing
* [x] Implement a command parsing utility to detect the `!drop` keyword and extract user-submitted emojis
* [ ] Establish an event-driven queue to pipe verified emoji commands from the chat panel over to the game engine

* **Phase 4: Physics Engine Integration (Matter.js)**
* [x] Initialize the 2D physics world, renderer, and runner inside the 70% canvas zone
* [x] Configure appropriate world gravity parameters simulating space descent towards Mars
* [x] Build static boundary walls to keep physics bodies contained within the play area
* [x] Position the curved bottom barrier representing the Mars surface boundary

* **Phase 5: Gameplay Mechanics & Spawning**
* [x] Write a spawner function that translates incoming chat emojis into physical falling bodies at the top of the canvas
* [x] Implement collision detection logic to handle interactions between falling items and obstacles
* [x] Define target landing zones on the Mars surface to register successful descents and calculate scores
* [ ] spawn emotes instead of emoji

* **Phase 6: Polish, Testing, & Optimization**
* [ ] Add dynamic UI feedback or score multipliers when emojis successfully land on the Mars Colony Base
* [ ] Optimize canvas rendering performance to handle multiple simultaneous drops smoothly
* [ ] Test edge cases like rapid spamming of chat commands and boundary collisions
* [ ] Perform final layout adjustments and responsiveness checks
