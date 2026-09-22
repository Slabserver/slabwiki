# SlabWiki CMS auth broker + GitHub proxy

A tiny Cloudflare Worker that lets **Decap CMS** (`/admin/` on the live site)
authenticate community editors with **Discord**, gated on holding a specific
**role in the SlabServer guild** — no GitHub account required for editors — and
then **proxies every GitHub API call** so the shared GitHub token never touches
the browser.

```
AUTH (popup):
  Editor ── /admin ──▶ Decap ──popup──▶ Worker /auth ──▶ Discord consent
                                              │
     Discord ──code──▶ Worker /callback ──────┘
          │ exchange code → user token
          │ GET /users/@me/guilds/{guild}/member  → check role
          └─ role OK → postMessage(SIGNED SESSION TOKEN, not the GitHub token)

WRITES (every GitHub call, via config.yml `api_root: <worker>/gh`):
  Decap ──▶ Worker /gh/*  ── verify session ── swap in shared GITHUB_TOKEN ──▶ api.github.com
                              └─ stamps the Discord identity onto:
                                 GET /user (display name) · POST /git/commits
                                 (author) · POST /pulls (body line)
```

Why a broker + proxy instead of Decap's plain GitHub backend:
- The stock backend makes every editor log in with their own GitHub account and
  have repo write access. Here editors prove themselves via **Discord role**.
- The stock backend also talks to `api.github.com` **from the browser**, which
  would expose the shared token to every authorised editor. Instead Decap's
  `api_root` points at this worker: the browser only ever holds a short-lived
  **session token** (a signed JWT carrying the Discord identity), and the worker
  injects the real `GITHUB_TOKEN` server-side.
- Because every write passes through the worker, the **commit author** and the
  **PR body** are stamped with the editor's Discord name — attribution without
  giving anyone a GitHub login. Commits still land as PRs against `main`
  (`publish_mode: editorial_workflow`); a maintainer merges them.

## 1. Discord application

1. https://discord.com/developers/applications → **New Application**.
2. **OAuth2** → copy **Client ID** and **Client Secret**.
3. **OAuth2 → Redirects**: add `https://slab-cms-auth.<your-subdomain>.workers.dev/callback`.
4. No bot or privileged intents needed — the `guilds.members.read` scope reads
   the user's own roles with their token.
5. Get the **Guild ID** (Discord → Server Settings → Widget, or right-click the
   server with Developer Mode on) and the **Role ID(s)** you want to allow
   (Server Settings → Roles → right-click a role → Copy ID). Multiple roles =
   comma-separated.

## 2. GitHub token

Create a **fine-grained PAT** (github.com → Settings → Developer settings →
Fine-grained tokens), scoped to **only `CodingTwist/slabwiki`**, with:
- Repository permissions: **Contents: Read and write**, **Pull requests: Read
  and write**, **Metadata: Read-only**.

Prefer a dedicated machine/bot account: it's the account that actually *pushes*
each commit (the git author on the commit is overridden to the Discord editor,
but the pusher is this token's account).

> Security note: this token **stays in the Worker** — it is injected into the
> proxied `/gh/*` requests and never sent to the browser. Editors hold only a
> short-lived session JWT. Keep the token repo-scoped anyway. For production you
> can upgrade to a **GitHub App**: give the Worker the app's private key and have
> the proxy mint a short-lived installation token instead of a static PAT.

## 3. Deploy the Worker

```bash
cd services/cms-auth
npm i -g wrangler        # or: npx wrangler ...
wrangler deploy

wrangler secret put DISCORD_CLIENT_ID
wrangler secret put DISCORD_CLIENT_SECRET
wrangler secret put DISCORD_GUILD_ID
wrangler secret put DISCORD_ALLOWED_ROLE_IDS   # e.g. 123,456
wrangler secret put GITHUB_TOKEN
wrangler secret put STATE_SECRET               # any long random string
```

Note the deployed origin (e.g. `https://slab-cms-auth.<sub>.workers.dev`) and:
- put it in `static/admin/config.yml` → `backend.base_url`,
- put `<origin>/gh` in `static/admin/config.yml` → `backend.api_root`,
- put `.../callback` in the Discord app's redirect list,
- confirm `wrangler.toml [vars] ALLOWED_ORIGIN` matches the live site origin
  (it's the CORS allow-origin for the `/gh/*` proxy, so it must be exact).

## 4. Wire up Decap

`static/admin/index.html` + `static/admin/config.yml` are already committed;
Hugo serves them at `https://slabwiki.gamingtwist.uk/admin/`. After the Worker
is live and `base_url` is set, visit `/admin/`, click **Login with GitHub**
(the button label is Decap's default; the popup is our Discord flow), approve
Discord, and — if you hold the role — the dashboard opens.

`index.html` also carries a small inline **admin tint** (`<style>`) — the site's
two fonts, its light paper/ink palette on the canvas, and grass in place of
Decap's blue accent. Deliberately minimal: Decap has **no supported theming API**
for the editor UI (`registerPreviewStyle` styles only the preview pane, which is
off), so this stops at fonts + colours and leaves Decap's own shapes/widgets
alone — a fuller restyle against Decap's internal class names looked half-baked
and coupled us to its internals. It's a single light theme (matching Decap's
native light UI) and reuses the site's design *language*, not `app.css` (Tailwind
utilities don't apply to Decap's React/emotion markup). Scoped under `#nc-root`;
if a decap-cms bump renames a component, at worst one accent falls back to blue.

## Local testing

`npx wrangler@3 dev --port 8787` runs the Worker locally (use `@3` on Node 20;
`@latest` needs Node ≥ 22). Put local secrets in `services/cms-auth/.dev.vars`
(gitignored) — including `ALLOWED_ORIGIN=http://localhost:1313` so the popup
postMessage and the `/gh/*` CORS both target the Hugo dev server. For Decap
itself, run the site (`npm run dev`) and temporarily set, in `config.yml`,
`base_url: http://localhost:8787`, `api_root: http://localhost:8787/gh`, and
`local_backend: false` (revert all three before commit). Discord redirect URIs
must list the exact callback URL you test against.

## Gotchas

- **Editorial workflow + shared token:** every save opens a PR against `main`
  for a maintainer to merge. The commit **author** and the PR **body** are
  stamped (by the `/gh/*` proxy) with the editor's Discord name; the token's
  account is only the *pusher*. The commit email is `<discord-id>@discord.invalid`
  — deliberately non-routable so it links to no GitHub account.
- **The proxy is transparent.** It forwards `/gh/*` straight to
  `api.github.com` with the real token, so it needs no per-endpoint knowledge —
  new Decap versions / endpoints just work. It only special-cases `GET /user`,
  `POST …/git/commits`, and `POST …/pulls` to stamp identity. If you ever enable
  Decap's GraphQL mode (`use_graphql`), the proxy would need a matching
  `/graphql` passthrough — it's REST-only today.
- **Session token, not the GitHub token, reaches the browser.** It's a signed
  JWT (HS256 over `STATE_SECRET`) valid for 8h; when it expires the editor
  re-runs the Discord popup. Rotating `STATE_SECRET` invalidates all sessions.
- **Decap drops unknown front-matter keys** on save for fields not declared in
  `config.yml`. The survival collection therefore declares the union of
  article + season-hub fields so nothing is lost. If you add a new front-matter
  key to content, add it to the collection too. **Exception:** shop pages
  (`season-N/shops/*.md`) are intentionally NOT covered — their owners/loc/items
  fields aren't declared, so Season 3 shops are git-only (see next bullet).
- **Four top-level collections:** Survival, Nexus, Workshop, Style Guide.
  **Survival** is a single nested folder collection (`folder: content/survival`,
  `nested: { depth: 3, subfolders: false }`). `subfolders: false` is the
  important bit: the sidebar tree shows the real folders (`season-4`, `shops`,
  …) and clicking one lists only its **immediate children**, so season pages
  sit under their season instead of one flat list. `depth` is a *scan* depth —
  it must cover the deepest files (`season-N/shops/*.md` = 3) or those files
  silently vanish from the CMS. The **Path** field is the page's target
  *folder* (e.g. `season-4`) — the filename comes from the title slug — and
  "+ New" pre-fills it with the folder you're browsing, so creating a page
  from inside a season just works. Its `fields` are the **union**
  of the article and season-hub shapes, because Decap silently drops any
  front-matter key a collection doesn't declare — the union keeps those page
  types lossless. Add any new front-matter key there too. **Shop pages are the
  exception:** owners/loc/items are deliberately undeclared, so a Season 3 shop
  page still shows in the tree but editing it in the CMS strips those keys —
  edit shops in the repo, not the CMS. (Note: a nested collection can't enforce
  that pages sit under a season — decap #4631 — so the Path is convention, not a
  hard gate; likewise it can't hide the shop subfolders from the tree.)
- **Do NOT add `index_file: _index` to `meta.path`.** It makes Decap treat
  *every* entry as `<path>/_index.md`, so a flat page's Path collapses to its
  dirname — the season hub's own path — and publishing ANY regular page
  (`spawn.md`, `outposts.md`, …) fails with "Path 'season-N' already exists".
  Without it, hubs are still visible in the tree and editable (they're the
  `season-N/_index` entries); the one thing the CMS can't do is create a *new*
  season hub (a new entry always gets a title-slug filename, never
  `_index.md`) — do that once a season via git.
- **Nested subfields must not be `required`.** Decap validates a new entry's
  empty defaults against every declared field, so a required subfield inside a
  list/object (e.g. an infobox or `infoboxes` subfield) blocks creating *any*
  page in the collection with a "…is required" error. Keep every union field
  `required: false` except top-level `title`.
- **Generated content is invisible to the CMS:** Season 4 shops come from
  `_content.gotmpl`, not real files, so they don't (and shouldn't) appear.
- **The media library is flat and non-recursive.** Decap's built-in media
  library lists exactly one folder at depth 1 and has no folder-browsing UI, so
  the global `media_folder: static/images` shows only `logo.png` — everything
  in `static/images/<sub>/` is invisible. The fix is a **per-field**
  `media_folder` (+ matching `public_folder`) using the `{{media_folder}}` /
  `{{public_folder}}` tokens: on entry load Decap fetches each field's declared
  folder and the picker scopes to it. Current mapping: survival `banner` +
  `infobox.image` → `/images/articles`, survival card `image` (shop images) →
  `/images/season-3-shops`, nexus `image` → `/images/articles`. You MUST set
  both `media_folder` and `public_folder` on the field — with only the former,
  the saved path drops the sub-folder. `season-4/` and `season-4-shops/` images
  are matched by filename in the build (never referenced from front matter), so
  no field targets them.
