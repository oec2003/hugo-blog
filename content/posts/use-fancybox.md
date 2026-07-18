---
title: 使用fancybox
date: 2015-12-02
categories: [技术]
tags: [fancybox, javascript, JQuery]
---

fancybox是一款不错的展示图片的jQuery插件，就目前在网上查到的资料大体有1.x和2.x两个大大版本，两个版本的用法有不少的差别，本文主要介绍的是2.1.5版本的使用。
<!--more-->
## 实现功能

fancybox功能很多，也有很多的插件，本文主要实现以下功能：

* 多图片切换
* 显示总图片数和当前浏览的图片索引数
* 图片标题可以点击，跳转到新的页面打开图片

## 代码实现

### 脚本样式引用

```
<link rel="stylesheet" type="text/css" href="fancybox/jquery.fancybox.css" />
<script src="jquery-1.8.2.min.js" type="text/javascript"></script>
<script src="fancybox/jquery.fancybox.pack.js?v=1" type="text/javascript"></script>
```

### HTML代码

```
<body>
    <h4>1、图片标题内嵌，并且可以点击 2、显示总图片数和当前数</h4>
    <p>
        <a class="fancybox" rel="group" data-fancybox-group="button" href="http://ww3.sinaimg.cn/mw690/3cefded1gw1eyl1p21s81j20xa0mctjo.jpg" title="在桂林1">
            
            <img src="http://ww3.sinaimg.cn/mw690/3cefded1gw1eyl1p21s81j20xa0mctjo.jpg"  style="width:100px;height:80px"/>
        </a>
       <a class="fancybox" rel="group" data-fancybox-group="button" href="http://ww2.sinaimg.cn/mw690/3cefded1gw1eyl1y8955tj20xa0lyq9q.jpg" title="在桂林2">
            
            <img src="http://ww2.sinaimg.cn/mw690/3cefded1gw1eyl1y8955tj20xa0lyq9q.jpg"  style="width:100px;height:80px"/>
        </a>
</p>

</body>
```

### Javascript代码

```
    $(function(){ 
        $(document).ready(function() {
            
            $(".fancybox").attr('rel', 'gallery').fancybox({
              //设置相应事件（左边从上到下依次是打开、关闭、下一个、上一个）的动画效果。可选 'elastic'、 'fade' 或 'none'。
              openEffect  : 'elastic',
              closeEffect : 'elastic', 
              nextEffect :'elastic',
              prevEffect:'elastic',
              maxWidth:1280,
              helpers:{
                //图片标题的显示方式
                title: { type:'inside' } ,
                 overlay : {
                    css : {
                        'background' : 'rgba(39,40,34,0.7)' //添加遮罩
                    }
                }
              },
              beforeShow : function() {
                this.title =' <a target="_blank" href="'+this.href+'">'+(this.title ? '' + this.title + '' : '')+'</a>  '+ (this.index + 1) + '/' + this.group.length;
               }
            });
        });
    }); 
```

## 参考

[http://www.xufukun.com/tools/fancybox2/](http://www.xufukun.com/tools/fancybox2/)
[http://www.cnblogs.com/mumutouv/p/4267408.html](http://www.cnblogs.com/mumutouv/p/4267408.html)

## 总结

fancybox还有许多的其它功能，后面再慢慢来实现，本文的例子已上传到了github上，地址：[https://github.com/oec2003/fancyboxdemo.git](https://github.com/oec2003/fancyboxdemo.git)

