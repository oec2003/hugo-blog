---
title: 程序员不可错过的一款Hexo博客主题
date: 2022-02-10T08:42:53+08:00
categories: [成长]
tags: [Hexo,stellar,博客]
---

自从 2018 年开始写公众号之后，我的个人站点（fwhyy.com）就停止更新了，直到最近查资料发现了hexo 博客的 stellar 主题，春节期间将博客重新维护起来，主要原因是因为该主题支持专栏的功能。

<!--more-->

原来博客站点的部署情况如下：

* 域名：在狗爹购买，DNSPod 进行 DNS 解析；
* 空间：Linode 东京机房，后来被迁移到东京机房 2 ，迁移后感觉速度变慢了；
* 图床：没有使用图床，图片直接放在网站发布的目录中；
* 写作工具：MWeb；
* 发布方式：使用 hexo d 命令结合 Linode 服务器上安装的 Git Hook 。

因为访问速度的原因，便想换一种部署的方式，调整后的方案如下：

* 空间：使用 GitHub Page ,然后进行域名的绑定；
* 域名：需要修改 DNSPod 中的 DNS 解析；
* 图床：选用 GitHub 图床，配合 jsdelivr 做 CDN 加速
* 写作工具：Typora；
* 发布方式：GitHub Action 。

## GitHub Page 绑定域名

多年前我就试用过 GitHub Page，所以这次只需要进行域名的绑定就可以：

1、在仓库的 Settings 的 Pages 项中进行域名的设置，如下图：

![image-20220207091653060](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202070917787.png)

2、在仓库的根目录下创建 CNAME 文件，内容为域名，如下图：

![iShot2022-02-07 09.35.48](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202070936920.jpg)

## 修改 DNSPod

1、将原来的两条 A 记录禁用；

2、添加新的 CNAME 记录，记录值为 oec2003.github.io。

如下图：

![iShot2022-02-07 10.07.03](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202071029958.jpg)

## 图床

* 图床使用的是 GitHub 图床；

* 使用 jsdelivr 做 CDN 加速；

* 使用 PicGo 来进行图片的上传；

* 在写作工具 Typora 中可以使用 PicGo 做为图片的上传服务。

1、在 GitHub 上创建 hblog-images 的公有仓库来用存储图片；

2、下载 PicGo 并进行配置：

![iShot2022-02-07 10.28.53](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202071029982.jpg)

* 仓库名：在 GitHub 中创建的公有仓库的名称 hblog-images
* 分支名：通常为 master
* 设定 Token：登录 GitHub ，在 Settings /  Developer settings / Personal access tokens 中生成 Token，需要注意的是生成之后Token只会出现一次，及时保存

![iShot2022-02-08 06.08.35](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202080608670.jpg)

* 指定存储路径：随便取个名字即可，比如上面配置的为 img/ ，表示图片会上传到仓库的 img 目录中
* 自定义域名：这里就是设置 jsdelivr 的 CDN 地址，https://cdn.jsdelivr.net/gh/oec2003/hblog-images ，格式为：https://cdn.jsdelivr.net/gh/<GitHub账号>/<仓库名称>

3、在 Typora 的偏好设置中进行图片的上传服务的设置，如下图：

![iShot2022-02-08 06.19.52](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202080630781.jpg)

4、在 Typora 中选中一张图片点击右键，选中上传图片，成功后图片的地址会自动替换，如下图：

![iShot2022-02-08 06.34.40](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202080634299.jpg)

## 使用 GitHub Action

使用 GitHub Action 需要两个 GitHub 仓库：

* GitHub Page 的仓库，https://github.com/oec2003/oec2003.github.com
* 存放 Hexo 代码的仓库，https://github.com/oec2003/hblog-code

具体步骤如下：

1、生成 SSH Key

```shell
ssh-keygen -t rsa -C "oec2003@qq.com"
```

以 Mac 系统为例，生成的文件在 ~/.ssh 目录中，id_rsa 为私钥文件，id_rsa.pub 为公钥文件。

2、在 GitHub Page 的仓库的 Settings > Deploy keys 中添加公钥

![iShot2022-02-09 06.43.44](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202090644408.jpg)

3、在 Hexo 代码仓库中的 Settings > Secrets > Actions 中添加私钥

![iShot2022-02-09 06.47.01](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202090647980.jpg)

4、在 Hexo 代码仓库的 Actions 页签添加 workflow，如下图：

![iShot2022-02-09 13.19.03](/Users/fengwei/Documents/my/typora-img/一款好用的Hexo博客主题/iShot2022-02-09 13.19.03.jpg)

5、创建的 workflow 为一个 yml 文件，内容如下：

```yaml
name: hblog deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    name: A job to deploy blog.
    steps:
    - name: Checkout
      uses: actions/checkout@v1
      with:
        submodules: true 
    - name: Cache node modules
      uses: actions/cache@v1
      id: cache
      with:
        path: node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-
    - name: Install Dependencies
      if: steps.cache.outputs.cache-hit != 'true'
      run: npm ci
    
    # Deploy hexo blog website.
    - name: Deploy
      id: deploy
      uses: sma11black/hexo-action@v1.0.4
      with:
        deploy_key: ${{ secrets.BLOG_DEPLOY_PRIVATE }}
        user_name: oec2003  
        user_email: oec2003@qq.com  
        commit_msg: ${{ github.event.head_commit.message }}  
    - name: Get the output
      run: |
        echo "${{ steps.deploy.outputs.notify }}"
```

* 上面配置我们需要修改的部分就是 steps 中的 Deploy 步骤；
* uses：这里使用的是 sma11black/hexo-action@v1.0.4 ，这是一个现成的 hexo 发布的 action；
* deploy_key ：上面第三步中在 Hexo 代码仓库的 Settings > Secrets > Actions 添加私钥的名称；
* user_name：GitHub 登录名；
* user_email：生成 ssh 密钥时使用的邮箱。

## 写作流程

1、使用 hexo n 命令创建博客文章的 md 文件 ,该文件的所在目录为 /source/_posts 目录中；

2、使用 Typora 打开 _posts 目录，选择创建的文件进行内容的编辑；

3、文章中如果有图片，直接粘贴到 Typora 中，并右键选择上传图片即可，上传成功后地址会自动替换为 jsdelivr 的地址；

4、文章内容编辑完成后，在 GitHub Desktop 中将修改内容进行提交和推送，GitHub Action 会自动进行网站的生成和部署。

## 常见问题

### 域名问题

每次 push 代码自动构建发布后，GitHub Page 的仓库中配置的域名会丢失。按照如下步骤可以解决：

1、在网站根目录的 _config.yml 文件中找到 skip_render 节点，配置 CNAME ，如下图：

![iShot2022-02-09 11.35.33](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202091135684.jpg)

2、在 /source 目录中创建一个文件，命名为 CNAME ，里边的内容为你的域名。例如我的域名为： http://fwhyy.com , 该文件的内容为：fwhyy.com 。

### Deploy keys 和 SSH keys 

每个仓库的 Settings 中有 Deploy keys 的设置，全局的 Settings 中有 SSH keys 的设置，全局的 SSH keys 设置后，其他的仓库就不用单独设置了。

而且这两个是冲突的，如果设置了全局的 SSH keys ，再在某个仓库中设置 Deploy keys 时，会提示 key 已经存在。

### _config.yml 文件中的 deploy 设置

这里需要主要两点：

1、网站根目录中的 _config.yml 的 deploy 节点需要进行设置，否则 GitHub Action 运行后不能将文件发布到 GitHub Page 的仓库，deploy 配置如下：

```yaml
deploy:
  type: 'git'
  repo: 
    github: git@github.com:oec2003/oec2003.github.com.git
    
  branch: master
  message: "Build at {{ now('YYYY-MM-DD HH:mm:ss Z') }}"
```

2、上面配置中的 github 的地址配置的是 GitHub Page 仓库的地址，因为前面有设置过 Deploy keys 或 SSH keys ，所以这个地址使用 ssh 地址即可，如果要使用 https 地址，需要在地址中添加 GitHub 的账户和密码。

## 总结

1、重新更新博客主要是因为这款主题，能支持专栏，还有一个原因就是博客更随意，内容也能随时修改；

2、第一次使用了 GitHub Action ，发现功能非常强大，也能带来一些思考，比如说，在 steps 中的一个任务块可以使用 uses 来引用其他现成的 action 。在零代码平台中一个很重要的思路就是组件的组合，组件如果能形成一个生态，而且在组建功能时能方便地使用到公共组件，扩展能力将会大大增强。
