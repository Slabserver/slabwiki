---
target: Season 4 portal
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/home/sam/slabserver/wiki2/slabwiki/content/survival/season-4/_index.md"
target_fingerprint: "sha256:021fea441edacafa93d329658cd896db320c642c06602b5e3fc24c6c1c3f5dc4"
target_path: /home/sam/slabserver/wiki2/slabwiki/content/survival/season-4/_index.md
timestamp: 2026-09-24T18-40-06Z
slug: content-survival-season-4-index-md
---
Method: dual-agent (A: design review · B: detector + headless-browser overlay)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Live "N shown" filter count; filter chips lack aria-pressed |
| 2 | Match System / Real World | 3 | Player vocabulary; "Documented 12 pages" / "0 pages" is wiki-speak |
| 3 | User Control and Freedom | 3 | Filters reversible; filter state not in URL, lost on Back |
| 4 | Consistency and Standards | 2 | 🗺 emoji map link (tofu) breaks sprite rule; season tag only on image-less cards |
| 5 | Error Prevention | 2 | Tunnels / Public Resources hub cards say "0 pages" |
| 6 | Recognition Rather Than Recall | 3 | Sprites aid recognition; Quick Links vanish on mobile |
| 7 | Flexibility and Efficiency | 2 | No quick path to Shops/Map/Tunnels on mobile; no coord search |
| 8 | Aesthetic and Minimalist Design | 3 | Strong world; 3 overview layers before content, duplicated intro |
| 9 | Error Recovery | 2 | Empty-filter message exists; image/summary-less cards leave voids |
| 10 | Help and Documentation | 2 | No "missing something? contribute" on an archive page |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict
Chrome is unmistakably Slabserver (sprites, Silkscreen, hard shadows, spawn backdrop). The portal body is a generic dashboard-landing stack (6 stat tiles → hub cards → bento spotlight → filter grid). The season never gets an arrival: `banner` and `spawn` front matter exist but aren't rendered as a hero. Detector: template scan clean (exit 0, 21 advisories, 9 are template-parse false positives); rendered-page overlay found 40 issues dark / 63 light — low-contrast, undersized pixel text (7–8px), nested-cards, line-length (~137ch header subtitle), skipped heading (no h2 anywhere).

## Priority Issues
1. [P0] Spotlight titles invisible in light mode — spotlight-card.html:31-33 uses theme text-fg/text-muted over a fixed black gradient; light fg is #2a2620 on ~black. Fix: constant light text + text-shadow on photo overlays. /impeccable harden
2. [P1] Contrast fails system-wide — every text-on-grass pair fails in both themes (white 4.08, on-grass 3.59, on-grass-dim 3.08, logo-text 2.9); light muted fails on all surfaces (2.5–3.8, and is lighter than "faint"); light gold chip 1.7:1; light wood-l labels 3.7. Fix: darken grass or grass-backed text weight; retune light muted/gold/wood-l. /impeccable colorize
3. [P1] Map link is a 🗺 emoji rendering as tofu (coord-chip.html:10) — breaks the no-emoji rule on every coord card; title-only name. Fix: mc-icon filled-map sprite + aria-label. /impeccable polish
4. [P1] Lookups buried and mislabeled — mobile drops Quick Links, 6 stat tiles push Shops/Tunnels to y≈1380; hub cards count .RegularPages so Tunnels/Resources read "0 pages" (list.html:44). Fix: quick-action row under H1 on mobile, compact stats, drop zero counts / use real nouns. /impeccable adapt + /impeccable clarify
5. [P2] No arrival, dead ending, flat outline — no banner hero; ends on an orphan card + ~1000px empty backdrop; no h2s (section labels are divs). Fix: banner hero with dates/status/spawn chip, prev/next season + contribute strip, real h2 section headings. /impeccable bolder then /impeccable layout

## Persona Red Flags
Casey (alt-tabbed mid-game, mobile): Shops/Tunnels ~1400px down; "0 pages" looks broken; tofu map button; filter state lost on return.
Sam (accessibility): light spotlight ~1:1; muted text fails light AA; white-on-grass active chip 4.1:1; no aria-pressed; no custom :focus-visible on cards/chips/buttons; 7px image tags.
The Alumni: no "that's our spawn" hero; no season narrative or roster; no next/prev season; no invitation to add memories.

## Minor Observations
Mobile Explore/Seasons strips clip labels with no scroll cue; Games District blank card; Fish Cult no summary; Map stat tile is a link styled like static tiles; "Season Spotlight" label too small; "Season 4 NOW" + "Status: Current" duplicated; header subtitle ~137ch line length.

## Questions to Consider
- Why isn't the first screen the spawn itself: banner, coords, "you are here"?
- Is the stat strip for players or for proving the wiki has content?
- When Season 5 starts, what makes this portal feel like a memorial rather than the same dashboard with "Ended" on it?
