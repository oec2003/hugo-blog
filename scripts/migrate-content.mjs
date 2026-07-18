import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const hugoRoot = path.resolve(scriptDir, "..");
const hexoSource = path.resolve(hugoRoot, "../hblog-new/source");

if (!fs.existsSync(path.join(hexoSource, "_posts"))) {
  throw new Error(`找不到 Hexo 源目录：${hexoSource}`);
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function normalizeMarkdown(source) {
  return source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(
      /^(date:\s*)(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::(\d{2}))?\s*$/m,
      (_, prefix, day, time, seconds = "00") => `${prefix}${day}T${time}:${seconds}+08:00`,
    );
}

function copyMarkdownDirectory(sourceDir, targetDir) {
  ensureDir(targetDir);
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyMarkdownDirectory(sourcePath, targetPath);
    } else if (entry.name.endsWith(".md")) {
      const body = normalizeMarkdown(fs.readFileSync(sourcePath, "utf8"));
      fs.writeFileSync(targetPath, body, "utf8");
    }
  }
}

copyMarkdownDirectory(
  path.join(hexoSource, "_posts"),
  path.join(hugoRoot, "content/posts"),
);
copyMarkdownDirectory(
  path.join(hexoSource, "wiki"),
  path.join(hugoRoot, "content/wiki"),
);

const wikiRoot = path.join(hugoRoot, "content/wiki");
const wikiLanding = path.join(wikiRoot, "designpattern/index.md");
const wikiBranch = path.join(wikiRoot, "designpattern/_index.md");
if (fs.existsSync(wikiLanding)) {
  fs.writeFileSync(wikiBranch, fs.readFileSync(wikiLanding, "utf8"), "utf8");
  fs.unlinkSync(wikiLanding);
}
for (const file of fs.readdirSync(path.join(wikiRoot, "designpattern")).filter((name) => name.endsWith(".md"))) {
  const filePath = path.join(wikiRoot, "designpattern", file);
  const body = fs.readFileSync(filePath, "utf8").replace(/^layout:\s*wiki.*\n/m, "");
  fs.writeFileSync(filePath, body, "utf8");
}

for (const page of ["about", "notes"]) {
  copyMarkdownDirectory(
    path.join(hexoSource, page),
    path.join(hugoRoot, `content/${page}`),
  );
}

const aboutPath = path.join(hugoRoot, "content/about/index.md");
let about = fs.readFileSync(aboutPath, "utf8");
about = about.replace(
  /\{%\s*image\s+(\S+)\s*%\}/g,
  "![不止dotNET 公众号]($1)",
);
about = about.replace(/\{%\s*timeline\s*%\}([\s\S]*?)\{%\s*endtimeline\s*%\}/g, (_, body) => {
  const items = [];
  const itemPattern = /<!--\s*node\s+(.+?)\s*-->\s*([\s\S]*?)(?=<!--\s*node|$)/g;
  for (const match of body.matchAll(itemPattern)) {
    items.push(`  <div class="timeline-item"><time>${match[1].trim()}</time><p>${match[2].trim()}</p></div>`);
  }
  return `<div class="timeline">\n${items.join("\n")}\n</div>`;
});
fs.writeFileSync(aboutPath, about, "utf8");

const singletonPath = path.join(hugoRoot, "content/wiki/designpattern/Singleton.md");
if (fs.existsSync(singletonPath)) {
  let singleton = fs.readFileSync(singletonPath, "utf8");
  if (!/^url:/m.test(singleton)) {
    singleton = singleton.replace(/^order:\s*100\s*$/m, "$&\nurl: /wiki/designpattern/Singleton/");
  }
  fs.writeFileSync(singletonPath, singleton, "utf8");
}

const topicSource = path.join(hexoSource, "_data/topic");
const topicTarget = path.join(hugoRoot, "data/topics");
ensureDir(topicTarget);
for (const file of fs.readdirSync(topicSource).filter((name) => name.endsWith(".yml"))) {
  fs.copyFileSync(path.join(topicSource, file), path.join(topicTarget, file));
}

ensureDir(path.join(hugoRoot, "static"));
for (const file of ["CNAME", "favicon.ico"]) {
  fs.copyFileSync(path.join(hexoSource, file), path.join(hugoRoot, "static", file));
}

console.log("Hexo 内容已同步，已统一为 UTF-8/LF 并转换专属标签。 ");
