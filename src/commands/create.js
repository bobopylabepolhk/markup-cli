import ora from "ora";
import chalk from "chalk";
import { downloadPages } from "../downloader.js";
import {
  createFolderStructure,
  generateRootIndex,
} from "../folderStructure.js";

function parsePage(raw) {
  const idx = raw.indexOf("=");
  if (idx === -1)
    throw new Error(
      `Неверный формат --page: "${raw}". Ожидается templateName=url`,
    );
  return { templateName: raw.slice(0, idx), url: raw.slice(idx + 1) };
}

export async function createCommand(options) {
  if (!options.page?.length) {
    console.error(
      chalk.red(
        "Укажите хотя бы одну страницу: --page templateName=https://...",
      ),
    );
    process.exit(1);
  }

  const pages = options.page.map(parsePage);
  const projectDir = `${options.output}/${options.name}`;

  const spinner = ora("Готовим файловую структуру...").start();
  await createFolderStructure(options.name, options.output);
  await generateRootIndex(options.output);

  if (options.download !== false) {
    for (const { url, templateName } of pages) {
      spinner.start(`Скачивание: ${templateName}  ←  ${url}`);
      await downloadPages([{ url, templateName }], projectDir);
      spinner.succeed(chalk.green(`Скачано: scraped/${templateName}/`));
    }
  }

  // spinner.start("Обновление vite.config.js...");
  // await updateViteConfig(".", names);
  // spinner.succeed(chalk.green("Конфиг обновлён"));
}
