#!/usr/bin/env node

import { program } from "commander";
import { createCommand } from "../src/commands/create.js";
import { reindexCommand } from "../src/commands/reIndex.js";

const collect = (val, prev) => [...prev, val];

program
  .name("my-cli")
  .description("Scaffold a local dev env from live pages")
  .version("1.0.0")
  .option("-n, --name <name>", "Название страницы и темплейта")
  .option(
    "-p, --page <templateName=url>",
    "Страница (можно несколько)",
    collect,
    [],
  )
  .option("-o, --output <dir>", "Корневая папка страниц", "./pages")
  .option("--no-download", "Пропустить скачивание статики")
  .action(createCommand);

program
  .command("reindex [pages-dir]")
  .description("Генерирует root index.html сканируя папку с шаблонами")
  .action((pagesDir = "./pages") => reindexCommand(pagesDir));

program.parse();
