---
title: "基于华为云编译运行C语言程序"
pubDatetime: 2021-12-09
categories:
  - "clang"
  - "study"
tags:
  - "c语言"
  - "华为云"
  - "服务器"
description: "首先启动华为云服务器。然后打开FTP软件，在这里笔者选择的是xFtp，其它软件也是同理。可以看到操作完之后我们成功连接到了服务器，可以管理文件了。"
---

首先启动华为云服务器

[![](@assets/images/1639025964-image-1024x518.png)](https://mxte.cc/?attachment_id=198)

然后打开FTP软件，在这里笔者选择的是xFtp，其它软件也是同理

[![](@assets/images/1639026320-image-1024x741.png)](https://mxte.cc/?attachment_id=199)

可以看到操作完之后我们成功连接到了服务器，可以管理文件了

[![](@assets/images/1639026599-image-1024x733.png)](https://mxte.cc/?attachment_id=201)

然后将c程序上传到服务器，可以直接将它拖拽到右边窗口，它就会自动上传了

[![](@assets/images/1639026671-image.png)](https://mxte.cc/?attachment_id=202)

然后通过ssh连接服务器的shell，在这里笔者用的xshell，其他软件同理。

[![](@assets/images/1639026788-image-1024x726.png)](https://mxte.cc/?attachment_id=203)

通过cd命令来到我们上传文件的目录，然后用ls命令可以看到，c语言程序已经上传在服务器上了

[![](@assets/images/1639026937-image-1024x547.png)](https://mxte.cc/?attachment_id=204)

通过命令

```bash
gcc ./main.c
```

编译程序，现在再ls一下，可以看到有a.out文件，这就是编译出来的东西

[![](@assets/images/1639027045-image-1024x326.png)](https://mxte.cc/?attachment_id=205)

然后我们输入

```bash
./a.out
```

发现程序运行了。

[![](@assets/images/1639027101-image-1024x134.png)](https://mxte.cc/?attachment_id=206)

你学会了吗？快来试试吧（
