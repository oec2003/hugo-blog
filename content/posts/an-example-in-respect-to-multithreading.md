---
title: 关于多线程的一个例子（UI实时显示）
date: 2009-12-20
categories: [技术]
tags: [C#,多线程]
---

在开发Window应用程序的时候，经常需要在界面上显示出已经执行到什么步骤了，拿一个简单例子来说，创建一个Winform程序，在窗体上访一个Button和一个Label，点击Button时做100次循环，在Label上实时显示当前循环的次数。一种简单的做法就是使用Application.DoEvents，代码如下：

```
private void btnTest_Click(object sender, EventArgs e)
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        label1.Text = i + "/100";
        Application.DoEvents();
    }
}
```

上面的代码如果将Application.DoEvents();去掉当点击Button时，程序会卡住，直到这个循环执行完成，当这个循环足够大时是不能忍受的。不过小数据量用Application.DoEvents()还行，数据量大了使用Application.DoEvents()就会带来性能的问题。所以Application.DoEvents()要慎用，在大数据量的时候可以使用多线程解决。如下：

```
private void btnTest_Click(object sender, EventArgs e)
{
    Thread thread = new Thread(new ThreadStart(DoWork));
    thread.Start();
}
private void DoWork()
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        label1.Text = i + "/100";
    }
}
```

嗯？出现异常了是吧，没错上面的代码运行后后会出现“线程间操作无效: 从不是创建控件“label1”的线程访问它。”的异常。关于什么原因造成的，大家可以google一下。不过上面代码在vs03中貌似可以正常运行。将代码改成下面这样就可以正常运行了：

```
private void btnTest_Click(object sender, EventArgs e)
{
    Thread thread = new Thread(new ThreadStart(DoWork));
    thread.Start();
}
private void DoWork()
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        this.Invoke(new Action<string>(this.ChangeLabel),i.ToString());
    }
}
private void ChangeLabel(string i)
{
    label1.Text = i + "/100";
}
```

如果嫌多写一个ChangeLabel方法费事，可以写成匿名方法的形式，如下：

```
private void btnTest_Click(object sender, EventArgs e)
{
    Thread thread = new Thread(new ThreadStart(DoWork));
    thread.Start();
}
private void DoWork()
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        this.Invoke(new Action(delegate(){label1.Text=i+"/100";}));
    }
}
```

同样可以使用匿名方法的方式将DoWork方法也去掉：

```
private void btnTest_Click(object sender, EventArgs e)
{
    Thread thread = new Thread(new ThreadStart(delegate() {
        for (int i = 0; i < 100; i++)
        {
            Thread.Sleep(100);
            this.Invoke(new Action(delegate() { label1.Text = i + "/100"; }));
        }
    }));
    thread.Start();
}
```

如果想传参数到Dowork方法中，那么就不能使用ThreadStart类了，应该使用ParameterizedThreadStart类，如下：

```
private void btnTest_Click(object sender, EventArgs e)
{
    string name = "oec2003";
    Thread thread = new Thread(new ParameterizedThreadStart(DoWork));
    thread.Start(name);
}
private void DoWork(object name)
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        this.Invoke(new Action(delegate(){label1.Text=name+":"+ i+"/100";}));
    }
}
```

同样我们也可以使用线程池的方式来实现

```
private void btnTest_Click(object sender, EventArgs e)
{
    ThreadPool.QueueUserWorkItem(new WaitCallback(DoWork));
}
private void DoWork(object o)
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        this.Invoke(new Action(delegate(){label1.Text=i+"/100";}));
    }
}
```

使用匿名方法的方式：

```
private void btnTest_Click(object sender, EventArgs e)
{
    ThreadPool.QueueUserWorkItem(new WaitCallback(delegate(object o)
    {
        for (int i = 0; i < 100; i++)
        {
            Thread.Sleep(100);
            this.Invoke(new Action(delegate() { label1.Text = i + "/100"; }));
        }
    }));
}
```

平时做Windows应用程序很少，对多线程理解也不是特别深入，有什么不对的地方往大家指正。

