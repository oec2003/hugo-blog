---
title: Go 学习：并发编程
date: 2022-10-17T08:21:16+08:00
categories: [技术]
tags: [golang]
---

Go 语言在创建之初，CPU 多核发展的正猛，Go 语言的创始人果断将面向多核、原生就支持并发作为了 Go 语言的设计目标之一，所以所在 Go 语言中使用并发有得天独厚的优势。

那么，什么是并发呢？

<!--more-->

聊到并发，就会有一系列的其他概念相继而来，比如：并行、进程、线程、异步等。

我们经常使用 C# 的 Winform 程序写一些工具，编译后为一个 exe 文件，文件执行后就会作为一个进程在 Windows 中执行，在之前的单核 CPU 时代，在某个时刻只能执行一个进程对应的程序代码，两个进程不存在并行执行的可能，多个处理器或多核处理器是并行执行的必要条件。

如果对程序进行改造，对执行的任务进行分解，每个分解出来的小的模块由一个单独的线程进行处理，多个线程共享这个进程所拥有的资源，线程作为执行单元可被独立调度到处理器上运行。也许还是执行在单 CPU 中，但是在并发执行的。

Go 语言的创始人 Rob Pike 曾说过：并行关乎执行，并发关乎结构。

举一个生活中的例子：

现在每天都在做的排队做核酸，有三个步骤：

1、排队；

2、扫二维码；

3、捅喉咙

![image-20221016044835822](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202210160632390.png)

* 需要做核酸的人分多个队伍进行排队，是并行在进行处理；
* 每一个队伍中只有一个检测人员，先进行扫码，然后去捅喉咙，两个步骤完成后，再进行下一个。

![image-20221016045411793](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202210160635086.png)

* 扫码和捅喉咙都有单独的人员进行处理，这就像将程序拆分成多个线程进行处理一样；
* 并发在单 CPU 也能发生，就像上图中只有一个队伍的情况，但多核或多 CPU 更多发挥其作用。

由此可见，要发挥并发的作用，离不开线程和多核，但线程创建的成本虽然已经比进程小了很多，但依然不适合创建大量的线程，因为除了每个线程占用的资源外，操作系统调度线程的成本也不小。

因此，Go 语言创造了 goroutine ，也叫协程，这是一个由 Go 运行时负责调度的轻量级线程。和常规的线程相比，有这些好处：

* 资源占用小Groutine 的 Stack 的初始化的大小为 2k ，而像 C# 、Java 语言中线程的 Stack 都是兆级别的，所以 Go 中的协程的创建会更加快；
* 由 Go 运行时调度，而不是操作系统，切换速度会更快。

在 Go 中怎样使用 goroutine 呢？非常的简单，使用关键字 go 就可以了，默认情况下，主程序在单独的一个 goroutine 中，如果某个函数或匿名函数使用了 go 关键字，那么就会创建一个单独的 goroutine 。

```go
package main

import (
	"fmt"
	"time"
)

func testGouroutine(name string) {
	fmt.Println("goroutine:", name)
}
func main() {
	fmt.Println("这是主程序")
	go testGouroutine("1")
	go testGouroutine("2")
	go testGouroutine("3")
	go testGouroutine("4")
	time.Sleep(time.Second)
}
```

如果在使用 go 关键字的函数中使用了主程序中的资源，就会出现竞争的情况，看下面的这个例子：

```go
package main

import (
	"fmt"
	"time"
)

func test() {
	counter := 0
	for i := 0; i < 5000; i++ {
		go func() {
			counter++
		}()
	}
	time.Sleep(time.Second)
	fmt.Println("counter:", counter)
}

func main() {
	test()
}
```

每次运行，counter 的值都会不一样，因为每次不同的协程队公共资源 counter 的抢夺情况不一样，要解决这个问题就要用到锁：

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func test() {
	var mut sync.Mutex

	counter := 0
	for i := 0; i < 5000; i++ {
		go func() {
			defer mut.Unlock()
			mut.Lock()
			counter++
		}()
	}
	time.Sleep(time.Second)

	fmt.Println("counter:", counter)
}

func main() {
	test()
}
```

值得注意的是，使用 go 关键字执行的函数即便是有返回值，也会被忽略，如果需要在 goroutine 之间进行通信，需要使用通道。

通道使用 make 进行构建，关键字为 chan 。看下面的例子：

```go
package main

import (
	"fmt"
	"strconv"
	"time"
)

func main() {
	//使用 make 创建一个字符型的通道，通道使用关键字 chan
	msg := make(chan string)
	//在异步匿名函数中模拟同步数据，完成一个给通道发送一个消息
	go func() {
		for i := 1; i <= 10; i++ {
			if i == 10 {
				msg <- "success"
			} else {
				msg <- "总共需要同步 10 个模块，已经处理 " + strconv.Itoa(i) + "个"
			}
			//每循环依次，演示 1 秒，模拟耗时
			time.Sleep(time.Second)
		}
	}()

	//主线程中进行进度显示
	for m := range msg {
		if m == "success" {
			fmt.Println("同步完成")
			break
		} else {
			fmt.Println(m)
		}
	}
}
```

在匿名函数中每隔一秒就给主 gorourine 发送一个消息，主 gorourine 把这个消息打印出来。

最后总结下：

1、并行关乎执行，并发关乎结构；

2、Go 语言的并发是基于轻量级的 goroutine ，相比普通的线程，goroutine 有很多的好处；

3、在不同的 goroutine 之间进行通信需要用到通道，通道使用 make 创建，关键字为 chan 。
