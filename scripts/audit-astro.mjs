#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname, join } from 'node:path';

const root = resolve(process.argv[2] || '.');
const findings = [];
const add = (severity, rule, file, message) => findings.push({ severity, rule, file: relative(root, file) || '.', message });

async function exists(path) { try { await stat(path); return true; } catch { return false; } }
async function filesUnder(dir) {
  if (!(await exists(dir))) return [];
  const out = [];
  for (const name of await readdir(dir)) {
    if (['.git', 'node_modules', '.astro'].includes(name)) continue;
    const path = join(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) out.push(...await filesUnder(path));
    else out.push(path);
  }
  return out;
}

const packagePath = join(root, 'package.json');
const configCandidates = [];
for (const ext of ['mjs', 'js', 'ts', 'cjs']) {
  const path = join(root, `astro.config.${ext}`);
  if (await exists(path)) configCandidates.push(path);
}
let isAstro = configCandidates.length > 0;
if (await exists(packagePath)) {
  try {
    const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
    isAstro ||= Boolean(pkg.dependencies?.astro || pkg.devDependencies?.astro);
  } catch { add('error', 'package-json', packagePath, 'package.json is not valid JSON'); }
}
if (!isAstro) add('error', 'astro-project', root, 'No astro.config.* or Astro dependency found');

const sourceFiles = (await filesUnder(join(root, 'src'))).filter(p => ['.astro', '.js', '.ts', '.jsx', '.tsx'].includes(extname(p)));
for (const file of sourceFiles) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/client:(load|only)\b/g)) add('warning', 'eager-island', file, `${match[0]} requires first-load justification`);
  for (const match of text.matchAll(/<img\b[^>]*>/gis)) {
    const tag = match[0];
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag)) add('warning', 'image-dimensions', file, 'img lacks explicit width and/or height; verify reserved aspect ratio in output');
  }
  for (const match of text.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = match[1].trim();
    if (body && !body.includes('{JSON.stringify')) {
      try { JSON.parse(body); } catch { add('error', 'json-ld-syntax', file, 'Static JSON-LD block is not valid JSON'); }
    }
  }
}

const htmlFiles = (await filesUnder(join(root, 'dist'))).filter(p => extname(p) === '.html');
const seenCanonical = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const count = re => (html.match(re) || []).length;
  if (count(/<title\b/gi) !== 1) add('error', 'title-count', file, `Expected one title, found ${count(/<title\b/gi)}`);
  if (count(/<meta\b[^>]*name=["']description["']/gi) !== 1) add('error', 'description-count', file, 'Expected one meta description');
  const canonical = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (canonical.length !== 1) add('error', 'canonical-count', file, `Expected one canonical, found ${canonical.length}`);
  else {
    const url = canonical[0][1];
    if (!/^https?:\/\//.test(url)) add('error', 'canonical-absolute', file, `Canonical must be absolute: ${url}`);
    if (seenCanonical.has(url)) add('warning', 'canonical-duplicate', file, `Canonical also used by ${relative(root, seenCanonical.get(url))}`);
    else seenCanonical.set(url, file);
  }
  if (count(/<h1\b/gi) !== 1) add('warning', 'h1-count', file, `Expected one H1, found ${count(/<h1\b/gi)}`);
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch { add('error', 'json-ld-syntax', file, 'Rendered JSON-LD is not valid JSON'); }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gis)) {
    const tag = match[0];
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag)) add('warning', 'image-dimensions', file, 'Rendered img lacks width and/or height');
  }
}

findings.sort((a,b) => `${a.severity}:${a.file}:${a.rule}`.localeCompare(`${b.severity}:${b.file}:${b.rule}`));
console.log(JSON.stringify({ root, astro: isAstro, sourceFiles: sourceFiles.length, outputHtmlFiles: htmlFiles.length, findings }, null, 2));
process.exitCode = findings.some(f => f.severity === 'error') ? 1 : 0;
