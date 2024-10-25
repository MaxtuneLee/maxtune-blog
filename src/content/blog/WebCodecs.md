---
title: "WebCodecs 概述"
pubDatetime: 2024-07-26T16:34:18+08:00
modDatetime: 2024-07-26T16:34:18+08:00
categories:
  - "前端"
tags:
  - "WebCodecs"
  - "Web Worker"
  - "音视频"
description: "WebCodecs API 提供了对浏览器中已存在的编解码器的访问能力。它可以访问原始视频帧、音频数据块、图像解码器、音频和视频的编码器及解码器。"
---

## 技术概述

### 这是什么？

WebCodecs API 提供了对浏览器中已存在的编解码器的访问能力。它可以访问原始视频帧、音频数据块、图像解码器、音频和视频的编码器及解码器。

### 为什么需要 WebCodecs?

浏览器内部自带了媒体编码器功能，来处理网页中的多媒体信息。我们调用的一些 API 中就运用了这部分的能力，比如说 Web Audio API 和 WebRTC API。但是这部分的 API 只是输出 MediaStream，并且没有编解码相关 API 的暴露，所以没办法对视频流里面的单个帧或者没有封装的编码音频块和视频块，这对于要介入音视频原始数据进行处理的场景（比如 B 站的实时弹幕人像抠图能力、剪映的视频编辑能力）提出了挑战。

- WebAudio 只能解码完整的音频文件，但不支持数据流、不提供解码进度信息、更不支持编码
- MediaRecorder 只能录制特定格式（WebM、MP4）的视频，无法控制编码速度、输出缓冲区等
- WebRTC 与 MediaStream API 高度耦合，且不透明，仅能用于实时音视频通信
- Video 标签、MSE 最常用于视频播放，但无法控制解码速率、缓冲区长度，且只支持播放部分视频容器格式

> #### 💡 名词解释
>
> - Web Audio API：这部分 API 是浏览器用于处理音频的 API，对于没做过相关工作前端来说可能不太熟悉，但是对于音频应用来说，它就是音频界的 Canvas，其中包含了如同 Canvas 一样强大的音频信号控制控制方法。
> - WebRTC API：它用来传输音频和视频媒体流，并在内部对媒体进行编码和解码，目前市场上在线会议软件都有它的身影
> - MediaStream：流由多个轨道组成，例如视频或音频轨道。

### 和原来的方法有什么不同？

原来在 Web 上为了实现视频编解码能力，可以直接用 js 对帧进行处理，但是这太低效了，一般方法是将 FFmpeg 编译成 WebAssembly 然后在 web 上调用。
WebAssembly 虽然给我们带来便利，但是它也存在比较严重的问题，其中最明显的就是额外的网络开销，用户使用的时候需要额外下载 ffmpeg.wasm 文件，需要等待较长的时间。
同时用 WebAssembly 还有一个比较大的劣势是内存复制成本，和纯 JS 处理一样，编解码都需要复制帧到内存中然后再给 WebAssembly，处理一个 1080p 的视频，在桌面设备上每帧的平均处理时间为 25ms，也就是 40fps 的水平，而使用 Webcodecs，可以做到 1ms，也就是 100fps。
所以目前正在使用 WebAssembly 的厂都倾向于在 WebAssembly 中完成一切的处理以节省帧复制的时间，这也就造成 C/Cpp 的代码比重就会加大。

> #### 💡 TIPS
>
> 像 Figma、Zoom，它们都是在 WebAssembly 中完成对帧的一切绘制和后续处理工作。Figma 直接使用 WebAssembly 来操纵 Canvas，监听事件来实现用户交互功能。

### WebCodecs 设计目标

- 流式传输：对远程、磁盘资源进行流式输入输出
- 效率：充分利用设备硬件，在 Worker 中运行
- 组合性：与其他 Web API（如 Streams、WebTransport 和 WebAssembly）配合良好
- 可恢复性：在出现问题时能够恢复的能力（网络不足、资源缺乏导致的帧下降等）
- 灵活性：能适应各种场景（硬实时、软实时、非实时），能在此之上实现类似 MSE 或 WebRTC 的功能
- 对称性：编码和解码具有相似的模式

## 编解码流程介绍

![Alt text](/assets/images/codecs.png)
以上是一个视频的解析和解码过程，WebCodecs 完成的工作位于右侧绿色区域部分。

> ### 💡 TIPS
>
> 从图中也可以得到，需要注意的是，WebCodecs 只负责编解码，与 FFmpeg 不一样的是，视频的封装和解封装不在它的设计范围内，所以我们需要其它工具来帮助我们封装和解封装

在得到视频（音频）数据之后，我们首先要对其进行解封装处理。

> ### 💡 TIPS
>
> 封装（容器）格式：
> 编码的主要目的是压缩，各种不同的编码算法就是不同的压缩算法。而这些压缩的数据需要元数据才可以正确地被解析播放，所以就需要封装。常见的元数据包括：时间信息，编码格式，分辨率，码率等等。

![Alt text](/assets/images/container-box.png)

如图所示，封装格式中包含了音视频的编码数据和元数据，解封装工具可以帮我们把他们分开来，得到 meta data、encoded audio chunk、encoded video chunk。
在得到这三个数据之后，根据 meta data 中包含的时间信息和编码格式，我们可以开始使用 WebCodecs 中的编码器 API 来对上面的两个编码后的音频和视频数据进行解码处理。
最终得到解码后的原始图像数据和原始音频数据，这两个数据可以使用 MSE API 来放到 video 或者 audio 标签播放，也可以作为 CanvasImageSource 播放
编码就是以上步骤逆向操作，对应了 WebCodecs API 的设计宗旨：

> have similar patterns for encoding and decoding

## 兼容性和浏览器支持？

![Alt text](/assets/images/can-we-use-codecs.png)

## 开发者工具和资源

- Safari 开发者工具：可以可视化地调试 canvas 和 webgl 代码
- web-demuxer：基于 ffmpeg 的解封装工具
- mp4-muxer：mp4 封装工具

> ### 💡 TIPS
>
> 关于以上两个工具，其实 https://github.com/gpac/mp4box.js/ 是更好的选择，它同时有封装和解封装能力，并且对流的控制更方便，但是它不支持 ts

## 参考资料

- [Video Processing With WebCodecs](https://developer.chrome.com/docs/web-platform/best-practices/webcodecs)
- [WebGL2 图像处理](https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-image-processing.html)
- [WebCodecs Tag](https://hughfenghen.github.io/tag/WebCodecs/)
- [关于 H.264 的码率，720P、1080P 输出比特率设置 | Lenix Blog](https://blog.p2hp.com/archives/9617)
- [Webcodecs 音视频编解码与封装技术探索](https://juejin.cn/post/7361631167065145344#heading-13)
- [基于WebCodecs的网页端高性能视频截帧](https://www.bilibili.com/read/cv30358687/)
- [YouTube recommended upload encoding settings](https://support.google.com/youtube/answer/1722171?hl=en#zippy=%2Ccontainer-mp%2Caudio-codec-aac-lc%2Cvideo-codec-h%2Cframe-rate%2Cbitrate%2Ccolor-space%2Cvideo-resolution-and-aspect-ratio)
- [Web端H.265播放器研发解密](https://fed.taobao.org/blog/taofed/do71ct/web-player-h265/)
