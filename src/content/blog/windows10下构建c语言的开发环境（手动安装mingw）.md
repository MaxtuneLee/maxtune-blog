---
title: "Windows10下构建C语言的开发环境（常规操作）"
pubDatetime: 2021-07-21
categories:
  - "other"
description: "1、下载MinGW mingw-w64-install  下载地址：
如果上面的网址无法下载了，可以试试下面的这个"
---

## 1、下载MinGW

mingw-w64-install  下载地址： [http://sourceforge.net/projects/mingw-w64/](http://sourceforge.net/projects/mingw-w64/)

如果上面的网址无法下载了，可以试试下面的这个

[1628065658-mingw-w64-install](https://mxte.cc/wp-content/uploads/2021/08/1628065658-mingw-w64-install.zip)[点击下载](https://mxte.cc/wp-content/uploads/2021/08/1628065658-mingw-w64-install.zip)

## 2、安装

运行安装包

version:选最新版本

architecture:X86_64

threads:posix

exception:seh

[![](@assets/images/1624029377-image.png)](https://mxte.cc/?attachment_id=86)

然后开始在线安装，速度取决于你家的网速

[![](@assets/images/1624029622-image.png)](https://mxte.cc/?attachment_id=87)

安装完成之后打开系统设置添加环境变量，地址是mingw地址/bin,重启电脑

打开powershell，输入gcc -v如果显示版本信息即安装开发环境成功

[![](@assets/images/1626856094-image.png)](https://mxte.cc/?attachment_id=95)

手动安装mingw比较麻烦，如果遇到无法在线安装的小伙伴可以百度一下其它教程
