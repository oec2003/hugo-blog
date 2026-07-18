---
title: dotNET：怎样处理程序中的异常（实战篇）？
date: 2020-08-03T17:38:52+08:00
categories: [技术]
tags: [dotNET Core]
---

在上篇 《dotNET：怎样处理程序中的异常（理论篇）》 中讲了一些程序中出现异常怎样处理的理论知识，本文将以代码的方式来进行实践。

<!--more-->

## 环境

* dotNET Core：3.1
* 工具：Rider 2019.3.2
* 系统：macOS 10.15.4

## 创建项目

在 Rider 中创建示例项目 ExceptionDemo ,该项目为 dotNET Core 3.1 的 WebAPI 项目，为了演示方便，不同层级以目录的方式放在了一个项目中，创建好的项目目录结构如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292133932.jpg)

* Controllers
    * UserController：操作用户的控制器
* CustomExceptions
    * UserNotFoundException：用户不存在的自定义异常类
* Filters
    * CustomerExceptionAttribute：异常结果处理过滤器
    * ResultFilterAttribute：普通结果处理过滤器
* Models
    * CustomExceptionResult：异常返回的处理类
    * CustomExceptionResultModel：异常内容的模型类
    * DataResult：普通结果的返回处理类
    * DataResultModel：普通结果的内容模型类
    * MessageResult：消息结果的返回处理类
    * MessageResultModel：消息结果的内容模型类
    * ResultModelBase：返回结果内容模型的基类
    * User：示例中用户的实体类
* Repositories
    * IUserRepository：用户操作数据库的接口
    * UserRepository：用户操作数据库的实现类
* Services
    * IUserService：用户业务层的接口
    * UserService：用户业务层的实现类

## 结果的返回

接口的返回可以归纳为三种情况：

* 正常的请求数据的返回
* 通过判断需要返回一些消息给前端进行提示
* 异常的返回

所以上面定义了 DataResult、MessageResult 和 CustomExceptionResult 相关类来进行这三种情况的封装。

这三个类都继承 ResultModelBase 类，ResultModelBase 类中只定义了 Code

```
public class ResultModelBase
{
    public int? Code { get; set; }
}
```

DataResultModel 类用属性 Data 来包装返回结果

```
public class DataResultModel:ResultModelBase
{
    public DataResultModel(object data,int? code = 200)
    {
        Code = code;
        Data = data;
    }
    
    public object Data { get; set; }
}
```

MessageResultModel 类使用属性 Message 类返回消息文本

```
public class MessageResultModel:ResultModelBase
{
    public MessageResultModel(string massage,int? code = 200)
    {
        Code = code;
        Message = massage;
    }

    public string Message { get; set; }
}
```

CustomExceptionResultModel 类中可以传入 Exception 类型和定义一些其他的相关属性

```
public class CustomExceptionResultModel:ResultModelBase
{
    public CustomExceptionResultModel(Exception exception,int? code = 500)
    {
        Code = code;
        Reason = exception.InnerException != null ?
            exception.InnerException.Message :
            exception.Message;
    }

    public string Reason { get; set; }
}
```

DataResult、MessageResult 和 CustomExceptionResult 类都是继承自ObjectResult，将相对应的 Model 类包装后通过构造函数赋值给 ObjectResult 的 Value 属性，用于最后的结果返回。

```
public class DataResult: ObjectResult
{
    public DataResult(object data , int? code=200 )
        : base(new DataResultModel(data,code))
    {
        StatusCode = 200;
    }
}
public class MessageResult:ObjectResult
{
    public MessageResult(string message, int? code=200 )
        : base(new MessageResultModel(message,code))
    {
        StatusCode = 200;
    }
}
public class CustomExceptionResult:ObjectResult
{
    public CustomExceptionResult(Exception exception,HttpStatusCode statusCode,  int? code=500 )
        : base(new CustomExceptionResultModel(exception,code))
    {
        StatusCode = (int)statusCode;
    }
}
```

使用两个过滤器对返回结果进行处理

```
public class CustomerExceptionAttribute: IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        HttpStatusCode status = HttpStatusCode.InternalServerError;

        int code = (int) status;
        //处理各种异常
        if (context.Exception is UserNotFoundException)
        {
            code = 500001;
        }
        context.Result = new CustomExceptionResult(context.Exception,status ,code);
        context.ExceptionHandled = true;
    }
}

public class ResultFilterAttribute:ActionFilterAttribute
{
    public override void OnResultExecuting(ResultExecutingContext context)
    {
        var objectResult = context.Result as ObjectResult;
        if (objectResult?.Value == null)
        {
            context.Result=new NotFoundObjectResult(new MessageResult("未找到资源"));
        }
        
        if (context.Result is MessageResult)
        {
            context.Result = new MessageResult(objectResult.Value.ToString());
        }
        else if (context.Result is OkObjectResult || context.Result is ObjectResult)
        {
            context.Result = new DataResult(objectResult.Value);
        }
    }
}
```

## 用户添加接口

在 UserRepository 中添加 AddUser 方法

```
public User AddUser(User user)
{
    int id=_users.OrderByDescending(x => x.Id).First().Id + 1;
    user.Id = id;
    _users.Add(user);

    return user;
}
```

示例中没有实际操作数据库，_users 是一个 List<User> 对象，当 _users 为 Null 或内容为空时，`_users.OrderByDescending(x => x.Id).First()` 的执行就会报错，空对象的问题在实际程序中无处不在，修改后的代码如下：

```
public User AddUser(User user)
{
    int id = 1;
    if (_users.Any())
    {
        id=_users.OrderByDescending(x => x.Id).First().Id + 1;
    }
    user.Id = id;
    _users.Add(user);

    return user;
}
```

在 Controller 层的 AddUser 方法也需要对入参实体进行检查

```
[HttpPost]
public User AddUser(User user)
{
    return _userService.AddUser(user);
}

public class User
{
    public int Id { get; set; }

    [Required(ErrorMessage = "用户名不能为空")]

    public string Name { get; set; }
    [Required(ErrorMessage = "用户编码不能为空")]
    public string Code { get; set; }
}
```

实际情况下接口层的入参实体和底层的数据实体需要分开，然后使用 AutoMapper 之类的映射工具进行转换，本示例中使用了同一个 User 。

使用 Postman 进行调用，当 Name 或 Code 为空时，结果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292133875.jpg)

默认的返回结果格式和上面定义的统一的格式有些区别，大家可以思考下，怎样使用过滤器的方式将参数验证的返回信息进行统一输出。

## 根据 Id 获取用户的名称

在 UserRepository 中有根据 Id 获取 User 对象的方法

```
public User GetUserById(int id)
{
    return _users.Find(x => x.Id == id);
}
```

在 UserService 中添加 GetUserName 方法获取名称

```
public string GetUserName(int id)
{
    User user=_userRepository.GetUserById(id);
    if (user == null)
    {
        throw new UserNotFoundException($"用户id：{id} 在数据库不存在" );
    }
    return user.Name;
}
```

当通过 id 找不到 User 对象时，可以抛出 UserNotFoundException 异常，如果只是对 user 对象进行 Null 判断然后返回一个空字符，就弄不清楚是 user 对象不存在还是用户名为空。

## 获取用户全名

下面用一个获取用户全名(包含部门)的业务来模拟异常的重新包装，部门操作的相关类就不在赘述了，可以在文章最下方的链接中查看源码。

UserController 中添加了接口方法 

```
[HttpGet("{id}")]
public string GetFullName(int id)
{
    return _userService.GetFullName(id);
}
```

UserService 中添加 GetFullName 方法

```
public string GetFullName(int id)
{
    try
    {
        User user = GetUserById(id);
        string deptName = _deptService.GetDeptName(user.ParentId);
        //处理其他逻辑
        return $"{user.Name}[{deptName}]";
    }
    catch (Exception e)
    {
        throw new UserFullNameGenException($"用户 Id 为 {id} 的 FullName 生产失败",e);
    }
}
```

* GetUserById 方法和 _deptService.GetDeptName 方法中都可能抛异常，在上次可以捕获异常然后抛出符合当前业务的 UserFullNameGenException 异常；
* 捕获的异常 e 作为 UserFullNameGenException 异常的 InnerException 传入，这样如果层级比较多，通过 InnerException 就可以追溯到最底层的原因。

当输入参数为用户不存在的时候调用结果如下：
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292135318.jpg)

当输入参数为用户的部门不存在时调用结果如下：
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292135834.jpg)

* 通过二次捕获提示的错误信息是跟当前业务有关的，可以更容易定位问题，更底一层的原因可以在 InnerException 中获取；
* 两次异常是不同原因造成的，但对于这个业务来说就是获取 FullName 失败，返回的错误码也是一致的 500100 ；
* 因为有了二次捕获，异常堆栈信息中只能定位到最上层捕获异常的地方，如果需要知道更底层的异常堆栈，可以将 InnerException 的堆栈信息进行合并。

## 最后

本文以一个简单的示例演示了代码中异常的处理，但重要的不是编码而是处理问题的思路。具体应该怎么做还是需要结合当前的上下文。希望本文对您有所帮助。

示例源码：[https://github.com/oec2003/DotNetCoreThreeAPIDemo/tree/master/ExceptionDemo](https://github.com/oec2003/DotNetCoreThreeAPIDemo/tree/master/ExceptionDemo)
