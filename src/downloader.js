import puppeteer from "puppeteer";
import fs from "fs-extra";
import { resolve, join, dirname, basename } from "path";
import { URL } from "url";

const jqueryTag =
  '<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>';

export async function downloadPages(pages, projectDir) {
  const results = {};

  for (const { url, templateName } of pages) {
    results[templateName] = await downloadPage(url, projectDir, templateName);
  }

  return results;
}

async function downloadPage(url, projectDir, templateName) {
  const rootHost = new URL(url).hostname;
  const dest = resolve(projectDir, "scraped");
  await fs.ensureDir(dest);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const collectedAssets = new Map(); // originalUrl: localRelativePath
  const assetPromises = [];

  await page.setRequestInterception(true);
  page.on("request", (req) => req.continue());

  page.on("response", (response) => {
    const resUrl = response.url();
    const resType = response.request().resourceType();

    if (!["stylesheet", "script", "image", "font", "media"].includes(resType))
      return;

    const promise = (async () => {
      try {
        const buffer = await response.buffer();
        const parsed = new URL(resUrl);

        const localRelative = join(
          "assets",
          parsed.pathname.replace(/^\//, ""),
        );

        const localAbsolute = join(dest, localRelative);
        await fs.ensureDir(dirname(localAbsolute));
        await fs.writeFile(localAbsolute, buffer);

        collectedAssets.set(resUrl, `./${localRelative}`);
      } catch {}
    })();

    assetPromises.push(promise);
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  await Promise.allSettled(assetPromises);

  let html = await page.content();
  html = html.replace(/(<head[^>]*>)/i, '$1\n  <meta charset="UTF-8">');
  html = html.replace(/(<script)/i, `${jqueryTag}\n$1`);
  html = html.replace(
    /(<head[^>]*>)/i,
    `$1\n  <link rel="stylesheet" href="../template/${templateName}.css" />`,
  );

  const cookies = await browser.cookies();
  const localStorage = await page.evaluate(() => {
    return { ...window.localStorage };
  });

  await browser.close();

  // заменяем урлы ассетов на локальные
  for (const [assetUrl, localPath] of collectedAssets) {
    html = html.replaceAll(assetUrl, localPath);

    const parsed = new URL(assetUrl);
    if (parsed.hostname === rootHost) {
      html = html.replaceAll(parsed.pathname, localPath);
    }
  }

  await fs.writeFile(join(dest, "index.html"), html, "utf-8");
  const commonDir = projectDir.replace(`/${templateName}`, "/__common");
  await fs.ensureDir(commonDir);
  await fs.writeFile(
    join(commonDir, "storage.json"),
    JSON.stringify({
      localStorage,
      cookies,
    }),
    "utf-8",
  );

  return dest;
}
