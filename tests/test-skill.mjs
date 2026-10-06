import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const skill = await readFile(resolve(root, 'SKILL.md'), 'utf8');

test('frontmatter is valid and uses fork identity', () => {
  assert.match(skill, /^---\nname: seo-landing-astro\n/);
  assert.match(skill, /\n---\n\n# SEO Landing for Astro/);
});

test('safety and dual-audit contracts remain explicit', () => {
  for (const phrase of ['audit-only', 'Do not write project files', 'Never install packages', 'Source audit', 'Output audit', 'Multi-route sampling', 'Optimization scores are targets, never guarantees']) assert.match(skill, new RegExp(phrase));
});

test('linked local references exist', async () => {
  const links = [...skill.matchAll(/\]\((\.\/[^)#]+)(?:#[^)]+)?\)/g)].map(m => m[1]);
  assert.ok(links.length >= 4);
  await Promise.all(links.map(async link => assert.ok((await readFile(resolve(root, link), 'utf8')).length > 0, link)));
});
