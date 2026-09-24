---
name: SlabWiki
description: Community wiki and archive for Slabserver, built like Minecraft's own inventory UI.
colors:
  grass: "#4b7131"
  grass-hi: "#7cc24a"
  grass-hi-light: "#3f6d2a"
  on-grass: "#eaf4dd"
  gold: "#e0a92e"
  gold-hi-light: "#7f5c10"
  wood: "#8a5e35"
  wood-l: "#c49a63"
  wood-l-light: "#855a33"
  ice: "#4f83b3"
  mesa: "#b5651d"
  stone: "#6e6e68"
  bg: "#16130e"
  surface: "#24201a"
  surface-2: "#1c1913"
  card: "#2f2a22"
  fg: "#f0ebe0"
  body: "#d8cfba"
  muted: "#c2b8a2"
  faint: "#b8ad98"
  muted-light: "#5f584b"
  faint-light: "#6b6455"
  line: "#0c0a07"
  divider: "#3a342a"
  bg-light: "#d9d4c7"
  surface-light: "#f5f3ee"
  surface-2-light: "#ece7db"
  card-light: "#ffffff"
  fg-light: "#2a2620"
  body-light: "#3a352c"
  line-light: "#2a2620"
typography:
  display:
    fontFamily: "Silkscreen, ui-monospace, Cascadia Code, monospace"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.15
  headline:
    fontFamily: "Silkscreen, ui-monospace, Cascadia Code, monospace"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Silkscreen, ui-monospace, Cascadia Code, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Nunito Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Silkscreen, ui-monospace, Cascadia Code, monospace"
    fontSize: "8px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.125em"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  button-grass:
    backgroundColor: "{colors.grass}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.fg-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  button-dark:
    backgroundColor: "{colors.line}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.body}"
    rounded: "{rounded.none}"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.body}"
    rounded: "{rounded.none}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  badge:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "4px 6px"
  badge-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.fg-light}"
    rounded: "{rounded.none}"
    padding: "4px 6px"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  coord:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
---

# Design System: SlabWiki

## Overview

**Creative North Star: "The Survival Inventory"**

SlabWiki should look like Minecraft's own UI. Every surface is a slot or a panel from the game: hard corners, near-black outlines, buttons that press down into their shadow, and pixel labels over everything that names something. Visitors should feel they've opened another in-game screen, not a SaaS dashboard with a Minecraft skin on top.

Depth is structural. Panels stack like placed blocks, and each layer of importance gets a heavier outline and a longer hard shadow. Nothing floats on blur. The palette is overworld dirt at night, lit by grass and gold: warm dark soil for the ground, grass green for the living parts (active states, headings, links), and gold for anything worth noticing (seasons, featured items). Light mode is the same world in daylight, not a separate identity.

Components are chunky and tactile. Thick borders, stepped `steps(2)` hover snaps, and press-down active states make everything feel placed rather than rendered. Screenshots are framed like item-frame exhibits. The chrome sits on a pixel checkerboard or a darkened spawn screenshot, so the wiki always reads as part of the server.

**Key Characteristics:**
- Hard corners everywhere (0px radius).
- Near-black outlines at 2, 3 or 4px, in both themes.
- Hard offset shadows only, no blur. They lengthen with elevation.
- Silkscreen pixel type on every heading, label, badge and button. Nunito Sans for reading.
- Real Minecraft item sprites for icons, rendered pixelated. Never emoji.
- Stepped, snappy motion (`steps(2)`, 50–100ms). Nothing eases softly.

## Colors

Overworld at night: warm soil neutrals, grass green as the living accent, gold for what matters. Every color is a theme token (`--c-*`) defined three times in `assets/css/main.css`: dark (default), `[data-theme="light"]`, and a `prefers-color-scheme: light` fallback.

### Primary
- **Grass Block Green** (grass): the fixed grass band (header, hero, step badges, active filter chips, the grass button). It's the same in both themes, which is why `on-grass` text is constant too.
- **Sunlit Grass** (grass-hi; grass-hi-light in light mode): headings (`.section-h`, prose h1–h3), links, hover borders and focus rings. It's the accent that tells you "this is alive or clickable".

### Secondary
- **Gold Ingot** (gold; gold-hi for text): seasons and featured items. `gold` fills the gold badge and gold button; `gold-hi` is the text shade (season chips, eyebrows, warning note titles), darkened in light mode so it stays readable on paper.

### Tertiary
- **Oak Plank** (wood) and **Stripped Oak** (wood-l): figure caption nameplates, the active map-dimension tab, and style-guide micro-labels.
- **Packed Ice** (ice), **Terracotta Mesa** (mesa), **Cobblestone** (stone): semantic notes only (info / danger / neutral). Don't use them as general accents.

### Neutral
- **Night Soil** (bg): the page ground under the checkerboard.
- **Coarse Dirt** (surface): the main content sheet and inputs.
- **Deep Dirt** (surface-2): the sidebar nav, breadcrumb strip, chips, badges, table headers and code blocks.
- **Podzol** (card): cards and panels, the raised layer.
- **Bone White** (fg): headings and emphasis. **Sandstone** (body): prose. **Muted** and **Faint** (muted, faint): metadata.
- **Blackstone Outline** (line): every border and outline. It's near-black in both themes (dark ink in light mode). This is what makes the UI read as Minecraft.
- **Divider** (divider): soft rules under section headings and between table rows.

### Named Rules
**The Token-Only Rule.** Templates never hardcode hex. Use `bg-*` / `text-*` / `border-*` token utilities so both themes stay in sync. To retune a color, edit all three theme blocks.

**The Constant Grass Rule.** Grass is the same in both themes, so text on a grass panel uses `on-grass` / `on-grass-dim`, never a theme-flipping token. Grass is dark enough that white, `on-grass` and `on-grass-dim` all clear 4.5:1 on it; keep it that way.

**The Gold Means Worth Noticing Rule.** Gold is for seasons and featured items only. If everything is gold, nothing is.

## Typography

**Display Font:** Silkscreen (with ui-monospace, Cascadia Code, monospace)
**Body Font:** Nunito Sans (with system-ui)

**Character:** Silkscreen is the in-game HUD voice: square, bitmap, uppercase-friendly. Nunito Sans is the book you read inside it: round, warm and easy on long lore pages. The base size is 17px on `<html>`.

### Hierarchy
- **Display** (Silkscreen 400, 32px, 24px on phones, 1.15): page titles.
- **Headline** (Silkscreen 400, 24px, 1.2): section headings, prose h1 and h2, in Sunlit Grass over a 3px divider rule.
- **Title** (Silkscreen 400, 16px): card titles, wood header bars, prose h3 and sub-headings.
- **Body** (Nunito Sans 400, 16.5px, 1.75): article prose in Sandstone. Strong text lifts to Bone White.
- **Label** (Silkscreen 400, 8px, 0.125em, uppercase): micro-labels, buttons, breadcrumbs and badges. Buttons and badges use no tracking.

### Named Rules
**The Pixel-Names-Things Rule.** Anything that names or labels (headings, buttons, badges, breadcrumbs, table headers, section labels) is Silkscreen. Anything you read for meaning (prose, descriptions, metadata) is Nunito Sans.

**The 8px Grid Rule.** Silkscreen is drawn on an 8px grid, so it only renders crisp at 8, 16, 24 and 32px (`text-pixel-label`, `-title`, `-heading`, `-display`). Never use another size, never inherit a body size into pixel type, and keep letter-spacing at 0 or 0.125em so glyphs stay on whole pixels.

## Layout

The page is centered on a max-1600px column over a darkened, viewport-pinned spawn screenshot, or over the pixel checkerboard where there's no backdrop. On large screens, a 260px sidebar nav panel sits beside the main content sheet with a 20px gap. Below `lg`, the sidebar stacks above the content.

The header (grass band) and breadcrumb strip are one sticky stack. JS measures its height into `--sticky-h` / `--sticky-top`, which drive the sticky sidebar offsets and heading `scroll-margin-top`. Below `sm`, search drops to its own full-width row.

Spacing follows Tailwind's 4px scale. Panels pad at 16–24px (`p-4` to `p-6`), cards at 12–16px, and gaps between cards at 12–20px. Card grids are responsive auto columns. Season portals group entries into category sections, each a pixel heading and icon over a card grid.

## Elevation & Depth

Elevation is structural stacking. Every raised layer is an outlined block with a hard, unblurred offset shadow, and both the outline weight and the shadow length grow with importance. Hover lifts a card by translating it up-left while its shadow lengthens. Pressing a button pushes it down-right into its shadow. The theme sets the shadow color (`--c-shadow`, `--c-card-sh`), so light mode gets soft ink and dark mode gets deep black.

### Shadow Vocabulary
- **Button** (`box-shadow: 3px 3px 0 var(--c-card-sh)`): buttons. Drops to `1px 1px` on `:active`.
- **Card** (`box-shadow: 4px 4px 0 var(--c-card-sh)`): cards, figures, notes, details, stats and prose images. Grows to `7px 7px` on hover.
- **Search dropdown** (`box-shadow: 6px 6px 0 var(--c-shadow)`): the search results popover.
- **Panel** (`box-shadow: 8px 8px 0 var(--c-shadow)`): heroes, infoboxes, the sidebar nav and the puzzle strip.
- **Sheet** (`box-shadow: 10px 10px 0 var(--c-shadow)`): the main content column.
- **Frame** (`box-shadow: 12px 12px 0 var(--c-shadow)`): the outermost site frame.
- **Inset** (`box-shadow: inset 2px 2px 0 rgb(0 0 0 / .12)`): inputs and progress troughs, which are sunk into the surface.

### Named Rules
**The No-Blur Rule.** A shadow's blur radius is always 0. A soft shadow breaks the block world instantly.

**The Heavier-Is-Higher Rule.** Card (3px outline, 4px shadow), then panel (4px, 8px), then frame (4px, 12px). Don't give a small element a panel-weight shadow.

## Shapes

Every corner is square. Never use `rounded`, including on images, avatars and inputs. Form comes from outline weight: 2px for small inline pieces (chips, badges, coord chips, keycaps, tooltips), 3px for cards, buttons, inputs and figures, and 4px for panels, sheets and the header's bottom edge. Callout notes use a thicker 6px left bar in their semantic color. The one angled shape is the puzzle strip, a skewed accordion banner whose panels meet on parallel 9° diagonals. It unskews into stacked bars on small screens.

## Components

### Buttons
Chunky and pressable, like a Minecraft menu button.
- **Shape:** square corners (0px), 3px Blackstone outline, 3px hard shadow.
- **Default:** Deep Dirt fill, Bone White Silkscreen label at 8px uppercase, 8px × 12px padding.
- **Variants:** grass (active or current world), gold (featured), and dark (the "← slabserver.org" back-link, with a lighter black shadow).
- **Hover / Active:** hover brightens slightly (`brightness(1.08)`). Active translates 2px down-right and the shadow collapses to 1px.

### Chips and badges
- **Badge:** Silkscreen at 8px uppercase, 2px outline, Deep Dirt fill. There are grass and gold variants for status and featured items.
- **Chip:** Nunito Sans at 12px for inline metadata, 2px outline, muted text. Linked chips take a grass border on hover. The season chip has gold text.
- **Filter chip:** toggles the season portal's category grid. When on, it's a solid grass fill with white text.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** Podzol (card) for cards and panels, Coarse Dirt for the content sheet, and Deep Dirt for the sidebar.
- **Shadow Strategy:** card, panel, sheet or frame from the vocabulary above, by importance.
- **Border:** 3px (card) or 4px (panel, sheet) Blackstone.
- **Hover:** clickable cards lift 3px up-left, the border turns grass and the shadow grows to 7px, all on a `steps(2)` transition. A full-card link overlay (`stretched-link`) lets nested controls, such as a coord chip's map link, stay clickable on their own.

### Inputs / Fields
- **Style:** Coarse Dirt fill, 3px outline, and an inset top-left shadow so the field reads as sunk. The header search has a spyglass sprite.
- **Focus:** the border turns Sunlit Grass (grass-hi). There's no glow.

### Navigation
- **Header:** a full-width grass band with a subtle vertical sheen and a 4px bottom outline, holding the back-link button, logo, pixel wordmark with a "Community wiki" micro-label, search and theme toggle.
- **Breadcrumbs:** a Deep Dirt strip under the header. Silkscreen at 8px uppercase, muted links that turn grass on hover, and the current page in Bone White.
- **Sidebar:** a Deep Dirt panel with a 4px outline and 8px shadow, sticky under the header stack. It's driven by `data/sections.yaml`.
- **Prev / next:** a pair of lift-on-hover cards with a Silkscreen direction label.

### Coordinate chip (signature)
A monospace, click-to-copy coordinate chip with a 2px outline in Deep Dirt. Hover turns the border grass. On copy it shows "✓ copied" in Sunlit Grass. An optional square map-link button sits beside it and jumps to the spot on the season map. It's the wiki's most-used lookup control.

### Framed figure (signature)
A screenshot in a 3px outline with a card shadow, with its caption butted directly underneath as a solid Oak Plank nameplate bar in white 12px text. Prose images get the same frame automatically.

### Minecraft item icon (signature)
32px or 16px cells from the Minecraft item sprite sheet (`mc-icon.html`, `mc-items.css`), always pixelated. It's the only icon system: categories, sections, quick links, map dimensions and empty states all use item sprites.

## Do's and Don'ts

### Do:
- **Do** outline every raised surface in Blackstone (line) at 2, 3 or 4px, choosing the weight by importance.
- **Do** use hard offset shadows from the vocabulary (3, 4, 6, 8, 10 or 12px, blur 0) and let them lengthen with elevation.
- **Do** set every heading, label, badge, breadcrumb and button in Silkscreen, sized explicitly.
- **Do** use `steps(2)` or sub-100ms transitions for hover and press so motion snaps like the game.
- **Do** render sprites, maps and pixel art with `image-rendering: pixelated`.
- **Do** add new components to the `@layer components` block with `mc-` naming and token utilities, then show them on `/style-guide/`.

### Don't:
- **Don't** round any corner.
- **Don't** use blurred or soft shadows.
- **Don't** use emoji as icons. Use Minecraft item sprites.
- **Don't** hardcode hex in templates. Use theme tokens, and use `on-grass` for text on grass.
- **Don't** use `@apply` with another component class (like `pixel`) inside a component. Inline `font-family: var(--font-pixel)` instead.
- **Don't** spend gold on anything that isn't a season or a featured item.
