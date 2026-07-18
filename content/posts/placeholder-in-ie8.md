---
title: placeholder在IE8中兼容性问题解决
date: 2014-02-12
categories: [技术]
tags: [placeholder, 兼容性]
---

placeholder是HTML5中的一个属性，可以在文本框中设置placeholder属性来显示一些提示性的文字，但对IE10以下的浏览器不支持，下面方法可以让placeholder能够使用在IE10以下的版本中。第一种方法是在页面中添加下面一段脚本：

```
<script type="text/javascript">   
  if( !('placeholder' in document.createElement('input')) ){   

    $('input[placeholder],textarea[placeholder]').each(function(){    
      var that = $(this),    
      text= that.attr('placeholder');    
      if(that.val()===""){    
        that.val(text).addClass('placeholder');    
      }    
      that.focus(function(){    
        if(that.val()===text){    
          that.val("").removeClass('placeholder');    
        }    
      })    
      .blur(function(){    
        if(that.val()===""){    
          that.val(text).addClass('placeholder');    
        }    
      })    
      .closest('form').submit(function(){    
        if(that.val() === text){    
          that.val('');    
        }    
      });    
    });    
  }   
</script>  
```

上面的方法不能支持password类型的文本框，网上找了些解决方法都不是很完美，最后发现jQuery的placeholder插件还不错，代码如下：

[https://gist.github.com/oec2003/8946120](https://gist.github.com/oec2003/8946120)

将placeholder.js文件引用到页面，页面中添加下面脚本：

```
<script type="text/javascript">
$(function() {
 $('input, textarea').placeholder();
});
</script>
```

