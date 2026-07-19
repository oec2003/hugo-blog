import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const hugoRoot = path.resolve(scriptDir, "..");
const obsidianRoot = process.env.OBSIDIAN_WRITING_ROOT
  ?? "/Users/fengwei/Documents/04-personal/06-obsidian/writing";
const postsRoot = path.join(hugoRoot, "content/posts");

// 这些条目已经过标题、正文指纹和发布时间人工核对。
// 脚本只读取 Obsidian，并且只创建 Hugo 中尚不存在的文件。
const posts = [
  {
    source: "10_公众号/20_技术/Hexo的Stellar主题问题.md",
    target: "hexo-stellar-theme-problems.md",
    title: "Hexo 的 Stellar 主题问题",
    date: "2022-01-27T14:45:54+08:00",
    categories: ["技术"],
    tags: ["Hexo", "Stellar", "博客"],
  },
  {
    source: "10_公众号/20_技术/云原生：一文读懂核心技术栈与演进路径.md",
    target: "cloud-native-technology-stack-and-evolution.md",
    title: "云原生：一文读懂核心技术栈与演进路径",
    date: "2025-06-24T14:36:00+08:00",
    categories: ["技术"],
    tags: ["云原生", "架构"],
    topic: "arch",
  },
  {
    source: "10_公众号/30_读书/再读《人件》.md",
    target: "rereading-peopleware.md",
    title: "再读《人件》",
    date: "2025-10-21T18:08:48+08:00",
    categories: ["读书"],
    tags: ["读书", "管理", "软件工程"],
    topic: "readbook",
  },
  {
    source: "10_公众号/40_成长/2023年总结（工作）.md",
    target: "2023-work-summary.md",
    title: "2023 年总结（工作）",
    date: "2023-01-19T15:47:06+08:00",
    categories: ["成长"],
    tags: ["工作", "总结", "管理"],
  },
  {
    source: "10_公众号/40_成长/公众号新的图片消息功能.md",
    target: "wechat-image-message-feature.md",
    title: "公众号新的图片消息功能",
    date: "2023-02-17T22:49:20+08:00",
    categories: ["成长"],
    tags: ["公众号", "微信", "写作"],
  },
  {
    source: "10_公众号/40_成长/等了 20 年的全国大赛.md",
    target: "the-first-slam-dunk-national-tournament.md",
    title: "等了 20 年的全国大赛",
    date: "2023-04-22T18:02:35+08:00",
    categories: ["成长"],
    tags: ["灌篮高手", "电影", "篮球"],
  },
  {
    source: "10_公众号/40_成长/记忆深刻的巴黎奥运时刻.md",
    target: "memorable-paris-olympics-moments.md",
    title: "记忆深刻的巴黎奥运时刻",
    date: "2024-08-12T14:42:57+08:00",
    categories: ["成长"],
    tags: ["巴黎奥运会", "体育"],
  },
  {
    source: "10_公众号/60_思考/AI 时代，低代码该如何演进？.md",
    target: "low-code-evolution-in-the-ai-era.md",
    title: "AI 时代，低代码该如何演进？",
    date: "2025-11-04T14:49:45+08:00",
    categories: ["思考"],
    tags: ["AI", "低代码", "思考"],
  },
  {
    source: "10_公众号/60_思考/从程序员到架构师，需要做些什么？.md",
    target: "from-programmer-to-architect.md",
    title: "从程序员到架构师，需要做些什么？",
    date: "2024-11-14T22:06:00+08:00",
    categories: ["思考"],
    tags: ["架构", "架构师", "个人成长"],
    topic: "arch",
  },
  {
    source: "10_公众号/70_跑步/ITRA 积分看不到怎么办？.md",
    target: "itra-points-not-visible.md",
    title: "ITRA 积分看不到怎么办？",
    date: "2024-07-26T16:30:00+08:00",
    categories: ["跑步"],
    tags: ["ITRA", "越野跑", "跑步"],
    topic: "run",
  },
  {
    source: "10_公众号/70_跑步/云丘山视频脚本.md",
    target: "yunqiu-mountain-video-script.md",
    title: "云丘山视频脚本",
    date: "2025-04-27T21:00:35+08:00",
    categories: ["跑步"],
    tags: ["云丘山", "越野跑", "跑步"],
    topic: "run",
  },
];

const itraImages = [
  "20240726161558",
  "20240726161741",
  "20240726162535",
  "20240726162619",
  "20240726162733",
  "20240726162447",
];

function splitMarkdown(source) {
  const text = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  if (!text.startsWith("---\n")) return text;
  const end = text.indexOf("\n---\n", 4);
  return end === -1 ? text : text.slice(end + 5);
}

function addSummaryDivider(body) {
  if (body.includes("<!-- more -->") || body.includes("<!--more-->")) return body;
  const lines = body.trim().split("\n");
  let inCode = false;
  let paragraphs = 0;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith("```")) inCode = !inCode;
    if (inCode || lines[index].trim() !== "") continue;
    const previous = lines[index - 1]?.trim() ?? "";
    if (!previous || previous.startsWith("#") || previous.startsWith("!") || previous.startsWith("-")) continue;
    paragraphs += 1;
    if (paragraphs === 2) {
      lines.splice(index + 1, 0, "<!-- more -->", "");
      return `${lines.join("\n").trim()}\n`;
    }
  }
  return `${body.trim()}\n`;
}

function frontMatter(post) {
  const lines = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `date: ${post.date}`,
    `categories: ${JSON.stringify(post.categories)}`,
    `tags: ${JSON.stringify(post.tags)}`,
  ];
  if (post.topic) lines.push(`topic: ${post.topic}`);
  lines.push("---", "");
  return lines.join("\n");
}

function normalizeBody(post, body) {
  let normalized = body;
  if (post.target === "hexo-stellar-theme-problems.md") {
    normalized = normalized.replace(
      /^!\[image-20220127143449465\]\([^\n]+\)\s*$/m,
      "> 原文中的错误截图文件已经缺失，这里保留文字说明。",
    );
  }
  if (post.target === "itra-points-not-visible.md") {
    normalized = normalized.replace(
      /Pasted%20image%20(202407261(?:61558|61741|62535|62619|62733|62447))\.png/g,
      "/images/posts/itra/$1.png",
    );
  }
  return addSummaryDivider(normalized);
}

const created = [];
const skipped = [];
for (const post of posts) {
  const sourcePath = path.join(obsidianRoot, post.source);
  const targetPath = path.join(postsRoot, post.target);
  if (!fs.existsSync(sourcePath)) throw new Error(`找不到 Obsidian 原稿：${sourcePath}`);
  if (fs.existsSync(targetPath)) {
    skipped.push(post.target);
    continue;
  }
  const source = fs.readFileSync(sourcePath, "utf8");
  const body = normalizeBody(post, splitMarkdown(source));
  fs.writeFileSync(targetPath, `${frontMatter(post)}${body}`, "utf8");
  created.push(post.target);
}

const itraTarget = path.join(hugoRoot, "static/images/posts/itra");
fs.mkdirSync(itraTarget, { recursive: true });
for (const id of itraImages) {
  const sourcePath = path.join(obsidianRoot, `99_Archives/attachmenent/Pasted image ${id}.png`);
  const targetPath = path.join(itraTarget, `${id}.png`);
  if (!fs.existsSync(sourcePath)) throw new Error(`找不到 ITRA 配图：${sourcePath}`);
  if (!fs.existsSync(targetPath)) fs.copyFileSync(sourcePath, targetPath);
}

console.log(`新增 ${created.length} 篇：${created.join(", ") || "无"}`);
console.log(`已存在并跳过 ${skipped.length} 篇：${skipped.join(", ") || "无"}`);
console.log(`ITRA 配图已复制 ${itraImages.length} 张，Obsidian 原目录未修改。`);
