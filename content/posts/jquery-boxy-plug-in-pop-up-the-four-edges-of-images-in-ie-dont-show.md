---
title: jQuery boxy插件弹出框的四个边角图片在IE中不显示问题的解决
date: 2010-12-09
categories: [技术]
tags: [boxy, JQuery]
---

jQuery boxy插件很好用，但也会出现一些问题，比如弹出框的边角在IE中不能显示。本博文将来解决这个问题。将boxy插件引用到项目中后会有一个boxy.css文件和jquery.boxy.js文件。在boxy.css文件中有给弹出框设置四个角图片的样式，如下图：

![2010-12-08_232652](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300719946.png)

不做任何修改在Chrome浏览器下没有问题，如下：

![2010-12-08_234216](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300719056.png)

在网上查了一些资料，说将css文件中的图片路径给位全路径可以解决问题，如下：

![2010-12-08_234934](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300719018.png)

发现这样修改后并没有作用，运行后效果仍然如下：

![2010-12-08_235049](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300720107.png)

有效的解决方法

将上面css截图的下半部分注释掉，如下图：

![2010-12-08_235357](http://fwhyy.com/img/post/2010-12-08_235357.png)

然后在jquery.boxy.js文件中的Boxy函数中添加一段脚本，下面贴出修改后的Boxy函数代码：

```
function Boxy(element, options) {

    this.boxy = jQuery(Boxy.WRAPPER);
    jQuery.data(this.boxy[0], 'boxy', this);

    this.visible = false;
    this.options = jQuery.extend({}, Boxy.DEFAULTS, options || {});

    if (this.options.modal) {
        this.options = jQuery.extend(this.options, {center: true, draggable: false});
    }

    // options.actuator == DOM element that opened this boxy
    // association will be automatically deleted when this boxy is remove()d
    if (this.options.actuator) {
        jQuery.data(this.options.actuator, 'active.boxy', this);
    }

    this.setContent(element || "<div></div>");
    this._setupTitleBar();

    this.boxy.css('display', 'none').appendTo(document.body);
    this.toTop();

    if (this.options.fixed) {
        if (jQuery.browser.msie && jQuery.browser.version < 7) {
            this.options.fixed = false; // IE6 doesn't support fixed positioning
        } else {
            this.boxy.addClass('fixed');
        }
    }

    if (this.options.center && Boxy._u(this.options.x, this.options.y)) {
        this.center();
    } else {
        this.moveTo(
            Boxy._u(this.options.x) ? this.options.x : Boxy.DEFAULT_X,
            Boxy._u(this.options.y) ? this.options.y : Boxy.DEFAULT_Y
        );
    }

    //fengwei add 2010-11-28
    //用于解决弹出框的圆角在ie中的显示问题
    if ($.browser.msie) {
        var setFilter = function(cls) {
            var obj = $(cls), ret = obj.css("background-image").match(/url\(\"(.+)\"\)/);
            if (ret == null || ret.length < 1) return;
            obj.css({
                "background": "none", "filter": "alpha(opacity=0)",
                "filter": "progid:DXImageTransform.Microsoft.
                                             AlphaImageLoader(src='" + ret[1] + "')"
            });
        };

        setFilter(".top-left");
        setFilter(".top-right");
        setFilter(".bottom-left");
        setFilter(".bottom-right");
    }
    if (this.options.show) this.show();
};
```

修改好css和js文件后，再次运行程序，在IE6,7,8中均能正常弹出带边角的框了。

希望本文对您有所帮助。

