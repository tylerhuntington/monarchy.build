#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
assert.ok(args.length <= 1, "Usage: node scripts/check-hosting.mjs [BASE_URL]");
const base = new URL(args[0] ?? "http://127.0.0.1:8788");
assert.ok(
  ["http:", "https:"].includes(base.protocol) && base.pathname === "/" &&
    !base.username && !base.password && !base.search && !base.hash,
  "BASE_URL must be an HTTP(S) origin, without credentials, a path or a query",
);
const { documents } = JSON.parse(
  readFileSync(new URL("../content/docs-manifest.json", import.meta.url), "utf8"),
);
let child, stopped, finished, startupError, output = "";

async function stop() {
  if (!child || !child.pid) return;
  return stopped ??= (async () => {
    const kill = (signal) => {
      try {
        if (process.platform === "win32") child.kill(signal);
        else process.kill(-child.pid, signal);
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    };
    kill("SIGTERM");
    await Promise.race([finished, delay(3000)]);
    // Wrangler launches subprocesses; kill the owned group even if its parent exited.
    kill("SIGKILL");
    await Promise.race([finished, delay(1000)]);
  })();
}

for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143]]) {
  process.once(signal, async () => {
    await stop();
    process.exit(code);
  });
}

async function request(path, timeout = 10000) {
  return fetch(new URL(path, base), {
    redirect: "manual",
    signal: AbortSignal.timeout(timeout),
  });
}

function security(response, path) {
  for (const [name, value] of Object.entries({
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
  })) assert.equal(response.headers.get(name), value, `${path}: ${name}`);
}

async function html(path, status = 200) {
  const response = await request(path);
  assert.equal(response.status, status, `${path}: HTTP status`);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/i, path);
  security(response, path);
  const body = await response.text();
  assert.match(body, /<main\b[^>]*\bid="main"/, `${path}: main content`);
  assert.match(body, /<h1\b/, `${path}: page heading`);
  return body;
}

function sameOrigin(path) {
  const url = new URL(path.replaceAll("&amp;", "&"), base);
  assert.equal(url.origin, base.origin, "Expected an asset on the checked origin");
  return url.pathname + url.search;
}

try {
  if (!args.length) {
    // Refuse an occupied port rather than accidentally testing somebody else's server.
    const port = createServer();
    await new Promise((resolve, reject) => {
      port.once("error", reject);
      port.listen(8788, "127.0.0.1", resolve);
    });
    await new Promise((resolve) => port.close(resolve));
    child = spawn(`${root}node_modules/.bin/wrangler`, [
      "dev", "--local", "--ip", "127.0.0.1", "--port", "8788",
    ], {
      cwd: root,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, CI: "true", WRANGLER_SEND_METRICS: "false" },
    });
    for (const stream of [child.stdout, child.stderr]) {
      stream.on("data", (data) => { output = (output + data).slice(-6000); });
    }
    finished = new Promise((resolve) => {
      child.once("close", resolve);
      child.once("error", (error) => { startupError = error; resolve(); });
    });
    const deadline = Date.now() + 30000;
    let ready = false;
    while (Date.now() < deadline) {
      if (startupError) throw startupError;
      assert.equal(child.exitCode, null, "Wrangler exited before readiness");
      try {
        const response = await request("/", 1000);
        await response.arrayBuffer();
        ready = response.status === 200;
        if (ready) break;
      } catch { /* The local server may still be starting. */ }
      await delay(250);
    }
    assert.ok(ready, "Wrangler was not ready within 30 seconds");
  }

  const home = await html("/");
  for (const doc of documents) {
    const path = doc.slug === "introduction" ? "/docs/" : `/docs/${doc.slug}/`;
    const body = await html(path);
    const heading = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    const escaped = doc.title.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;",
    })[character]);
    assert.equal(heading, escaped, `${path}: expected guide, not a fallback page`);
  }
  const redirect = await request("/docs");
  assert.ok([301, 302, 307, 308].includes(redirect.status), "/docs must redirect");
  assert.equal(new URL(redirect.headers.get("location"), base).href,
    new URL("/docs/", base).href, "/docs must retain its trailing slash");
  await redirect.arrayBuffer();
  await html("/__monarchy_hosting_check_missing__/", 404);

  const assets = [...home.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1]).filter((path) => path.startsWith("/_next/static/"));
  for (const extension of ["js", "css"]) {
    const path = assets.find((asset) => new URL(asset, base).pathname.endsWith(`.${extension}`));
    assert.ok(path, `Homepage must load a ${extension} asset`);
    const response = await request(sameOrigin(path));
    assert.equal(response.status, 200, path);
    security(response, path);
    assert.match(response.headers.get("content-type") ?? "",
      extension === "js" ? /(?:java|ecma)script/i : /text\/css/i, path);
    assert.match(response.headers.get("cache-control") ?? "", /\bimmutable\b/i, path);
    assert.match(response.headers.get("cache-control") ?? "", /\bmax-age=31536000\b/, path);
    assert.ok((await response.arrayBuffer()).byteLength, `${path}: empty asset`);
  }
  const poster = home.match(/<img\b[^>]*\bclass="[^"]*\bhero-poster\b[^"]*"[^>]*>/)?.[0];
  const posterPath = poster?.match(/\bsrc="([^"]+)"/)?.[1];
  assert.ok(posterPath, "Homepage must include its poster");
  const image = await request(sameOrigin(posterPath));
  assert.equal(image.status, 200, "Poster HTTP status");
  assert.match(image.headers.get("content-type") ?? "", /^image\//i, "Poster MIME type");
  assert.ok((await image.arrayBuffer()).byteLength, "Poster must not be empty");
  console.log(`Hosting checks passed at ${base.origin}: homepage, ${documents.length} guides, redirect, 404, security headers, immutable JS/CSS and poster.`);
} catch (error) {
  console.error(`Hosting checks failed: ${error.message}`);
  if (child && output) console.error(output.trim());
  process.exitCode = 1;
} finally {
  await stop();
}
