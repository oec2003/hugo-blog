---
title: 在批处理文件中启动MediaPlayer播放制定文件
date: 2010-05-05
categories: [技术]
tags: [WMS, 发布点]
---

我们知道在运行可以使用wmplayer指令来启动一个MediaPlayer，如果需要让MediaPlayer播放制定的文件或是一个制定的流媒体发布点，我们可以使用如下的命令格式

```
wmplayer “mms://WIN-FW.MiGu.com/12530”
wmplayer “C:\wmpub\wmroot\legacy_content_clip.wmv”
```

但是在运行中来执行命令需要手动去控制，如果将命令写到批处理文件中，就可以通过计划任务等一些手段来动态控制它的执行。

做批处理文件非常简单，将文本文件的后缀改成bat即可，然后保存上面的内容在文件中，双击就可以执行。不过此时双击会发现并不能启动MediaPlayer，因为缺少了一个步骤。只需将C:\Program Files (x86)\Windows Media Player目录下的wmplayer.exe文件复制到C:\Windows\System32目录下即可。

注:上面的路径C:\Program Files (x86)\Windows Media Player为64位系统下的路径，如果是32位系统则为C:\Program Files\Windows Media Player

