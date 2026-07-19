---
title: dotNET Core WebAPI 统一处理（返回值、参数验证、异常）
date: 2019-08-21T06:28:27+08:00
categories: [技术]
tags: [dotNET Core,WebAPI]
---

现在 Web 开发比较流行前后端分离，我们的产品也是一样，前端使用Vue，后端使用 dotNet Core WebAPI ，在写 API 的过程中有很多地方需要统一处理：

<!--more-->

* 文档
* 参数验证
* 返回值
* 异常处理

本文就说说 API 的统一处理这些事。

## 环境

dotNet Core：2.1
VS For Mac：8.1

## 文档

Swagger 是一个 API 文档生成框架，在非 Core 时代就一直在使用，现在前后端分离的模式下，API 文档更是非常重要，让前端开发人员和后端开发人员能更好的沟通和合作，前端开发人员在 Swagger 可以了解到接口的地址、入参、出参，还能模拟调用，非常方便。

### 安装

在 VS For Mac 中创建 API 项目 DotNetCoreApiSample ，在依赖项中的 NuGet 上点击右键，选择添加包，如下图：

![](https://img.fwhyy.com/2022/202201280622650.webp)

搜索 `Swashbuckle.AspNetCore`，选中搜索结果的第一条，点击「添加包」按钮进行添加。

### 配置

Startup 类的 ConfigureServices 方法中添加

```
services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Swashbuckle.AspNetCore.Swagger.Info
    {
        Version = "v1",
        Title = "DotNet Core WebAPI文档"
    });

});
```

Startup 类的 Configure 方法中添加

```
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DotNet Core WebAPI文档");
});
```

### 运行效果

运行 WepAPI 项目，在浏览器中输入 `http://localhost:5000/swagger` ，效果如下

![](https://img.fwhyy.com/2022/202201280622006.webp)

## 参数验证

此处所说的参数验证指的是实体类型的参数验证，通过在实体的属性上添加特性的方式来实现。

### 简单实现

创建名为 ValidationDemoController 的 API 类，代码如下：

```
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace DotNetCoreApiSample.Controllers
{
    [Route("api/[controller]")]
    public class ValidationDemoController : Controller
    {
        [HttpPost]
       public IActionResult AddUser([FromBody]User user)
       {
            string errorMessage = string.Empty;
            if (!ModelState.IsValid)
            {
                foreach (var item in ModelState.Values)
                {
                    foreach (var error in item.Errors)
                    {
                        errorMessage += error.ErrorMessage + "|";
                    }
                }
            }
            if(!string.IsNullOrEmpty(errorMessage))
            {
                return BadRequest(errorMessage);
            }
            return Ok();
       }
    }

    public class User
    {
        [Required(ErrorMessage = "用户Code不能为空")]
        public string Code { get; set; }
        [Required(ErrorMessage = "用户名称不能为空")]
        public string Name { get; set; }
        [Required(ErrorMessage = "用户年龄不能为空")]
        [Range(1, 100, ErrorMessage = "年龄必须介于1~100之间")]
        public int Age { get; set; }
        public string Address { get; set; }
    }
}
```

* 实体类属性使用 Required 等特性需要引用命名空间System.ComponentModel.DataAnnotations
* 除了上面的 Required 和 Range 标记，还有很多实用的标记，详细参考：[https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations(v=vs.110).aspx](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations(v=vs.110).aspx)
* 上面的示例代码将错误信息的收集写在了接口方法中，这是一个很不好的做法，仅仅实现了功能，下面将通过过滤器的方式来进行重构，统一处理错误信息

### 重构

添加名为 ValidateModelAttribute 的过滤器类，继承 ActionFilterAttribute ，代码如下

```
namespace DotNetCoreApiSample.Filters
{
    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var result = context.ModelState.Keys
                        .SelectMany(key => context.ModelState[key].Errors.Select(x => new ValidationError(key, x.ErrorMessage)))
                        .ToList();
                context.Result = new ObjectResult(result);
            }
        }
    }
    public class ValidationError
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Field { get; }
        public string Message { get; }
        public ValidationError(string field, string message)
        {
            Field = field != string.Empty ? field : null;
            Message = message;
        }
    }
}
```

Startup 类的 ConfigureServices 方法中添加下面代码：

```
services.AddMvc(options =>
{
    options.Filters.Add<ValidateModelAttribute>();
});
```

使用 Postman 调用结果如下

![](https://img.fwhyy.com/2022/202201280622800.webp)


## 返回值

返回值的统一处理需要下面几个步骤：

* 创建统一返回结果的实体类，所有的接口方法都返回固定格式，方便前端统一处理
* 创建过滤器，过滤器用来拦截请求，包装结果，统一输出
* Startup 类中进行配置注册

### 结果实体类

接口的返回值需要统一的格式，下面的属性字段是我认为必须要有的

* Result：返回的结果 
* Message：出现错误或需要提示时的提示文本内容
* Code：调用成功、失败或出错时的编码
* ReturnStatus：用来判断接口调用状态的

创建返回结果的实体类 BaseResultModel

```
public class BaseResultModel
{
    public BaseResultModel(int? code = null, string message = null,
        object result = null, ReturnStatus returnStatus = ReturnStatus.Success)
    {
        this.Code = code;
        this.Result = result;
        this.Message = message;
        this.ReturnStatus = returnStatus;
    }
    public int? Code { get; set; }

    public string Message { get; set; }

    public object Result { get; set; }

    public ReturnStatus ReturnStatus { get; set; }
}
public enum ReturnStatus
{
    Success = 1,
    Fail = 0,
    ConfirmIsContinue = 2,
    Error = 3
}
```

### 过滤器类

创建名称为 ApiResultFilterAttribute 的过滤器类，该类继承 ActionFilterAttribute ，具体代码如下

```
public class ApiResultFilterAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        base.OnActionExecuting(context);
    }
    public override void OnResultExecuting(ResultExecutingContext context)
    {
        var objectResult = context.Result as ObjectResult;
        context.Result = new OkObjectResult(new BaseResultModel(code:200, result: objectResult.Value));
    }
}
```

在过滤器中将接口的返回值获取后重新包装到 BaseResultModel 模型类中进行返回。

### Startup 配置

在 Startup 类的 ConfigureServices 方法中添加如下代码

```
services.AddMvc(options =>
{
    options.Filters.Add<ValidateModelAttribute>();
    options.Filters.Add<ApiResultFilterAttribute>();
});
```

### 添加示例接口方法

```
[HttpGet]
public IActionResult GetUserCode()
{
    return Ok("oec2003");
}
```

### 运行效果

使用 Postman 调用该接口方法，返回结果如下

![](https://img.fwhyy.com/2022/202201280623599.webp)

### 继续重构参数验证

添加了返回值的过滤器类后，调用之前的参数验证的接口，会发现返回结果如下

```
{
  "code": 200,
  "message": null,
  "result": [
    {
      "field": "Age",
      "message": "年龄必须介于1~100之间"
    }
  ],
  "returnStatus": 1
}
```

接口会调用两次过滤器，先调用参数验证的过滤器，再调用返回值的过滤器，导致验证失败的接口返回值状态也是成功的，所以需要做进一步重构。

1、添加 ValidationFailedResultModel 类

```
public class ValidationFailedResultModel : BaseResultModel
{
    public ValidationFailedResultModel(ModelStateDictionary modelState)
    {
        Code = 422;
        Message = "参数不合法";
        Result = modelState.Keys
                    .SelectMany(key => modelState[key].Errors.Select(x => new ValidationError(key, x.ErrorMessage)))
                    .ToList();
        ReturnStatus = ReturnStatus.Fail;
    }
}

public class ValidationError
{
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string Field { get; }
    public string Message { get; }
    public ValidationError(string field, string message)
    {
        Field = field != string.Empty ? field : null;
        Message = message;
    }
}
```

将错误信息的收集移到了 ValidationFailedResultModel 类中，所以
ValidateModelAttribute 过滤器也需要调整。

2、修改 ValidateModelAttribute 过滤器，在修改代码之前，先要添加名为 ValidationFailedResult 的类，该类继承 ObjectResult ，用做参数验证的结果收集。

```
public class ValidationFailedResult: ObjectResult
{

    public ValidationFailedResult(ModelStateDictionary modelState)
          : base(new ValidationFailedResultModel(modelState))
    {
        StatusCode = StatusCodes.Status422UnprocessableEntity;
    }
}
```

修改 ValidateModelAttribute 类

```
public override void OnActionExecuting(ActionExecutingContext context)
{
    if (!context.ModelState.IsValid)
    {
        context.Result = new ValidationFailedResult(context.ModelState);
    }
}
```

3、修改 ApiResultFilterAttribute 过滤器，添加对 ValidationFailedResult 类型的判断

```
public override void OnResultExecuting(ResultExecutingContext context)
{
    if (context.Result is ValidationFailedResult)
    {
        var objectResult = context.Result as ObjectResult;
        context.Result = objectResult;
    }
    else
    {
        var objectResult = context.Result as ObjectResult;
        context.Result = new OkObjectResult(new BaseResultModel(code: 200, result: objectResult.Value));
    }
}
```

4、调用参数验证接口结果如下

![](https://img.fwhyy.com/2022/202201280623944.webp)

## 异常处理

异常处理和参数验证的方式基本相同，有以下几个步骤

1、创建名为 CustomExceptionResultModel 的模型类

```
public class CustomExceptionResultModel:BaseResultModel
{
    public CustomExceptionResultModel(int? code, Exception exception)
    {
        Code = code;
        Message = exception.InnerException != null ?
            exception.InnerException.Message :
            exception.Message;
        Result = exception.Message;
        ReturnStatus = ReturnStatus.Error;
    }
}
```

2、创建名为 CustomExceptionResult 的异常结果类

```
public class CustomExceptionResult:ObjectResult
{
    public CustomExceptionResult(int? code, Exception exception)
            : base(new CustomExceptionResultModel(code, exception))
    {
        StatusCode = code;
    }
}
```

3、创建名为 CustomExceptionAttribute 的异常过滤器类，继承自 IExceptionFilter

```
public class CustomExceptionAttribute : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        HttpStatusCode status = HttpStatusCode.InternalServerError;

        //处理各种异常

        context.ExceptionHandled = true;
        context.Result = new CustomExceptionResult((int)status, context.Exception);
    }
}
```

4、Startup 配置

在 Startup 类的 ConfigureServices 方法中添加如下代码

```
services.AddMvc(options =>
{
    options.Filters.Add<ValidateModelAttribute>();
    options.Filters.Add<ApiResultFilterAttribute>();
    options.Filters.Add<CustomExceptionAttribute>();
});
```

感兴趣的朋友可以在 Github 上下载示例代码进行调试。

## 总结

如果是从零开始搭建一个 WebAPI 项目，这些基础处理是必不可少的，有了这些做保障才能专注于业务代码的编写。

本文只是抛砖引玉，同样的思路我们还可以实现更多的功能，例如

* 如果某些特殊接口需要直接返回值怎么办？
* 怎样记录耗时较长的接口？
* 怎样做接口的验证？

