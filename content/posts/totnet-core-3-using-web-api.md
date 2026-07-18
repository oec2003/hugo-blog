---
title: dotNET Core 3.X 使用 Web API
date: 2020-04-01T06:48:56+08:00
categories: [技术]
tags: [dotNetCore]
---

现在的 Web 开发大多都是前后端分离的方式，后端接口的正确使用显得尤为重要，本文讲下在 dotNET Core 3.X 下使用 Web API 。

<!--more-->

## 环境 

* 操作系统：Mac
* IDE：Rider
* dotNET Core：3.1

## 创建项目

如果是 Windows 操作系统当然是首选 VS2019 ，在 Mac 中虽然也有 VS2019 For Mac，但还是感觉 Rider 比较好用（调试和智能提示），在 Rider 中创建 Web API 项目：

![iShot2022-01-30 21.23.09](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135152.jpg)

## 3.x 和 2.x 区别

1、Program 类的 IWebHostBuilder 修改为了 IHostBuilder，这一块的改动如果是直接使用3.x可以不用过于关心，如果是从 2.x升级到3.x，就要注意了，对比结果如下图：

![iShot2022-01-30 21.25.02](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135694.jpg)

2、Startup 类的区别如下图：

![iShot2022-01-30 21.25.32](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135068.jpg)

最重要的还是在 3.x 中使用的是 services.AddControllers(); 来注册服务，相比较 2.x 中的 services.AddMvc() 更加轻量级，因为在 AddMvc 方法中添加了很多 WebAPI 不需要的功能，如下图：

![iShot2022-01-30 21.26.13](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135487.jpg)

3、3.x 引入了新的JSON API,新的JSON API使用更少的内存，拥有更快的执行速度,引用 `using System.Text.Json;` 就可以使用，如果需要使用原来的功能，需要引入 Nuget包：`Microsoft.AspNetCore.Mvc.NewtonsoftJson`

另：

* 有关 3.x 中被删除的程序集可以参考这里：[https://github.com/dotnet/aspnetcore/issues/3755](https://github.com/dotnet/aspnetcore/issues/3755)

* 有关 3.x 中性能提升可以参考这篇文章：[https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-core-3-0/](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-core-3-0/)


## [ApiController] 特性

在 3.x 中默认项目模板中会创建的一个名为 WeatherForecastController 的控制器，按照约束控制器类以 Controller 结尾。

![iShot2022-01-30 21.26.31](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135419.jpg)

可以看到在 WeatherForecastController 类的上面自动添加了 [ApiController] 特性，添加此特性后，会对 Api 功能有所加持，比如：

### 自动模型状态验证

意思是当客户端传递的模型数据不符合要求时，在接口方法中不需要做任何处理，接口会自动返回 `400` 的错误,看下面的例子：

1、创建 UserController 类，先将 [ApiController] 特性注释掉；
2、添加 User 类，将 Name 属性设置为 Required；

```
public class User
{
    [Required]
    public  string Name { get; set; }
    public string Code { get; set; }
}
```
3、在 UserController 类中添加 AddUser 方法

```
[HttpPost]
[Route("adduser")]
public ActionResult AddUser(User user)
{    
	return Ok();
}
```

4、使用 Postman 调用，没有添加任何参数，返回的结果为 200

![iShot2022-01-30 21.27.00](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135285.jpg)

这个结果不是我们所期望的，之前没有 [ApiController] 特性的时候，需要在接口方法中处理，如下：

```
[HttpPost]
[Route("adduser")]
public ActionResult AddUser(User user)
{
    if (!ModelState.IsValid)
    {
        return BadRequest((ModelState));
    }
    return Ok();
}
```

5、再用 Postman 调用，结果如下：

![iShot2022-01-30 21.27.22](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135553.jpg)

6、现在添加上 [ApiController] 特性，并将 AddUser 中的校验逻辑去掉，再次使用 Postman，结果如下：

![iShot2022-01-30 21.27.43](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302135830.jpg)

### 推断参数绑定源

之前需要在参数上添加 [FromBody]、[FromQuery]等特性，现在可以去掉这些特性，系统会自动推断参数的来源，比如：如果一个参数在 Route 里面定义了，会自动从先从Path 查找，没找到会从查询参数上查找然后进行绑定。

### 错误状态码详细信息

之前的版本中，如果接口返回一个 BadRequest，是没有内容的，只有状态码，如下：

![iShot2022-01-30 21.28.05](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136771.jpg)

加上 [ApiController] 特性后，结果如下：

![iShot2022-01-30 21.28.30](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136511.jpg)

## 基类

在 3.x 中创建控制器后，默认的基类为 ControllerBase ，该类中提供了 OK、BadRequest 等常用方法给我们使用。

在我们实际开发中，通常会自定义添加一个所有  Controller 类的基础类，一些通用的功能可以放到基类中，比如，对 AutoMapper 的注入，代码如下：

```
public class BaseController: ControllerBase
{
    private readonly IMapper _mapper;
    public BaseController(IMapper mapper)
    {
        _mapper = mapper;
    }

    public IMapper Mapper => _mapper;
}
```

## HTTP 方法

先看下面这张图

![iShot2022-01-30 21.28.59](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136111.jpg)

按照标准的 RESTful Web API 风格，不同的请求动作需要使用相对应的方法，但实际我们最常用的是 GET 和 POST，查询使用 GET，其他的操作都是使用 POST。

## HTTP 状态码

正确的返回状态码有助于客户端分析请求返回结果和问题排查，常用的状态码如下：

![iShot2022-01-30 21.29.20](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136739.jpg)

常见的一个问题：由于客户端参数的问题，导致接口代码中执行异常了，最终返回了 500，导致排查问题非常复杂，还需要还原问题场景下的数据和入参。正确的做法应该是对参数做相关校验最终返回相应的 4XX 的状态码。

## 输入参数

### 模型绑定

接口的输入参数就是通过模型绑定将 HTTP 请求中的值映射到参数中，模型绑定有以下六种：

* [FromRoute]：通过路由的 URL 中取值，可以自动推断；
* [FromQuery]：获取 URL 地址中的参数，可以自动推断；
* [FromBody]：从HTTP Body取值，通常用于取JSON, XML，可以自动推断；
* [FromHeader]：获取 Request Header 中的参数信息，需要指定
* [FromForm]：获取 Content-Type 为 multipart/form-data 或 application/x-www-form-urlencoded 类型的参数，需要指定
* [FromServices]：获取依赖注入的参数，依赖注入默认是使用构造函数注入，但Controller 可能会因为每个Action用到不一样的 Service 导致很多参数，所以也可以在 Action 注入Service，需要指定。

下面实现一个使用 [FromServices] 的示例：

1、创建 IUserService 接口和 UserService 类，代码如下：

```
public interface IUserService
{
	string GetUserName(string userId);
}
public class UserService:IUserService
{
    public string GetUserName(string userId)
    {
        return $"UserName:{userId}";
    }
}
```

2、在 Startup 类的 ConfigureServices 方法中添加下面代码进行注册

```
services.AddScoped<IUserService,UserService>();
```

3、添加 UserController 类，里面添加名为 GetUserName 的 Action 方法

```
[HttpGet]

public ActionResult<string> GetUserName(string userId, 						[FromServices]IUserService userService)
{
    return Ok($"{userService.GetUserName(userId)}");
}
```

4、执行结果如下：

![iShot2022-01-30 21.29.41](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136167.jpg)


### 参数验证

参数验证是非常重要的，否则本来是 4XX 的问题就会变成 5XX 的问题，参数验证有这么几种：

* Data Annotations
* 自定义 Attribute
* 实现 IValitableObject 接口
* 使用第三方的验证库，比如 FluentValidation

#### Data Annotations

1、在 User 的实体类上添加相关特性

```
public class User
{
    [Required(ErrorMessage = "姓名不能为空")]
    public string  Name { get; set; }
    
    [EmailAddress(ErrorMessage = "邮件格式不正确")]
    public string  Email { get; set; }
}
```

2、调用结果如下：

![iShot2022-01-30 21.30.44](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136159.jpg)

有关更多的 Data Annotations 特性的使用，可以参考官方文档：[https://docs.microsoft.com/en-us/dotnet/api/system.componentmodel.dataannotations?view=netcore-3.1](https://docs.microsoft.com/en-us/dotnet/api/system.componentmodel.dataannotations?view=netcore-3.1)

#### IValitableObject 接口

1、将 User 类继承 IValitableObject 接口，并实现 Validate 方法，代码如下：

```
public class User: IValidatableObject
{
    [Required(ErrorMessage = "姓名不能为空")]
    public string  Name { get; set; }
    
    [EmailAddress(ErrorMessage = "邮件格式不正确")]
    public string  Email { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Name == Email)
        {
            yield return new ValidationResult("名称不能和邮箱相等",
                new []{nameof(Name),nameof(Email)});
        }
    }
}
```

2、调用结果如下：

![iShot2022-01-30 21.32.01](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136176.jpg)

#### 自定义 Attribute

自定义 Attribute 功能和IValitableObject 接口类似，但可以作用于类级别也能用于属性级别，更加灵活。

1、创建 NameNotEqualEmailAttribute 类，用来实现判断 User 类中的名称和邮箱不能相等

```
public class NameNotEqualEmailAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, 
        ValidationContext validationContext)
    {
        var user = validationContext.ObjectInstance as User;
        if (user.Name == user.Email)
        {
            return new ValidationResult("名称不能和邮箱相等",
                new []{nameof(User)});
        }
        return ValidationResult.Success;
        
    }
}
```

2、在 User 类上添加此特性

```
[NameNotEqualEmail]
public class User
{
    [Required(ErrorMessage = "姓名不能为空")]
    public string  Name { get; set; }
    
    [EmailAddress(ErrorMessage = "邮件格式不正确")]
    public string  Email { get; set; }
}
```

3、调用结果如下：

![iShot2022-01-30 21.32.20](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136609.jpg)

#### FluentValidation

FluentValidation 就不多做介绍了，可以参见官方文档：[https://fluentvalidation.net/](https://fluentvalidation.net/)

### ModelBinder

ModelBinder 是自定义模型绑定器，可以对入参的类型进行一些转换，比如，参数中传递 001,002 这样的字符串，在接口中使用 IEnumerable<string> 来进行接收。

1、创建 StringToListModelBinder 类，如下：

```
public class StringToListModelBinder: IModelBinder
{
public Task BindModelAsync(ModelBindingContext bindingContext)
{
    if (!bindingContext.ModelMetadata.IsEnumerableType)
    {
        bindingContext.Result = ModelBindingResult.Failed();
        return Task.CompletedTask;
    }

    var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).ToString();
    if (string.IsNullOrWhiteSpace(value))
    {
        bindingContext.Result = ModelBindingResult.Success(null);
        return Task.CompletedTask;
    }

    var elementType = bindingContext.ModelType.GetTypeInfo().GenericTypeArguments[0];
    var converter = TypeDescriptor.GetConverter(elementType);

    var values = value.Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries)
        .Select(x => converter.ConvertFromString(x.Trim())).ToArray();
    
    var typedValues = Array.CreateInstance(elementType, values.Length);
    
    values.CopyTo(typedValues,0);

    bindingContext.Model = typedValues;
    
    bindingContext.Result = ModelBindingResult.Success(bindingContext.Model);
    return Task.CompletedTask;
}
```

2、在 UserController 类中创建 GetUsersByIds 方法

```
[HttpGet("ids")]
public ActionResult<List<User>> GetUsersByIds(
    [ModelBinder(BinderType = typeof(StringToListModelBinder))]IEnumerable<string> ids)
{
    if (ids == null)
    {
        return BadRequest();
    }

    return Ok();

}
```

3、调用结果

![iShot2022-01-30 21.32.42](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302136740.jpg)


## 返回值

### 返回 XML 格式

尽管使用 Web API 通常都是使用 JSON 格式，但有些时候需要返回 XML 格式，默认情况下，即使请求头中添加了 Accept=application/xml，接口依然会返回 JSON 格式的结果，想要返回 XML 格式，修改 Startup 类的 ConfigureServices 方法即可。

```
services.AddControllers().AddXmlDataContractSerializerFormatters();
```

结果如下：

![iShot2022-01-30 21.33.12](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302137439.jpg)

### 错误信息统一返回

之前的文章中有讲过使用过滤器的方式来做到结果的统一返回。这里介绍另一种方式，使用 ConfigureApiBehaviorOptions ，可以让我们自定义错误信息的返回内容和格式。修改 Startup 类中的 ConfigureServices 方法

```
services.AddControllers()
            .AddXmlDataContractSerializerFormatters()
            .ConfigureApiBehaviorOptions(setup =>
            {
                setup.InvalidModelStateResponseFactory = context =>
                {
                    var details = new ValidationProblemDetails(context.ModelState)
                    {
                        Type = "http://api.oec2003.com/help",
                        Title = "实体验证错误",
                        Status = StatusCodes.Status422UnprocessableEntity,
                        Detail = "看详细",
                        Instance = context.HttpContext.Request.Path,
                    };
                    details.Extensions.Add("trachid",context.HttpContext.TraceIdentifier);

                    return new UnprocessableEntityObjectResult(details)
                    {
                        ContentTypes = { "application/problem+json" }
                    };
                };
            });
```

当出现验证问题时，结果如下：

![iShot2022-01-30 21.33.33](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302137273.jpg)

更多详细信息可以看文档：[https://docs.microsoft.com/zh-cn/aspnet/core/web-api/handle-errors?view=aspnetcore-3.1](https://docs.microsoft.com/zh-cn/aspnet/core/web-api/handle-errors?view=aspnetcore-3.1)

### 数据塑形

在 API 中返回结果到前端时，一般不会直接将底层的 Entity 返回，会创建相对应的 Dto，比如，用户的 Entity 是这样的

```
public class User
{
    public string  Name { get; set; }

    public string  Email { get; set; }

    public string  Password { get; set; }
}
```

创建 User 的 Dto 类 UserDto，如下

```
public class UserDto
{
    public string  Name { get; set; }

    public string  Email { get; set; }

}
```

在接口的 Action 方法中使用 AutoMapper 做下转换

```
[HttpGet("{userId}")]
public ActionResult<UserDto> GetUserById(string userId)
{
    User user = new User()
    {
        Name = "oec2003",
        Email = "oec2003@qq.com",
        Password = "123456"
    };
    return Ok(base.Mapper.Map<UserDto>(user));
}
```

请求结果如下

![iShot2022-01-30 21.33.56](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302137436.jpg)

同样的接口在前端不同的场景下需要返回不一样的字段数据，一种方式是创建很多不同的接口，返回不同的 Dto 的结果，但这样做非常繁琐，可以通过 ExpandoObject 来实现按客户端的需要进行返回结果，具体步骤如下：

1、因为获取用户列表的接口方法的是 List<User> ,所以先创建一个 IEnumerable 的扩展方法，该扩展方法用于根据传进的字段参数来组装返回的结果，代码如下：

```
public static class IEnumerableExtension
{
    public static IEnumerable<ExpandoObject> GetData<T>
        (this IEnumerable<T> source, string fields)
    {
        if (source == null)
        {
            throw new ArgumentNullException(nameof(source));
        }
        
        var objectList = new List<ExpandoObject>(source.Count());
        var propertyInfoList = new List<PropertyInfo>();

        if (string.IsNullOrWhiteSpace(fields))
        {
            var propertyInfos = typeof(T).GetProperties(BindingFlags.Public |
                                                        BindingFlags.Instance);
            propertyInfoList.AddRange(propertyInfos);
        }
        else
        {
            var fieldSplit = fields.Split(',');
            foreach (var field in fieldSplit)
            {
                var propertyName = field.Trim();
                var propertyInfo = typeof(T).GetProperty(propertyName,
                    BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                if (propertyInfo == null)
                {
                    throw  new Exception($"属性名：{propertyName} 没有找到");
                }

                propertyInfoList.Add(propertyInfo);
            }
        }

        foreach (T t in source)
        {
            var obj=new ExpandoObject();
            foreach (var propertyInfo in propertyInfoList)
            {
                var value = propertyInfo.GetValue(t);
                ((IDictionary<string, object>) obj).Add(propertyInfo.Name, value);
            }
            objectList.Add(obj);
        }
        return objectList;
    }
}
```

2、创建获取用户列表的 Action 方法

```
[HttpGet]
public ActionResult GetUsers([FromBody]string fields)
{
    var userList =new List<User>() 
    {
        new User(){ Name = "oec2003",Email = "oec2003@qq.com",Password = "123456"},
        new User(){ Name = "oec2004",Email = "oec2004@qq.com",Password = "123456"},
        new User(){ Name = "oec2004",Email = "oec2004@qq.com",Password = "123456"}
    };
    var returnResult = base.Mapper.Map<List<UserDto>>(userList);
    //使用扩展方法按需获取
    return Ok(returnResult.GetData(fields));
}
```

3、查看调用结果

返回一个属性 Name

![iShot2022-01-30 21.34.19](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302137830.jpg)

返回所有

![iShot2022-01-30 21.34.37](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302137999.jpg)

## 最后

本文只是涉及了在 Web API 中比较常用的一些功能点，限于篇幅，每个点并没有写的非常深入，也较少涉及原理，但我们在学习过程中，除了实现效果外还应该深入去了解其中细节和原理。

文中示例代码：[https://github.com/oec2003/DotNetCoreThreeAPIDemo](https://github.com/oec2003/DotNetCoreThreeAPIDemo)

希望本文对您有所帮助。

