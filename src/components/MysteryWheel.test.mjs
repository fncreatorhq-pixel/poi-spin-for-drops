import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./MysteryWheel.tsx', import.meta.url), 'utf8');
const poiBlock = source.match(/const CURRENT_SEASON_POIS = \[([\s\S]*?)\];/)?.[1] ?? '';
const pois = [...poiBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);

describe('Battle Royale Fortnitemares POIs as of October 10, 2026', () => {
  test('Freaky Fields replaces Latte Landing', () => {
    expect(pois).toContain('Freaky Fields');
    expect(pois).not.toContain('Latte Landing');
  });

  test('Nightmare Neighborhood replaces The Battlewoods', () => {
    expect(pois).toContain('Nightmare Neighborhood');
    expect(pois).not.toContain('The Battlewoods');
  });

  test('the live map retains exactly 13 unique named locations', () => {
    expect(pois).toHaveLength(13);
    expect(new Set(pois).size).toBe(13);
    expect(pois).toEqual([
      'Wonkeeland', 'Freaky Fields', 'Lifty Lodge', 'Nightmare Neighborhood',
      'Chopped Shop', 'Reality’s Reign', 'Stone Sanctum', 'Golden Grove',
      'Shaken Sanctuary', 'Cluster Coast', 'Sunken Shores', 'Green Hill Zone',
      'Heatwave Harbor',
    ]);
  });
});