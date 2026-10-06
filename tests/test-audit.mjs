import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = resolve(import.meta.dirname, '..');
const fixture = join(repo, 'tests/fixtures/astro-basic');
const script = join(repo, 'scripts/audit-astro.mjs');
const run = path => spawnSync(process.execPath, [script, path], { encoding: 'utf8' });

test('clean Astro fixture passes and inventories all output routes', () => {
  const result = run(fixture);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.astro, true);
  assert.equal(report.outputHtmlFiles, 3);
  assert.deepEqual(report.findings, []);
});

test('broken rendered SEO contract fails deterministically', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-landing-astro-'));
  await cp(fixture, root, { recursive: true });
  const bad = '<html><head><title>A</title><title>B</title><link rel="canonical" href="/bad"><script type="application/ld+json">{bad}</script></head><body><img src="x.jpg"><h1>A</h1><h1>B</h1></body></html>';
  await writeFile(join(root, 'dist/index.html'), bad);
  const result = run(root);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  const rules = new Set(report.findings.map(f => f.rule));
  for (const rule of ['title-count', 'description-count', 'canonical-absolute', 'json-ld-syntax', 'image-dimensions', 'h1-count']) assert.ok(rules.has(rule), `missing ${rule}`);
});

test('non-Astro project is rejected', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-landing-static-'));
  await mkdir(join(root, 'dist'));
  await writeFile(join(root, 'package.json'), '{"private":true}');
  const result = run(root);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.astro, false);
  assert.ok(report.findings.some(f => f.rule === 'astro-project'));
});
