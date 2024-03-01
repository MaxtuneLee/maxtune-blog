---
title: "在Windows11下安装ISE14.7指南"
pubDatetime: 2023-04-03
categories:
  - "other"
  - "软件"
tags:
  - "fpga"
  - "ise"
  - "电工电子实验"
description: "众所周知，ise已经停更很久了，目前所有更新都在vivado上。很遗憾的是，ise对新版本的windows兼容性很差，基本是无法使用的状态。但是由于一些原因，我们有时候不得不使用ise，所以这篇文章来分享一下如何在windows11环境下安装ise14.7。笔者使用的是官方推荐的安装方案，除此以外ise还有很多安装的方法，如果你看到的教程有异可以随意选择一个先试试看。"
---

众所周知，ise已经停更很久了，目前所有更新都在vivado上。很遗憾的是，ise对新版本的windows兼容性很差，基本是无法使用的状态。但是由于一些原因，我们有时候不得不使用ise，所以这篇文章来分享一下如何在windows11环境下安装ise14.7。笔者使用的是官方推荐的安装方案，除此以外ise还有很多安装的方法，如果你看到的教程有异可以随意选择一个先试试看。

[![](/assets/images/1680509988-Pasted-image-20230403160345.png)](https://mxte.cc/333.html/1680509988-pasted-image-20230403160345)

## 下载ISE14.7安装包

在xilinx的官方网站下载ISE的安装包，目前最后的版本是14.7，我们选择的是14.7for windows10版本。  
官方网站链接：[Downloads (xilinx.com)](https://www.xilinx.com/support/download/index.html/content/xilinx/en/downloadNav/vivado-design-tools/archive-ise.html)

[![](/assets/images/1680510006-Pasted-image-20230403160553-1024x520.png)](https://mxte.cc/333.html/1680510006-pasted-image-20230403160553)

点击下载后会跳转到登录界面，如果你还没有xilinx的账号可以注册一个，需要注意的是不要使用学校的邮箱注册，原因后面会说到。  
之后会来到一个叫做下载中心 - 名称和地址验证的界面，需要你填写一堆信息，随便填，不用写真的，如果写真的也不要写学校，不然可能会不让你下载，如图

[![](/assets/images/1680510013-Pasted-image-20230403161302-1024x764.png)](https://mxte.cc/333.html/1680510013-pasted-image-20230403161302)

然后点击continue就会继续下载。

## 安装的前期准备

首先需要关闭你的电脑的Hyper-V  
在terminal中用管理员权限运行`bcdedit /set hypervisorlaunchtype off` 即可关闭  
然后需要关闭内核隔离  
在windows安全中心中关闭，如图

[![](/assets/images/1680510018-Pasted-image-20230403161545-1024x792.png)](https://mxte.cc/333.html/1680510018-pasted-image-20230403161545)

### 安装Virtual Box

由于ISE和windows的兼容性问题，在windows10及以上版本无法正常使用，所以官方推荐的方案是把ISE跑在虚拟机里面（这边使用官方包中自带的Oracle Linux Server，如果使用更老的windows版本做虚拟机也是没有问题的）。

到Virtual Box官网下载安装包安装：[Oracle VM VirtualBox](https://www.virtualbox.org/)

[![](/assets/images/1680510920-image-1024x567.png)](https://mxte.cc/333.html/1680510920-image)

## 安装ISE

之后双击安装包打开安装跟着步骤走即可，需要注意的是安装路径不能有中文，安装包放的位置也不能用中文。

在刚打开安装包的时候会弹出一个提醒，意思是是否安装到上面已经安装的现有的Virtual Box版本中，这边选择是就可以继续安装了，然后跟着下面的步骤走，选择安装目录和与虚拟机共享的目录。

之后如果要把外部的工程文件导入的话，只需要把文件放在与虚拟机共享的目录就好了。

## 参考

[virtualbox - virtualization is enabled but not working - Stack Overflow](https://stackoverflow.com/questions/33552810/virtualbox-virtualization-is-enabled-but-not-working)

[(4) ISE on windows 10 : FPGA (reddit.com)](https://www.reddit.com/r/FPGA/comments/pxn65o/ise_on_windows_10/)

[https://www.xilinx.com/htmldocs/xilinx14_7/ug1227-ise-vm-windows10.pdf](https://www.xilinx.com/htmldocs/xilinx14_7/ug1227-ise-vm-windows10.pdf)
