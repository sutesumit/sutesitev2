import fs from "fs";
import path from "path";

const postsDirectory = path.join(process.cwd(), "src/content/bloqs");

export function getPostsDirectory(): string {
  return postsDirectory;
}

export function getYearDirectories(): string[] {
  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && /^\d{4}$/.test(e.name))
    .map(e => e.name);
}

export function readPostFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

export function postFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function getPostEntries(basePath: string): fs.Dirent[] {
  return fs.readdirSync(basePath, { withFileTypes: true });
}
