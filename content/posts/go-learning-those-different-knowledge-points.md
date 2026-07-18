---
title: Go 学习：那些不一样的知识点（上）
date: 2022-09-26T08:20:20+08:00
categories: [技术]
tags: [golang]
---

在学习 Go 语言的过程中，会涉及到语法、数据结构、和一些 Go 特有的东西，其中有不少现在还印象深刻，本文就说说 Go 语言中那些不一样的地方。

<!--more-->

## 1、变量和函数的声明

```go
package main

import "fmt"

func main() {
	var name string //使用 var 关键字定义一个名为 name 的字符串类型变量
	name = "oec2003" //给变量赋值

	age:=18 //使用 := 来定义变量，会自动进行类型推导，这种方式也是常用的方式

	fmt.Println(name,age)
}
```

上面示例是变量的声明方式，可以看到跟 C# 不同的是，类型是写在变量名之后的，而在 Go 中的函数也遵循这个原则：

```go
func getName(name string) string {
	return "hello," + name
}
```

* 函数的定义使用 func 关键字；
* 参数也是类型写在了参数名的后面；
* 函数的返回值写在了方法名的后面

## 2、不支持类型的隐式转换

为了提高代码的可读性和避免一些隐藏的错误，在 Go 中不支持类型的隐式转换。

在 C# 中下面的代码可以正常编译和运行：

```c#
static void Main(string[] args)
{
    int a = 18;
    long b = a;
    Console.WriteLine(b);
}
```

而在 Go 中下面的代码是会有编译错误的：

```go
func main() {
	var a int16=10
	var b int32=a
	fmt.Println(b)
}
```

int16 和 int32 之间不能隐式转换，只能进行显示转换，如下：

```go
func main() {
	var a int16 = 10
	var b int32 = int32(a)
	fmt.Println(b)
}
```

## 3、运算符

为了提高生产力，避免在语言中犯错，Go 有很强的约束性，不支持前置 ++ 和 -- ：

```
func main() {
	a:=10
	a++ //可以支持后置 ++ 和 --
	++a //不支持前置 ++ 和 --
}
```

对数组的比较和 C# 也有区别，比如在 C# 中比较两个长度相同、值相同的数组，返回的是 False ：

```c#
static void Main(string[] args)
{
    int[] a = new[] {1, 2, 3};
    int[] b = new[] {1, 2, 3};
    Console.WriteLine(a==b); // 返回 False
}
```

但在 Go 中会有不一样的结果：

```go
func main() {
	a := [...]int{1, 2, 3, 4}
	b := [...]int{1, 2, 3, 4}
	fmt.Println(a == b) // 长度相同、内容相同、值顺序相同 返回 ture

	b = [...]int{1, 2, 3, 5}
	fmt.Println(a == b) // 长度不同 返回 false

	b = [...]int{1, 2, 4, 3}
	fmt.Println(a == b) // 长度相同、内容相同、值顺序不相同 返回 false
}
```

## 4、map 的值可以是一个函数

Go 中的 map 和 C# 中的 Dictionary 有点像，map 的值可以是普通的数据类型外，也可以是一个函数:

```go
package main

import (
	"fmt"
)

func aa(num int) int {
	return num * num
}
func main() {
	m := map[int]func(a int, b int) int{}
	m[1] = func(a int, b int) int { return a + b }
	m[2] = func(a int, b int) int { return a - b }
	m[3] = func(a int, b int) int { return a * b }
	m[4] = func(a int, b int) int { return a * b }

	m[1](12, 3)
	for _, f := range m {
		fmt.Println(f(12, 3))
	}
}

//运行结果如下：
15
9
36
36
```

## 5、条件判断

在 Go 中的条件判断也有 if 和 switch 两种。

if 可以支持在条件的表达式中进行变量赋值：

```go
func main() {
	m := map[int]string{1: "oec2003", 2: "fengwei"}
	if v, isExist := m[2]; isExist {
		fmt.Println(v)
	} else {
		fmt.Println("不存在")
	}
}
```

*  if 后的表达式分成了两段，第一段对变量进行赋值；第二段进行条件的判断，两段之间用分号分隔；
* 第二段的条件判断必须返回布尔值。

switch 的使用也有些不一样的地方：

* 单个 case 中可以支持多个值，用逗号分隔；
* 不需要显示添加 break 来退出 case；
* switch 后可以不加任何表达式，就跟 if 类似了。

```go
func main() {
	switch os := runtime.GOOS; os {
	case "darwin":
		fmt.Println("system is mac")
	case "linux":
		fmt.Println("system is linux")
	default:
		fmt.Println("其他")
	}
}

//类似 if else
name:="oec2003"
switch{
    case name=="oec2003":
    fmt.Println("name is oec2003")
    default:
    fmt.Println("name is undefine")
}

//case 后面支持多个值
name := "fengwei"
switch name {
    case "oec2003", "fengwei":
    fmt.Println("都是我的名字")
    default:
    fmt.Println("不认识")
}
```

## 6、循环

在 Go 语言中，关键字非常少，因此，循环处理只有一个关键字 for  

```go
//相当于 C# 中的 while
n := 0
for n < 5 {
    fmt.Println(n)
    n++
}
//相当于 C#中的 while(true)
for{
    fmt.Println("这是一个死循环")
}
// 相当于 C# 中的正常的 for
for i := 0; i < 10; i++ {
    fmt.Println(i)
}
// 相当于 C# 中的 foreach
a := [...]int{1, 2, 3, 4}
for v := range a {
    fmt.Println(v)
}
```
* 上面使用一个关键字包含了 C# 中所有遍历的方式；
* for 后面的表达式不需要写括号。

## 7、特别的 main 函数

一个简单完整的 Go 程序如下所示：

```go
package main

import "fmt"

func main() {
	fmt.Println("hello oec2003!")
}
```

可以看出 Go 的 main 函数没有返回值和参数，如果需要在 main 函数中使用参数，需要引入 os 包：

```go
package main

import (
	"fmt"
	"os"
)

func main() {
    if len(os.Args) > 1 {
        //这里需要注意，第一个参数下标为 1
        fmt.Println("hello", os.Args[1])
	}
    
    //遍历所有的参数
	for _, arg := range os.Args {
		fmt.Println(arg)
	}
}
```

* os.Args 是一个字符串的数组；
* 使用 range 可以用来遍历数组；
* 在 for中使用 _ 可以忽略第一个参数。

## 8、初始化函数

我们知道在 Go 语言中，main 函数是程序的入口函数，但 main 函数并不是第一个执行的函数，在 main 之前还有 init 函数会先被执行，在 init 函数中可以做一些初始化的工作：

```go
package main

import (
	"fmt"
)

func init() {
	fmt.Println("在这里做初始化工作")
}
func main() {
	fmt.Println("程序开始执行")
}
```

## 9、函数支持多返回值

在 C# 中函数支持多返回值的方式有很多种，比如：返回一个对象、参数使用 out ，还有就是在 C# 7.0 添加的新功能元组，下面为 C# 中用元组的方式返回多值：

```c#
class Program
{ 
    static void Main(string[] args)
    {
        var userInfo = GetUserInfo();
        var name = userInfo.name;
        var age = userInfo.age;

        Console.WriteLine(name+age);
    }
    static (string name, int age) GetUserInfo()
    {
    	return ("oec2003", 18);
    }
}
```

Go 语言的函数多返回值和 C# 的元组的方式比较像：

```go
package main

import (
	"fmt"
)

func getUserInfo() (string, int) {
	return "oec2003", 18
}

func main() {
	name, age := getUserInfo()
	fmt.Println(name, age)
}
```

在接收值时，如果某些值不需要，可以使用 _ 进行忽略：

```go
func getUserInfo() (string, int) {
	return "oec2003", 18
}

func main() {
	name,_ := getUserInfo()
	fmt.Println(name)
}
```

## 10、函数延迟执行

在 Go 中使用 defer 关键字可以让函数延迟执行，可以用来做释放资源，释放锁等，先看下面的代码，

clear 函数前面添加了 defer 关键字，虽然在第 main 函数第一行，但会最后调用：

```go
package main

import (
	"fmt"
)

func clear() {
	fmt.Println("清理资源")
}

func main() {
	defer clear()
	fmt.Println("程序开始")
}

//程序执行结果为
程序开始
清理资源
```

使用 panic 使程序崩溃，会发现被 defer 定义的函数依然会在最后执行：

```go
package main

import (
	"fmt"
)

func clear() {
	fmt.Println("清理资源")
}

func main() {
	defer clear()
	fmt.Println("程序开始")
	panic("程序崩溃啦")
}

程序开始
清理资源
panic: 程序崩溃啦
```

这有点像是在 C# 中使用 try catch ，异常捕获之后，finally 块中的代码还是会被执行，我认为 Go 语言的这种处理更加灵活，以组合的方式来达到目的，这也符合 Go 语言的设计哲学。
