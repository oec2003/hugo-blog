---
title: Angularjs跨域调用Asp.Net WebAPI
date: 2016-01-06
categories: [技术]
tags: [AngularJS, WebAPI]
---

之前写过一篇使用jQuery跨域调用WebAPI的博客《[jQuery跨域调用Asp.Net Web API](http://blog.fwhyy.com/2015/08/jquery-cros-access-asp-net-web-api/)》,但最近使用Angularjs来调用WebAPI发现之前的方法行不通。本文主要介绍解决使用Angularjs调用WebAPI的跨域问题。
<!--more-->

## 环境

* Angularjs1.4.7
* Asp.Net WebAPI2
* IIS：IIS8.0
* VS：VS2013
* .Net Framework：4.5

## 服务端跨域实现

这里的服务端指的是Asp.Net WebAPI,根据最近查过的些资料，大概有三种实现方式：

方式一： 使用《[在jQuery跨域调用Asp.Net Web API](http://blog.fwhyy.com/2015/08/jquery-cros-access-asp-net-web-api/)》一文中介绍的方式；

方式二： 使用自定义的Attribute，代码如下：

```
    public class CrossSiteAttribute : System.Web.Http.Filters.ActionFilterAttribute
    {
        private const string Origin = "Origin";
        /// <summary>
        /// Access-Control-Allow-Origin是HTML5中定义的一种服务器端返回Response header，用来解决资源（比如字体）的跨域权限问题。
        /// </summary>
        private const string AccessControlAllowOrigin = "Access-Control-Allow-Origin";
        /// <summary>
        ///  originHeaderdefault的值可以使 URL 或 *，如果是 URL 则只会允许来自该 URL 的请求，* 则允许任何域的请求
        /// </summary>
        private const string originHeaderdefault = "*";
        /// <summary>
        /// 该方法允许api支持跨域调用
        /// </summary>
        /// <param name="actionExecutedContext"> 初始化 System.Web.Http.Filters.HttpActionExecutedContext 类的新实例。</param>
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            actionExecutedContext.Response.Headers.Add(AccessControlAllowOrigin, originHeaderdefault);
        }
    }
```

方式三： 另一种自定义的Attribute，代码如下：

```
    public class CorsPolicyProvider : Attribute, ICorsPolicyProvider
    {
        private CorsPolicy _policy;
        public CorsPolicyProvider()
        {
            // Create a CORS policy.
            _policy = new CorsPolicy
            {
                AllowAnyMethod = true,
                AllowAnyHeader = true,
                AllowAnyOrigin = true
            };

            // Magic line right here
            _policy.Origins.Add("*");

        }

        public Task<CorsPolicy> GetCorsPolicyAsync(HttpRequestMessage request, 
            CancellationToken cancellationToken)
        {
            return Task.FromResult(_policy);
        }
    }
```

如果是普通的js或jQuery跨域调用，服务端进行上面的设置基本就可以了，但在Angularjs中，还是无法成功调用，通常会报下面的错误:

![wpid-14520930264098](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290822742.jpg)

## Angularjs中的设置

```
 var app = angular.module('app', []);
 app.config(['$httpProvider', function ($httpProvider) {
        // Use x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function (data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function (obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                    else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                    else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    }]);
```

## 参考

[http://www.codeproject.com/Articles/742532/Using-Web-API-Individual-User-Account-plus-CORS-En](http://www.codeproject.com/Articles/742532/Using-Web-API-Individual-User-Account-plus-CORS-En)
[http://www.asp.net/web-api/overview/security/enabling-cross-origin-requests-in-web-api](http://www.asp.net/web-api/overview/security/enabling-cross-origin-requests-in-web-api)

