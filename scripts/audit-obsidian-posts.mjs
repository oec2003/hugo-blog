import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const hugoRoot = path.resolve(scriptDir, "..");
const obsidianWritingRoot = process.env.OBSIDIAN_WRITING_ROOT
  ?? "/Users/fengwei/Documents/04-personal/06-obsidian/writing";
const obsidianRoot = path.join(obsidianWritingRoot, "10_公众号");
const sourceSections = [
  "20_技术",
  "30_读书",
  "40_成长",
  "50_管理",
  "60_思考",
  "70_跑步",
  "80_旅行",
];

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(directory, entry.name));
}

function splitMarkdown(source) {
  const text = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  if (!text.startsWith("---\n")) return { frontMatter: "", body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { frontMatter: "", body: text };
  return {
    frontMatter: text.slice(4, end),
    body: text.slice(end + 5),
  };
}

function field(frontMatter, name) {
  const match = frontMatter.match(new RegExp(`^${name}:\\s*(.*?)\\s*$`, "m"));
  return match?.[1]?.replace(/^['"]|['"]$/g, "") ?? "";
}

function normalizeTitle(title) {
  return title
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/dot\s*net/g, "net")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "");
}

function normalizeBody(body) {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "");
}

function levenshtein(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function similarity(left, right) {
  if (!left || !right) return 0;
  return 1 - levenshtein(left, right) / Math.max(left.length, right.length);
}

function bodySimilarity(left, right) {
  if (left.length < 40 || right.length < 40) return 0;
  const sampleCount = Math.min(200, Math.max(1, Math.floor(left.length / 24)));
  const step = Math.max(1, Math.floor((left.length - 24) / sampleCount));
  let matches = 0;
  let samples = 0;
  for (let index = 0; index + 24 <= left.length; index += step) {
    samples += 1;
    if (right.includes(left.slice(index, index + 24))) matches += 1;
  }
  return samples ? matches / samples : 0;
}

function readPost(file, section = "") {
  const { frontMatter, body } = splitMarkdown(fs.readFileSync(file, "utf8"));
  const fallbackTitle = path.basename(file, ".md");
  const title = field(frontMatter, "title") || fallbackTitle;
  return {
    file,
    section,
    title,
    normalizedTitle: normalizeTitle(title),
    normalizedBody: normalizeBody(body),
    created: field(frontMatter, "创建时间"),
    date: field(frontMatter, "date"),
    category: field(frontMatter, "categories"),
  };
}

const sources = sourceSections.flatMap((section) =>
  markdownFiles(path.join(obsidianRoot, section)).map((file) => readPost(file, section)),
);
const targets = markdownFiles(path.join(hugoRoot, "content/posts")).map((file) => readPost(file));
const targetsByTitle = new Map(targets.map((post) => [post.normalizedTitle, post]));

const results = sources.map((source) => {
  const titleMatch = targetsByTitle.get(source.normalizedTitle);
  if (titleMatch) return { source, status: "title", match: titleMatch };

  const bodyNeedle = source.normalizedBody.slice(0, 100);
  const prefixMatch = bodyNeedle.length >= 50
    ? targets.find((target) => target.normalizedBody.includes(bodyNeedle))
    : undefined;
  const bodyMatch = prefixMatch ?? targets.find(
    (target) => bodySimilarity(source.normalizedBody, target.normalizedBody) >= 0.8,
  );
  if (bodyMatch) return { source, status: "body", match: bodyMatch };

  const suggestions = targets
    .map((target) => ({
      target,
      score: similarity(source.normalizedTitle, target.normalizedTitle),
      bodyScore: bodySimilarity(source.normalizedBody, target.normalizedBody),
    }))
    .sort((a, b) => Math.max(b.score, b.bodyScore) - Math.max(a.score, a.bodyScore))
    .slice(0, 3);
  return { source, status: "missing", suggestions };
});

const summary = Object.groupBy(results, ({ status }) => status);
console.log(JSON.stringify({
  counts: Object.fromEntries(Object.entries(summary).map(([status, posts]) => [status, posts.length])),
  missing: (summary.missing ?? []).map(({ source, suggestions }) => ({
    section: source.section,
    title: source.title,
    created: source.created,
    category: source.category,
    file: source.file,
    suggestions: suggestions.map(({ target, score, bodyScore }) => ({
      title: target.title,
      score: Number(score.toFixed(3)),
      bodyScore: Number(bodyScore.toFixed(3)),
      file: target.file,
    })),
  })),
}, null, 2));
