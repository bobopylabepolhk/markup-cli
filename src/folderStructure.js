import fs from "fs-extra";
import { resolve, join } from "path";

export async function createFolderStructure(templateName, outputBase) {
  const projectDir = resolve(outputBase, templateName);
  const templateDir = join(projectDir, "template");

  await fs.ensureDir(join(projectDir, "scraped"));

  if (await fs.pathExists(templateDir)) {
    return projectDir;
  }

  await fs.ensureDir(templateDir);
  await fs.writeFile(join(templateDir, `${templateName}.html`), "", "utf8");
  await fs.writeFile(join(templateDir, `${templateName}.css`), "", "utf8");

  return projectDir;
}

export async function generateRootIndex(outputBase) {
  const entries = await fs.readdir(outputBase, { withFileTypes: true });

  const templateDirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("__"),
  );

  const links = [];

  for (const dir of templateDirs) {
    const scrapedIndex = join(outputBase, dir.name, "scraped", "index.html");
    const exists = await fs.pathExists(scrapedIndex);

    if (exists) {
      links.push(
        `  <li><a href="./${dir.name}/scraped/index.html">${dir.name}</a></li>`,
      );
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>шаблоны</title>
</head>
<body>
  <ul>
${links.join("\n")}
  </ul>
</body>
</html>`;

  const rootIndex = resolve(outputBase, "index.html");
  await fs.writeFile(rootIndex, html, "utf8");
}
