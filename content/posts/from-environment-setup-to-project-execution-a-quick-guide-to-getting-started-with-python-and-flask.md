---
title: 从环境搭建到项目运行：Python 和 Flask 快速上手指南
date: 2025-01-07T20:27:00+08:00
categories: [技术]
tags: [Python,Flask]
---
最近在研究 RAG，免不了会使用到 Python，本文简单介绍下 Python 从环境的搭建到运行一个简单的 Web 项目。

<!-- more -->

## 环境

- 操作系统：Mac 13.0
- Python：3.11.7
- 包管理：poetry1.8.3
- Web 框架：Flask3.1

Python 中的包管理工具有 conda、pip、poetry、PyPI 等，Web 框架也有 Django、Flask、FastAPI ，为什么选择的是 poetry 和 Flask 呢？

因为现在研究的 RAGFlow 的源码中使用的就是 poetry 和 Flask 。带着目的去学习效率会高很多。

## 安装

### 1 、安装 Python

直接在官网下载安装就可以：https://www.python.org/downloads/，我很早前就安装了，一直没有升级，所以版本还是 3.11.7 。

### 2 、安装 poetry

如果你了解过 Python，一定知道 pip，但 pip 在包的依赖管理和版本冲突管理上做的不是很好，而 poetry 就是为了解决这两个问题而生。

我在本机是使用 pipx 来安装的 poetry ，先使用 homebrew 安装 pipx：

```shell
brew install pipx
pipx ensurepath
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images@master/img/202501061750427.webp)

接着使用 pipx 安装 poetry，命令如下：

```shell
pipx 安装 poetry 
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061805738.webp)

安装完成后，可以通过以下命令验证 poetry 是否安装成功：

```
poetry --version
```

出现下图所示，说明安装成功：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061805772.webp)

### 3 、使用 poetry

可以使用 poetry 创建一个新的项目:

```
poetry new poetry-project
```

也可以在现有项目的目录中初始化 poetry：

```
cd exist-project
poetry init
```

使用 poetry 创建的项目目录如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061805758.webp)

在 pyproject.toml 文件中进行包版本的管理。这时如果我要给项目添加相关的依赖包，有两种方式：

直接使用 poetry 命令:

```
poetry add six:1.16.0            
```

使用命令安装完成后，pyproject.toml 文件中会自动添加 six = "1.16.0" ，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061805053.webp)

另一种方式就是先修改配置，在 pyproject.toml 中添加 six = "1.16.0" 或其他的包，然后执行下面命令进行安装：

```
poetry install
```

**在使用 poetry 之前，先使用下面命令设置虚拟环境在项目内：**

```
poetry config virtualenvs.in-project true
```

经过上面的设置后，不管是使用 `poetry install` 还是使用 `poetry add ` 添加的包，会在项目根目录下的 .venv 目录中，便于管理：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061805840.webp)

### 4 、安装 flask

```
poetry add flask
```

上面命令会将 Flask 添加到 `pyproject.toml` 并安装到虚拟环境中。

## 使用 flask

使用 poetry 初始化一个项目并添加 flask 后，项目的目录结构如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061805118.webp)

可以看到到多了 `__init__.py` 和 `poetry.lock` 两个文件：

* `__init__.py`：可以将这个文件所在目录标记为一个 Python 包，使得这个目录可以被当作模块导入。
* `poetry.lock`：锁定项目所有依赖包的具体版本，确保项目在不同环境中使用完全相同的依赖版本，记录了每个包的详细信息，包括其哈希值、依赖关系等。

在上面的基础上，我们让 windsurf 来完成一个示例程序，在 windsurf 中输入：按照flask的最佳实践，创建 get 和 post 的接口示例，创建的目录结构如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061806816.webp)

从上往下来看看每个文件的内容：

### `__init__.py`

```python
"""Flask 应用工厂模块"""
from flask import Flask
from .config import config

def create_app(config_name='default'):
    """
    创建 Flask 应用实例
    :param config_name: 配置名称，可选值：development, production, default
    :return: Flask 应用实例
    """
    # 创建应用实例
    app = Flask(__name__)

    # 加载配置
    app.config.from_object(config[config_name])

    # 注册蓝图
    from .api import api_bp
    app.register_blueprint(api_bp)

    # 添加一个测试路由
    @app.route('/')
    def index():
        return 'Welcome to Flask API'

    return app
```

### config.py

```python
"""Flask 应用配置文件"""

class Config:
    """基础配置类"""
    SECRET_KEY = 'dev-key'  # 开发环境密钥
    JSON_AS_ASCII = False   # 支持中文返回

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    ENV = 'production'
    SECRET_KEY = 'your-production-secret-key'  # 生产环境应使用强密钥

# 配置映射
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

```

### api__init__.py

```python
from flask import Blueprint

# 创建 API 蓝图
api_bp = Blueprint('api', __name__, url_prefix='/api')
# 导入视图函数
from . import views # 这行很重要，确保视图函数被注册到蓝图
```

### api_views.py

```python
"""API 视图函数"""
from flask import jsonify, request
from . import api_bp

@api_bp.route('/hello', methods=['GET'])
def hello():
    """GET 请求示例"""
    return jsonify({
        'code': 200,
        'message': 'Hello, World!',
        'data': None
    })

@api_bp.route('/echo', methods=['POST'])
def echo():
    """POST 请求示例"""
    try:
        # 获取 JSON 数据
        data = request.get_json()
        if not data:
            return jsonify({
                'code': 400,
                'message': 'No JSON data provided',
                'data': None
            }), 400

        # 返回接收到的数据
        return jsonify({
            'code': 200,
            'message': 'Data received successfully',
            'data': data
        })

    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

```

### run.py

```python
"""应用启动入口"""
from poetry_project import create_app

app = create_app('development')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)

```

在项目更目录下执行下面命令运行和测试：

```shell
poetry run python run.py

curl http://localhost:5005/api/hello
curl -X POST -H "Content-Type: application/json" -d '{"message":"test"}' http://localhost:5005/api/echo
```

## 扩展

到这里，一个简单的例子就跑起来了。

但例子中有些地方看不明白，直接在 windsurf 中去问就可以了，比如 api 目录中的 `__init__.py` 文件中有这样一行代码：

```python
api_bp = Blueprint('api', __name__, url_prefix='/api')
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202501061806824.webp)

了解了一个简单的 Flask 项目结构，也知道怎么去抽丝剥茧搞清楚不懂的问题。我们就可以去阅读 RAGFlow 的源码了。

## 常用命令

### 1、升级 Poetry

如果需要升级 `Poetry`，可以使用以下命令：

```bash
pipx upgrade poetry
```

### 2、卸载 Poetry

如果不再需要 `Poetry`，可以通过以下命令卸载：

```bash
pipx uninstall poetry
```

### 3、创建虚拟环境

Poetry 默认会在你安装依赖时自动创建虚拟环境。如果你想手动创建虚拟环境，可以运行以下命令：

```bash
poetry env use python
```

这会使用系统默认的 Python 版本创建虚拟环境。如果你想指定 Python 版本，可以这样做：

```bash
poetry env use python3.9
```

### 4、查看虚拟环境信息

创建虚拟环境后，可以通过以下命令查看虚拟环境的路径和信息：

```bash
poetry env info
```

### 5、激活虚拟环境

如果你想手动激活虚拟环境，可以运行以下命令：

```bash
poetry shell
```

这会启动一个新的 shell 并激活虚拟环境。激活后，你可以直接运行 Python 脚本或命令。

### 6、删除虚拟环境

如果你想删除虚拟环境，可以运行以下命令：

```bash
poetry env remove python
```