---
title: "浅谈 Web Components"
pubDatetime: 2024-04-03T10:58:18+08:00
modDatetime: 2024-04-03T20:01:18+08:00
categories:
  - "前端"
tags:
  - "Lit"
  - "Web Component"
  - "前端框架"
description: "Web Component 是一套技术方案，它可以允许你创建可重复利用的自定义元素，在 web 应用中以一个自定义标签的形式引入。最近觉得前端技术栈变得越来越复杂，所以想看点纯粹的东西，Web Component 在很久之前就有所耳闻，但是一直没有深入去了解过，因为当时目光都在当红的框架 React 和 Vue 上。经过这次一番搜索，让我对 Web Component 有了很大的改观，原来它已经不经意间遍布了我们日常访问的 Web 应用，并带来一些优秀的性能提升。"
---

Web Component 是一套技术方案，它可以允许你创建可重复利用的自定义元素，在 web 应用中以一个自定义标签的形式引入。最近觉得前端技术栈变得越来越复杂，所以想看点纯粹的东西，Web Component 在很久之前就有所耳闻，但是一直没有深入去了解过，因为当时目光都在当红的框架 React 和 Vue 上。经过这次一番搜索，让我对 Web Component 有了很大的改观，原来它已经不经意间遍布了我们日常访问的 Web 应用，并带来一些优秀的性能提升。

## 核心概念

2011 年 Alex Russel 首次提出了 Web Components 的概念 Web Components and Model Driven Views by Alex Russell·Fronteers 并首次演示了 demo, 这时候整套技术包括三个方面：Scoped CSS、Shadow DOM 和 Web Components。W3C 也在此时开始推进 Web Components 规范。

- Custom element（自定义元素）：一组 JavaScript API，允许你定义 custom elements 及其行为，然后可以在你的用户界面中按照需要使用它们。
- Shadow DOM（影子 DOM）：一组 JavaScript API，用于将封装的“影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，你可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。
- HTML template（HTML 模板）： `<template>` 和 `<slot>` 元素使你可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

### 简单的自定义元素栗子

一个自定义元素可以通过以下两种方式来实现

- 自定义元素
- 自定义继承元素，比如说基于 HTMLInputElement 做自定义的输入框
  比如说以下的例子

```js
class WordCount extends HTMLInputElement {
  constructor() {
    super();
    // 得到父亲节点
    var input = this;
    // 创建影子节点
    var shadow = this.parentNode.attachShadow({ mode: "open" });
    var count = "Words: " + countWords(input);
    // 创建一个 span 节点
    var text = document.createElement("span");
    text.textContent = count;
    // 将创建的节点添加到影子节点
    shadow.appendChild(text);
    //200ms 更新字数统计
    setInterval(function () {
      var count = "Words: " + countWords(input);
      text.textContent = count;
    }, 200);
    //定义统计字数的方法
    function countWords(node) {
      var text = node.value;
      return text.split(/\s+/g).length;
    }
  }
}
customElements.define("word-count", WordCount, { extends: "p" });
```

```html
<input is="word-count" />
```

这时候你可能想感叹，怎么有种又老又现代的感觉，竟然用一个定时器来更新统计，还有复杂的 api，这和写原生没啥区别啊，真是吐血了。确实，在经过 React 和 Vue 后大家的口味都变刁了，这也是为什么我一开始接触 Web Component 的时候对它的印象并不好。

### Shadow DOM

Shadow DOM 允许我们将隐藏的 DOM 树附加到常规的 DOM 树元素上。那么什么叫作隐藏的 DOM 树呢。
![alt text](/assets/images/shadowdom.png)
可以通过上图简单的理解。Shadow DOM 的主要作用就是**封装和隔离**，它是一个基于现有上下文的 封闭的 DOM 结构，它以 shadow root 节点为起始根节点，在这个根节点的下方，可以是任意元素，和普通的 DOM 元素一样，但是这棵子树不在主 DOM 树中——即影子 DOM 是一种不属于主 DOM 树的独立的结构，所以 Shadow DOM 内部的元素始终不会影响到它外部的元素（除了`:focus-within`)，这就为封装提供了便利！

> 类似 iFrame，但显然 Shadow DOM 要轻量化多了

Shadow DOM 都不是一个新事物，在过去的很长一段时间里，浏览器用它来封装一些元素的内部结构，以一个有着默认播放控制按钮的`<video>`元素为例，我们所能看到的只是一个`<video>`标签，实际上，在它的 Shadow DOM 中，包含来一系列的按钮和其他控制器。
![alt text](/assets/images/videoshadowdom.png)

### templates and slots

这部分让我想起了 Vue，如果对 Vue 比较熟悉的朋友对这个部分应该有种回家了的感觉，这边也不展开细讲，如果你对这部分感兴趣，可以去看看 MDN 的解释

https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_templates_and_slots

## Web Component 的优势和劣势

Web Component 作为一个浏览器原生的组件化支持，给它带来了得天独厚的优势——**框架无关**。

现在前端领域里面已经有数不清的前端框架了，更是产生了下面的梗图

![前端大手子](/assets/images/IMG_428820240303-224643.png)

**框架 API 差异巨大，学习与应用成本高。** 虽然框架在实现的某些概念是相同的，但是由于实现方式不一样，导致 api 区别非常大。比如说`Signal`在 Vue 和在 Solid 上的用法差异就是比较巨大的，Solid 作者在写区别的时候也特意强调了受到 Vue 设计的影响非常小，并且是特意让属性只读而非像响应式通常的做法，相反 Vue 那边宣称自己引领了框架的`Signal`设计（乐）。由此可见，框架的差异必然会产生了许多前端领域的派系纷争，最经典的就是 React 和 Vue 作者及用户 X 对喷，Angular 用户岁月静好。

**开始出现框架的框架的框架的套娃框架。** 框架都在尝试把自己打造成一个底层生态，并鼓励社区在其基础上建设，比如说从 React 发展出来的 Next，从 Next 发展出来的 Blitz，这其中又诞生出来一个问题，怎么开始套娃了（？之后再继续发展下去的话轮子永远是学不完的。

**单一生态的危机。** 虽然目前 React 手下巨将 Next 占据了市场主导，但是最近社区中越来越多的声音表明大家并不喜欢 React 与 Next 进行绑定，毕竟 Next 背后是一个商业公司 Vercel，在更早之前就有人批评称 Next 在非 Vercel 平台难以部署的问题，这在 Vue 生态下的 nuxt 是一样的。React 的杀手锏是其生态，但是随着目前的发展，之后会变成怎么样谁会知道呢？

这里并不会讨论哪个框架好哪个框架坏（是不是已经暗示了。相反，这里想提倡大家思考一下是否应该在业务中或者自己日常非 1 即 2 的思考方式。在我接手和我了解到的项目中，已经有很多项目开始了混合开发的模式——多种框架混合使用，根据业务需求选择相应合适的框架。

而除了在脚手架里面添加对每个框架的适配，更加优雅的方式我目前认为是使用 Web Component。

> Browser-native component library, framework-agnostic, base on web components.
>
> ——哈啰的 Web Component 组件库对自己的描述

**目前许多框架都支持 Web Component**，Vue 在很早以前就支持了，React 计划在 19 提供更加强大的支持，所以总体上来说无论是只使用 Web Component 还是与其他框架结合 Web Component 都是一个能得到持久支持和能渐进式使用的方案。

**比虚拟 DOM 更强大的性能。** React 和 Vue 都是虚拟 DOM 方案。如果在一些比较重的组件上结合 Web Component 使用可以极大地提高性能。

### 噔噔咚

既然 Web Component 在上面被吹得那么好，我们是不是应该开始看 MDN 文档开始上手了？

欸，不对，好像漏了一些东西？Web Component 的组件状态管理呢？组件的 SSR 呢？怎么前端现代化的设计好像都没有找到。

确实，Web Component 作为一套 native 的技术方案，它的 api 设计十分地原始和底层，这使得你需要用最基本的 api 去操作和更新 DOM，连 JQuery 都不如。

所以我们一般都使用基于 Web Component 的框架去编写 Web Component，比如说 [Lit](https://lit.dev/)、或者是腾讯家的 [OMI](https://omi.cdn-go.cn/home/latest/zh/)……
![alt text](/assets/images/lit.png)
这些框架给 Web Component 带来了更加现代化的全新体验，包含了更方便的定义自定义组件、Reactive 属性、Event Handler，以及更高阶的 Server Render 特性。

而且即使使用框架开发的 WebComponent 依然是跨框架的，毕竟本质还是一个 Web Component。

## Web Component 目前在生产环境的实践

也许你没留意，但是实际上 Web Component 已经遍布了我们的日常体验。

![alt text](/assets/images/youtubewebcomponent.png)

上面是 youtube 中 web component，google 在很早就在全站用上了 Web Cmponents，并且开源了自己播放器组件 [GitHub - GoogleWebComponents/google-youtube: YouTube video playback web component](https://github.com/GoogleWebComponents/google-youtube) 此外 google 开源的 Web Components 还是很多的，[Google Web Components · GitHub](https://github.com/GoogleWebComponents) ，包括地图、drive、日历等等。

推荐你尝试安装一个叫作 [Web Component DevTools](https://chromewebstore.google.com/detail/web-component-devtools/gdniinfdlmmmjpnhgnkmfpffipenjljo) 的插件来检查 Web Component，也许会有许多以外惊喜。

## 尾记

笔者写累了，不写了，再写就不是浅谈了，之后计划再深入写一下 lit 在开发中的实践，希望看了这篇文章之后你会对 Web Component 有了不一样的看法。另外之后我也计划用 lit 来重写博客里面部分的组件，之后再做更多的分享八。

> ## 参考链接
>
> 神奇的 Shadow DOM https://jelly.jd.com/article/6006b1045b6c6a01506c87ac
>
> Web Components 从技术解析到生态应用个人心得指北 https://www.cnblogs.com/zhoulujun/p/17972261
>
> HTML Living Standard https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-accessibility-example
>
> 你不知道的 Web Components - 过去和未来 https://www.albertaz.com/blog/web-component-history-and-future
>
> MDN - 使用自定义元素 https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements
>
> Web Components 的前世今生 https://juejin.cn/post/7308782855941242906
