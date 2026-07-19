# 冯威的博客 · Hugo 版

这是从相邻目录 `../hblog-new`（Hexo）迁移得到的 Hugo 站点。

## 本地运行

需要 Hugo 0.146.0 或更高版本：

```bash
hugo server -D
```

浏览器访问 <http://localhost:1313>。

## 构建

```bash
hugo --gc --minify
```

生成结果位于 `public/`。部署时需要同时配置域名 `fwhyy.com`；`static/CNAME` 已随站点保留。

## 内容结构

- `content/posts/`：原 Hexo 文章，保留 `/:year/:month/:slug/` 地址规则
- `content/topic/`：专栏聚合页
- `content/wiki/`：Wiki 内容
- `content/about/`、`content/notes/`：独立页面
- `layouts/`：Hugo 模板
- `assets/`：站点样式和脚本
- `scripts/migrate-content.mjs`：从 Hexo 源目录重新同步 Markdown 的脚本
- `scripts/audit-obsidian-posts.mjs`：比对公众号原稿与 Hugo 文章
- `scripts/sync-obsidian-posts.mjs`：同步已核对的公众号缺失文章，不修改 Obsidian 原稿

重新运行迁移脚本会覆盖 Hugo 中对应的文章、Wiki、关于和笔记内容；运行前请先提交 Hugo 侧的内容修改。

```bash
node scripts/migrate-content.mjs
```

## 同步公众号原稿

先执行只读审计，确认公众号目录中的文章是否已存在：

```bash
node scripts/audit-obsidian-posts.mjs
```

同步本次已核对的缺失文章：

```bash
node scripts/sync-obsidian-posts.mjs
```

两个脚本默认读取 `/Users/fengwei/Documents/04-personal/06-obsidian/writing`；如目录发生变化，可通过 `OBSIDIAN_WRITING_ROOT` 指定新的 writing 目录。同步脚本只创建缺失的 Hugo 文件，已存在的目标会跳过。

## 配置专栏目录

文章只保留一个 Markdown 文件，通过 Front Matter 同时进入普通文章列表和专栏目录，不需要重复发布：

```yaml
topic: arch
series_chapter: 第一章 架构基础
series_section: 第一小节 服务拆分与协作 # 可选；直属章节时留空
series_order: 310
```

- `topic`：对应 `data/topics/` 中的专栏标识
- `series_chapter`：专栏目录的一级章节
- `series_section`：可选的二级小节
- `series_order`：整个专栏中的阅读顺序，数字越小越靠前

同一篇文章仍使用原来的唯一地址；首页、分类、标签、搜索和专栏目录都指向这个地址。
