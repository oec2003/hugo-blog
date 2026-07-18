---
title: window.print()实现局部打印
date: 2008-03-06
categories: [技术]
tags: [javascript,print]
---

window.print()  实际上，是浏览器打印功能菜单的一种程序调用。与点击打印功能菜单一样，不能精确分页，不能设置纸型，套打的问题更加无从谈起，只不过，可以让用户不用去点菜单，直接点击网页中的一个按钮，或一个链接里面调用罢了。事实上，很多用户都是采用这种方式打印，但是这种方式最致命的缺点是不能设置打印参数，比如纸型，页边距，选择打印机等等。
<!--more-->

这种方法提供一个打印前和打印后的事件onbeforeprint、onafterprint。可以在打印前的时候重新编辑一些格式，专门送去打印，打印后又处理回来。

```
function window.onbeforeprint() {
    //将一些不需要打印的隐藏
    //如：document.getElementById("div1").style.display="none";
}
function window.onafterprint() {
    //放开隐藏的元素
    //如：document.getElementById("div1").style.display="none";
}
```

通过这两个方法，就可以实现页面的局部打印。



