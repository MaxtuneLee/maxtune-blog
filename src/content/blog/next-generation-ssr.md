---
title: "Resumable - Next generation SSR ?"
pubDatetime: 2024-12-10T14:41:45.176Z
modDatetime: 2024-12-13T16:00:43+08:00
categories:
  - "前端"
tags:
  - "前端框架"
  - "SSR"
  - "前端性能优化"
description: "你遇到过网页加载完但是点不了的情况吗？不妨体验一下 Qwik，它是一个新的全栈框架，它的核心理念就是 Resumable，和目前框架常用的水合作用不同，Resumable 代表的是懒加载代码的方法，这会大大加快网页的 TTI 指标。"
---

> **摘要**
> 本文介绍了 Qwik 框架及其核心理念 Resumable，探讨了 SSR 和水合作用的现有问题，并详细讲解了 Qwik 如何通过懒加载和状态恢复来优化页面性能。文章还对比了 React 和 Astro 的解决方案，并总结了 Qwik 的优缺点及其在实际应用中的表现。

在参加 FEDAY 的时候看到嘉宾分享了一个叫做 Qwik 的框架，之前其实也有听说过，但是没去详细了解，毕竟现在前端框架出的太快了，我以为又是什么玩具框架。但是听完了他的分享之后感觉这个框架还是有点意思的，下面想来分享一下我对它的理解和以及目前存在的问题。

## 水合作用

目前前端生态中 SSR 已经占据了很重要的地位，许多框架都推出了自己的 SSR 框架，而 SSR 相比于 CSR 应用大大地提升了应用的 FCP 和 TTI 指标，但是 SSR 也有它的问题。从服务端渲染好的 HTML 只是一个静态网页，用户是无法进行交互的，所以在浏览器端中需要将服务器渲染的 HTML 和本地的框架 runtime 进行结合，那就是**水合作用**。
水合作用的一般过程如下图所示：
![alt text](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/hydration.png)

可以看到第一步获取 HTML 是非常快的，但是第二步需要将整个页面的 JS 代码都给拉下来，如果在网络不太好的情况下，这个步骤就比较耗时，所以这个时候虽然用户已经可以看到网页长什么样子了，但是点击上面的元素或者进行别的交互是没有反应的。

第三部分是执行整个页面的 JS 代码，具体来说，就是在就是在执行 React runtime 代码以及你写的网页的 js 代码；当这些都加载完了之后框架会在内存渲染 DOM 树，然后遍历 SSR 的 HTML 树进行匹配，但是这个时候不会给已经 SSR 的组件生成实体 DOM，而是将现有的逻辑绑定到对应的 HTML 元素上，这么听一下都感觉这个过程是十分耗性能的。

### 水合的问题

> 网页看起来加载完了，为什么有时候输入框和按钮之类的元素还是无法点击呢？

虽然 SSR 能够让用户快速地看到页面，提高 SEO 分数，但是这样也是有问题的。

- **服务端获取完所有的数据才能返回内容**：这十分好理解，SSR 出来的 HTML 数据都已经有了，这代表我们需要在服务端把网页上所需要的数据都给拉完才能返回到用户那边
- **浏览器需要加载完所有的内容才能开始水合**：框架一般需要比对内存构建的 DOM 树和 HTML 的 DOM 树，所以需要把所有组件的 JS 代码都拉到了执行完了才可以进行水合，否则 v-DOM 就对不上了，框架就不知道如何处理这部分的组件。
- **浏览器需要水合才能进行任何交互**：这个就是上面说的，虽然用户可以看到页面，但是点击上面的元素是没有反应的，因为这个时候还没有水合完成。尽管用户可能知识想进入到网页里面点击一个链接跳转到另一个页面，但是这个时候还是没有反应的。

## 现有的方案

目前有框架也在使用各种方式解决这个昂贵的水合问题。

### React

React 18 使用了**并发**的新架构，这个架构可以让 React 在渲染的时候可以中断，带来了一个新的组件 `<suspense>`，如果经常使用 next.js 的同学可能会比较常用，它可以将我们的程序分割成更小的**独立单元**，这样的话就不需要在一开始水合之前把整个页面的 JS 都拉下来执行一遍，而是可以**手动指定组件的边界**，分区域加载（你也可以理解成手动的 `code spliting`）。这样网页慢的部分就不会影响快的部分，从而提升 TTI。同时还更新了 Streaming 的能力，每个部分的组件都可以在准备好了之后立刻流式发送 HTML，然后执行 JS，然后水合，**不会互相阻塞**。
![alt text](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/react-hydrate.png)

### Astro

Jason Miller 2020 的时候提出了 Islands architecture 的概念，在之后 Astro 在他们的框架中应用了这个思想，将网页的每个组件分成一小块一小块的客户端 Island 或者服务端 Island，让他们分开来加载。这在提高性能的同时，让 Astro 可以同时支持多个框架的渲染，比如在一个组件中使用 React，在另一个组件中用 Svelte，实际上 Astro 官方也推荐这样做，下面是他们对此的描述。

> - Choose the framework that is best for each component.
> - Learn a new framework without needing to start a new project.
> - Collaborate with others even when working in different frameworks.
> - Incrementally convert an existing site to another framework with no downtime.

## Qwik 的方案

上面的方案确实很好地解决了水合一整个页面的性能问题，但是代价就是用户需要自己**显式地指定组件的边界**，比如手动使用`<suspense>`包裹，比如在 RSC 中我们需要用`"use server"` 和`"use client"`标记，在 astro 中需要使用复杂的 `client directive` 等，实际上都是**以运行时为主**的思考方式，因为像 React 一样的老框架有大量的存量 CSR 应用需要向前兼容，只能在这上面再加额外的东西，对开发者来说就需要考虑更多的问题，开发体验不够好。Qwik 的方案对比之前的方案来说就是**重点放在 SSR 上**，在开发的流程中就已经在处理服务端=>客户端的问题，所以开发者就不需要小心翼翼地判定哪里到哪里是服务端，哪里到哪里是客户端部分了。下面将会展开讲讲 Qwik 是怎么样解决这些问题的。

### 可恢复性

可恢复性指的是应用能够在**不重新执行组件代码的情况下恢复组件的状态**。和水合相比的区别是，水合需要**完整执行**所有的代码（就像上面所说的），所以是服务端执行一次、客户端再重新执行一次。而可恢复性则是服务端执行一部分，然后暂停并且序列化这些状态传到客户端，然后客户端反序列化之后**继续执行**没执行完的部分，从而恢复目标的状态。就像下面图展示的一样：

<video id="video" src="https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/hydration-and-resume.mp4" preload="auto" autoplay loop playsinline webkit-playsinline></video>

所以相比起水合来说要快得多，下面的图直观展示了两种方案的对比：
![hydration vs resumable](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/hydration-resumable.png)
用户在拿到 html 后直接就可以进行交互，而之后的 js 是按需加载的，大大提高了 TTI 指标。

Qwik 团队从水合需要做的三件事，一一解决来实现了这样的能力：

#### 监听器

应用程序需要监听器才可以响应用户的行为。在上面提到，在水合作用中我们需要等待所有的 JS 代码加载完了之后才能进行水合，对此之前框架提升性能的方案是用户**手动指定组件边界划分**（就像上面提到的 `<suspense>`）来实现 `lazy loading`，但是在 Qwik 中，一切都是默认 `lazy loading` 的，不需要开发者对此付出额外的心智负担。Qwik 实现的方案是在 DOM 中序列化了 `listener` 的属性。

```html
<button on:click="./chunk.js#handler_symbol">Increment</button>
```

Qwik 依然需要收集 listener 信息，但是这是在服务端中完成的，服务端完成这部分之后将所需信息给序列化如`./chunk.js#handler_symbol`，这个东西在 Qwik 中被成为 [**QRL**](https://qwik.dev/docs/advanced/qrl/)，在按钮点击之后，Qwik 会根据 QRL 去加载对应的代码块，然后执行对应的函数。

- Qwik 给每个元素设立一个全局的监听器，而不是特定的监听器，这可以在没有监听器代码的情况下也可以完成
- 序列化信息中包含了触发回调的所在 chunk 文件位置，所以 Qwik 可以自动加载该 chunk
- Qwik 会自动异步化处理这些 chunks，所以页面启动的时候并不会一下子把所有 chunks 都给拉下来

#### DOM 树构建

在现有的框架中，HTML 和 v-DOM 是分开的，导致需要重新执行所有代码并且进行 diff 来获取到组件边界。Qwik 在 HTML 塞入额外的序列化信息来存储这部分信息，所以这部分工作就可以在服务端完成，在客户端直接使用。
具体使用上来说的话，Qwik 使用 `$` 符号来划分**懒加载的边界 (Boundaries)**，如下面的例子所示：

```tsx
import { component$ } from "@builder.io/qwik";

// 这个组件会被单独打包到一个 chunk 里面
export default component$(() => {
  console.log("render");
  return (
    <button
      onClick$={() =>
        // 这个回调也是
        console.log("hello")
      }
    >
      Hello Qwik
    </button>
  );
});
```

在 Qwik 中存在一个叫 [**Optimizer**](https://qwik.dev/docs/advanced/optimizer/) 的构建时工具，使用 Rust 编写，在构建的时候将将应用程序分解为许多**小的、可延迟加载的**块。**优化器**（也就是上面提到的 Optimizer，下面也用**优化器**来叫）将表达式（通常是函数）移动到新文件中，并留下一个指向表达式移动位置的引用。

上面的例子中，由于存在`$`符号，所以在编译后组件就会分成多个块：

```js
// app.js
import { componentQrl, qrl } from "@builder.io/qwik";

const App = /*#__PURE__*/ componentQrl(
  qrl(
    () => import("./app_component_akbu84a8zes.js"),
    "App_component_AkbU84a8zes"
  )
);

export { App };
```

```js
// app_component_akbu84a8zes.js
import { jsx as _jsx } from "@builder.io/qwik/jsx-runtime";
import { qrl } from "@builder.io/qwik";
export const App_component_AkbU84a8zes = () => {
  console.log("render");
  return /*#__PURE__*/ _jsx("button", {
    onClick$: qrl(
      () => import("./app_component_button_onclick_01pegc10cpw"),
      "App_component_button_onClick_01pEgC10cpw"
    ),
    children: "Hello Qwik",
  });
};
```

```js
// app_component_button_onclick_01pegc10cpw.js
export const App_component_button_onClick_01pEgC10cpw = () =>
  console.log("hello");
```

这样的话，当用户点击按钮的时候，Qwik 就会根据`onClick$`的信息去加载对应的 chunk，然后执行对应的函数。

Qwik 的优化器十分强大，也十分有趣，如果你也对它感兴趣，建议你点击上面的链接去了解更详细的限制和使用方法。

#### 应用状态恢复

现有框架通常具有**将应用程序状态序列化为 HTML 的方法**，以便可以在激活过程中恢复状态。Qwik 的创新点是将状态管理更紧密地集成到组件的生命周期中。用起来比较直观的感知是，每个组件都可以进行**独立的进行延迟加载**。这在现有框架中并不容易实现，因为组件 props 通常由父组件创建，这会产生连锁反应，为了恢复组件 X，还需要恢复其父组件。而 Qwik 的实现允许在不存在父组件代码的情况下恢复任何组件。

Qwik 中并不是所有的对象都能序列化，其中也有一些限制：

- 类的序列化（instanceof 和 prototype）
- 流的序列化

所以说在服务端上不可以写这两个东西在组件内，否则运行时将会抛出错误。如果需要使用上面的两个东西，将他们**只跑在客户端上**，比如说写在 `useVisibleTask$()`（类似`useEffect`）里面。

#### 总结

上面也提到了，你会发现 Qwik 和写之前的前端框架都不一样，每个组件不是相互依赖的（像堆一样）而是独立的，这要求开发者使用不同的思路去开发 Qwik 应用，并且还需要考虑序列化恢复性的问题。

### Progressive

Vue 的官网就是大大的 `Progressive Javascript Framework`，它对渐进式的定义是 “Vue 的设计非常注重灵活性和'可以被逐步集成'”。Qwik 对 `Progressive` 的定义有所不同，它指的是下载应用所需要的代码，而不是下载全部代码。这和上面提到的相对应，Qwik 是一个注重懒加载的框架。
Qwik 实现懒加载主要分为上面提到的优化器，以及 Qwik 运行时的协作。这开发者可以正常编写组件，而 Qwik 优化器会将组件拆分成块，并在需要时下载它们。框架运行时不需要下载交互性不需要的代码，即使该组件是渲染树的一部分。实现了 DX 和 UX 的最优化。

## Qwik 的一些问题

Qwik 的全新设计给它带来了很多的优点，同时也带来了一些问题。

### 用户响应问题

在分享会中就出现了这么一个场景，主讲人在分享的时候打开了网页（这个网页在之前就加载渲染完了），然后这时候因为可能代理、网络原因导致网站上不去了，这时候菜单按钮是无法点击的，这就是因为 Qwik 的设计，它需要先加载对应的 chunk 才能执行对应的函数，所以这个时候就会有这个问题。这个问题在之前的框架中是不存在的，因为水合完成之后就结束了，而 Qwik 的设计就是需要先加载对应的 chunk 才能执行对应的函数，所以这个时候就会有这个问题。

在网络比较弱的环境中，如果 chunk 包太多，可能也会导致用户点击按钮之后等待时间过长，这个时候用户可能会认为网站卡住了，这个时候就会有用户体验的问题。

### HTML 冗余问题

在目前的 Qwik 版本中，HTML 存储了大量框架使用的序列化信息，让 HTML 体积变得更大，而且不好阅读：
![qwik ssr output](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/qwik-ssr-output.png)
听团队说在新的版本中已经解决这个问题，十分期待，我也会继续关注。（builder.io 网站中已经没有了这些标签）

## 总结

Qwik 创造的新理念 Resumable，以懒加载为核心提供了 SSR 的新方案，确实在目前比较同质化的社区中是个比较眼前一亮的设计。

作为 React 框架的重度使用者来说，之前再写 Next.js 的时候就经常遇到网页加载出来了，但是无法交互的情况（这个在 Shadcn 的网页中也可以复现），特别是在手机上，在网络情况不太好的时候，已经渲染出表单但是无法点击而是触发了双击放大确实令人抓狂。Qwik 的语法和 React 相近，迁移成本比较友好（Qwik 可以调用 React 组件，兼容 React 生态），性能上也有很大的进步，我觉得是一个十分值得关注的框架。

目前从 Qwik 的社区生态来看，已经提供了 Tailwind、Shadcn 类组件库、状态管理工具、路由管理等解决方案，看起来已经是一个 production ready 的框架了。在之后我也想将部分的项目迁移到 Qwik 上去尝试看看效果，以及体验一下实际的开发过程是否 DX 有大提升。

## 参考

- [New Suspense SSR Architecture in React 18](https://github.com/reactwg/react-18/discussions/37)
- [Islands architecture - astro](https://docs.astro.build/en/concepts/islands/)
- [Islands Architecture - Jason Miller](https://jasonformat.com/islands-architecture/)
- [客户端水化](https://www.quasar-cn.cn/quasar-cli-vite/developing-ssr/client-side-hydration)
- [Hydration is Pure Overhead](https://www.builder.io/blog/hydration-is-pure-overhead)
- [Resumability vs Hydration](https://www.builder.io/blog/resumability-vs-hydration)
- [Resumable vs. Hydration](https://qwik.dev/docs/concepts/resumable/)
- [The dollar $ sign](https://qwik.dev/docs/advanced/dollar/)
- [QRL](https://qwik.dev/docs/advanced/qrl/)
- [Optimizer](https://qwik.dev/docs/advanced/optimizer/)
