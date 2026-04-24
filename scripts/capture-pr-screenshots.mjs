/**
 * Captures three PNGs for PR documentation (requires production build + preview).
 *
 *   npm run build && npx vite preview --port 4173 --strictPort &
 *   BASE_URL=http://127.0.0.1:4173 node scripts/capture-pr-screenshots.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs", "pr-screenshots");
/** Use `localhost` (not 127.0.0.1): Vite preview often binds IPv6-only on macOS. */
const BASE = process.env.BASE_URL || "http://localhost:4173";

const CLUSTER_RUN_AS_KEY = "ome-console-prototype-cluster-run-as";
const RUN_AS_PLATFORM = "Platform Service";

mkdirSync(OUT, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
  });

  // 1) Cluster detail — Logs tab with Initiator / Actor (Platform Service)
  await page.goto(`${BASE}/clusters/1`, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, platform }) => {
      sessionStorage.setItem(key, JSON.stringify({ "1": platform }));
    },
    { key: CLUSTER_RUN_AS_KEY, platform: RUN_AS_PLATFORM },
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Logs" }).click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: join(OUT, "01-cluster-detail-logs-initiator-actor.png"),
    fullPage: true,
  });

  // 2) Settings — workspace execution vs personal signing
  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(OUT, "02-settings-workspace-vs-personal-signing.png"),
    fullPage: true,
  });

  // 3) Day-one configuration — IdP / OIDC-hosted keys registry
  await page.goto(`${BASE}/day-one/configuration`, {
    waitUntil: "networkidle",
  });
  const signingSection = page.locator(
    'section[aria-labelledby="day-one-heading-signing-registry"]',
  );
  await signingSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await signingSection.screenshot({
    path: join(OUT, "03-day-one-signing-registry-idp-oidc.png"),
  });

  await browser.close();
  console.log("Screenshots written to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
