/* Fifteen deliberately irregular pencil-style field sketches for chronicle pages. */
(() => {
  'use strict';

  if (typeof state === 'undefined') return;

  const sketches = {
    mountains: '<svg viewBox="0 0 190 105"><path d="M9 86c20-1 43 1 61 0 38-1 73 2 111-1"/><path d="M18 85c13-16 24-30 38-47 7 8 13 14 20 22 11-18 18-34 29-51 12 20 23 36 34 54 8-10 15-19 23-26 9 16 16 30 21 47"/><path d="M54 39c4 16 8 31 11 47M105 12c5 23 11 48 15 73M161 39c-4 14-4 28-3 44"/></svg>',
    compass: '<svg viewBox="0 0 120 120"><ellipse cx="60" cy="61" rx="37" ry="36"/><ellipse cx="60" cy="61" rx="25" ry="24"/><path d="M59 10c1 8 1 15 1 22M60 89c0 7 1 13 0 20M11 60c8 1 15 1 22 0M87 60c8 0 14 1 22 1"/><path d="M70 48c-2 7-6 14-9 20-6 2-12 5-19 7 4-7 7-13 10-20 6-3 12-5 18-7Z"/></svg>',
    route: '<svg viewBox="0 0 190 100"><path d="M12 79c21-15 36-24 54-22 21 2 30 16 49 8 14-6 17-24 31-31 10-5 20-5 31-15"/><path d="M18 74c3 2 6 5 9 8M169 14c7 0 12 1 17 4-4 5-7 10-8 16"/><circle cx="24" cy="76" r="5"/><path d="M73 55c-1 5-2 10-1 15M113 64c4 3 7 5 9 9"/></svg>',
    tavern: '<svg viewBox="0 0 170 120"><path d="M18 98c34 1 72-1 135 0M28 97c1-18-1-40 1-58 12-9 22-17 34-27 12 9 21 18 31 27-1 19 0 39 0 58"/><path d="M94 46c14-1 29 0 43 0 1 17 0 34 1 51M40 56c8 0 15-1 22 0M45 97V72c6 0 12 0 18 1v24M111 62c7 0 14-1 20 0"/><path d="M130 46c1-7 0-12 3-18 5 1 10 3 16 6-2 6-6 11-11 15"/></svg>',
    bridge: '<svg viewBox="0 0 190 105"><path d="M11 81c54-1 112 2 169 0M27 80c15-26 37-39 67-39 31 0 52 13 70 39"/><path d="M43 80c-1-11 1-21 2-31M65 80c0-17 1-29 3-36M94 80c-1-17 0-27 1-39M122 80c0-16 0-28-2-35M146 80c0-10-1-20-3-29"/><path d="M17 89c25 4 46 4 68 2 31-3 55 2 88-2"/></svg>',
    campfire: '<svg viewBox="0 0 120 125"><path d="M36 98c-7-14-5-26 2-38 5-8 9-14 12-25 8 10 11 18 11 27 7-7 13-15 17-27 6 12 9 23 8 34-1 13-7 23-19 31"/><path d="M48 101c-3-9-1-18 5-25 4 6 6 11 6 17 4-4 7-8 9-14 4 9 3 17-1 24"/><path d="M22 112c16-7 29-14 46-22M39 115c15-8 29-15 47-23"/></svg>',
    tower: '<svg viewBox="0 0 130 145"><path d="M29 128c24-1 49 1 75 0M39 127c1-22 0-47 1-70 11-7 19-14 28-21 9 7 17 14 25 21 1 23 0 47 1 70"/><path d="M49 45c0-8-1-16 0-24 11 0 22 1 33 0 0 8-1 17 0 25M55 77c7 0 13-1 19 0M56 96c6 0 13 0 19 1M63 126c0-7-1-14 0-21 5-1 10-1 14 0 0 7 0 14 1 21"/><path d="M41 58c-4 2-7 6-11 10M94 60c5 3 9 7 13 12"/></svg>',
    ruins: '<svg viewBox="0 0 170 115"><path d="M11 95c50 0 99 1 150 0M25 94c0-19 1-39 1-58 9-7 16-13 24-20 0 11 1 22 0 33 9-7 17-13 26-18 0 21-1 42 0 63"/><path d="M92 95c-1-25 0-50 0-75 8 6 15 12 23 18 8-9 15-16 23-24 0 27 0 53 1 81M67 94c3-7 8-15 13-23M123 38c7-5 12-10 17-17"/><path d="M30 69c8 0 16-1 23 0M100 63c7 0 13 1 19 0"/></svg>',
    signpost: '<svg viewBox="0 0 125 125"><path d="M59 111c1-29-1-57 0-86M50 111c7 1 14 0 22 0"/><path d="M59 37c14-1 28 0 41 0 5-4 9-8 13-13-5-4-9-8-13-12-14 0-27-1-41 0"/><path d="M59 69c-12 0-25 1-37 0-4-4-7-7-11-11 4-5 7-8 12-12 12 0 24-1 36 0"/><path d="M62 84c5-1 9 1 13 4"/></svg>',
    pines: '<svg viewBox="0 0 170 120"><path d="M10 101c50-1 100 1 150 0M38 101c1-10 0-19 1-30M82 101c0-14 1-28 0-42M126 101c0-9 0-18 1-27"/><path d="M22 73c6-10 11-20 17-31 7 10 12 20 18 31-6-2-12-3-18-3-6 0-11 1-17 3ZM61 63c8-14 14-27 22-42 9 15 15 28 23 43-8-3-16-4-23-4-8 0-15 1-22 3ZM112 77c5-10 10-19 15-29 6 9 11 19 16 29-6-2-10-3-16-3-5 0-10 1-15 3Z"/></svg>',
    moon: '<svg viewBox="0 0 125 125"><path d="M75 13c-20 7-34 26-34 48 0 23 14 42 35 50-7 2-13 3-19 2-29-2-50-25-48-54 2-29 25-50 53-49 5 0 9 1 13 3Z"/><path d="M87 31c3 1 6 1 9 0M103 52c3 0 6 1 9 1M88 78c4 0 7 1 10 0M79 23c1-3 2-5 3-8"/></svg>',
    dragon: '<svg viewBox="0 0 185 125"><path d="M14 98c9-26 28-45 54-49 13-2 25 2 34 10 5-9 8-15 11-24 9 1 18 3 27 7-5 5-9 10-14 15 18 7 31 20 39 39-15-5-27-4-39 1-10 4-19 10-27 20-6-15-18-24-35-25-7 5-13 10-20 15-4-5-8-9-11-14-6 0-12 2-19 5Z"/><path d="M91 59c6 4 10 9 14 15M117 35c3 2 7 4 11 5M48 90c-6-5-12-7-18-8"/><circle cx="128" cy="49" r="1.8"/></svg>',
    potion: '<svg viewBox="0 0 110 135"><path d="M40 14c9 0 18 1 27 0M46 15c0 7 0 14 1 21-8 11-16 21-23 32-11 17-3 40 15 47 10 4 24 3 33-3 16-11 19-31 8-47-7-10-14-20-21-29 0-7 1-14 0-21"/><path d="M33 80c8 3 16 4 23 1 8-3 15-4 23-1M42 56c8 0 16 1 24 0"/><path d="M45 95c3 3 6 4 10 4 5 0 9-2 12-5"/></svg>',
    sword: '<svg viewBox="0 0 125 145"><path d="M63 11c0 26 1 54 0 82M54 26c3-5 6-10 9-15 4 5 7 10 10 15M43 99c13 0 27 1 41 0M51 99c0 5 0 10 1 15 4 3 7 6 11 9 4-3 8-6 12-9 0-5 0-10 1-15M59 122c0 5 0 10 1 15M67 122c0 5 0 10-1 15"/><path d="M32 103c8-3 15-4 22-3M74 100c8 0 15 2 21 5"/></svg>',
    ship: '<svg viewBox="0 0 195 120"><path d="M14 95c54-1 111 2 169 0M43 91c8-18 16-36 25-53 12 0 24 0 36 1 9 18 18 35 28 53M86 18c0 23-1 48 0 70"/><path d="M87 18c18 5 35 16 48 32-21 1-37-4-48-11M85 31c-15 7-27 17-38 31 15 0 27-4 38-11"/><path d="M35 93c18 5 34 7 50 5 23-3 45-4 70 0"/></svg>'
  };

  const pageSets = [
    ['mountains', 'compass', 'route'],
    ['tavern', 'bridge', 'campfire'],
    ['tower', 'ruins', 'signpost'],
    ['pines', 'moon', 'dragon'],
    ['potion', 'sword', 'ship'],
    ['route', 'campfire', 'compass'],
    ['ruins', 'moon', 'signpost'],
    ['ship', 'mountains', 'sword'],
    ['bridge', 'pines', 'potion'],
    ['tower', 'dragon', 'route'],
    ['tavern', 'compass', 'moon'],
    ['signpost', 'campfire', 'mountains'],
    ['potion', 'ruins', 'ship'],
    ['sword', 'bridge', 'pines'],
    ['dragon', 'tower', 'tavern'],
  ];

  function makeSketch(name, slot, seed) {
    const span = document.createElement('span');
    span.className = `human-sketch human-sketch--${slot}`;
    span.dataset.sketch = name;
    span.style.setProperty('--sketch-tilt', `${((seed * 7) % 9) - 4}deg`);
    span.innerHTML = sketches[name];
    const svg = span.querySelector('svg');
    if (svg) {
      const echo = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      echo.setAttribute('class', 'human-sketch-echo');
      [...svg.children].forEach((node) => echo.append(node.cloneNode(true)));
      svg.prepend(echo);
    }
    return span;
  }

  function decorate() {
    if (state.section !== 'chronicles') return;
    const page = document.querySelector('.entry-page');
    if (!page) return;
    const dayNumber = Math.max(1, Number(state.selectedDayId) || 1);
    const set = pageSets[(dayNumber - 1) % pageSets.length];
    const key = `${dayNumber}:${set.join('-')}`;
    const existing = page.querySelector(':scope > .human-sketch-layer');
    if (existing?.dataset.key === key) return;
    existing?.remove();

    const layer = document.createElement('div');
    layer.className = 'human-sketch-layer';
    layer.dataset.key = key;
    set.forEach((name, index) => layer.append(makeSketch(name, index + 1, dayNumber + index)));
    page.append(layer);
  }

  const app = document.querySelector('#app');
  if (!app) return;
  const observer = new MutationObserver(() => queueMicrotask(decorate));
  observer.observe(app, { childList: true, subtree: true });
  decorate();
})();
