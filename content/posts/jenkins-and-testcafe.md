---
title: 端到端测试实践：Jenkins集成TestCafe
date: 2019-07-08T07:00:15+08:00
categories: [技术]
tags: [Jenkins,testcafe]
---

上一篇《[对产品质量的一点思考](http://fwhyy.com/2019/07/some-thoughts-on-product-quality/)》中说到自动化测试的重要性，本文简单介绍下怎样在实际项目中实现端到端测试的自动化，在这里我们使用的端到端测试工具是TestCafe。

## 环境

Jenkisn：2.183
TestCafe：1.3.0

## 为什么采用TestCafe做自动化测试

* 前端Vue或是netCore要添加单元测试相对较复杂，需要一定的时间来沉淀，不能解燃眉之急
* 经常会因为代码重构、代码合并等原因造成原本正常的功能出现问题，而这些问题在手动测试时不容易覆盖到
* TestCafe足够简单，只要使用过jQuery，基本可以几分钟上手

## 要实现的目标

目前前端代码通过GitLab来进行管理，采用Merge Request的开发模式，开发人员的代码被合并到master后，Jenkins会自动构建到测试环境，希望自动化测试能做到下面两点：

* 能在前端项目构建完成后自动执行TestCafe脚本进行测试
* 能提供测试的完整结果

## 步骤

1、在Jenkins中新创建一个新的项目

![](https://img.fwhyy.com/2022/202201280613334.webp)

Git中配置的测试的代码地址`https://github.com/oec2003/testcafe-ci-demo.git`是我fork的官网的一个例子,原项目地址为：`https://github.com/DevExpress-Examples/testcafe-ci-demo.git`

2、增加构建步骤，选择执行Windows批处理命令

![](https://img.fwhyy.com/2022/202201280614319.webp)

![](https://img.fwhyy.com/2022/202201280614096.webp)

```
D:\Jenkins\Testcafe\node_modules\.bin\testcafe path:C:\Users\oec2003\AppData\Local\Google\Chrome\Application\chrome.exe tests/**/* -r xunit:res.xml
```

上面执行的命令分为三个部分：

* testcafe的执行程序
* 测试的浏览器的路径，此处为chrome的路径，这里有一个小坑，直接执行命令时是可以使用chrome或ie来选择测试浏览器的，但配置在Jenkins中如果直接写chrome或ie会报异常，所以写了chrome执行程序的全路径
* 将结果输出到xunit的xml文件中

要想使用xunit，需要先使用下面命令进行安装

```
npm install testcafe testcafe-reporter-xunit
```

3、添加构建后操作，选择Publish JUnit test result report

![](https://img.fwhyy.com/2022/202201280614661.webp)
![](https://img.fwhyy.com/2022/202201280614568.webp)

4、修改Jenkins中现有的前端项目的配置，增加构建后操作步骤，选择构建起他工程

![](https://img.fwhyy.com/2022/202201280615176.webp)

选择第一步创建的测试项目即可。

5、实际测试结果如下，所有测试用例的通过情况以列表形式展现，点击可以看详细信息

![](https://img.fwhyy.com/2022/202201280615015.webp)

## 总结

* Testcafe非常简单，有一定开发经验的程序员，可以在很短的时间内达到熟练的程度
* Testcafe虽然简单，但怎样去设置场景覆盖，让所有业务没有遗漏，这才是比较困难的，是我们需要着重思考的
* 前端代码如果做了修改，特别是UI层面做了调整，测试代码需要同步修改
* 只要能够持续下去，先从容易出错的模块开始，积少成多，软件质量的最后一道防线一定能守住

