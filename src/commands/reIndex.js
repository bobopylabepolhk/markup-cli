import { resolve } from "path";
import { generateRootIndex } from "../folderStructure.js";

export async function reindexCommand(pagesDir = "./pages") {
  const absolutePagesDir = resolve(pagesDir);
  generateRootIndex(absolutePagesDir);
}
