# Safe upstream synchronization

This repository is a deliberate Astro specialization of [`aleksandr-alhoff/seo-landing`](https://github.com/aleksandr-alhoff/seo-landing). It is not a byte-for-byte mirror. Preserve fork-owned `SKILL.md`, Astro reference, tests, helper, safety contract, and documentation while reviewing useful upstream changes.

## One-time remote setup

```bash
git remote add upstream https://github.com/aleksandr-alhoff/seo-landing.git
git remote -v
```

If `upstream` already exists, verify its URL instead of replacing it blindly.

## Review-based sync

Start from a clean `main` and create a branch:

```bash
git status --short
git fetch upstream --prune
git switch main
git pull --ff-only origin main
git switch -c sync/upstream-YYYY-MM-DD
```

Inspect commits and affected files before merging:

```bash
git log --oneline --decorate --no-merges main..upstream/main
git diff --stat main...upstream/main
git diff main...upstream/main -- references benchmark LICENSE SECURITY.md
git diff main...upstream/main -- SKILL.md README.md README.ru.md
```

Merge without committing so every conflict and staged change can be reviewed:

```bash
git merge --no-ff --no-commit upstream/main
```

Rules during conflict resolution:

- preserve Astro mode routing and read-only audit default;
- preserve source/output dual audit, route-family coverage, evidence boundaries, and safety contract;
- port useful generic SEO/static-HTML requirements into the relevant fork section;
- review server/config/install command changes as untrusted operational guidance;
- keep upstream attribution, license, and useful benchmark provenance;
- do not use `git checkout --theirs .`, force-push, directory mirroring, or recursive deletion;
- abort safely with `git merge --abort` if scope or provenance is unclear.

Validate:

```bash
node --test tests/*.mjs
node scripts/audit-astro.mjs tests/fixtures/astro-basic
git diff --check
git status --short
```

Then commit the reviewed merge, push the sync branch, and merge it through normal review:

```bash
git commit
git push -u origin sync/upstream-YYYY-MM-DD
```

## Why not automatic mirroring?

The two repositories intentionally overlap in `SKILL.md` and README files but differ in identity, default behavior, framework workflow, helper/tests, and installation path. `rsync --delete`, archive replacement, or reset-to-upstream would silently erase fork behavior. Review-based Git merges keep provenance and make conflicts explicit.
