---
title: dotNET 7 尝鲜（VS 和 C# 11)
date: 2022-11-10T18:39:37+08:00
categories: [技术]
tags: [DotNet,dotNet7,C#]
---

2022 年 11 月 8 日，.NET 7 正式发布了，从 11 月 8 号 到 10 号，线上的 .NET Conf 2022 会议正在举行，可以通过 https://www.dotnetconf.net/ 了解相关情况。
<!--more-->
微软现在节奏越来越快，相信很多人还没在生产上使用 .NET 6 , 7 就发布了，先来看看都有什么新特性吧。

.NET 7 为 C# 11/F# 7 带来了更好的性能和新特性，体现在 .NET MAUI，ASP.NET Core/Blazor ，Web API，WinForms，WPF 等等。

.NET 7 在 Visual Studio 17.4.0 版本中支持，17.4.0 版本是 Visual Studio 2022的第三个长期服务渠道 (LTSC) ，17.4 LTSC 版本将支持到 2024 年 7 月 11 日。如果已经安装了 Visual Studio 2022 ，可以直接更新，也可以通过下面地址下载安装：

https://dotnet.microsoft.com/zh-cn/download

我个人比较关注的是工具和语言。

## 更新 Visual Studio

在帮助中点击检查更新就可以启动更新，需要等待更新的下载：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841864.webp)

更新完成后重启电脑，再打开 Visual Studio ，就可以看到框架选择中有 .NET 7.0 了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841474.webp)

## Visual Studio 的改进

### 选择文本匹配项高亮显示 

在「工具->选项->文本编辑器->常规」界面可以开启「显示 selection 匹配项」。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841559.webp)

勾选此项后，在编辑器中选择某个文本，编辑器其他有选择文本的地方会进行高亮显示，滚动条中也显示了标记来指示哪些位置有和选择文本相同的文本。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841588.webp)

目前，它只适用于长度小于 200 个字符的字符串，并且所有字符都在一行上。

### 音频提示

在「工具->选项->文本编辑器->常规」界面可以开启启用音频提示，需要重新启动 VisualStudio 生效。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841263.webp)

启用后，编辑器中某一个行设置了断点，或者这一行的代码有警告或者错误，光标移动到这一行时，Visual Studio 会播放一个声音。

断点因为有高亮背景色，有没有提示音都行，警告和错误，有时不太容易看出来，这个声音就能起到作用了。

### DataTable 可视化工具

在调试时，DataTable 可以直接打开成一个列表，在这个列表界面中可以进行搜索和导出成 Excel 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841407.webp)

当然，Visual Studio 17.4 还有更多的新增特性，可以参考下面地址：

https://devblogs.microsoft.com/visualstudio/visual-studio-2022-17-4/

## C# 11

### 原始字符串

在 C# 中字符串是用双引号包含起来的内容，这个内容中可能还会有各种符号，比如：斜杠、双引号、单引号等等，像 json 、xml 内容中就经常出现双引号，之前需要使用转义符来进行处理，而在 C# 11 中可以使用三个引号包含字符串内容，来实现原始字符串，这个功能真是太喜欢了。

```csharp
[HttpGet]
public string Get()
{
	string sql = """这是一个原始字符串，名字为"oec2003",加上斜杠/a/b \c\d 单引号 ''""";

	return sql;
}
```

运行结果：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161841680.webp)

### 自动默认结构

在 C# 10 或更早版本中，创建结构时，必须初始化所有字段值。如果有字段没有初始化，会有编译错误。 C# 11 引入了 「自动默认结构」，它会初始化字段为默认值。

比如在 C# 10 中，会出现这样的错误：

![](../../attachmenent/202211100546836.webp)

C# 11 中这段代码是可以正常执行，Age 会被初始化为 0 。

## 必要成员

当一个类的属性需要强制在类初始化时进行赋值的时候，就可以用 required 关键字进行修饰：

```csharp
public class User
{
	public required string UserName { get; init; }
	public required int Age { get; init; }
}
```

在创建 User 对象时，如果没有初始化 UserName 和 Age 就会出现错误，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161842248.webp)

### 列表模式

从 C# 11 开始，数组或列表可以与元素序列相匹配，元素序列就是一组由中括号括起来的元素，匹配使用 is 关键字。

```csharp
int[] testArray = { 1, 2, 3, 5, 8 };

bool result = false;

// result 值为 false, 最后一个数字没有匹配
result = testArray is [1, 2, 3, 5, 9];

// result 值为 false, 元素的位置不一样
result = testArray is [8, 1, 2, 3, 5];

// result 值为 false, 长度没有匹配
result = testArray is [1, 2, 3, 5];

// result 值为 true, 元素、长度、位置都匹配
result = testArray is [1, 2, 3, 5, 8];
```

列表模式有三种不同的方式：Discard pattern、Range pattern、Var pattern

Discard pattern：

比如还是上面例子中的数组 testArray ,想要知道是否匹配第一个元素为 1 ，可以这样来实现：

```csharp
int[] testArray = { 1, 2, 3, 5, 8 };

bool result = false;

// result 值为 true，序列的长度和数组匹配，第一个元素也是 1
result = testArray is [1, _, _, _, _];
```

- 序列的长度要和数字相同；
- 序列中不用匹配的元素可以使用 _ 进行忽略。

Range pattern：

在匹配时，如果序列中元素个数是未知的，那么 Range pattern 就可以起作用。使用两个点可以用来指定任意数量的元素，两个点只能在序列中使用一次。

```csharp
int[] testArray = { 1, 2, 3, 5, 8 };

bool result = false;

// result 值为 true，.. 表示 5之前的，_ 表示最后一个元素，这个匹配的是倒数第二个是 5
result = testArray is [..,5,_];
```

Var pattern：

在这个模式中，可以在 var 关键字后面加变量，匹配上的元素的值会赋值给变量。

```csharp
int[] testArray = { 1, 2, 3, 5, 8 };

if(testArray is [..,var lastNum])
{
    // lastNum 的之为 8
    Console.WriteLine($"最后一个元素是：{lastNum}");
}
```

其他的特性，如：对静态成员进行抽象等，我觉得可以单独写文章来介绍。

最近因为项目原因，写了一些 Java 代码，相比之下，C# 优雅太多了，希望 .NET 能越来越好，在国内得到更多的认可。

相关阅读：

C#：8.0 & 9.0 常用新特性

带你了解C#每个版本新特性
