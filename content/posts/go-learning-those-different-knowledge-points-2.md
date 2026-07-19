---
title: Go 学习：那些不一样的知识点（下）
date: 2022-10-01T08:21:16+08:00
categories: [技术]
tags: [golang]
topic: programming-language
series_chapter: 第四章 Go 语言
series_section: 入门与语法
series_order: 430
---

在上一篇《Go 学习：那些不一样的知识点（上）》中已经提到了 10 个 Go 语言中有特点的地方，本文继续介绍一些 Go 语言中语法或使用方式比较独特的知识点。

## 11、切片类型

同 Python 一样，Go 语言中也支持切片类型，而 C# 在 C# 8 中也增加了对数组进行切片操作的语法糖，先来看一个 C# 的例子：

<!--more-->

```c#
static void Main(string[] args)
{
    var s = new string[] { "a", "b", "c","d","e","f" };
    Console.WriteLine(string.Join(",",s)); 
    //取下标 2 到 4
    var s1 = s[2..5]; 
    Console.WriteLine(string.Join(",",s1));  //输出 c,d,e
    //最后两个之前的所有元素
    var s2 = s[..^2]; 
    Console.WriteLine(string.Join(",",s2)); //输出 a,b,c,d
    //最后两个元素
    var s3 = s[^2..];
    Console.WriteLine(string.Join(",",s3)); //输出 e,f
}
```

在 Go 语言中使用 make 关键字来构建切片：

```go
package main

import (
	"fmt"
)

func main() {
	s := make([]string, 3)
	fmt.Println(s)

	s[0] = "a"
	s[1] = "b"
	s[2] = "c"
	fmt.Println(s) //输出 [a b c]

	//内容追加
	s = append(s, "d")
	s = append(s, "e", "f")
	fmt.Println(s) //输出[a b c d e f]

	//根据下标取数，下标从 0 开始计算，下面例子中是取下标为 2,3,4 的值
	l := s[2:5]
	fmt.Println(l) //输出 [c d e]
	//取下标为 0,1 的值
	l = s[:2]
	fmt.Println(l) //输出 [a b]
	//取下标为 3,4,5 的值
	l = s[3:]
	fmt.Println(l) //输出 [d e f]
}
```

## 12、range 的使用

在上一篇的示例中，遍历 map 的时候有使用过 range，而 range 的作用不仅能遍历 map ，还可以遍历数组、切片、字符串等：

```go
package main

import "fmt"

func main() {
	//遍历数组
	nums := []int{1, 2, 3, 4}
	for index, num := range nums {
		fmt.Println("下标：", index, "值：", num)
	}
	//输出
	// 下标： 0 值： 1
	// 下标： 1 值： 2
	// 下标： 2 值： 3
	// 下标： 3 值： 4

	//遍历 map
	m := map[int]string{1: "oec2003", 2: "fengwei"}
	for _, n := range m {
		fmt.Println(n)
	}
	//输出
	//oec2003
	//fengwei

	//遍历字符串
	s := "hello,oec2003!"
	for _, k := range s {
		fmt.Println(string(k))
	}
}
```

## 13、指针

上大学时学习 C 语言有学习过指针，C# 虽然也能使用指针，但不常用，而且是在有限范围内使用，C#的指针是一个持有另一类型内存地址的变量，在C#中，指针只能被声明为持有值类型和数组的内存地址，指针类型不被默认的垃圾收集机制所跟踪。

下面看看 Go 中的指针使用：

```go
package main

import "fmt"
//接收具体的数值
func useValue(num int) {
	num = 0
}
//接收指向 int 类型的指针
func usePointer(num *int) {
	*num = 0
}

func main() {
	i := 10
	useValue(i)
	fmt.Println(i)

	usePointer(&i)
	fmt.Println(i)
}

//输出结果
//10
//0

```

* 使用数值传递时，函数中对参数值进行了修改，但不会影响原值；
* 对指针类型的参数赋值时，需要添加 & 符号，表示传递的不是 i 的值，而是 i 的值对应的地址，所当函数内对这个地址的值进行修改后，原值也会发生变化。

## 14、结构体和方法

在 Go 语言中没有类的概念，取而代之的是结构体，结构体使用 struct 关键字声明：

```go
package main

import "fmt"
//定义一个名为 user 的结构体
type user struct {
	name string
	age  int
}

func main() {
	user1 := user{name: "oec2003", age: 18}
	fmt.Println(user1)
}
```

如果想在上面例子中 userInfo 结构体中添加方法，并不是写在结构体的内部，看下面的代码：

```go
package main

import (
	"fmt"
	"strconv"
)

// 定义一个名为 userInfo 的结构体
type user struct {
	name string
	age  int
}

func (u user) getUserInfo() string {
	return "姓名：" + u.name + ",年龄：" + strconv.Itoa(u.age)
}

func main() {
	user1 := user{name: "oec2003", age: 18}
	fmt.Println(user1.getUserInfo())
}
```

* 通过在定义函数的时候指定一个结构体类型的实例，就可以将函数变成结构体的方法了；
* 有点像是 .NET 中的扩展方法。

## 15、接口

在 Go 语言中，接口是非入侵性的，接口的实现不依赖接口的定义，这一点跟 C# 有很大的不同。

```go
package main

import "fmt"

// 定义一个数据库访问的接口，有一个方法返回连接字符串
type database interface {
	getConnection() string
}

// mysql 的执行器
type mysqlExecutor struct{}

// sqlserver 的执行器
type sqlserverExecutor struct{}
// 给 mysql 执行器添加方法
func (m mysqlExecutor) getConnection() string {
	return "这是 mysql 连接字符串"
}
//给 sqlserver 执行器添加方法
func (m sqlserverExecutor) getConnection() string {
	return "这是 sqlserver 连接字符串"
}

//定义一个函数获取连接字符串，参数为 database 接口类型
func getConnection(d database) string {
	return d.getConnection()
}

func main() {
	//只要是结构体中的方法有跟接口方法有相同的签名，就可以进行调用
	m := mysqlExecutor{}
	fmt.Println(getConnection(m))

	s := sqlserverExecutor{}
	fmt.Println(getConnection(s))
}

//输出
//这是 mysql 连接字符串
//这是 sqlserver 连接字符串

```

跟结构体的方法不需要结构体的内部一样，接口的实现也不要显示的声明，只需要方法的签名和接口中的方法签名相同，就算是实现了接口方法。

## 16、并发

Go 语言因为出生的比较晚，在设计之初就考虑到了并发编程的场景，并以原生支持并发著称，下面以一个简单的例子来感受下 Go 的并发：

```go
package main

import "fmt"

func sayHello(msg string) {
	for i := 0; i < 3; i++ {
		fmt.Println("hello,", msg, ":", i)
	}
}

func main() {
	//主线程调用
	sayHello("fengwei")
	//使用 go 关键字让函数异步调用，单独开启线程
	go sayHello("fengwei")
}
```

上面代码执行的结果为：

```
hello, fengwei : 0
hello, fengwei : 1
hello, fengwei : 2
```

使用 go 关键字异步调用的方法并没有打印出来，因为主线程不会等异步函数执行就会继续往下走，然后程序就运行结束了，可以在调用后 sleep 1 秒钟来让异步调用的结果能打印出来：

```go
func main() {
	//主线程调用
	sayHello("fengwei")
	//使用 go 关键字让函数异步调用，单独开启线程
	go sayHello("oec2003")
    //等待 1 秒
	time.Sleep(time.Second)
}

//输出
// hello, fengwei : 0
// hello, fengwei : 1
// hello, fengwei : 2
// hello, oec2003 : 0
// hello, oec2003 : 1
// hello, oec2003 : 2
```

上面只有一个异步函数的调用，如果有多个异步函数调用，那么这些异步函数的调用顺序是随机的，有兴趣的朋友可以自己试试看。

## 17、通道

在 Go 语言中可以很方便地使用并发，那么在并发中多个线程怎么通信，就要用到通道了。通道使用关键字 chan 定义，使用 make 类构建通道，下面代码创建了一个字符类型的通道：

```go
package main

func main() {
	//使用 make 创建一个字符型的通道，通道使用关键字 chan
	msg := make(chan string)
}
```

假设有这样一个场景：

1、用一个匿名异步函数来处理耗时操作，比如同步数据，使用通道反馈给主线程进度；

2、在主线程中实时更新进度。

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

运行效果为，每隔一秒，输出一条进度信息，全部输出完结果如下：

```
总共需要同步 10 个模块，已经处理 1个
总共需要同步 10 个模块，已经处理 2个
总共需要同步 10 个模块，已经处理 3个
总共需要同步 10 个模块，已经处理 4个
总共需要同步 10 个模块，已经处理 5个
总共需要同步 10 个模块，已经处理 6个
总共需要同步 10 个模块，已经处理 7个
总共需要同步 10 个模块，已经处理 8个
总共需要同步 10 个模块，已经处理 9个
同步完成
```

## 18、异常处理

在 Go 语言中没有 C# 中 try catch 的异常处理机制，而采用的是使用返回值的判断，Go 语言的一些内置函数就是使用多返回值来处理异常，比如：strconv.Atoi ，看下面的例子：

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	age := "oec2003"
	age1, err := strconv.Atoi(age)
	if err != nil {
		fmt.Println("转换出错，错误信息：", err)
	} else {
		fmt.Println("转换成功，值为：", age1)
	}
}
```

当 age 的值不是数字的时候，就会打印出错误：

```
转换出错，错误信息： strconv.Atoi: parsing "oec2003": invalid syntax
```

我们自定义的函数也可以通过多返回值的方式来返回错误：

```go
package main

import (
	"errors"
	"fmt"
)

// 返回值的第二个参数为 error
func division(a int, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("除数不能为 0")
	}

	return a / b, nil
}
func main() {
	result, err := division(2, 0)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(result)
	}
}
```

## 总结

到这，Go 语言的学习应该就算是入门了，接着可以针对 Go 的并发进行深入研究，还可以学习下在 Go 语言中是怎么使用面向对象编程的？怎样进行数据库的操作？一些常用库是如何使用的？

然后拿 Go 语言去做一些实际的小项目，比如：SSG 类型的博客系统、容器的发布部署系统等等。在实际项目的过程中，不断地解决问题，慢慢就可以从入门变成熟悉了 。

希望本文对您有所帮助。
