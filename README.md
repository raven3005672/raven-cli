# 脚手架

## 脚手架的雏形

脚手架的初衷，就是提供一个最佳实践的基础模板，因此模板拷贝是其核心功能。简单举例，大致干两件事，npm publish一个全局安装的包，执行命令时，wget云服务上的一个压缩包，并在当前文件夹下解压。这就是一个脚手架的雏形。

## 脚手架需要考虑的

常见脚手架的最基本功能：首先提出一些列问题选项，然后为你的新建项目提供一份模板并安装依赖，再提供调试构建命令。

* 模板支持版本管理
    npm仓库天然支持版本管理，因此将模板发布到npm上自然解决了这个问题。
* 支持扩展新模板
    cli的设计支持扩展，符合开发封闭的设计原则。
* 自动监测版本更新
    npm提供了一些命令来检测包的版本，比如npm view react version返回react最新版本，借此，可以判断用户目前安装的是否最新版本，并提示用户更新。
* 根据用户选择，生成个性化模板
    可以通过问询用户，来提供差异化支持，这些问询的结果，将影响我们最终的模板，比如我们根据是否TypeScript会在两套预设的模板中选一个，将用户输入的信息插入package.json的description字段等等。
* 友好的UI界面
    合适的格式、颜色、字体、进度条等，给与用户良好的信息反馈。
* 构建功能独立，可因模板而异
    我们通常使用webpack来构建/调试，对于不同的模板，构建流程存在较大差异，我们需要支持为不同的模板配置不同的构建。因此构建能力也被抽离成单独的npm包，模板中可指定其构建包。
* 多人合作项目，能确保构建结果一致
    针对那些可能导致差异的因素，我们都收录到工程中，让git仓库记录，从而实现同样的结果。

## 脚手架的三类包

包              功能                        安装位置                    备注
全局命令包  负责响应全局命令，并进行调度         全局包路径          global安装，提供全局命令
模板插件包  初始化工程所拷贝的模板             某个约定路径             模板可随业务扩展
构建插件包  提供构建（webpack）能力             工程内         不同模板可使用同一构建包，也可不同

## 全局命令包

### cli开发中值得收藏的一些第三方包

包名称          功能
minimist    解析用户命令，将process.argv解析成对象
fs-extra    对fs库的扩展，支持promise
chalk       让你console.log出来的字带颜色
import-from 类似require，但支持指定目录，让你可以跨工程目录进行require，比如全局包想引用工程路径下的内容
resolve-from    同上，只不过是require.resolve
imquirer    询问用户并记录反馈结果，界面互动
yeoman-environment  【核心】用于执行一个[模板插件包]
easy-table  类似console.table，输出漂亮的表格
ora         提供loading菊花
semver      提供版本比较
figlet      console.log出一个漂亮的大logo
cross-spawn 跨平台的child_process(跨Windows/Mac)
osenv       跨平台的系统信息
open        跨平台打开app，比如调试的时候打开chrome

### 命令解析与分发

命令解析与分发，是[全局命令包]的核心功能，其过程比较简单。

1. cli版本更新判断：
    * 先获取本package.json中的version
    * 再通过npm view xxx version命令查询当前npm库最新版本
    * 两者比较得出结论，提醒用户更新
2. 解析用户命令
    * 通过process.argv[2]获取到用户执行的实际命令【推荐使用minimist解析参数】
3. 处理命令
    * 比如install命令，则通过require动态映射install.js文件来处理逻辑
    * require支持动态名称，如require('./scripts/' + command)这样，如果command是install则映射执行script/install.js文件

### install命令：安装一个模板插件包

核心处理流程如下：

1. 先判断是否硬盘缓存目录~/.maoda下是否已经安装过模板插件包
    * 如果没有，则接下来进行安装（相当于在目录下执行npm install）
    * 如果有，且版本低，则提示升级
    * 如果有，且版本最新，则不作为
2. 安装过程即execSync('npm i xxx@latest -s', {cwd: '~/.maoda'})

### init命令：选一个模板插件包来初始化一个新工程

这是一个脚手架高频而核心的功能

1. 查询硬盘缓存目录~/.maoda下的package.json文件，读取其中dependacies字段，拿到已安装的模板插件包。
    * 如果一个都没安装，则提示用户要先install
2. 让用户选择一套模板
    * 利用inquery库发起对话，罗列出已选模板，让用户选择
3. 触发模板初始化流程
    * 用户选择某个模板，则用yeoman-environment这个库去执行缓存目录里的这个包
    * 这里相当于跨目录的两个js文件引用执行，用到了之前说的import-from这个库
4. 模板插件包被执行，则启动了常规的模板拷贝过程

### build命令：在工程里执行构建

1. 确定工程目录
    * 工程目录即执行目录，通过process.cwd()获取
2. 读取该工程所用的构建插件
    * 读取工程中约定的配置文件（采用约定式的配置，类似webpack.config.js、.babelrc、.prettierrc）
    * 读取配置中builder配置项(即指定的构建插件包)
    * 如果有的话，读取自定义webpack配置（约定为webpackCustom字段，后续会被合并/覆盖到默认webpack配置上）
3. 使用指定的构建插件包来进行webpack打包
    * 判断工程中是否已经安装
    * 未安装，则在工程路径中执行npm install(或yarn add，此处可根据用户工程中lock文件的类型，判断用户使用的npm还是yarn)
    * 已安装，则直接执行build

### dev命令：启动devServer进行调试

类似build只不过webpack配置不同

## 模板插件包

核心功能：提供模板文件夹+文件夹的拷贝

1. 询问用户，并获取反馈的答案
    * 比如工程名是什么，描述一下你的工程，是否使用TypeScript，是否使用Sass/Less/Stylus等
2. 根据用户的答案，拷贝对应的模板，细分两种拷贝
    * 直接拷贝，直接把模板插件包里的文件夹/文件，拷贝到用户工程目录
    * 填充模板拷贝，将用户答案，填充到文档的对应位置，类似WebpackHTMLPlugin、ejs，如将name: <%=packageName%>填充成name:我的工程
3. 在工程中执行npm依赖的安装

看似流程很多，其实只用一个现成的轮子就可以解决，即yeoman-generator，它帮我们把这些过程都封装好了，我们只需继承基类，并写几个预设的生命周期函数即可。
```
module.exports = class extends Generator {
    // 问询环节
    prompting() {
        return this.prompt([
            {
                type: 'input',
                name: 'appName',
                message: '请输入项目名称：'
            },
            {
                type: 'list',
                choices: ['JavaScript', 'TypeScript'],
                name: 'language',
                message: '请选择项目语言',
                default: 'TypeScript'
            },
        ]).then(answers => {
            this.answers = answers;
        })
    }
    // 模板拷贝
    writing() {
        // 从模板路径拷贝到工程路径
        this.fs.copy(this.templatePath(), this.destinationPath());
    }
    // 安装依赖
    install() {
        this.installDependencies();
    }
    end() {
        this.log('happy coding!');
    }
}
```

模板插件包导出的是一个class，我们需要通过上文提到的全局命令包的yeoman-environment来启动
```
yeomanEnv.register(resolveFrom('./maoda', 'gen-tpl'), 'gen-tpl');
yeomanEnv.run('gen-tpl', (e, d) => {
    d && this.console('happy coding', 'green')
})
```

这里同样用到前文提到的resolve-from包，进行跨目录的引用解析。

## 构建插件包

构建插件包其实核心就是webpack能力，将内置的webpack.config.js与用户工程下自定义的webpackCustom进行merge，然后执行webpack流程。

构建工具不一定非要使用webpack，比如可以选择rollup之类的。
