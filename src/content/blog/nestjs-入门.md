---
title: "NestJS 入门"
pubDatetime: 2022-07-06
categories:
  - "前端"
  - "后端"
tags:
  - "nestjs"
  - "nodejs"
  - "后端"
  - "大前端"
description: "Nest (NestJS) 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的开发框架。它利用 JavaScript 的渐进增强的能力，使用并完全支持 TypeScript，当然写纯的 js 也是可以的。在底层，Nest 构建在强大的 HTTP 服务器框架上，比如说默认采用了 Express。Nest 再常见的 Node.js 框架上抽象封装了一下，但依然向开发者暴露出原生接口，让我们可以自由地使用第三方模块进行开发。"
---

Nest (NestJS) 是一个用于构建高效、可扩展的 [Node.js](https://nodejs.org/) 服务器端应用程序的开发框架。它利用 JavaScript 的渐进增强的能力，使用并完全支持 [TypeScript](http://www.typescriptlang.org/)，当然写纯的 js 也是可以的。在底层，Nest 构建在强大的 HTTP 服务器框架上，比如说默认采用了 Express。Nest 再常见的 Node.js 框架上抽象封装了一下，但依然向开发者暴露出原生接口，让我们可以自由地使用第三方模块进行开发。

## 安装 NestJS

使用 Nest CLI 构建项目，可以运行一下命令。

```bash
npm i -g @nestjs/cli
nest new projectname
```

[![](/assets/images/1657099957-image.png)](https://mxte.cc/?attachment_id=314)

稍等一段时间就安装好了

## NestJS 初体验

### 目录结构

[![](/assets/images/1657101203-image.png)](https://mxte.cc/?attachment_id=315)

```bash
src
  |- app.controller.spec.ts // controller 的测试文件
  |- app.controller.ts      // controller，路由和预处理
  |- app.module.ts          // module，为模块注册用
  |- app.service.ts         // service 真正的逻辑
  |- main.ts                // 程序入口
```

### Module

[![](/assets/images/1657101425-image.png)](https://mxte.cc/?attachment_id=316)

Module 是一个用 `@Module()` 注释的类， `@Module()` 提供了 Nest 组织应用结构的元数据。每一个应用的至少有一个 Module 一个根 Module ，根模块是 Nest 用来构建应用程序结构的起点。Module 的作用是再程序运行的时候给模块处理依赖。对于大多数应用程序，最终的架构将采用多个 Module ，每个 Module 都封装了一组密切相关的功能。

### Controller

Controllers 负责处理传入的请求并向客户返回响应。

[![](/assets/images/1657101947-image.png)](https://mxte.cc/?attachment_id=317)

一个 Controller 的目的是接收应用程序的特定请求。Router 控制哪个 Controller 接收哪些请求。通常，每个 Controller 有一个以上的 Router，不同的 Router 可以执行不同的动作。

为了创建一个基本的Controller，我们使用类Classes和装饰器Decorators。装饰器将类与所需的元数据metadata联系起来，使 Nest 能够创建一个路由图routing map（将请求与相应的 Controller 绑定）。

### Provider

![](/assets/images/Components1.png)

Provider是Nest的一个基本概念。许多基本的Nest类都可以被当作Provider--services, repositories, factories, helpers等等。Provider的主要思想是它可以注入依赖关系；这意味着对象可以相互建立各种关系。service 是真正处理业务逻辑的地方，所有的业务逻辑都会在这里处理。它可经过 module 引用其他模块的service，也可经过 module 暴露出去。

### 运行程序

```bash
pnpm run start
pnpm run start:dev //可以监听文件修改实时更新
```

然后访问 localhost:3000 可以看见出现了 Hello, World!。

## 创建新的 Module

NestJS CLI支持通过命令行形式创建新的 Module

```bash
nest g controller test
nest g service test
nest g module test
```

运行上述命令后，可以看见 Nest 为我们自动创建了新的文件夹和文件，并且还给我们再根 module 中自动填充了所需的引入。

<figure>

[![](/assets/images/1657103941-image-1024x283.png)](https://mxte.cc/?attachment_id=318)

<figcaption>

创建了文件与文件夹

</figcaption>

</figure>

<figure>

[![](/assets/images/1657103966-image.png)](https://mxte.cc/?attachment_id=319)

<figcaption>

新的 module 文件和文件夹

</figcaption>

</figure>

<figure>

[![](/assets/images/1657103994-image.png)](https://mxte.cc/?attachment_id=320)

<figcaption>

根 Module 中自动 import 与 Module 引入

</figcaption>

</figure>

我们在Test 模块的service层上编写

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class TestService {
  TestSuccess() {
    return "Test return successfully~";
  }
}
```

再test 模块的controller上写

```ts
import { Controller, Get } from "@nestjs/common";
import { TestService } from "./test.service";

@Controller("test")
export class TestController {
  constructor(private readonly testService: TestService) {}
  @Get("check")
  check() {
    return this.testService.TestSuccess();
  }
}
```

启动服务

尝试一下请求 http://localhost:3000/test/check，看到返回 Test return successfully~

[![](/assets/images/1657104842-image.png)](https://mxte.cc/?attachment_id=321)

## 请求处理

### Post 请求

在原来的test controller上添加

```ts
@Post('postcheck')
  postcheck() {
    return this.testService.TestSuccess();
  }
```

在terminal中测试

```bash
curl -X POST http://localhost:3000/test/postcheck
```

可以看到返回了 Test return successfully~

说明控制请求方法的是上面的@Post() Decorator

### 请求参数

正常的请求都会在请求时带参数，get请求会在url上附带，而post一般会在header里面附带参数

#### Get请求参数

Get参数一般会放在URL上，所以我们可以使用 `@Query` 修饰器

在Controller上修改

```ts
@Get('check')
  check(@Query('name') name: string) {
    return this.testService.TestSuccess(name);
  }
```

然后到 service上添加引入的参数和修改返回内容

```ts
@Injectable()
export class TestService {
  TestSuccess(name?: string) {
    return "Hello " + name + ", " + "Test return successfully~";
  }
}
```

请求 http://localhost:3000/test/check?name=Maxtune 可以看到返回了 Hello Maxtune, Test return successfully~

#### Post 请求参数

Post参数会有些不同，比Get参数稍微复杂一些，涉及到了DTO的传输，因为数据通过HTTP传输是文本类型，程序要使用这些数据需要将他们转换为变量，这就要使用到DTO（Data Transfer Object），它是展示层和服务层之间的数据传输对象。

新建./src/test/dtos/test.dto.ts

```ts
export class TestDto {
  name: string;
}
```

修改controller

```ts
@Post('postcheck')
postcheck(@Body() Test: TestDto) {
  return this.testService.TestSuccess(Test.name);
}
```

运行程序，尝试通过Post请求并带个name参数，可以看到返回Hello Maxtune, Test return successfully~

### 管道

[![](/assets/images/1657200748-image.png)](https://mxte.cc/?attachment_id=326)

管道一般会有两个用处

- 类型转换：转换输入的数据到所需的类型
- 数据验证：评估输入的数据是否有效，如果数据不合法的话就会返回相应的响应

对于上面这两种用处来说，管道会在请求被路由处理发生作用。简单的来说，管道就是NestJS处理请求之前对数据的预操作，NestJS里面内置了许多实用的管道，我们也可以自定义一个管道使用。

使用管道可以避免在service重写很多数据转换和验证的代码，

当使用非法请求，导致无法转换时，NestJs 会将请求报错处理，而正确参数则会转换后调用调用相应函数。通过简单的装饰器引用， NestJs 框架就可以自动做了参数检查与转换了。

#### Get请求管道

NestJS内置了这些管道

- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`

在这里我们尝试使用ParseIntPipe来做一个搜索用户的操作

首先在service上定义一下userdata

```ts
const userData = {
  1: { username: "Maxtune", uid: 1 },
};
```

然后添加上一个新的service

```ts
@Injectable()
export class SearchService {
  SearchService(uid: number) {
    return userData[uid] ?? "user not found";
  }
}
```

别忘了需要在app.module.ts中的Providers上添加上SearchService

[![](/assets/images/1657203786-image.png)](https://mxte.cc/?attachment_id=327)

然后回到controller，添加一个新的Get请求

```ts
  @Get('search')
  search(@Query('uid', ParseIntPipe) uid: number) {
    return this.searchService.SearchService(uid);
  }
```

oh对了，别忘了在constructor中添加上searchService引入

[![](/assets/images/1657203880-image.png)](https://mxte.cc/?attachment_id=328)

那么现在尝试请求`curl -X GET -d"name=Maxtune" http://localhost:3000/test/search?uid=1` 看到返回`{"username":"Maxtune","uid":1}` 说明成功啦

### 在Post请求中限制参数类型

需要借助 class-validator

另外安装 class-validator `pnpm add classvalidator class-transformer`

在main.ts 中修改

```ts
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

在之前写过的dto中添加一个新的

```ts
export class userDto {
  name: string;
  @IsNotEmpty() //不能为空
  @IsNumberString() //必须是纯数字字符串
  uid: number;
}
```

新建一个service并写入

```ts
import { Injectable } from "@nestjs/common";
import { userData } from "./test.service";

@Injectable()
export class PostSearchUserService {
  PostSearchUserService(uid: number) {
    return userData[uid] ?? "user not found";
  }
}
```

在controller中添加

```ts
@Controller('test')
export class TestController {
  constructor(

  ...
    private readonly postSearchService: PostSearchUserService,
  ) {}
  ...
  @Post('postsearch')
  postsearch(@Body() Test: userDto) {
    return this.postSearchService.PostSearchUserService(Test.uid);
  }
}
```

尝试请求`curl -X POST -d"uid=x" http://localhost:3000/test/postsearch` ，返回了错误`{"statusCode":400,"message":["uid must be a number string"],"error":"Bad Request"}`说明存在类型检验

当我们请求`curl -X POST -d"uid=1" http://localhost:3000/test/postsearch` 可以看到正常返回了`{"username":"Maxtune","uid":1}`

---

> 参考
>
> [NestJS 简介 | NestJS 中文文档 | NestJS 中文网 (bootcss.com)](https://nestjs.bootcss.com/)
>
> [Pipes | NestJS - A progressive Node.js framework](https://docs.nestjs.com/pipes)
>
> [SpringBoot中VO,DTO,DO,PO的概念、区别和用处 - 简书 (jianshu.com)](https://www.jianshu.com/p/0f7583f72187)
>
> [Web on Servlet Stack (spring.io)](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-requestmapping)
>
> [NestJs 处理请求 - 掘金 (juejin.cn)](https://juejin.cn/post/7008415513093079077#heading-2)
>
> [NestJs 初次上手 - 掘金 (juejin.cn)](https://juejin.cn/post/7008414959285567518)
