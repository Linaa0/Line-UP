// Renders the mockup HTML files in this folder to 2x PNGs inside
// design/figma-references/individual-screens/<stage>/.
//
// Usage (from the repo root):  node design/mockups/render.mjs [file.html ...]
// Requires Node 22+ (built-in WebSocket) and Microsoft Edge or Chrome.
// Set BROWSER=<path to msedge.exe/chrome.exe> to override the browser path.
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const here = import.meta.dirname;
const screensDir = resolve(here, "../figma-references/individual-screens");
const browser =
  process.env.BROWSER ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const port = 9333;

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(here).filter((f) => f.endsWith(".html"));

const proc = spawn(browser, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "lineup-render-"))}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path, method = "GET") {
  for (let i = 0; i < 40; i++) {
    try {
      return await (await fetch(`http://127.0.0.1:${port}${path}`, { method })).json();
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Browser did not start");
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const msgId = ++id;
      pending.set(msgId, res);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  const once = (method) => new Promise((res) => listeners.push((m) => m.method === method && res(m)));
  return new Promise((res) => (ws.onopen = () => res({ ws, send, once })));
}

try {
  const version = await getJson("/json/version");
  for (const file of files) {
    const name = file.replace(/\.html$/, "");
    const stage = readdirSync(screensDir).find((d) => d.startsWith(name.slice(0, 2) + "-"));
    const target = await getJson("/json/new?about:blank", "PUT");
    const page = await connect(target.webSocketDebuggerUrl);
    await page.send("Page.enable");
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 470,
      height: 930,
      deviceScaleFactor: 2,
      mobile: false,
    });
    const loaded = page.once("Page.loadEventFired");
    await page.send("Page.navigate", { url: pathToFileURL(join(here, file)).href });
    await loaded;
    await sleep(600);
    const shot = await page.send("Page.captureScreenshot", { format: "png" });
    const out = join(screensDir, stage, `${name}.png`);
    writeFileSync(out, Buffer.from(shot.result.data, "base64"));
    console.log(`rendered ${name} -> ${stage}/`);
    page.ws.close();
  }
  const b = await connect(version.webSocketDebuggerUrl);
  await b.send("Browser.close").catch(() => {});
} finally {
  setTimeout(() => proc.kill(), 500);
}
