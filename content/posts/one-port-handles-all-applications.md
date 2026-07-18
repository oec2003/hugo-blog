---
title: 一个端口搞定所有应用
date: 2020-12-14T09:40:05+08:00
categories: [技术]
tags: [Nginx]
---

在产品或项目的发布部署中，往往需要很多的端口来对应不同的应用，特别是前后端分离的架构，更是如此，比如：有 PC 端的前端、移动端的前端和 WebAPI ，这就需要三个端口了：

<!--more-->

- PC 端：80；
- 移动端：81；
- WebAPI ：5000

如果是开发环境和测试环境，端口任意开都没有什么问题，但在客户生产环境中，开放端口有时是一个极其复杂的事情，默认情况下，可能只开放了 80 或 443 ，这是就要想办法将所有应用使用一个端口发布出来。

就拿上面的例子来说，移动端的站点和 WebAPI，都期望使用 80 端口来进行访问。

## Web API

Web API 比较简单，使用 nginx 做代理就可以很容易解决：

```csharp
server {
    listen       80;
    server_name  fwhyy.com;
    client_max_body_size 100M;

   location / {
      proxy_pass http://10.15.3.110:8080;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrate";
   }
   location /api/ {
      proxy_pass http://10.15.3.110:5000/;
   }

   error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

使用 location /api/ 来进行 /api 这个路由的代理，上面的代码中是代理到了内网服务器 10.15.3.110 的 5000 端口。

## 移动端 Web

移动端 Web 的 nginx 配置和 Web API 类似：

```csharp
server {
    listen       80;
    server_name  fwhyy.com;
    client_max_body_size 100M;

   location / {
      proxy_pass http://10.15.3.110:8080;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrate";
   }
   location /api/ {
      proxy_pass http://10.15.3.110:5000/;
   }
   location  /mobile {
     proxy_pass http://10.15.3.110:8081/;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrate";
   }

   error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

除了 nginx 的配置，前端的代码还需要进行简单的改造，此处前端以 Vue 为例：

1、修改全局的 vue.config.js 

```jsx
module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/mobile' : '/',
	css: {
		loaderOptions: {
			stylus: {
				'resolve url': true,
				import: ['./src/theme'],
			},
		},
	},
	pluginOptions: {
		'cube-ui': {
			postCompile: true,
			theme: true,
		},
	},
	devServer: {
		disableHostCheck: true,
		port: 8080,
		host: '0.0.0.0',
		https: false,
	},
	transpileDependencies: [
		'cube-ui',
		'axios',
		'vue',
		'vue-router',
		'vuex',
		'webpack-dev-server',
		'js-base64',
		'xss',
	],
};
```

添加 publicPath ，默认为 / ，在这里设置为如果构建为 production 环境，就设置 publicPath 为 /mobile ，这里的 mobile 这个名称和 nginx中配置的一致。

2、修改 index.html 

在 public 目录下的 index.html 文件的 head 中添加：

```jsx
<meta base ="/mobile/">
```

3、修改全局路由中的 base 设置：

```jsx
const router = new Router({
	mode: 'history',
	base: '/mobile',
	routes: [
		{
			path: '/',
			name: 'main',
			component: () => import(/* webpackChunkName: "data-form" */ '@/views/main-view'),

            ...
        }]
})
```

修改上面三处后，再加上 nginx 中的配置，就可以直接在浏览器中输入 [http://localhost/mobile](http://localhost/mobile)  来进行移动端的访问了。

希望本文对您有所帮助。
