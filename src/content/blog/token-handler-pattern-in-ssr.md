---
title: "Token handler pattern 在 Next SSR 中的应用"
pubDatetime: 2025-03-21T15:52:13+08:00
modDatetime: 2025-03-23T16:39:00+08:00
categories:
  - "前端"
tags:
  - "Token handler pattern"
  - "Next.js"
  - "SSR"
  - "服务端渲染"
  - "鉴权"
description: "在前后端分离的Next.js项目中，传统JWT鉴权方式将Token存储在客户端，导致无法充分利用SSR能力。本文介绍如何通过Token handler pattern将认证逻辑迁移到服务端，使Next.js作为API网关处理Token，从而实现真正的服务端渲染和React Server Components，同时提升应用安全性、性能及用户体验。"
# draft: true
---

> 摘要
>
> 本文探讨了在前后端分离架构的 Next.js 项目中，如何通过 Token handler pattern 解决认证问题。传统方法将 Token 存储在 localStorage 中，导致必须在客户端加载完成后才能发起 API 请求，使得 Next.js 的 SSR 能力大打折扣。而 Token handler pattern 通过将 Next.js 服务器作为 API 网关，在服务端加密存储 Token 到 HTTP-only Cookie，代理所有 API 请求，从而实现了真正的服务端渲染。这种模式不仅提高了安全性（避免 XSS 攻击、降低 CSRF 风险），还充分发挥了 Next.js 的 SSR 和 RSC 特性，改善了开发体验（统一接口层、自动刷新 Token），并优化了性能（减少客户端请求、避免瀑布流请求）。虽然实现较为复杂，但对于追求性能和用户体验的 Next.js 项目来说，这是一个值得考虑的认证方案。

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

![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/assets/images/202503231541415.png)

- 首先用户登录，填写用户信息点击按钮向next发送请求
- next请求后端登录接口，获取到token与refresh token
- 在next侧加密这两个token，并把他们set到用户端cookie中
- 在之后用户发起其它请求时候（比如获取他们的帖子），携带cookie请求next
- next解密拿到token请求后端对应接口获取数据并渲染页面返回

在这个过程中用户并不会直接和后端服务进行交互、用户无法获取到真实的token和refreshtoken，并且用户并非直接获取到数据，而是获取到由next渲染好的rsc返回。

## 这么做的好处

采用 Token handler pattern 在 Next.js SSR 中有几个明显的好处：

### 安全性提升

1. **Token 不在客户端暴露** - 真正的 access token 和 refresh token 不再存储在客户端的 localStorage 中，而是通过 HTTP-only cookie 存储加密后的版本，这样可以有效防止 XSS 攻击者窃取 token。

2. **降低 CSRF 风险** - 通过合理配置 cookie 的 SameSite 属性和使用 CSRF token，可以进一步增强安全性。

3. **API 请求隔离** - 用户不再直接与后端 API 交互，降低了敏感接口被直接暴露的风险。

### 充分发挥 Next.js 特性

1. **真正的 SSR 能力** - 不再需要在每个组件上添加 `"use client"` 指令，可以充分利用 Next.js 的服务端渲染能力。

2. **RSC (React Server Components)** - 可以在服务端组件中直接获取数据，减少客户端 JavaScript 体积，提升性能。

3. **Streaming UI** - 支持流式渲染界面，优先渲染静态内容，提升首屏加载速度和用户体验。

### 开发体验改善

1. **统一的接口层** - 在 Next.js 服务端统一处理 API 请求，可以更好地封装接口逻辑，减少重复代码。

2. **自动刷新 Token** - 可以在服务端自动处理 token 过期的情况，进行无感知的 token 刷新，简化客户端逻辑。

3. **更清晰的关注点分离** - 前端开发者可以专注于 UI 交互，而不必过多关注鉴权细节。

### 性能优化

1. **减少客户端请求** - 服务端可以在一次请求中聚合多个 API 调用，减少客户端的网络请求次数。

2. **避免瀑布流请求** - 客户端不再需要先加载页面，再获取 token，最后发起数据请求，可以直接获取到包含数据的完整页面。

3. **缓存优化** - 可以在服务端实现更高效的缓存策略，减少不必要的后端请求。

## 常见问题、风险与解释

### 加密解密的时间消耗

在我的项目中，我使用拼接加上“chacha20-poly1305”来加密用户的Token，经测试检验，在每个请求中的解密阶段时间远远小于请求后端服务的时间，所以并没有什么影响

```bash
server request url: /search/dataSource server request time: 121.6239999999998 ms
decrypt time: 0.05069999999977881 ms
```

### Cookie 安全性

Next 作为一个代理给用户发 Cookie，用于存储加密后的后端的 Token 信息，虽然用户没办法直接用这些信息，但是如果 Cookie 被盗用还是十分危险的，为了防止 Cookie 在不应该访问的位置被获取到，一般可以设置下面的值。

| 属性            | 描述                                                |
| --------------- | --------------------------------------------------- |
| HTTP-only       | Cookie 不能被 JavaScript 代码读取，仅限 HTTP 访问   |
| Secure          | Cookie 需要 SSL 连接才能传输                        |
| SameSite=strict | Cookie 只能从当前网站源发送，不能从其他恶意域名发送 |

在next中，你可以参考 [Next.js Cookie 文档](https://nextjs.org/docs/app/api-reference/functions/cookies#options)

## 结语

Token handler pattern 为 Next.js 应用提供了一种优雅的方式，既能保持前后端分离架构的灵活性，又能充分利用 Next.js 的 SSR 和 RSC 特性。虽然实现起来比传统方法更复杂，但带来的安全性提升和性能优化是值得的。

通过将认证逻辑迁移到服务端，我们既提升了应用的安全性，又改善了用户体验和开发体验。对于任何关注性能和用户体验的 Next.js 项目，特别是在前后端分离架构中，Token handler pattern 都是一个值得考虑的认证方案。
