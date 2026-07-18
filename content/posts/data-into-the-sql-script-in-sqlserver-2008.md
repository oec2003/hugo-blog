---
title: 在SqlServer 2008中将数据导成脚本
date: 2011-03-31
categories: [技术]
tags: [sqlserver2008, 小技巧]
---

当我们想将数据库搬到另一个环境中运行时，如果数据库的版本一样我们可以直接选择附加的方式，而如果实验环境中的数据库版本比当前数据库低，就无法附加了。这时要向将数据全部导过去就需要使用脚本的方式，像Sqldbx就可以将数据库中的数据导出成脚本。本文将说下怎样直接在SqlServer 2008中将数据导出成脚本。

具体步骤：

1 打开SqlServer 2008 ，选择需要将数据导出到脚本的数据库。

![2011-03-31_102716](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290623081.png)

2 在选中数据库上右击，选择任务-》生成脚本…

![2011-03-31_102951](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290623858.png)

3 点击“生成脚本”后，弹出一个生成脚本的向导。

![2011-03-31_103235](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290623337.png)

4 点击下一步至“设置脚本编写选项”，点击高级进入到高级设置对话框，可以看到“要编写脚本数据的类型”默认是“仅限架构”。

![2011-03-31_103700](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290623298.png)

5 将“要编写脚本的数据的类型”修改为“架构和数据”。

![2011-03-31_103808](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290623038.png)

6 执行完后，可以看到脚本中多了很多的Insert语句。

![2011-03-31_104032](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290624044.png)

