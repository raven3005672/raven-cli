process.argv参数
[ '/usr/local/bin/node',
  '/Users/yanglin/Raven3005672/raven-cli/index.js',
  '-v',
  '-a',
  '-x',
  '-ss',
  '-asd' ]

声明执行环境
which env

代码中的#!被称为Shebang，是用来告诉编译器用什么命令执行文件的。Shebang的一些具体用法罗列如下：

* 如果脚本文件中没有#!这一行，那么执行时会默认采用当前Shell去解释这个脚本(即：$SHELL环境变量)。
* 如果#!之后的解释程序是一个可执行文件，那么执行这个脚本时，它就会把文件名及其参数一起作为参数传给那个解释程序去执行。
* 如果#!指定的解释程序没有可执行权限，则会报错“bad interpreter: Permission denied”。如果#!指定的解释程序不是一个可执行文件，那么执行的解释程序会被忽略，转而交给当前的SHELL去执行这个脚本。
* 如果#!执行的解释程序不存在，那么会报错“bad interpreter: No such file or directory”。注意：#!之后的解释程序，需要写其绝对路径（如：#!/bin/bash），它是不会自动到$PATH中寻找解释器的。
* 当然，如果你使用类似于“bash test.sh”这样的命令来执行脚本，那么#!这一行将会被忽略掉，解释器当然是用命令行中显式指定的bash
* 脚本文件必须拥有可执行权限

env可以在系统的PATH目录中查找脚本解释器安装目录。

添加#!/usr/bin/env node是告诉系统，这个脚本使用node.js来执行。这样我们就可以简化命令，执行index.js直接得到ip地址，不需要显式的调用node index.js
