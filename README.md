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


