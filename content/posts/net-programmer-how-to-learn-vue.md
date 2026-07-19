---
title: .NET 程序员如何学习Vue
date: 2019-08-31T16:32:05+08:00
categories: [技术]
tags: [dotNET Core,Vue]
---

之所以取这个标题，是因为本文来自内部培训的整理，培训的对象是公司的 .NET 程序员，.NET 程序员学习 Vue 是为了在项目中做二次开发时能够更好地跟产品对接。

<!--more-->

Vue 是现在比较流行的前端框架，也是非常容易入门的前端框架，花几个小时看看官方文档基本就入门，如果连官方文档都懒得看，那本文或许对您有所帮助。

开发一个站点最基本的知识点，我认为有以下几个：

* 页面组装
* 页面跳转
* 页面传值
* 接口调用

.NET 程序员通常会采用 Asp.Net 或 Asp.Net MVC 来开发网站，对于上面四点，在 .NET 中的对应关系如下：

| 知识点 | Asp.Net | Asp.Net MVC |
| --- | --- | --- |
| 页面组装 | Aspx页面、用户控件、MasterPage | 视图、分部视图 |
| 页面跳转 | 链接、Redirect | 路由 |
| 页面传值 | QueryString、Session等 | ViewBag、ViewData等 |
| 接口调用 | Ajax | Ajax |

在 Vue 中、使用「组件」来组装页面，使用「路由」来做页面的跳转，传值分为「路由参数」和「组件之间的通讯」，接口的调用使用官方推荐的「axios」。

下面以一个简单的登录示例来讲解上面说到的一些知识点。

## 环境安装

首先安装 nodejs ,可以在[http://nodejs.cn/download/](http://nodejs.cn/download/)找到相关的版本进行安装。

Vue的使用有两种模式，直接引用 Vue 的 js 文件，或者使用脚手架生成完整的项目框架，这里我们使用脚手架的方式，使用下面命令进行安装

```
npm install -g @vue/cli
```

## 创建应用

使用下面命令创建名为 hello-world 的应用

```
vue create hello-world
```

Vue 创建应用时分为默认模式和手动模式，这里我们选择默认模式

![](https://img.fwhyy.com/2022/202201280632585.webp)

创建完成后，项目的目录结构如下

![](https://img.fwhyy.com/2022/202201280632685.webp)

* public：public中的静态资源会复制到最终打包的dist目录中
* src：编写代码主要要操作的目录
* src/assets：存放静态资源，如图片、字体等
* src/components：组件目录
* src/App.vue：根组件
* src/main.js：入口文件
* 下面的一些配置文件可以暂时不做深入研究

## 运行应用

在命令行输入`npm run serve`，运行起来后，在浏览器中输入http://localhost:8080,就可以访问站点了。

作为一个.NET程序员，本机通常安装有IIS，在IIS中可能有站点将8080端口占用了，这时就需要指定端口的方式来启动

```
.\node_modules\.bin\vue-cli-service serve –port 4000
```

## 一个简单的登录示例

### 安装 ElementUI

```
npm i element-ui -S
```

安装完成后在 main.js 中进行引用

```
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Element, { size: 'small', zIndex: 3000 });
```

### 添加 login.vue 组件

在 components 目录中添加 login.vue 组件文件，代码如下：

```
<template>
  <el-form ref="ruleForm" :model="formModel">
    <p class="title">登录</p>
    <el-form-item required>
      <el-input v-model="formModel.loginName" placeholder="请输入登录名" size="large"></el-input>
    </el-form-item>
    <el-form-item required>
      <el-input
        type="password"
        v-model="formModel.password"
        @keyup.native="keyup"
        placeholder="请输入登录密码"
        size="large"
      ></el-input>
    </el-form-item>
    <p v-show="showErrorMessage" class="alert">{{ errorMessage }}</p>
    <el-form-item>
      <el-button type="primary" size="medium" @click="login" style="width: 100%;">登录</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: "login",
  data() {
    return {
      errorMessage: "",
      formModel: {
        loginName: "",
        password: ""
      }
    };
  },
  watch: {
    "formModel.password": function(val) {
      if (val.trim() !== "") {
        this.errorMessage = "";
      } else {
        this.errorMessage = "请输入密码";
      }
    }
  },
  computed: {
    showErrorMessage() {
      return this.errorMessage !== "";
    }
  },
  mounted: function() {},
  methods: {
    keyup(event) {
      if (event.keyCode === 13) {
        this.login();
      }
    },

    login() {
      const loginName = this.formModel.loginName;
      const password = this.formModel.password;
      if (loginName === "") {
        this.errorMessage = "请输入登录名";
        return;
      }
      if (password === "") {
        this.errorMessage = "请输入密码";
        return;
      }
      //调用接口验证
    }
  }
};
</script>
<style scoped>
</style>
```

* data()：组件中使用到的数据需要以对象的方式在 data() 函数中返回
* watch：监听属性，上面例子中监听 formModel.password 的值，当改变时，修改 errorMessage 
* computed：计算属性，例子中当 errorMessage 的值从空变成非空，或者从非空变成空时才会触发
* mounted：页面加载完成后执行，如果登录组件想要请求接口设置一个背景图，可以写在这里
* methods：常规的 js 方法就放在这里

### 安装路由

1、安装路由插件

```
npm install --save vue-router
```

2、在 main.js 中引入路由

```
import router from './routers/router'

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
```

3、在 src 目录中添加 routers 目录，在该目录新增 router.js 文件，内容如下

```
import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);
const router = new Router({
    mode: 'history',
    routes: [{
            path: "/login",
            name: "login",
            component: () =>
                import ("@/components/login.vue")
        },
        {
            path: "*",
            redirect: "/"
        }
    ]
})
export default router;
```

添加了 /login 的路由地址，指向 login.vued的组件

4、修改 App.vue 组件

```
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <router-view></router-view>
  </div>
```

添加了 router-view 后，路由中指定的组件就会被替换到此处。

5、此时访问 http://localhost:8080/login 可以看到下面界面

![](https://img.fwhyy.com/2022/202201280632305.webp)

### 添加 home.vue 组件

home 组件是登录成功后要跳转到的组件，该组件包含一个子组件 top-bar。

1、在 components 目录下添加 top-bar.vue 和 home.vue 文件

top-bar.vue

```
<template>
    <div>这是网站的头部</div>
</template>
<script>
export default {
    name:"top-bar"
}
</script>
<style scoped>
</style>
```

home.vue

```
<template>
  <el-container id="main-view">
    <el-header class="header">
          <top-bar></top-bar>
    </el-header>
    <el-main>
        这是正文部分
    </el-main>
  </el-container>
</template>

<script>
import TopBar from "@/components/top-bar.vue";
export default {
    name: "home",
    components:{
         TopBar
    }
};
</script>
<style lang="css" scoped>
.header{
    background-color: rgb(0, 120, 215);
    color:aliceblue;
    padding-left:0;
    height:48px;
}
</style>
```

2、修改 login 组件的 login() 方法，添加登录路由跳转的逻辑

![](https://img.fwhyy.com/2022/202201280632590.webp)

3、修改 router.js ，添加登录后跳转的路由配置

![](https://img.fwhyy.com/2022/202201280633499.webp)

运行后，点击登录按钮就可以跳转到 home 组件了。

### 路由传参

登录成功后，将登录名传递到 home 组件中，通过路由传参的方式有很多中，这里使用 query 的方式

1、修改登录成功后的跳转

```
this.$router.push({
	path: "/",
	query: {
	    code: loginName
	  }
});
```

2、home 组件添加变量接收参数值

![](https://img.fwhyy.com/2022/202201280633926.webp)

### 组件通讯-父组件传递到子组件

父组件传递数据到子组件的方法是在子组件定义 props ，本例中将 home 组件接收到的登录名传递到 top-bar 组件中。

1、在 top-bar 组件中定义 props

![](https://img.fwhyy.com/2022/202201280633444.webp)

2、修改 home 组件进行传值

```
<top-bar :code="loginName"></top-bar>
```

### 组件通讯-子组件传递到父组件

子组件传递到父组件使用 $emit ，本例中在 top-bar 组件中添加一个按钮，点击按钮传递参数到 home 组件，并改变 home 组件的 loginName的值。

1、top-bar 组件中添加按钮和相关事件

![](https://img.fwhyy.com/2022/202201280633951.webp)

2、在 home 组件中进行事件接收

![](https://img.fwhyy.com/2022/202201280633426.webp)

### 接口调用

在 Vue 中使用 axios 需要先进行插件的安装

```
npm install axios --save
```

axios 的使用请点击「阅读原文」查看示例代码。

## 发布部署

### 发布

使用下面命令可以将项目发布到 dist 目录中

```
npm run build
```

发布结果如下

![](https://img.fwhyy.com/2022/202201280634794.webp)

### 部署到Docker

1、在 dist 目录中创建 Dockerfile文件，文件内容如下

```
FROM nginx:latest
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2、进入到 dist目录，执行下面命令进行镜像的构建

```
docker build -t vue-demo .
```

3、创建 nginx 配置文件，在执行 docker run 时会将容器内的配置文件映射出来

```
server {
    listen       80;
    server_name  221.234.36.41;
    client_max_body_size 100M;

   location / { 
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
   }
   error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

3、执行 docker run 创建容器

```
docker run -d -p 9000:80 --name vue-demo -v ~/Documents/fengwei/projects/conf.d:/etc/nginx/conf.d:ro --restart=always vue-demo
```

在浏览器输入 http://localhost:9000 可以查看运行效果。

示例代码：[https://github.com/oec2003/StudySamples/tree/master/VueSample/hello-world](https://github.com/oec2003/StudySamples/tree/master/VueSample/hello-world)

希望本文对您有所帮助。

