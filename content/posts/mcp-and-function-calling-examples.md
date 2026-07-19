---
title: MCP 和 Function Calling：示例
date: 2025-04-16T18:48:00+08:00
categories: [技术]
tags: [MCP,AI]
topic: ai
series_chapter: 第三章 智能体、RAG 与开放协议
series_section: 协议与连接
series_order: 330
---
在上一篇《MCP 和 Function Calling：概念》中简单介绍了 MCP 和 Function Calling 的基础概念和执行逻辑。

<!-- more -->

本文以实际例子来加深对 MCP 和 Function Calling 的理解。

实现这样一个场景：和大模型聊天，然后让大模型将回答的内容保存到 flomo 笔记中。

## Function Calling

我们知道 Function Calling 和模型的能力有关，我使用的是 qwen2.5:7b 模型，使用 ollama 在本地运行。

## 思路

1、写一个 api 接口，这个接口的作用就是将输入的值存入 flomo 笔记中。

2、利用 qwen-agent 框架，来实现 function calling ，最终调用自定义开发的 api 接口。

### 实现

1、api 接口使用任何语言都行，我这里使用的是 python 的 flask 框架。

```python
@api_bp.route('/flomo/save', methods=['POST'])
def save_to_flomo():
    # 获取请求数据
    data = request.get_json()

    # 验证请求数据
    if not data or 'content' not in data:
        return jsonify({"error": "Missing required field: content"}), 400

    content = data['content']
    tags = data.get('tags', [])  # 可选的标签列表

    # 验证Flomo API URL是否配置
    flomo_api_url = current_app.config.get('FLOMO_API_URL')
    if not flomo_api_url:
        return jsonify({"error": "Flomo API URL not configured"}), 500

    try:
        # 准备发送到Flomo的数据
        flomo_data = {
            "content": content
        }

        # 如果有标签，添加到内容中
        if tags:
            # Flomo使用 #tag 格式的标签
            tag_text = ' '.join([f"#{tag}" for tag in tags])
            flomo_data["content"] = f"{content}\n\n{tag_text}"

        # 发送请求到Flomo API
        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(
            flomo_api_url,
            headers=headers,
            data=json.dumps(flomo_data),
            timeout=10  # 设置超时时间，处理大文本可能需要更长时间
        )

        # 检查响应
        if response.status_code == 200:
            return jsonify({
                "message": "Content successfully saved to Flomo",
                "flomo_response": response.json()
            }), 200
        else:
            return jsonify({
                "error": "Failed to save to Flomo",
                "status_code": response.status_code,
                "response": response.text
            }), 500

    except requests.RequestException as e:
        # 处理请求异常
        return jsonify({
            "error": f"Request to Flomo failed: {str(e)}"
        }), 500
    except Exception as e:
        # 处理其他异常
        return jsonify({
            "error": f"Unexpected error: {str(e)}"
        }), 500

```

2、创建一个 qwen-client.py 的文件，内容如下：

```python
import json
import requests
from qwen_agent.llm import get_chat_model

def save_to_flomo(content):
    """Save content to Flomo notes"""
    try:
        api_url = "http://localhost:6500/api/flomo/save" 

        data = {"content": content}

        response = requests.post(
            api_url,
            headers={"Content-Type": "application/json"},
            json=data,
            timeout=10
        )

        if response.status_code == 200:
            print(f"Successfully saved to Flomo: {content}")
            return json.dumps(response.json())
        else:
            error_message = f"Failed to save to Flomo. Status code: {response.status_code}, Response: {response.text}"
            print(error_message)
            return json.dumps({"error": error_message})

    except Exception as e:
        error_message = f"Error calling Flomo API: {str(e)}"
        print(error_message)
        return json.dumps({"error": error_message})

def test(fncall_prompt_type: str = 'qwen'):
    llm = get_chat_model({
        'model': 'qwen2.5:7b',
        'model_server': 'http://localhost:11434/v1',
        'api_key': "",
        'generate_cfg': {
            'fncall_prompt_type': fncall_prompt_type
        }
    })

    # 第1步：将对话和可用函数发送给模型
    messages = [{'role': 'user', 'content': "怎么学习软件架构，总结为三点，保存到笔记"}]
    functions = [{
        'name': 'save_to_flomo',
        'description': '保存内容到Flomo笔记',
        'parameters': {
            'type': 'object',
            'properties': {
                'content': {
                    'type': 'string',
                    'description': '内容',
                }
            },
            'required': ['content'],
        },
    }]

    responses = []
    for responses in llm.chat(
            messages=messages,
            functions=functions,
            stream=False,  
    ):
        print(responses)

    # 如果使用stream=False，responses直接是结果，不需要循环
    if isinstance(responses, list):
        messages.extend(responses) 
    else:
        messages.append(responses) 

    # 第2步：检查模型是否想要调用函数
    last_response = messages[-1]
    if last_response.get('function_call', None):
        # 第3步：调用函数
        available_functions = {
            'save_to_flomo': save_to_flomo,
        }
        function_name = last_response['function_call']['name']
        function_to_call = available_functions[function_name]
        function_args = json.loads(last_response['function_call']['arguments'])
        function_response = function_to_call(
            content=function_args.get('content'),
        )
        print('# Function Response:')
        print(function_response)

        # 第4步：发送每个函数调用和函数响应到模型，让大模型返回最终的结果
        messages.append({
            'role': 'function',
            'name': function_name,
            'content': function_response,
        }) 

        for responses in llm.chat(
                messages=messages,
                functions=functions,
                stream=False,
        ): 
            print(responses)

if __name__ == '__main__':
    test()

```

- save_to_flomo 方法就是大模型需要用到的函数，函数中调用第一步写的接口，将内容存储到 flomo 笔记中。
- test 方法中首先进行初始化，http://localhost:11434/v1 是本地通过 ollama 运行 qwen2.5:7b 模型的地址。
- 后面的步骤在上面代码中写有注释。

3、在 qwen_client.py  所在目录执行下面的命令安装 qweb-agent 框架：

```shell
pip install -U "qwen-agent[gui,rag,code_interpreter,mcp]"
```

4、执行 `python qwen_client.py` 运行程序。

![](https://img.fwhyy.com/2025/202504161734636.webp)

5、检查 flomo 客户端，可以看到内容已经存储进来了。

![](https://img.fwhyy.com/2025/202504161734341.webp)

## MCP 

MCP 的使用，可以自己开发服务端，也可以使用 MCP 服务站的服务，比如 mcp.so 。客户端有很多，比如：Windsurf、Cursor、CherryStudio 等。

## Windsurf 中使用 MCP

1、先在 mcp.so 中找到 flomo 的 Server 。

![](https://img.fwhyy.com/2025/202504161737621.webp)

2、连接 Server 的方式选择了 Original 。

![](https://img.fwhyy.com/2025/202504161737161.webp)

3、在 Windsurf 中的 MCP 设置中添加 flomo 的 Server 。

![](https://img.fwhyy.com/2025/202504161737518.webp)

4、配置好后，在 chat 模式下进行提问：根据最新的内容对比下mcp和A2A，将结果存储到笔记中。

![](https://img.fwhyy.com/2025/202504161739600.webp)

Windsurf 一通查询资料，整理后，就调用 MCP 工具，将结果存到我的 flomo 中了。

![](https://img.fwhyy.com/2025/202504161739084.webp)

### 代码示例

很久没用 dotnet 了，这个例子就用 dotnet 来实现吧。

工具和环境：

- dotnet：8.0
- ModelContextProtocol：0.1.0-preview.8
- 工具：Windsurf

1、创建 mcp-server 控制台项目，Program 代码如下：

```csharp
using Microsoft.Extensions.Hosting;
using ModelContextProtocol;
using Microsoft.Extensions.DependencyInjection;
using FlomoMcpServer;

try
{
  Console.WriteLine("启动 MCP 服务...");

  var builder = Host.CreateEmptyApplicationBuilder(settings: null);
  builder.Services
    .AddMcpServer()
    .WithStdioServerTransport()
    .WithToolsFromAssembly();

  await builder.Build().RunAsync();
}
catch (Exception)
{
  Console.WriteLine("启动 MCP 服务失败");
}
```

2、添加 flomo 工具类 FlomoTools.cs ，内容如下：

```csharp
using ModelContextProtocol.Server;
using System.ComponentModel;

namespace FlomoMcpServer
{
    [McpServerToolType]
    public static class FlomoTools
    {
        [McpServerTool]
        [Description("写笔记到 Flomo")]
        public static async Task WriteNote(string content)
        {
            Console.WriteLine("写笔记到 Flomo...");
            if (string.IsNullOrEmpty(content))
            {
                throw new ArgumentNullException("content");
            }

            var apiUrl = "https://flomoapp.com/iwh/xxxxxxxxxxxxx/";

            using (var httpClient = new HttpClient())
            {
                var payload = new { content = content };
                var json = System.Text.Json.JsonSerializer.Serialize(payload);
                var httpContent = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(apiUrl, httpContent);
                response.EnsureSuccessStatusCode();
            }

            Console.WriteLine("写笔记到 Flomo 完成");
        }
    }
}

```

3、创建 mcp-client 控制台项目，Program 代码如下：

```csharp
using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol.Transport;
using System.Collections.Generic;

var clientTransport = new StdioClientTransport(new StdioClientTransportOptions
{
    Name = "flomo",
    Command = "dotnet",
    Arguments = new[] { "/Users/fengwei/Projects/ai-demo/dotnet-mcp-demo/mcp-server/bin/Debug/net8.0/mcp-server.dll" }
});

await using var client = await McpClientFactory.CreateAsync(clientTransport);

var tools = await client.ListToolsAsync();
foreach (var tool in tools)
{
    Console.WriteLine($"{tool.Name}: {tool.Description}");
}
```

上面例子中使用的是本地 Stdio 的模式。通过 client.ListToolsAsync(); 获取 MCP 服务中的所有工具，并打印出来。执行效果如下：

![](https://img.fwhyy.com/2025/202504161740840.webp)

4、client 的 Program 中继续添加下面代码进行直接的 Server 端方法调用，来测试下 client 和 server 是否是连通的。

```csharp
var result = await client.CallToolAsync("WriteNote", new Dictionary<string, object?>
{
    ["content"] = "Hello, oec2003!"
});
Console.WriteLine($"Result: {result}");
```

![](https://img.fwhyy.com/Pasted%20image%2020250415181626.webp)

执行完后，如果 flomo 中笔记插入正常，说明调用成功。

5、接着调用本地 ollama 运行的大模型来实现跟大模型对话，然后将对话结果保存到 flomo 。Client 端的 Program 完整代码如下：

```csharp
using Microsoft.Extensions.Hosting;
using ModelContextProtocol;
using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol.Transport;
using Microsoft.Extensions.DependencyInjection;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Json;
using Microsoft.Extensions.AI;
using OpenAI;
using System.ClientModel;

Console.WriteLine("启动 MCP 客户端...");

var clientTransport = new StdioClientTransport(new StdioClientTransportOptions
{
    Name = "flomo",
    Command = "dotnet",
    Arguments = new[] { "/Users/fengwei/Projects/ai-demo/dotnet-mcp-demo/mcp-server/bin/Debug/net8.0/mcp-server.dll" }
});

await using var mcpClient = await McpClientFactory.CreateAsync(clientTransport);

Console.WriteLine("已连接到 MCP 服务器");
Console.WriteLine("可用工具:");
foreach (var tool in await mcpClient.ListToolsAsync())
{
    Console.WriteLine($"{tool.Name}: {tool.Description}");
}

// 配置硅基流动API参数
var apiKeyCredential = new ApiKeyCredential("xx");
var aiClientOptions = new OpenAIClientOptions();
aiClientOptions.Endpoint = new Uri("http://localhost:11434/v1");
var aiClient = new OpenAIClient(apiKeyCredential, aiClientOptions)
    .AsChatClient("qwen2.5:7b");

var chatClient = new ChatClientBuilder(aiClient)
    .UseFunctionInvocation()
    .Build();

var mcpTools = await mcpClient.ListToolsAsync();
var chatOptions = new ChatOptions() {
    Tools = [..mcpTools]
};

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine($"助手> 请输入想要记录的内容，AI总结后会存入笔记");
while (true)
{
    Console.ForegroundColor = ConsoleColor.White;
    Console.Write("用户> ");
    var question = Console.ReadLine();

    if (!string.IsNullOrWhiteSpace(question) && question.ToUpper() == "EXIT")
        break;

    var messages = new List<ChatMessage> {
        new(ChatRole.System, "你是一个笔记助手，请将用户的输入总结为简洁的笔记形式，使用markdown格式。保留关键信息，删除冗余内容。"),
        new(ChatRole.User, question)
    };

    try 
    {
        var response = await chatClient.GetResponseAsync(messages, chatOptions);
        var content = response.ToString();
        Console.WriteLine($"助手> {content}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"错误: {ex.Message}");
    }

    Console.WriteLine();
}
```

输入 `dotnet run` 运行程序，结果如下：

![](https://img.fwhyy.com/2025/202504161740697.webp)

## 参考

https://modelcontextprotocol.io/introduction

https://blog.frognew.com/2025/01/building-effective-agents.html

https://github.com/QwenLM/Qwen-Agent/blob/main/examples/function_calling.py

https://mcp.so/zh/servers?q=flomo
