---
title: 使用LoadRunner测试WMS
date: 2010-05-21
categories: [技术]
tags: [LoadRunner, WMS]
---

LoadRunner是一款非常强大的测试工具，本文为笔者在对LoadRunner有了初步了解后对WMS的压力测试过程，因为接触时间比较短，不对之处欢迎大家指出。由于Licence的原因，对WMS的测试只支持最多100个虚拟用户。下面就开始测试了。

1 要有一个可用的WMS的地址，可以在本机的流媒体服务中创建，也可以使用远程的。
2 打开LoadRunner8.1，并运行窗口中点击Create/Edit Srcirpts ,如下图：

![2010-05-20_150059](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290657907.png)

2 在弹出的窗口中点击New VUser Scripts，如下图：

![2010-05-20_150204](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290657630.png)

3 点击New VUser Script后，会弹出一个窗口让选择脚本协议，在这里我们选择Streaming下面的WMS，如下图：

![2010-05-20_150235](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290657385.png)

4 确定后会在窗口中新开一个Lab页，该页面的左边为导航栏，标明了完成测试的5个步骤，如下图：

![2010-05-20_152114](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658818.png)

5 首先执行第一项创建脚本，在WMS中不能录制脚本所以只能手动来写了，有关WMS脚本的写法可以参考LoarRunner自带的帮助文档。点击Create Script，如下图：

![2010-05-20_150312](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658655.png)

6 在右边出现的界面中点击Script View ，如下图：

![2010-05-20_150401](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658471.png)

7 点击Srcipt View后就会出现脚本编辑区域，选择Action，在代码中添加启动WMS的代码，如下图：

![2010-05-20_150550](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658569.png)

8 脚本写好之后就需要执行第二步来验证下脚本是否正确，或是是否能和指定的WMS地址相连接。点击左边的Verify Replay，在右侧的界面中点击Start Replay，如下图：

![2010-05-20_151032](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658124.png)

9 通常会出现如下的错误，原因是在WMS的根目录（C:\wmpub\wmroot）下缺少wmload.asf文件，至于这个文件是做什么用的大家可以网上搜一下。随便找一个asf文件将名称改为wmload然后放在WMS的根目录即可。

有可能添加wmload.asf文件后仍然不成功，有两个可能的原因：

* 流媒体服务器没有默认的点播发布点，如果没有[添加默认点播发布点](http://www.cnblogs.com/oec2003/archive/2010/05/19/1739254.html)，路径只想WMS根目录。
* 默认点播发布点“拒绝新连接”了，选中“允许新连接”即可。

![2010-05-20_151115](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658097.png)

10 这些都搞定后，重新验证会出现成功的界面。

![2010-05-20_151742](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290658265.png)

11 点击上图中出现的Run-Time Settings 设置脚本的运行迭代次数等信息。

![2010-05-20_152032](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659546.png)

12 设置好迭代次数后，就可以执行第三步了，不过第三步主要是设置事务和参数的，在本例中用不上，所以直接执行第四步，点击Concurrent User 出现如下界面：

![2010-05-20_152321](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659558.png)

13 点击上图中Create Controller Scenario ，创建一个控制场景，在这之前会提示保存脚本信息，这里我们将脚本信息命名为TestWMS ，如下图：

![2010-05-20_152405](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659727.png)

14 保存好脚本信息后，会弹出一个场景设置框，可以设置虚拟用户的个数，我们设置虚拟用户为100，如下图：

![2010-05-20_152432](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659640.png)

15 点击确定后会弹出运行测试的窗口，在此窗口中点击 Edit Schedule 可以设置多用户是以什么形式并发的，如下图：

![2010-05-20_152519](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659921.png)

16 点击上图中的 Edit Schedule 出现设置窗口，如下图：

![2010-05-20_152722](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659479.png)

17 设置完成后，可以点击窗口右侧的Start Scenairo按钮开始运行测试，如下图：

![2010-05-20_152814](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659657.png)

18 测试运行完成后，点击窗口上方的分析结果按钮来查看测试结果，如下图：

![2010-05-20_152949](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290659897.png)

19 最后就可以根据结果来编写相应的测试报告了

![2010-05-20_153020](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290700441.png)

当然LoadRunner的功能远不止这些，本文只是测试WMS的一个非常简单的例子，希望对您有所帮助。

