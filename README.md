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

重新运行迁移脚本会覆盖 Hugo 中对应的文章、Wiki、关于和笔记内容；运行前请先提交 Hugo 侧的内容修改。

```bash
node scripts/migrate-content.mjs
```
