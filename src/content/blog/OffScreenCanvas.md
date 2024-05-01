---
title: "OffscreenCanvas — 用 Web Worker 来加速 Canvas 绘制"
pubDatetime: 2024-05-01T11:47:18+08:00
modDatetime: 2024-05-01T11:47:18+08:00
featured: true
categories:
  - "前端"
tags:
  - "Canvas"
  - "Web Worker"
  - "前端性能优化"
description: "OffscreenCanvas 是一个新的 API, 它可以让你在 Web Worker 中绘制 Canvas, 从而提高绘制性能. "
---

Canvas 大家都不陌生, 它是一个常用来绘制各种图形的 API, 也是使用 WebGL 载体. 它可以被用来绘制基本的图形, 图像, 在上面添加动画, 甚至还可以显示与处理视频. 由此可见, **它的用处非常广泛**, 可以用来开发富媒体的应用, 或者是游戏. 就像笔者, 目前使用 canvas 开发图片编辑器, 灵感来自于 Figma.

同时, 在现代网页中, 脚本的执行是用户体验的关键因素之一. 如果脚本执行时间过长, 会导致页面卡顿, 用户体验下降, 这是因为**Canvas 的逻辑和渲染是在主线程中执行的**, 如果绘制的内容过多, 会导致主线程被占用, 从而影响页面的交互, 这就会导致我们的页面变得不流畅.

所以, 为了解决这个问题, 我们可以使用 [OffscreenCanvas](https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas), 它是一个新的 API, 它可以让你在 Web Worker 中绘制 Canvas, 从而提高绘制性能.

## OffScreenCanvas 的浏览器支持度

目前主流的浏览器都已经支持了这个 API:

- Chrome 69+ 支持
- Firefox 105+ 支持
- Safari 16.4+ 支持

## 使用 OffScreenCanvas

在之前我们都是用 `<canvas>` 元素来绘制图形, 所以说它就是直接靠的 DOM 来绘制的. 而 OffscreenCanvas 正如它名字一样, 是 off screen 的, 也就是说它不依赖 DOM 来进行绘制.

正是因为 Canvas 的绘制和 DOM 解耦, 这样就可以提高 Canvas 的绘制性能 (众所周知, DOM 更新的性能确实是拉跨的, 如果一边更新 DOM 一边又要绘制 Canvas, 能不卡吗? )

既然 Canvas 绘制已经不依赖 Dom 了, 那我们可以把它放到其它地方跑, 比如说 Web Worker 中. 这样就可以避免主线程被占用, 提高页面的性能, 还能增加更多的玩法 (比如说在后台测量字体大小? 处理图片? 而不是塞一个看不见的 canvas 到 dom 上处理) .

> 需要注意的是, 虽然 Offscreen Canvas 可以不依赖 `<canvas>` 标签绘制, 但是它依然是一个浏览器层面上的 API, 所以它的使用还是需要依赖浏览器的支持. 也就是说 Node.js 等环境是不支持的.
>
> 如果你要在 Node.js 环境里面绘制 Canvas, 可以使用 [node-canvas](https://github.com/Automattic/node-canvas) 尽管作者已经很尽力去还原浏览器环境的 Canvas, 但是其实渲染效果还有偏差, 这边笔者曾踩过不少坑, 有机会与大家再分享.
>
> Node-Canvas 社区已经再着手支持 Offscreen API https://github.com/Automattic/node-canvas/issues/2232 官方预计在 3.0 版本推出

### 在 Web Worker 中使用 OffscreenCanvas

Workers 就是浏览器里面的"多线程", 我们可以用它来在后台跑多个任务.

把一些重的任务放在后台处理可以腾出更多的空间来让浏览器在主线程响应用户交互任务. 在之前我们没办法使用 Worker 来优化 Canvas 的绘制, Worker 里面是没办法操控 DOM 的, 但是现在我们可以使用 OffscreenCanvas API 来进行图形绘制了.

OffscreenCanvas 可以直接生成一个Canvas对象，可以直接在worker中使用，以下是一个用它获取红和蓝之间过渡颜色百分比的例子：

```js
// file: worker.js
function getGradientColor(percent) {
  const canvas = new OffscreenCanvas(100, 1);
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, "blue");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, 1);
  const imgd = ctx.getImageData(0, 0, ctx.canvas.width, 1);
  const colors = imgd.data.slice(percent * 4, percent * 4 + 4);
  return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]})`;
}

getGradientColor(40); // rgba(152, 0, 104, 255 )
```

### 给主线程降降压

就像上面讲的，将重的计算搬到 Worker上去可以让你给主线程释放很多压力。在Canvas上，我们用transferControlToOffscreen 方法来把常规的canvas映射给Offscreencanvas实例来使用。在映射好的OffscreenCanvas上绘制会被自动同步到源Canvas上。

```js
const offscreen = document.querySelector("canvas").transferControlToOffscreen();
const worker = new Worker("myworkerurl.js");
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

> OffscreenCanvas 是可以转移的。除了在信息中将其指定为一个字段外，还需要在 postMessage（Worker 的通信方式）中将其作为第二个参数传递，以便在 Worker 上下文中使用。

在下面的示例中，在更改颜色主题时计算量会巨大——就算在桌面端设备下都需要几毫秒来处理。您可以选择在主线程或 Worker 中运行动画。在主线程中，当重型任务正在运行时，你不能与按钮进行交互--线程会被阻塞。如果是在工作线程中，则不会影响用户界面的响应。

<iframe src="https://devnook.github.io/OffscreenCanvasDemo/keep-ui-responsive.html" width="100%" height="700" data-gtm-yt-inspected-100001731_63="true"></iframe>

反之亦然：主线程阻塞不会影响 Worker 上运行的动画。如以下演示所示。你可以尝试点击一下按钮：

<iframe src="https://devnook.github.io/OffscreenCanvasDemo/index.html" width="100%" height="440" data-gtm-yt-inspected-100001731_63="true"></iframe>

可以发现，如果是普通画布，当主线程阻塞的时候时，动画就会停止（一卡一卡的），而基于Worker 的 OffscreenCanvas 则能流畅播放。

### 和其它基于Canvas的库搭配使用

TODO：在Konva JS中使用的示例

> 参考自 https://web.dev/articles/offscreen-canvas
