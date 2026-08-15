const STATE_KEY = "site:mode";
const ONLINE = "online";
const OFFLINE = "offline";
const CONTROL_PATHS = new Set(["/control", "/control.html", "/offline", "/offline.html"]);

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function safeEqual(left = "", right = "") {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) difference |= (a[index] || 0) ^ (b[index] || 0);
  return difference === 0;
}

async function handleControl(request, env) {
  if (!env.SITE_STATE || !env.ADMIN_KEY) return json({ error: "El control todavía no está configurado." }, 503);
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) return json({ error: "Origen no autorizado." }, 403);
  const authorization = request.headers.get("Authorization") || "";
  const suppliedKey = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!safeEqual(suppliedKey, env.ADMIN_KEY)) return json({ error: "Clave incorrecta." }, 401);

  if (request.method === "GET") {
    const mode = (await env.SITE_STATE.get(STATE_KEY)) || ONLINE;
    return json({ mode, checkedAt: new Date().toISOString() });
  }
  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Solicitud no válida." }, 400); }
    if (body.mode !== ONLINE && body.mode !== OFFLINE) return json({ error: "Estado no válido." }, 400);
    await env.SITE_STATE.put(STATE_KEY, body.mode);
    return json({ mode: body.mode, changedAt: new Date().toISOString() });
  }
  return json({ error: "Método no permitido." }, 405);
}

async function serveOffline(request, env) {
  const offlineUrl = new URL("/offline.html", request.url);
  const asset = await env.ASSETS.fetch(offlineUrl);
  const headers = new Headers(asset.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Retry-After", "180");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("X-Varenholt-Archive", "closed");
  return new Response(request.method === "HEAD" ? null : asset.body, { status: 503, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/site-control") return handleControl(request, env);
    if (CONTROL_PATHS.has(url.pathname)) return env.ASSETS.fetch(request);

    let mode = ONLINE;
    try { mode = (await env.SITE_STATE?.get(STATE_KEY)) || ONLINE; } catch { mode = ONLINE; }
    if (mode === OFFLINE) return serveOffline(request, env);
    return env.ASSETS.fetch(request);
  }
};
