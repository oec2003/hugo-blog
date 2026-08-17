---
title: "Codex 设置上下文为 1M"
date: 2026-08-17T08:13:00.000Z
categories: ["技术"]
tags: ["AI","Codex"]
---
Tibo 在推上分享了 Codex 开启 1 M 上下文的方法。

操作很简单，修改全局的配置文件： ~/.codex/config.toml ，添加

``` 
model = "gpt-5.6-sol" 
model_context_window = 1000000 
model_auto_compact_token_limit = 900000 
```
