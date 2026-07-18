---
title: 在IIS中寄存已有WCF服务
date: 2010-07-19
categories: [技术]
tags: [WCF]
---

IIS是WCF服务的宿主之一，在新建Web Site的时候有WCF Service模板可以供选择，不过依据WCF Service模板创建的站点是将服务和宿主整合在一起了，下面就来看看如何将一个已有的WCF服务寄存在IIS中。

1 在[一个简单的WCF示例](http://www.cnblogs.com/oec2003/archive/2010/07/15/1778013.html)一文的解决方案中添加新的站点，选择WCF Service模板，地址设置为http://localhost/IISHostedService，如下图：

![2010-07-19_154628](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301618792.png)

2 确定后，WCF Service模板就生成了一个带有服务的站点，因为我们要将已有服务寄存在该站点中，所以要删除站点中自带的服务，服务的文件在App_Code目录中，如下图：

![2010-07-19_155053](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301619850.png)

3 添加对Service项目的引用，如下图：

![2010-07-19_161549](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301619979.png)

4 双击项目中Service.svc文件，修改@ServiceHost指令，关联上服务类型，修改后的代码如下：

```
<%@ ServiceHost Language="C#" Debug="true" Service="Service.HelloWorldService"  %>
```

5 修改站点的Web.Config文件，找到Service节点，修改Service节点的Name属性、endpoint节点的绑定属性和契约属性，修改后的代码如下图：

![2010-07-19_162314](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301619029.png)

6 将该站点设置为启动项目，按F5运行，如果Web.Config文件中没有配置元数据交换端点，运行后会看到如下页面：

![2010-07-19_164149](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301619804.png)

可以根据上面页面中的步骤一步一步来配置元数据交换端点，配置好后，如果serviceMetadata节点的httpGetEnabled属性设置为false，运行后如下图所示：

![2010-07-19_164721](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301619610.png)

在设置httpGetEnabled属性为true，再次运行可以看到svcutil指令后是一个带有?wsdl的链接地址，如下图：

![2010-07-19_1649411](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301619381.png)

点击这个链接，可以看到服务的WSDL文档，如下图：

![2010-07-19_165128](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301620414.png)

7 IIS宿主部分已经写好，现在要做的就是使用SvcUtil工具来生成客户端的代理，打开VS2008 的命令提示窗口，输入先前站点运行后的命令提示，如下图：

![2010-07-19_170851](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301620416.png)

8 执行后生成了一个代理文件和一个配置文件，在目录C:\Program Files (x86)\Microsoft Visual Studio 9.0\VC 中，将这两个文件拷贝到客户程序中，配置文件改名为app.config，然后再客户程序中添加如下代码：

```
class Program
{
    static void Main(string[] args)
    {
        oec2003Client proxy = new oec2003Client();
        Console.WriteLine(proxy.SayHello());
        proxy.Close();
        Console.ReadLine();
    }
}
```

9 运行客户程序可以看到如下结果

![2010-07-19_171432](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301620809.png)

