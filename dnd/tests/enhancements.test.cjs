const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('journal ships exactly fifteen pencil sketch subjects', () => {
  const source = read('sketches.js');
  const expected = [
    'mountains', 'compass', 'route', 'tavern', 'bridge',
    'campfire', 'tower', 'ruins', 'signpost', 'pines',
    'moon', 'dragon', 'potion', 'sword', 'ship',
  ];
  for (const name of expected) assert.match(source, new RegExp(`\\b${name}: '<svg`));
  const declared = [...source.matchAll(/^\s{4}([a-z]+): '<svg/gm)].map((match) => match[1]);
  assert.equal(new Set(declared).size, 15);
});

test('cloud sync uses a publishable key and the dedicated RLS table', () => {
  const source = read('sync.js');
  assert.match(source, /sb_publishable_/);
  assert.match(source, /traveler_journal_state/);
  assert.doesNotMatch(source, /service_role|sb_secret_/);
});

test('entry point pins Supabase and loads enhancements after base styles', () => {
  const html = read('index.html');
  assert.match(html, /@supabase\/supabase-js@2\.111\.0/);
  assert.ok(html.indexOf('refinement.css') < html.indexOf('enhancements.css'));
  assert.ok(html.indexOf('journal.js') < html.indexOf('sync.js'));
});
