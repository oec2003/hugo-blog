---
title: DeepSeek R1震撼登场：从介绍到使用
date: 2025-02-08T16:31:00+08:00
categories: [技术]
tags: [AI,DeepSeek]
---
春节期间，DeepSeek 掀起了一股热潮，成为了科技领域的热门话题。身边很多非圈内人士茶余饭后也在讨论 DeepSeek，足以见得其火爆程度。

<!-- more -->

## 介绍

DeepSeek 全称：杭州深度求索人工智能基础技术研究有限公司，成立于 2023 年 7 月 17 日。由知名量化投资机构幻方量化创立并孵化。

幻方量化是中国顶尖的对冲基金公司，擅长利用 AI 算法优化金融交易策略。其强大的算力资源和技术积累为 DeepSeek 的研发提供了硬件支持和资金保障。

DeepSeek 的创始人梁文峰出生于 1985 年，17 岁考入浙江大学，拥有信息与电子工程学硕士学位。2023 年，梁文锋宣布进军通用人工智能（AGI）领域，创办了 DeepSeek，致力于开发真正人类级别的人工智能。

DeepSeek 近期发布了三个模型，分别是：24 年 12 月 26 的 DeepSeek V3、25 年 1 月 20 日发布了 DeepSeek R1、25 年 1 月 28 日发布的多模态模型 Janus-Pro 。

>V3：该模型是混合专家（MoE）架构，参数量达 6710 亿，激活参数为 370 亿，预训练数据量为 14.8 万亿 token。在百科知识（MMLU、GPQA）、长文本（DROP、LongBench v2）、代码（Codeforces）、数学（AIME 2024、CNMO 2024）等评测中超越主流开源模型（如 Qwen2.5-72B、Llama-3.1-405B），并与 Claude-3.5-Sonnet、GPT-4o 等闭源模型性能持平。
 R1：专注于数学、代码、自然语言推理任务，性能对标 OpenAI o1 正式版，部分测试（如AIME 得分率 79.8% vs. o1 的 79.2% ）实现超越。API 调用成本仅为 OpenAI o1 的3.7%（输出 Token 每百万 16元），训练总成本约 550 万美元，算力需求显著低于同类模型
 Janus-Pro：作为 DeepSeek 首款开源多模态模型，Janus-Pro 支持视觉、语言等多模态输入输出，填补此前 V3 模型仅限文本交互的局限。

我是 DeepSeek 的早期用户，开始使用时，只有网页版，非常简陋，还没有历史记录，但回答问题的效果不错，特别是编程相关。给我的感觉是认真在做模型，在应用层面不太重视。即便是到现在，依然没有花哨的应用层功能，硬是靠强大的模型能力和创新火出圈了。

DeepSeek R1 的技术报告地址如下：

https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf

## 使用

### 网页端

浏览器访问这个地址：https://chat.deepseek.com/ ，手机号或者微信注册，登录后如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071551961.webp)

深度思考后面括号里写的是 R1，说明使用的是 R1 模型，深度思考和联网搜索可以同时勾选，比如我让评价射雕的电影，可以看到 DeepSeek 先搜索网页，再进行深度思考，思考过程也会显示在页面中：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071552247.webp)

### APP

DeepSeek 最近推出了移动端，网页版的左下角有下载二维码。抛开最近的稳定性不谈，可以免费在电脑和手机上使用 R1 模型，已经非常良心了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071552601.webp)

### 本机部署

可以使用 ollama 在本机进行 DeepSeek R1 模型的部署。

在 ollama 的网站上可以搜索到 DeepSeek R1 模型：https://ollama.com/search?q=DeepSeek

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071553848.webp)

可以看到从 1.5b 到 671b 的都有。下面使用 `ollama run deepseek-r1:7b` 来运行 7b 的模型，使用 run 命令时如果本地没有这个模型会先自动进行下载。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071553258.webp)

虽然 7b 的模型知识储备还有点弱，但 R1 的思考能力已经具备了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071553750.webp)

### 调用 API

1、在 DeepSeek 官网（https://www.deepseek.com/）点击右上角的「API 开放平台」：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071554630.webp)

2、登录后在左侧菜单「API Keys」中创建一个新的 key：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071555454.webp)

现在已经暂停了 API 服务的充值。

3、开始写代码调用 API，下面代码是将 DeepSeek 的文档地址 (https://api-docs.deepseek.com/zh-cn/) 给 Windsurf，让 Windsurf 完成的，Windsurf 最近版本更新的很快，已经集成了 DeepSeek R1 模型。

deepseek_client.py

```python
from openai import OpenAI
import os

class DeepSeekClient:
    def __init__(self):
        self.client = OpenAI(
            api_key='sk-7d2fac93b6ee498ca5546f1ad59244fa',
            base_url='https://api.deepseek.com'
        )

    def chat_completion(self, messages, model="deepseek-reasoner", stream=False):
        return self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=stream
        )

```

webapi.py

```python
from flask import Flask, request, jsonify
from deepseek_client import DeepSeekClient

app = Flask(__name__)
client = DeepSeekClient()

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    completion = client.chat_completion(
        messages=data.get('messages', []),
        model=data.get('model', 'deepseek-reasoner'),
        stream=data.get('stream', False)
    )
    return jsonify({'response': completion.choices[0].message.content})

```

pyproject.toml

```toml
[tool.poetry.dependencies]
python = "^3.10"
openai = "^1.12.0"
flask = "^2.0.3"
```

4、在项目的根目录下执行下面命令启动

```
poetry install
poetry run flask --app webapi run --debug 
```

5、在 postman 中调用的结果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071559285.webp)

因为我没有充值，提示余额不足，说明调用 DeepSeek API 是成功的。

## 最后

R1 模型虽然强悍，但随着春节期间的火爆，使用人数的突增（攻击），现在变得不太稳定，经常会出现“服务器繁忙，请稍后再试。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071600050.webp)

这种频繁的稍后重试体验非常不好，我们也可以采取一些其他措施：

1、kimi 也发布了 k1.5 长思考，可以和联网搜索一起使用。

2、秘塔 AI 搜索可以开启长思考-R1,这个 R1 就是采用 Deepseek R1 深度推理模型进行回答。

3、使用 ollama 自己部署，跟满血 R1 相比肯定有差距，而且也不能联网。

4、使用 chatbox 调用硅基流动的 R1 API 接口，硅基流动自己部署的 R1 模型，这个方案现在应该知道的人比较多，刚看到 R1 模型的介绍里添加了：2025 年 2 月 6 日起，未实名用户每日最多请求此模型 100 次。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502071559589.webp)

5、在 Windsurf 中使用 DeepSeek 的 R1 模型。

