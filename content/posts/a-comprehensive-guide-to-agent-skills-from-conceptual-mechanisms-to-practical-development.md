---
title: Agent Skills 全景指南：从概念机制到实战开发
date: 2026-01-23T09:01:00+08:00
categories: [技术]
tags: [Skills,Agent,AI]
topic: ai
series_chapter: 第三章 智能体、RAG 与开放协议
series_section: 智能体系统
series_order: 370
---
最近，Agent Skills 彻底火了。

<!-- more -->

很多人第一次听到 Skills，会觉得“这不就是一堆 Markdown 吗？”我一开始也这么想。但当你把它放进 Agent 的运行方式里，再对比 Prompt、MCP、Function Calling 这些概念，你会发现：Skills 解决的不是“模型会不会”，而是“怎么让模型稳定、可复用、可分发地把事做完”。

在这篇文章里，我将从概念到实战，带你彻底搞懂 Skills。

## 一、什么是 Skills？它从何而来？

简单来说，Skills 就是供大模型使用的技能包。

- Skills 里面包含做事的方法（流程、规范、检查点），以及可选的资源（模板、脚本、参考资料等）。
- 目标不是让模型“临场表现更好”，而是让同一类任务在不同时间、不同输入、不同人使用时，都能得到稳定的结果。

例如：团队新来了一个开发工程师。为了让他按团队要求开展工作，通常会告知：

*   这件事的目标和流程是什么（SOP）
*   要用到什么工具（Scripts/MCP）
*   有什么参考模板和素材（References/Assets）

这就是 Skills。它让 Agent 具备了“专业知识”和“稳定做事的方法”。

Skills 最早由 Anthropic 在 2025 年 10 月中旬随 Claude Code 推出。两个月后（12 月 18 日），Agent Skills 被作为开放标准发布。

https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills?utm_source=chatgpt.com

![](https://img.fwhyy.com/2026/202601230643573.webp)

## 二、Skills、MCP、Agent、Function Calling 的关系
之前写过 MCP 和 Function Calling 相关的文章：

《[[MCP 和 Function Calling：概念]]》

《[[MCP 和 Function Calling：示例]]》

这些和新的 Skills，关系是什么呢？

*   Function Calling：这是最底层的能力，相当于人的“手”。它让 AI 知道自己能“拿杯子”、“按开关”，是连接外部世界的基础接口。
*   MCP：这是一种标准协议，定义通用通信架构和数据格式（类似于 USB 标准）。Function Calling 可视为 MCP 生态下的一种具体功能实现形式。
*   Skills：这是业务逻辑和流程，相当于“脑子里的知识”。它教 AI 如何使用 MCP 里的工具去完成一个复杂的任务（比如写一篇符合你风格的文章）。它解决的是“流程”问题。
*   Agent：Agent 是位于最上层的“大脑”或“协调者”。

可以这么理解，不一定准确：Agent 是工人、Function Calling 是工人具备使用工具的能力，比如会用锤子等、 MCP 是一个多功能腰带，有各种标准的卡口用来放不同类型的工具、Skills 可以是这些工具的使用说明书，也可以是怎么用工具造房子的施工图纸。

![](https://img.fwhyy.com/2026/202601230655772.webp)

## 三、核心机制

Skills 的核心机制，我认为就两件事：

- 让 Agent 能“找到该用哪个技能”
- 让 Agent 能“只在需要时加载需要的部分”

Agent 启动时不会把所有技能全文塞进上下文窗口，而是先扫描技能包，读取每个技能的少量元信息（名称和描述，描述尤为重要）。

当用户提出需求后，Agent 会用这些元信息做匹配，判断要不要触发某个技能。这也是为什么 Skills 的 `description` 写得好不好，直接决定“命中率”。

如果说本质，Skills 是更高级的提示词，但为什么 Skills 比提示词更强大呢？秘密就在于渐进式披露。

Agent 不会把所有 Skills 的内容一次性塞进脑子（上下文）里，而是分三层加载：

- Level 1（元数据）：只有 Skills 的名字和简介（Description）常驻内存。这只占极少的 Token，所以你可以装几百个 Skills 都不卡。
- Level 2（指令）：当 Agent 发现你的需求匹配某个 Skill 的简介时，才会读取 `SKILL.md` 的正文，加载具体的指令。
- Level 3（资源/代码）： 只有在执行过程中真正需要时，才会去读取具体的参考文档或运行 Python 脚本。

这种机制完美解决了上下文爆炸的问题。

## 四、Skills 包含哪些内容？

一个标准的 Skills 包结构如下（以“会议记录整理”为例）：

*   **`SKILL.md`（必须）**：核心说明书。
    *   *样例*：包含 YAML 元数据（名字：meeting-notes），正文描述输入、格式、流程等。

```
---
name: meeting-notes
description: 把会议录音转写/速记整理成可发的会议纪要，包含结论、待办与负责人。
---

## 目标
把输入材料整理成一份“可直接发群”的会议纪要。

## 输入
- 会议文字稿（可能很乱）
- 会议基本信息：时间、参会人（可选）

## 输出格式
1. 会议结论（最多 5 条）
2. 决策与原因（如有）
3. ToDo（负责人/截止时间/依赖项）
4. 风险与待澄清问题

## 工作流程
1. 先快速提取主题与关键结论，确认会议的“主线”。
2. 再按时间或议题整理讨论要点，删掉寒暄与重复。
3. 把行动项改写成可执行句式，并补齐负责人和截止时间（缺失就标注待确认）。
4. 最后做一次一致性检查：结论是否能在正文找到依据、ToDo 是否可执行。
```

*   **`scripts/`（可选）**：执行脚本。
    *   *样例*：`fetch_news.py`，抓取内部系统数据作为补充。
*   **`references/`（可选）**：参考资料。
    *   *样例*：`style_guide.md`（风格指南），`vocabulary.csv`（术语表）。
*   **`assets/`（可选）**：静态资源。
    *   *样例*：如果需要转 PPT ，可以提供 PPT 模板文件。

![](https://img.fwhyy.com/2026/202601230656902.webp)

## 五、怎么使用 Skills？

因为我平时不需要深度写代码，Trae 的国际版我觉得完全够用了，使用 OpenCode + GLM 4.7 效果也还不错。

Trae 最近也支持了 Skills，下面就以 Trae 为例来说说怎么使用  Skills ，需要注意的是，在 Trae 中使用 Skills 需要开启 SOLO 模式。

1、Anthropic 官方提供了很多的 Skills ，GitHub 地址如下：

https://github.com/anthropics/skills/tree/main/skills

![](https://img.fwhyy.com/2026/202601230656881.webp)

将代码拉取到本地。

2、打开 Trae，在设置中打开规则和技能，在技能区域点击创建。

![](https://img.fwhyy.com/2026/202601230656234.webp)

3、可以自己写，也可以导入现有的 Skills，在拉取的 Skills 源码中找到 docx 的 Skills ，压缩成 zip 文件，上传到 Trae 的技能中。

![](https://img.fwhyy.com/2026/202601230656025.webp)

4、上传成功后，Skills 会被安装到当前项目的 .trae/skills 目录。

![](https://img.fwhyy.com/2026/202601230656158.webp)

5、可以看出，对话中涉及到 word 文档的操作时，就会调用 docx 的 Skills 。

![](https://img.fwhyy.com/2026/202601230657090.webp)

6、效果如下：

![](https://img.fwhyy.com/2026/202601230657910.webp)

## 六、哪些场景适合封装自己的 Skills ？

1、任务需要被重复执行的。

2、任务是可以分解为很多个步骤的，这些步骤是可描述的。

满足上面两种情况的一些任务就适合封装成 Skills 。

## 七、如何制作自己的 Skills？

先说一个场景：

> 1、项目的需求文档让大模型解析为 json 数据
> 2、低代码平台可以对外提供构建应用功能的 API
> 3、以 json 数据作为输入，调用平台的 API 进行功能的创建

上面的场景是需要反复利用的、也有清晰的步骤，可以制作成 Skills 。

Anthropic 官方的技能包中有一个 skill-creator 的技能，按照上面的方式，导入到 Trae 中。

SOLO 模式下，输入下面内容让 skill-creator 这个技能来帮我创建 Skills

```
我们有一个低代码平台，可以可视化的方式进行应用的创建，我现在的想法是，需要要创建多个Skills 来协作创建应用：
1、我最终只需要给一个需求文档，并且输入根据文档创建应用，就能帮我完成任务；
2、主 Skills 接收到这个任务后可以安排任务，先用 docx 这个 Skills 解析需求文档内容，按照给定的 json 格式，输出 json 数据；
3、json 数据的入参准备好后，再调用创建应用的 Skills，用 json 数据作为入参调用scripts 中的脚本进行应用的创建，script 中是用 python 写好的调用低代码平台接口的脚本，需要注意的是接口的前缀可以配置。
请帮我创建这些 Skills
```

最后 skill-creator 帮我创建了三个 Skills：

![](https://img.fwhyy.com/2026/202601230657964.webp)

- lowcode-architect：接收任务的主 Skills
- lowcode-requirement-parser：分析文档的 Skills
- lowcode-app-builder：应用创建的 Skills

![](https://img.fwhyy.com/2026/202601230657280.webp)

## 总结

Skills 不是简单的文档，它是人机协作的中间层。它让普通人也能用自然语言定义复杂的软件行为。赶快去梳理下平常的日常工作，找出那些重复、繁琐、需要特定知识的环节，动手制作一个 Skills 体验一下吧。
