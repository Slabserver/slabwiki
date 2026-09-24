# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: the Slabserver community as a whole, current players and alumni, browsing the wiki as the server's archive: past and present seasons, builds, events, puzzles and lore. Current players also use it mid-game as a reference (shops, coordinates, farms, public resources), often alt-tabbed out of Minecraft.

Secondary: the maintainer and a few staff who write nearly all content through git PRs. Contributor UX is a low priority.

## Product Purpose
SlabWiki is the community wiki and shop directory for Slabserver, a Minecraft SMP. It exists so that what happens on the server is recorded and doesn't vanish when a season ends, and so players have one place to look things up during play.

Success a season from now means:
- every season's builds, events and lore are preserved before they're lost;
- players use it daily as their go-to for shops, coordinates and farms.

## Positioning
It's organised the way the server is actually lived: server (Survival, Nexus), then season, then category. Each season is a place you can browse into, not a filter over a flat table. It replaced a MediaWiki install that couldn't model that hierarchy (see `content/workshop/goodbye-mediawiki.md`).

## Operating Context
- Content is Markdown in git, edited through PRs. There is no in-browser editing. A CMS experiment was shelved (branch `shelved/cms`).
- Hierarchy is `content/<server>/<season>/`. Category is a taxonomy tag (build / farm / event / puzzle / community), not a folder. Shops, public resources and similar live in season-nested folders.
- Workshop (`content/workshop/`) is the blog for tech write-ups and updates.
- Contribution policy (`content/contributing.md`): AI may only assist with articles, roughly 80/20 in favour of the author's own writing. Pages that used AI carry the `ai: true` tag and show a note.

## Capabilities and Constraints
- Static Hugo site (extended, v0.163.3+) with custom layouts and no theme. Styling is Tailwind CSS v4, precompiled with the standalone CLI. TypeScript is compiled with `tsc`.
- Servers and quick links come from `data/sections.yaml`; category labels and icons come from `data/categories.yaml`.
- Current content: Survival Seasons 2–4 (Season 4 is the current season, with map, shops, tunnels, public resources and The Passage) and Nexus games (Decked Out, Hurtin' Slabbers, spectator servers).
- Features: client-side search, coordinate copy chips, light/dark theme, and a live in-site style guide at `/style-guide/` that is the source of truth for the visual system.
- Open: whether player contributions will be actively encouraged later.

## Brand Commitments
- Name: SlabWiki / Slabserver. It's a companion to slabserver.org and links back to it.
- Icons are real Minecraft item sprites, never emoji (explicit user preference).

## Evidence on Hand
- Real article, shop and image content under `content/` and `static/images/` (Seasons 2–4, Nexus).
- The legacy MediaWiki export is at `../wiki-dump.xml`.
- No testimonials, usage statistics or player counts exist; don't fabricate them.

## Product Principles
1. The archive comes first. Pages should let a season be revisited years later, not just serve today's lookup.
2. Browse like a place. Seasons and servers are destinations with their own landing pages, not filters over a flat table.
3. Lookup stays fast. Shops, coordinates and farms need to be one or two clicks away for someone in the middle of a game.
4. Community-written. Pages are written by people, and AI may only assist.
