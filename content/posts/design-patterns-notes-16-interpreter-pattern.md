---
title: 设计模式笔记(16)—解释器模式（行为型）
date: 2010-01-19
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

给定一个语言，定义它的文法的一种表示，并定义一种解释器，这个解释器使用该表示来解释语言中的句 子。

## 动机

在软件构建过程中，如果某一特定领域的问题比较复杂，类似的模式不断重复出现，如果使用普通的编程方式来实现将面临非常频繁的变化。在这种情况下，将特定领域的问题表达为某种语法规则下的句子，然后构建一个解释器来解释这样的句子，从而达到解决问题的目的。

下面看下解释器模式的结构图：

![2010-12-29_115427](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290616838.png)

基本代码：

```
/// <summary>
/// 上下文信息
/// </summary>
public class Context
{
    public string Data { get; set; }
}
/// <summary>
/// 抽象表达式，声明一个抽象的解释操作
/// </summary>
public abstract class AbstractExpression
{
    public abstract void Interpret(Context context);
}
public class TerminalExpression:AbstractExpression
{
    public override void Interpret(Context context)
    {
        context.Data += "终端,";
    }
}
public class NonterminalExpression : AbstractExpression
{
    public override void Interpret(Context context)
    {
        context.Data += "非终端,";
    }
}
public class App
{
    static void Main(string[] args)
    {
        Context context = new Context();
        List<AbstractExpression> list = new List<AbstractExpression>();
        list.Add(new TerminalExpression());
        list.Add(new NonterminalExpression());
        list.Add(new TerminalExpression());

        foreach (AbstractExpression exp in list)
        {
            exp.Interpret(context);
        }
        Console.WriteLine(context.Data);
    }
}
```

接下来看一个实际的应用，功能是数字的转换，如将“五百二十”转换成“520“，首先创建一个Context类用来储存上下文信息，类中有两个属性Statement和Data，分别用来存放汉字的数字和阿拉伯数字。

```
public class Context
{
    public string Statement { get; set; }
    public int Data { get; set; }
}
```

抽象的Expression类

```
/// <summary>
/// 抽象表达式类
/// </summary>
public abstract class Expression
{
    protected Dictionary<string, int> table = new Dictionary<string, int>(9);
    public Expression()
    {
        table.Add("一", 1);
        table.Add("二", 2);
        table.Add("三", 3);
        table.Add("四", 4);
        table.Add("五", 5);
        table.Add("六", 6);
        table.Add("七", 7);
        table.Add("八", 8);
        table.Add("九", 9);
    }
    public virtual void Interpret(Context context)
    {
        if (context.Statement.Length == 0)
        {
            return;
        }

        foreach (string key in table.Keys)
        {
            int value = table[key];
            if (context.Statement.EndsWith(key + GetPostFix()))
            {
                context.Data += value * this.Multiplier();
                context.Statement = 

                          context.Statement.Substring

                          (0, context.Statement.Length - this.GetLength());
            }
            if (context.Statement.EndsWith("零"))
            {
                context.Statement = 

                   context.Statement.Substring(0, context.Statement.Length-1);
            }
        }
    }
    public abstract string GetPostFix();
    public abstract int Multiplier();
    public virtual int GetLength()
    {
        return this.GetPostFix().Length + 1;
    }
}
```

个十百千万的表达式类

```
public class GeExpression : Expression
{
    public override string GetPostFix()
    {
        return string.Empty;
    }
    public override int Multiplier()
    {
        return 1;
    }
    public override int GetLength()
    {
        return 1;
    }
}
public class ShiExpression : Expression
{
    public override string GetPostFix()
    {
        return "十";
    }
    public override int Multiplier()
    {
        return 10;
    }
}
public class BaiExpression : Expression
{
    public override string GetPostFix()
    {
        return "百";
    }
    public override int Multiplier()
    {
        return 100;
    }
}
public class QianExpression : Expression
{
    public override string GetPostFix()
    {
        return "千";
    }
    public override int Multiplier()
    {
        return 1000;
    }
}
public class WanExpression : Expression
{
    public override string GetPostFix()
    {
        return "万";
    }
    public override int Multiplier()
    {
        return 10000;
    }
}
```

客户端调用

```
class Program
{
    static void Main(string[] args)
    {
        string num = "五百二十";
        Context context = new Context { Statement=num};
        List<Expression> list = new List<Expression>();
        list.Add(new GeExpression());
        list.Add(new ShiExpression());
        list.Add(new BaiExpression());
        list.Add(new QianExpression());
        list.Add(new WanExpression());

        foreach (Expression exp in list)
        {
            exp.Interpret(context);
        }

        Console.WriteLine("{0}={1}", num, context.Data);
    }
}
```

运行结果

![2010-12-29_115512](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290616749.png)

## Interpreter模式的几个要点

* Interpreter模式的应用场合是Interpreter模式应用中的难点，只有满足“业务规则频繁变化，且类似的模式不断重复出现，并且容易抽象为语法规则的问题”才适合使用Interpreter模式。
* 使用Interpreter模式来表示文法规则，从而可以使用面向对象技巧来方便地“扩展”文法。
* Interpreter模式比较适合简单的文法表示，对于复杂的文法表示，Interperter模式会产生比较大的类层次结构，需要求助于语法分析生成器这样的标准工具。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

