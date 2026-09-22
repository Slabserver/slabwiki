/**
 * Discord-gated GitHub proxy for Decap CMS.
 *
 * Two jobs:
 *
 *  A) AUTH (popup)  — /auth, /callback
 *     1. Decap opens  GET /auth  in a popup.
 *     2. We redirect to Discord's OAuth consent (scopes: identify,
 *        guilds.members.read) with a signed state cookie for CSRF.
 *     3. Discord redirects back to  GET /callback?code=...
 *     4. We exchange the code, read the user's guild member object
 *        (GET /users/@me/guilds/{guild}/member) and check their role.
 *     5. If authorised we mint a short-lived SIGNED SESSION TOKEN carrying the
 *        Discord identity (username + id) — NOT the GitHub token — and hand it
 *        to Decap via the `authorization:github:success:` handshake.
 *
 *  B) PROXY (api_root) — /gh/*
 *     Decap is configured with `api_root: <worker>/gh`, so EVERY GitHub REST
 *     call it makes is sent here with the session token in the Authorization
 *     header. We verify that token, swap in the real shared GITHUB_TOKEN
 *     (which therefore NEVER reaches the browser), and forward to
 *     api.github.com. Because every write passes through us, we also stamp the
 *     Discord identity onto the work:
 *       • GET  /user            → override display name with the Discord name
 *       • POST /git/commits     → set commit author/committer to the Discord user
 *       • POST /pulls           → append "Submitted by <discord>" to the PR body
 *     Editorial workflow still opens the PR automatically — the editor never
 *     touches git or GitHub directly.
 *
 * Required secrets (wrangler secret put ...):
 *   DISCORD_CLIENT_ID
 *   DISCORD_CLIENT_SECRET
 *   DISCORD_GUILD_ID
 *   DISCORD_ALLOWED_ROLE_IDS   comma-separated role IDs
 *   GITHUB_TOKEN               fine-grained PAT (contents+PR rw on the repo)
 *   STATE_SECRET               long random string (signs state cookie + session)
 * Required vars (wrangler.toml [vars]):
 *   ALLOWED_ORIGIN             the site origin, e.g. https://slabwiki.gamingtwist.uk
 *   GIT_PROVIDER               "github" (the postMessage channel name)
 */

const DISCORD_API = "https://discord.com/api/v10";
const GITHUB_API = "https://api.github.com";
const SESSION_TTL = 8 * 3600; // seconds the editor stays signed in

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // B) API proxy — its own error channel (JSON, not the auth popup HTML).
    if (url.pathname === "/gh" || url.pathname.startsWith("/gh/")) {
      try {
        return await handleProxy(request, env, url);
      } catch (err) {
        return cors(
          json({ message: `Proxy error: ${err.message}` }, 500),
          env.ALLOWED_ORIGIN || "*"
        );
      }
    }

    // A) Auth popup.
    try {
      if (url.pathname === "/auth") return handleAuth(request, env, url);
      if (url.pathname === "/callback") return handleCallback(request, env, url);
      if (url.pathname === "/") return new Response("SlabWiki CMS auth broker", { status: 200 });
      return new Response("Not found", { status: 404 });
    } catch (err) {
      return popupResult(env, "error", { message: `Auth error: ${err.message}` });
    }
  },
};

function redirectUri(url) {
  return `${url.origin}/callback`;
}

// ── A) Auth ───────────────────────────────────────────────────────────────

// Step 1-2: kick off Discord OAuth.
async function handleAuth(request, env, url) {
  const state = crypto.randomUUID();
  const sig = await hmacHex(env.STATE_SECRET, state);
  const authUrl = new URL(`${DISCORD_API}/oauth2/authorize`);
  authUrl.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri(url));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "identify guilds.members.read");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "consent");

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      // Signed, short-lived, host-only cookie to validate `state` on return.
      "Set-Cookie": `slab_oauth_state=${state}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

// Step 3-5: validate, exchange, role-check, mint a session token for Decap.
async function handleCallback(request, env, url) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return popupResult(env, "error", { message: "Missing code/state." });

  // CSRF: state must match the signed cookie we set in /auth.
  const cookie = parseCookie(request.headers.get("Cookie") || "");
  const raw = cookie["slab_oauth_state"] || "";
  const [cState, cSig] = raw.split(".");
  if (!cState || cState !== state || cSig !== (await hmacHex(env.STATE_SECRET, cState))) {
    return popupResult(env, "error", { message: "Invalid session state. Try again." });
  }

  // Exchange the code for the user's access token.
  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(url),
    }),
  });
  if (!tokenRes.ok) return popupResult(env, "error", { message: "Discord token exchange failed." });
  const token = await tokenRes.json();

  // Read the user's member object *in this guild* — includes their role IDs.
  const memberRes = await fetch(
    `${DISCORD_API}/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );
  if (memberRes.status === 404) {
    return popupResult(env, "error", { message: "You're not a member of the SlabServer Discord." });
  }
  if (!memberRes.ok) return popupResult(env, "error", { message: "Could not read Discord membership." });
  const member = await memberRes.json();

  const allowed = (env.DISCORD_ALLOWED_ROLE_IDS || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const roles = member.roles || [];
  const ok = allowed.some((r) => roles.includes(r));
  if (!ok) {
    const who = member.user ? member.user.username : "You";
    return popupResult(env, "error", {
      message: `${who} lacks the required editor role in the SlabServer Discord.`,
    });
  }

  // Authorised → mint a signed session token carrying the Discord identity.
  // This is what Decap stores and sends to /gh/* — the GitHub token stays here.
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    name: (member.user && member.user.username) || "SlabWiki editor",
    sub: (member.user && member.user.id) || "0",
    iat: now,
    exp: now + SESSION_TTL,
  };
  const session = await signSession(env.STATE_SECRET, claims);
  return popupResult(env, "success", {
    token: session,
    provider: env.GIT_PROVIDER || "github",
    // Echoed so the admin page can show a "Signed in as …" chip immediately.
    discord_user: claims.name,
    discord_id: claims.sub,
  });
}

/**
 * Render the Decap OAuth handshake page. Decap's popup logic:
 *   - popup posts "authorizing:<provider>" to window.opener
 *   - opener replies, popup then posts
 *     "authorization:<provider>:success:{json}"  (or :error:{json})
 */
function popupResult(env, status, payload) {
  const provider = env.GIT_PROVIDER || "github";
  const origin = env.ALLOWED_ORIGIN || "*";
  const msg = `authorization:${provider}:${status}:${JSON.stringify(payload)}`;
  const body = `<!doctype html><html><body><script>
    (function () {
      function receive(e) {
        window.opener.postMessage(${JSON.stringify(msg)}, ${JSON.stringify(origin)});
        window.removeEventListener("message", receive, false);
        window.close();
      }
      window.addEventListener("message", receive, false);
      window.opener && window.opener.postMessage("authorizing:${provider}", "*");
    })();
  </script><p>${status === "success" ? "Signing you in…" : "Sign-in failed. You can close this window."}</p></body></html>`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Clear the state cookie now that the flow is done.
      "Set-Cookie": "slab_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    },
  });
}

// ── B) GitHub proxy ─────────────────────────────────────────────────────────

async function handleProxy(request, env, url) {
  const origin = env.ALLOWED_ORIGIN || "*";

  // Browser preflights the Authorization header before every real request.
  if (request.method === "OPTIONS") return corsPreflight(request, origin);

  // Verify the session token Decap sends as `Authorization: token <jwt>`.
  const authHeader = request.headers.get("Authorization") || "";
  const session = authHeader.replace(/^(token|bearer)\s+/i, "").trim();
  const claims = await verifySession(env.STATE_SECRET, session);
  if (!claims) return cors(json({ message: "Session expired — please sign in again." }, 401), origin);

  // Map /gh/<rest> → https://api.github.com/<rest>, preserving the query.
  const rest = url.pathname.slice("/gh".length) || "/";
  const upstream = GITHUB_API + rest + url.search;

  // Forward the client's headers, but swap in the real GitHub token and drop
  // things that must not cross to another origin / would mismatch a new body.
  const headers = new Headers(request.headers);
  headers.set("Authorization", `token ${env.GITHUB_TOKEN}`);
  headers.set("User-Agent", "slab-cms-auth");
  headers.delete("Origin");
  headers.delete("Referer");
  headers.delete("Cookie");
  headers.delete("Host");
  headers.delete("Content-Length");
  // Avoid CORS/304 edge cases — always fetch a full body.
  headers.delete("If-None-Match");
  headers.delete("If-Modified-Since");

  const method = request.method;
  let body;
  if (method !== "GET" && method !== "HEAD") {
    body = stampWrite(rest, method, await request.text(), claims);
  }

  let res = await fetch(upstream, { method, headers, body });

  // Show the Discord name in Decap's UI without breaking anything that keys off
  // the real bot `login` (repo permissions still come from the real token).
  if (method === "GET" && rest === "/user" && res.ok) {
    const u = await res.json();
    u.name = claims.name || u.name;
    const h = new Headers(res.headers);
    h.delete("Content-Length");
    res = new Response(JSON.stringify(u), { status: 200, headers: h });
  }

  return cors(res, origin);
}

/**
 * Rewrite outbound write bodies so the Discord editor — not the shared bot — is
 * credited. Only touches the two endpoints that carry attribution; everything
 * else passes through untouched.
 */
function stampWrite(rest, method, raw, claims) {
  if (method !== "POST" || !raw) return raw;
  try {
    if (/\/git\/commits$/.test(rest)) {
      const b = JSON.parse(raw);
      const ident = {
        name: claims.name,
        // `.invalid` is a reserved non-routable TLD — a syntactically valid
        // email that deliberately links to no GitHub account, so the commit
        // shows the Discord name rather than the bot's avatar.
        email: `${claims.sub}@discord.invalid`,
        date: new Date().toISOString(),
      };
      b.author = ident;
      b.committer = ident;
      return JSON.stringify(b);
    }
    if (/\/pulls$/.test(rest)) {
      const b = JSON.parse(raw);
      b.body = `${b.body || ""}\n\n---\nSubmitted by **${claims.name}** (Discord) via SlabWiki CMS.`;
      return JSON.stringify(b);
    }
  } catch (_) {
    // Malformed body — forward as-is and let GitHub reject it.
  }
  return raw;
}

// ── CORS ────────────────────────────────────────────────────────────────────

function cors(res, origin) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", origin);
  // Decap reads Link (pagination) and ETag off responses.
  h.set("Access-Control-Expose-Headers", "Link, ETag, X-GitHub-Media-Type");
  h.set("Vary", "Origin");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

function corsPreflight(request, origin) {
  const reqHeaders = request.headers.get("Access-Control-Request-Headers") || "Authorization, Content-Type";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": reqHeaders,
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Session tokens (compact HS256 JWT, signed with STATE_SECRET) ────────────

async function signSession(secret, claims) {
  const enc = new TextEncoder();
  const header = b64url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = b64url(enc.encode(JSON.stringify(claims)));
  const data = `${header}.${payload}`;
  const sig = b64url(await hmacBytes(secret, data));
  return `${data}.${sig}`;
}

async function verifySession(secret, token) {
  if (!token || token.split(".").length !== 3) return null;
  const [h, p, s] = token.split(".");
  const expected = b64url(await hmacBytes(secret, `${h}.${p}`));
  if (!timingSafeEqual(s, expected)) return null;
  try {
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(p)));
    if (claims.exp && Math.floor(Date.now() / 1000) > claims.exp) return null;
    return claims;
  } catch (_) {
    return null;
  }
}

// ── tiny helpers ────────────────────────────────────────────────────────────

function parseCookie(str) {
  return Object.fromEntries(
    str.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
    })
  );
}

async function hmacBytes(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

async function hmacHex(secret, data) {
  return [...(await hmacBytes(secret, data))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function b64url(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
