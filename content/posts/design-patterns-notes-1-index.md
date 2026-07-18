---
title: 设计模式笔记(1)—开篇（文章索引）
date: 2009-11-18
categories: [技术]
tags: [C#,设计模式]
---

## 概念

设计模式描述了软件设计过程中某一类常见问题的一般性的解决方案。

面向对象的设计模式描述了面向对象设计过程中，在特定场景下类与相互通讯的对象之间常见的组织关系。

## 设计模式与面向对象

面向对象设计模式解决的是“类与相互通信的对象之间的组织关系。包括他们的角色、职责、协作方式几个方面。

面向对象设计模式是“好的面向对象设计”，所谓“好的面向对象设计”是那些可以满足“因对变化，提高复用的设计”。

面向对象设计模式描述的是软件设计，因此他是独立于编程语言的，但是面向对象设计模式的最终实现仍然要使用面向对象编程语言来表达。

面向对象设计模式不像算法技巧，可以照搬照用，他是建立在对“面象对象”纯熟、深入的理解的基础上的经验性认识。

## 从设计原则到设计模式

针对接口编程，而不是针对实现编程—客户无需知道所有使用对象的特定类型，只需要知道对象拥有客户所期望的接口。

优先使用对象组合，而不是类继承—类继承通常为“白箱复用”，对象组合通常为“黑箱复用”。继承在某种程度上破坏了封装性，子类父类耦合度高；而面向组合只要求组合的对象具有良好定义的接口，耦合度低。

封装变化点—使用封装来创建对象之间分界曾，让设计者可以在分界曾的一侧进行修改，而不会对另一侧产生不良的影响，从而实现层次间的松耦合。

使用重构得到模式—设计模式的应用不宜先入为主，一上来就是用设计模式是对设计模式的最大无用。没有一步到位的设计模式。

## 几个设计原则

在设计模式的使用中无时无刻都在贯穿着下面这几个原则，所以说理解了这几个设计原则对学习和理解设计模式有很大的帮助。

* 1. 单一职责原（SRP）：一个类应该仅有一个引起它变化的原因。
* 2. 开放封闭原则（OCP）：类模块应该是可以扩展的，但是不可以修改（多扩展开放，对修改封闭）
* 3. Liskov替换原则（LSP）：子类必须能够替换他们的基类
* 4. 依赖倒置原则（DIP）：高层模块不应该依赖于底层模块，二者都应该依赖于抽象；抽象不应该依赖于实现细节，实现细节应该依赖于抽象。
* 5. 接口隔离原则（ISP）：不应该强迫客户程序依赖于他们不用的方法。

上面只是简单给出了定义，网上有很多关于这些原则的详细介绍。

下面简单谈一下我自己对设计模式的认识，设计模式很早就接触了，不过实际在项目中使用过的也只是很少的几个，现在市面上有很多关于设计模式的书，其中不乏有些很生动的例子，非常容易理解，但设计模式并不是写些简单的Demo，个人感觉从很熟悉那些简单的Demo到能够灵活在项目中运用这中间有很长的路要走，需要我们多写、多思考，多总结。之所以要使用设计模式，是因为当变化来临时我们能更方便快捷地解决问题，并且有利于以后的维护。如果没有需求的变化，完全可以用自己认为最简单直接的方式去实现功能，不过需求往往是多变的。我们通常所讲的设计模式指的是面向对象设计模式，所以学习好面向对象的知识是学习面向对象设计模式的前提。最近又将几年前的关于设计模式的webcast讲座翻出来听了听，感觉收获颇多，也顺便做了些笔记以备后用。

## 设计模式的分类

设计模式分类创建型、结构型、行为型三类。

### 创建型

[Singleton 单件](http://blog.fwhyy.com/2009/11/design-patterns-notes-2-singleton-pattern/)
[Abstract Factory 抽象工厂模式](http://blog.fwhyy.com/2009/11/design-patterns-notes-3-abstract-factory-pattern/)
[Builder 生成器模式](http://blog.fwhyy.com/2009/11/design-patterns-notes-4-generator-pattern/)
[Factory Method 工厂方法模式](http://blog.fwhyy.com/2009/11/design-patterns-notes-5-factory-method-pattern/)
[Prototype 原型模式](http://blog.fwhyy.com/2009/11/design-patterns-notes-6-prototype-pattern/)

### 结构性

[Adapter 适配器模式](http://blog.fwhyy.com/2009/11/design-patterns-notes-7-adapter-pattern/)
[Bridge 桥接模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-8-bridge-pattern/)
[Composite 组合模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-9-portfolio-pattern/)
[Decorator 装饰模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-10-decorative-pattern/)
[Facade 外观模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-11-appearance-pattern/)
[Flyweight 享元模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-12-flyweight-pattern/)
[Proxy 代理模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-13-proxy-pattern/)

### 行为型

[TemplateMethod 模板方法模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-14-template-method-pattern/)
[Command 命令模式](http://blog.fwhyy.com/2009/12/design-patterns-notes-15-command-pattern/)
[Interpreter 解释器模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-16-interpreter-pattern/)
[Mediator 中介者模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-17-mediator-pattern/)
[Iterator 迭代器模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-18-iterator-pattern/)
[Observer 观察者模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-19-observer-pattern/)
[Chain Of Responsibility 职责链模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-20-chain-of-responsibility-pattern/)
[Memento 备忘录模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-21-memo-pattern/)
[State 状态模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-22-state-pattern/)
[Strategy 策略模式](http://blog.fwhyy.com/2010/01/design-patterns-notes-23-strategy-pattern/)
[Visitor 访问者模式](http://blog.fwhyy.com/2010/02/design-patterns-notes-24-visitor-pattern/)
[总结](http://blog.fwhyy.com/2010/02/design-patterns-notes-25-summary/)

