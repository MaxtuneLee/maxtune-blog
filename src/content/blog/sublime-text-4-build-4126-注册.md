---
title: "Sublime Text 4 Build 4126 注册"
pubDatetime: 2022-05-03
categories:
  - "软件"
tags:
  - "sublime"
  - "前端"
  - "软件"
description: "最近用vscode时候发现了卡顿、打开关闭都很缓慢之类的现象，打算试一下更加轻量的sublime，所以使用特殊方法注册了，这里提供教程参考 ↓ 居然支持deno，这让我很惊喜"
---

最近用vscode时候发现了卡顿、打开关闭都很缓慢之类的现象，打算试一下更加轻量的sublime，所以使用特殊方法注册了，这里提供教程参考

↓ 居然支持deno，这让我很惊喜

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1651547362-image-1024x689.png)](https://mxte.cc/289.html/1651547362-image)

## 1.修改host

找到 “C:\\Windows\\System32\\drivers\\etc\\hosts” ,添加：

```text
127.0.0.1 license.**sublime**hq.com # SublimeText
127.0.0.1 www.sublimetext.com # SublimeText
```

## 2.HxD工具修改sub_lime.exe值

使用HxD工具修改sub_lime.exe值（[https://hexed.it/](https://hexed.it/)）

注意替换完之后要另存为，替换原来主程序（名字为安装程序的主程序名字，如sub_lime.exe）. 搜索替换对应本版本的值：

### 第一步:

x64 版本：  
查找： 4157415656575553B828210000  
替换： 33C0FEC0C3575553B828210000  
x86 版本:  
查找： 55535756B8AC200000  
替换： 33C0FEC0C3AC200000

### 第二步:

查找： 6C6963656E73652E7375626C696D6568712E636F6D  
替换： 7375626C696D6568712E6C6F63616C686F73740000

## 3.打开sublime,输入注册码完成注册:

```
----- BEGIN LICENSE -----
You
Unlimited User License
EA7E-81044230
0C0CD4A8 CAA317D9 CCABD1AC 434C984C
7E4A0B13 77893C3E DD0A5BA1 B2EB721C
4BAAB4C4 9B96437D 14EB743E 7DB55D9C
7CA26EE2 67C3B4EC 29B2C65A 88D90C59
CB6CCBA5 7DE6177B C02C2826 8C9A21B0
6AB1A5B6 20B09EA2 01C979BD 29670B19
92DC6D90 6E365849 4AB84739 5B4C3EA1
048CC1D0 9748ED54 CAC9D585 90CAD815
------ END LICENSE ------
```

> 参考：吾爱破解论坛
