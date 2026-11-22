import { expect, test } from 'bun:test';
import { liveAcademyPatch } from '../scripts/build-academy-live.js';

test('matches the set and patch of the official Academy tier list together', () => {
  const html = (set: number, patch: string) => `<title>Best TFT Meta Comps for Set ${set} (Patch ${patch}) | TFT Academy</title>`;
  expect(liveAcademyPatch(html(18, '18.7'))).toBe('18.7');
  expect(() => liveAcademyPatch(html(19, '18.7'))).toThrow('Expected the official TFT Academy Set 18');
  expect(() => liveAcademyPatch(html(18, '19.1'))).toThrow('Expected the official TFT Academy Set 18');
});
