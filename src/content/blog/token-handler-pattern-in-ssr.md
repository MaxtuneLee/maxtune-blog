---
title: "Token handler pattern 在 Next SSR 中的应用"
pubDatetime: 2025-03-21T15:52:13+08:00
modDatetime: 2025-03-21T21:49:43+08:00
categories:
  - "前端"
tags:
  - "Token handler pattern"
  - "Next.js"
  - "SSR"
  - "服务端渲染"
  - "鉴权"
description: "在使用 JWT 鉴权的前后端分离项目中应用 Token handler pattern 完成后端接口鉴权，以充分发挥 Next.js 的 SSR 能力以及应用 RSC。 "
draft: true
---

# Next.js 的尴尬

在一般的 CSR SPA 的项目中，我们经常用 JWT 来与后端完成鉴权，我们一般会把 Token 放在 LocalStorage 或者 SessionStorage 中，加载完网站之后，再客户端取 Token 然后直接发请求到服务端，如下面的图所示。

![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/assets/images/202503212032549.png)

可以看到由于 Token 是存在客户端，所以我们需要把**最花费时间的关键任务**——请求 API 放在了客户端去做。这对于一个全栈框架 Next.js 来说是个很尴尬的点，如果是独立开发者也把后端写了那还好，可以直接把后端也用 next 来写，直接用自带的 cookie session 完成 Server Action 的鉴权或者直接在 RSC 中获取完所有的数据。然而在团队中通常不会让你一个人吭哧吭哧全写完，一般都采用前后端分离的架构。所以我们目前在团队中用 Next.js 的时候新建文件第一件事一定是写 `"use client"` 这让 Next.js 的 SSR 以及 steaming UI 特性完全没办法好好发挥，同时也没办法用好 RSC 的设计，直接当成了一个普通 CSR 应用去写了。

![老项目成吨的 “use client”](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/assets/images/202503212049408.png)
老项目成吨的 "use client"，即使有的地方是可以不跑"client"的，但是有个小地方需要调api所以还是跑在了客户端。

> ## 什么？你问为什么不用 Vite？
>
> 也对吼，如果只是个 tob 的中台应用的话就用了，但是对于 toc 端应用来说一些指标以及 seo 还是比较重要的，而且 Next.js 作为一个 All in one的解决方案确实写起来是相对来说比较省心舒服的。

# 解决一下这个尴尬

上面提到的问题主要在于**Token需要存在客户端localstorage存取**、那有没有可能放别的地方呢？
此时我想到了之前在next中的鉴权交互，每次用户请求一个新的页面或者发起一个server action，都会带上cookie在next的node server鉴权，如果我们把这个**token放在cookie**中而不是localstorage呢？
要实现这样的想法，我们需要将next server作为一个**API请求的网关**，帮用户**托管**他们后端服务的token，并夹在中间帮助他们与后端进行交互。也就是这次博客的主题 **Token handler pattern**。

## Token handler pattern

在一般的API交互中，用户一般会通过反向代理直接和后端服务进行交互，如下图所示。

![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/assets/images/202503212142524.png)

用户的 Access Token 一般会放在Header，直接传给后端。

Token handler pattern（我也不到咋翻译啊）是一个在[BFF](https://samnewman.io/patterns/architectural/bff/)中常用的设计模式，其核心就是在用户和后端之间多出了一个API网关，用于代理用户和对应的后端服务进行鉴权，如下图所示。

![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/assets/images/202503212129424.png)

在我们的这个场景中，要实现这样的目标不需要做的像上面图一样复杂，可以简化架构至下面如图所示。
