---
title: jQuery上传插件Uploadify使用详解
date: 2010-01-06
categories: [技术]
tags: [JQuery, Uploadify]
---

## 本文Uploadify版本为2.1.0，已经过时，截止（2016-09-25）最新版本3.2.1的详细介绍请移步《[jQuery上传插件Uploadify使用详解(3.2.1)](http://fwhyy.com/2016/09/jquery-upload-plugin-uploadify-3-2-1-use-explanation/)》

Uploadify是jQuery的一个上传插件，实现的效果非常不错，带进度显示。不过官方提供的实例时php版本的，本文将详细介绍Uploadify在Aspnet中的使用，您也可以点击下面的链接进行演示或下载。

* [官方下载](http://www.uploadify.com/download)
* [官方文档](http://www.uploadify.com/documentation)
* [官方演示](http://www.uploadify.com/demo)

首先按下面的步骤来实现一个简单的上传功能。

1 创建Web项目，命名为JQueryUploadDemo，从官网上下载最新的版本解压后添加到项目中。

2 在项目中添加UploadHandler.ashx文件用来处理文件的上传。

3 在项目图:

![2010-12-29_120720](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300722377.png)

4 Default.aspx的html页的代码修改如下：

```
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Uploadify</title>
    <link href="JS/jquery.uploadify-v2.1.0/example/css/default.css"
     rel="stylesheet" type="text/css" />
    <link href="JS/jquery.uploadify-v2.1.0/uploadify.css"
     rel="stylesheet" type="text/css" />

    <script type="text/javascript"
     src="JS/jquery.uploadify-v2.1.0/jquery-1.3.2.min.js"></script>

    <script type="text/javascript"
     src="JS/jquery.uploadify-v2.1.0/swfobject.js"></script>

    <script type="text/javascript"
   src="JS/jquery.uploadify-v2.1.0/jquery.uploadify.v2.1.0.min.js"></script>

    <script type="text/javascript">
        $(document).ready(function()
        {
            $("#uploadify").uploadify({
                'uploader': 'JS/jquery.uploadify-v2.1.0/uploadify.swf',
                'script': 'UploadHandler.ashx',
                'cancelImg': 'JS/jquery.uploadify-v2.1.0/cancel.png',
                'folder': 'UploadFile',
                'queueID': 'fileQueue',
                'auto': false,
                'multi': true
            });
        });
    </script>

</head>
<body>
    <div id="fileQueue"></div>
    <input type="file" name="uploadify" id="uploadify" />
    <p>
      <a href="javascript:$('#uploadify').uploadifyUpload()">上传</a>|
      <a href="javascript:$('#uploadify').uploadifyClearQueue()">取消上传</a>
    </p>
</body>
</html>
```

5  UploadHandler类的ProcessRequest方法代码如下：

```
public void ProcessRequest(HttpContext context)
{
    context.Response.ContentType = "text/plain";
    context.Response.Charset = "utf-8";   

    HttpPostedFile file = context.Request.Files["Filedata"];
    string  uploadPath =
        HttpContext.Current.Server.MapPath(@context.Request["folder"])+"\\";  

    if (file != null)
    {
       if (!Directory.Exists(uploadPath))
       {
           Directory.CreateDirectory(uploadPath);
       }
       file.SaveAs(uploadPath + file.FileName);
        //下面这句代码缺少的话，上传成功后上传队列的显示不会自动消失
       context.Response.Write("1");
    }
    else
    {
        context.Response.Write("0");
    }
}
```

6 运行后效果如下图：

![2010-12-29_120813](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300722966.png)

7 选择了两个文件后，点击上传，就可以看到UploadFile文件夹中会增加这两个文件。

上面简单地实现了一个上传的功能，依靠函数uploadify实现，uploadify函数的参数为json格式，可以对json对象的key值的修改来进行自定义的设置，如multi设置为true或false来控制是否可以进行多文件上传，下面就来介绍下这些key值的意思：

uploader ： uploadify.swf 文件的相对路径，该swf文件是一个带有文字BROWSE的按钮，点击后淡出打开文件对话框，默认值：uploadify.swf。

script ：   后台处理程序的相对路径 。默认值：uploadify.php

checkScript ：用来判断上传选择的文件在服务器是否存在的后台处理程序的相对路径

fileDataName ：设置一个名字，在服务器处理程序中根据该名字来取上传文件的数据。默认为Filedata

method ： 提交方式Post 或Get 默认为Post

scriptAccess ：flash脚本文件的访问模式，如果在本地测试设置为always，默认值：sameDomain
folder ： 上传文件存放的目录 。

queueID ： 文件队列的ID，该ID与存放文件队列的div的ID一致。

queueSizeLimit ： 当允许多文件生成时，设置选择文件的个数，默认值：999 。

multi ： 设置为true时可以上传多个文件。

auto ： 设置为true当选择文件后就直接上传了，为false需要点击上传按钮才上传 。

fileDesc ： 这个属性值必须设置fileExt属性后才有效，用来设置选择文件对话框中的提示文本，如设置fileDesc为“请选择rar doc pdf文件”，打开文件选择框效果如下图：

![2010-12-29_120847](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300722940.png)

fileExt ： 设置可以选择的文件的类型，格式如：’*.doc;*.pdf;*.rar’ 。

sizeLimit ： 上传文件的大小限制 。

simUploadLimit ： 允许同时上传的个数 默认值：1 。

buttonText ： 浏览按钮的文本，默认值：BROWSE 。

buttonImg ： 浏览按钮的图片的路径 。

hideButton ： 设置为true则隐藏浏览按钮的图片 。

rollover ： 值为true和false，设置为true时当鼠标移到浏览按钮上时有反转效果。

width ： 设置浏览按钮的宽度 ，默认值：110。

height ： 设置浏览按钮的高度 ，默认值：30。

wmode ： 设置该项为transparent 可以使浏览按钮的flash背景文件透明，并且flash文件会被置为页面的最高层。 默认值：opaque 。

cancelImg ：选择文件到文件队列中后的每一个文件上的关闭按钮图标，如下图：

![2010-12-29_120923](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300723549.png)

上面介绍的key值的value都为字符串或是布尔类型，比较简单，接下来要介绍的key值的value为一个函数，可以在选择文件、出错或其他一些操作的时候返回一些信息给用户。

onInit : 做一些初始化的工作。

onSelect ：选择文件时触发，该函数有三个参数

* event:事件对象。
* queueID：文件的唯一标识，由6为随机字符组成。
* fileObj：选择的文件对象，有name、size、creationDate、modificationDate、type 5个属性。

代码如下：

```
$(document).ready(function()
{
    $("#uploadify").uploadify({
        'uploader': 'JS/jquery.uploadify-v2.1.0/uploadify.swf',
        'script': 'UploadHandler.ashx',
        'cancelImg': 'JS/jquery.uploadify-v2.1.0/cancel.png',
        'folder': 'UploadFile',
        'queueID': 'fileQueue',
        'auto': false,
        'multi': true,
        'onInit':function(){alert("1");},
        'onSelect': function(e, queueId, fileObj)
        {
            alert("唯一标识:" + queueId + "\r\n" +
                  "文件名：" + fileObj.name + "\r\n" +
                  "文件大小：" + fileObj.size + "\r\n" +
                  "创建时间：" + fileObj.creationDate + "\r\n" +
                  "最后修改时间：" + fileObj.modificationDate + "\r\n" +
                  "文件类型：" + fileObj.type
            );

        }
    });
});  
```

当选择一个文件后弹出的消息如下图：

![2010-12-29_121000](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300723978.png)

onSelectOnce ：在单文件或多文件上传时，选择文件时触发。该函数有两个参数event，data，data对象有以下几个属性：

* fileCount：选择文件的总数。
* filesSelected：同时选择文件的个数，如果一次选择了3个文件该属性值为3。
* filesReplaced：如果文件队列中已经存在A和B两个文件，再次选择文件时又选择了A和B，该属性值为2。
* allBytesTotal：所有选择的文件的总大小。

onCancel : 当点击文件队列中文件的关闭按钮或点击取消上传时触发。该函数有event、queueId、fileObj、data四个参数，前三个参数同onSelect 中的三个参数，data对象有两个属性fileCount和allBytesTotal。

* fileCount：取消一个文件后，文件队列中剩余文件的个数。
* allBytesTotal：取消一个文件后，文件队列中剩余文件的大小。

onClearQueue ：当调用函数fileUploadClearQueue时触发。有event和data两个参数，同onCancel 中的两个对应参数。

onQueueFull ：当设置了queueSizeLimit并且选择的文件个数超出了queueSizeLimit的值时触发。该函数有两个参数event和queueSizeLimit。

onError ：当上传过程中发生错误时触发。该函数有event、queueId、fileObj、errorObj四个参数，其中前三个参数同上，errorObj对象有type和info两个属性。

* type：错误的类型，有三种‘HTTP’, ‘IO’, or ‘Security’
* info：错误的描述

onOpen ：点击上传时触发，如果auto设置为true则是选择文件时触发，如果有多个文件上传则遍历整个文件队列。该函数有event、queueId、fileObj三个参数，参数的解释同上。

onProgress ：点击上传时触发，如果auto设置为true则是选择文件时触发，如果有多个文件上传则遍历整个文件队列，在onOpen之后触发。该函数有event、queueId、fileObj、data四个参数，前三个参数的解释同上。data对象有四个属性percentage、bytesLoaded、allBytesLoaded、speed：

* percentage：当前完成的百分比
* bytesLoaded：当前上传的大小
* allBytesLoaded：文件队列中已经上传完的大小
* speed：上传速率 kb/s

onComplete：文件上传完成后触发。该函数有四个参数event、queueId、fileObj、response、data五个参数，前三个参数同上。response为后台处理程序返回的值，在上面的例子中为1或0，data有两个属性fileCount和speed

* fileCount：剩余没有上传完成的文件的个数。
* speed：文件上传的平均速率 kb/s

注：fileObj对象和上面讲到的有些不太一样，onComplete 的fileObj对象有个filePath属性可以取出上传文件的路径。

onAllComplete：文件队列中所有的文件上传完成后触发。该函数有event和data两个参数，data有四个属性，分别为：

* filesUploaded :上传的所有文件个数。
* errors ：出现错误的个数。
* allBytesLoaded ：所有上传文件的总大小。
* speed ：平均上传速率 kb/s

相关函数介绍

在上面的例子中已经用了uploadifyUpload和uploadifyClearQueue两个函数，除此之外还有几个函数：

uploadifySettings：可以动态修改上面介绍的那些key值，如下面代码

```
$('#uploadify').uploadifySettings('folder','JS');
```

如果上传按钮的事件写成下面这样，文件将会上传到uploadifySettings定义的目录中

```
<a href="javascript:$('#uploadify').uploadifySettings('folder','JS');
$('#uploadify').uploadifyUpload()">上传</a>
```

uploadifyCancel：该函数接受一个queueID作为参数，可以取消文件队列中指定queueID的文件。

```
$('#uploadify').uploadifyCancel(id);
```

花了一个晚上，终于写完了，对JQuery这个上传插件也基本了解了，希望对大家有所帮助，不对之处还望大家指正。

[源码下载](http://files.cnblogs.com/oec2003/JQueryUploadDemo.rar)

