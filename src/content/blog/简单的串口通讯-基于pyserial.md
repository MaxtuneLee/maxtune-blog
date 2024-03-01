---
title: "简单的串口通讯 基于PySerial"
pubDatetime: 2023-04-25
categories:
  - "other"
  - "单片机"
  - "智能科学"
tags:
  - "python"
  - "stm32"
  - "串口通讯"
  - "单片机"
  - "智能车"
description: "串行通讯是只用两条线直接进行数据传输的通讯方式，数据将会按照位的形式传输，虽然传输速度没有以字节传输数据的并行传输快，但是对于通讯量不大而且需要轻量级传输方案的时候串口通讯就是很好的选择。一般的串口通讯会使用到三条线，一条接收线一条发送线和一条接地线。"
---

串行通讯是只用两条线直接进行数据传输的通讯方式，数据将会按照位的形式传输，虽然传输速度没有以字节传输数据的并行传输快，但是对于通讯量不大而且需要轻量级传输方案的时候串口通讯就是很好的选择。一般的串口通讯会使用到三条线，一条接收线一条发送线和一条接地线。

串口通讯是异步的，所以能够做到在一根线上传送数据的同时在另一根线上接受数据。除此以外，完成串口通讯还需要数据发送方与数据接收方波特率、数据位、停止位和奇偶的校验匹配。

## 通讯参数

### 波特率

> **波特率是指数据信号对载波的调制速率，它用单位时间内载波调制状态改变的次数来表示**。

每秒钟通过信号传输的码**元数称为码元 的传输速率，简称波特率**，常用符号“Baud”表示，其单位为“波特每秒（Bps）”。串口常见的波特率有 4800、9600、115200 等。

波特率为9600bps；代表的就是每秒中传输9600bit，也就是相当于每一秒中划分成了9600等份。

因此，那么每1bit的时间就是1/9600秒=104.1666...us。约0.1ms。既然是9600等份，即每1bit紧接着下一个比特，不存在额外的间隔。两台设备要想实现串口通讯，这收发端设置的波特率必须相同。

### 数据结构

> 串口数据的发送与接收是基于**帧结构**，即一帧一帧的发送与接收数据。

<figure>

[![](@assets/images/1682322731-image.png)](https://mxte.cc/?attachment_id=344)

<figcaption>

传输数据结构图示例

</figcaption>

</figure>

1. 起始位为0点评，标志一个字符的开始
2. 数据位，紧跟起始位，是本次通讯发送的数据内容，发送的位数又通讯协议约定，传输的时候先传输低位，再传输高位。
3. 校验位，分为奇校验和偶校验，由发送和接受双方协定，并不是必须要发的。如果是奇校验，那么必须保证数据位加上校验位“1”数量为奇数，若偶校验则为偶数。
4. 停止位，代表传输字符的结束，可以是1位、1.5位或者2位，但是一定是逻辑高电平。
5. 空闲位：一个自负停止位结束到下个自负起始位开始，表示线路空闲，必须是高电平

## 单双工通讯

1. 单工：只能往一个方向传
2. 半双工：两边都可以传，但是一个时刻只能往一个方向传
3. 全双工：可以一边传一边收

## 上位机与STM32的串口通讯

笔者本次使用的是树莓派4B和STM32进行通讯，如果和你是使用Jetson nano 或者其他上位机的话可以查一查相应的通讯端口。

STM32串口通信接口有两种，分别是：UART(通用异步收发器)、USART(通用同步异步收发器)

<figure>

[![](@assets/images/1682322413-image.png)](https://mxte.cc/?attachment_id=343)

<figcaption>

串口连接示意图 TXD：数据发送引脚；RXD：数据输入引脚

</figcaption>

</figure>

如上面图所示，如果你要使用三根线完成串口通讯，要注意TXD和TXD需要交叉连接。

如果要使用电脑调试串口，可以购买CH340，一个USB转串口的工具，然后电脑上下载一个串口调试助手调试，Windows上推荐使用[VOFA+](https://www.vofa.plus/)，一个使用Qt编写的跨平台串口调试软件。在Mac上可以在Appstore下载串口调试助手，那个更加好使。

> 关于树莓派串口的提示
>
> 树莓派的gpio串口默认分配给了蓝牙，如果要使用的话要单独开启，而且使用树莓派的魔改debian系统和使用ubuntu系统的开启方式不太一样。如果你还没有给树莓派开启串口，需要先开启串口才能进行接下来的调试。你可以上网搜索相关文章，笔者之后也会写一篇教程聊聊树莓派在ubuntu系统上使用串口的一些经验。

## 程序部分

### 安装与引入PySerial

PySerial模块封装了对串行端口的访问。它为在Windows、OSX、Linux、BSD（可能是任何符合POSIX的系统）和IronPython上运行的Python提供后端。名为“Serial”的模块会自动选择适当的后端。使用以下命令安装：

```bash
pip install pyserial
或者
conda install pyserial
```

通过以下代码引入Pyserial

```py
import serial
```

### PySerial 常用函数汇总

```py
ser = ser.Serial("/dev/ttyAMA0", 115200)  # 打开串口并设置波特率为115200
print(ser.portstr)  # 能看到第一个串口的标识
ser.write("hello")  # 往串口里面写数据
ser.close()  # 关闭serial 表示的串口
ser.open()  # 打开串口
data = ser.read(num)  # 读num个字符
data = ser.readline()  # 读一行数据，以/n结束，要是没有/n就一直读，阻塞。
ser.baudrate = 9600  # 设置波特率
print(ser)  # 可查看当前串口的状态信息
ser.isOpen()  # 当前串口是否已经打开
ser.inWaiting()  # 判断当前接收的数据
ser.flushInput()  # 清除输入缓冲区数据
ser.flushOutput()  # 中止当前输出并清除输出缓冲区数据
```

### 打开串口

```py
serial.Serial(port=None, baudrate=9600, bytesize=EIGHTBITS, parity=PARITY_NONE, stopbits=STOPBITS_ONE, timeout=None, xonxoff=False, rtscts=False, write_timeout=None, dsrdtr=False, inter_byte_timeout=None, exclusive=None)

# example
ser = serial.Serial('/dev/ttyAMA0', 115200, timeout=0.01)
```

常用的可接受参数：

- port：端口
- baudrate：波特率
- timeout：读超时时间（这个参数设置为None则为等待永久，也就是用不超时；设置为0，非阻塞模式，马上返回数据，如果没有的话就是返回0；设置为x就是当请求的字节数可用时，马上返回，否则就等待x秒，然后返回在此之前接收到的所有字节）

### 检查串口是否正常打开

一般如果需要对串口进行进一步的操作，需要先检查串口是否正常打开，否则万一串口出现了问题的时候不好排查，也许你可以尝试这样写？额，看了下官方文档，说isOpen()方法在3.0已经被抛弃了，新的api是is_open()，版本不同的话需要留意一下。

```py
if ser.isOpen():
    print("[sys] Serial port is open")
else:
    print("[sys] Serial port is not open")
```

### 串口发送

可以使用\`write()\` 方法发送数据，但是write方法只接受二进制数据的数据类型，所以我们发送数据有两种方式，一个是发送bytes，另一个是bytearray。

#### bytes和bytesarray

`bytes()` 是一个内置函数，用于创建一个不可变的 bytes 对象。`bytes()` 方法可以接受多种不同的参数类型，并将其转换为 bytes 对象。下面是一些创建和使用的例子：

```py
# 创建一个空的 bytes 对象
empty_bytes = bytes()
print(empty_bytes)  # b''

# 通过字符串创建 bytes 对象
str_bytes = bytes("hello world", encoding="utf-8")
print(str_bytes)  # b'hello world'

# 通过字节串创建 bytes 对象
bytearray_bytes = bytes(bytearray(b'\x01\x02\x03\x04'))
print(bytearray_bytes)  # b'\x01\x02\x03\x04'

# 通过整数列表创建 bytes 对象
int_list_bytes = bytes([65, 66, 67])
print(int_list_bytes)  # b'ABC'
```

`bytearray()`函数其实和`bytes()`差不多，但是`bytearray()`是可以变化的。

```py
# 创建一个空的 bytearray 对象
empty_bytearray = bytearray()
print(empty_bytearray)  # bytearray(b'')

# 通过字符串创建 bytearray 对象
str_bytearray = bytearray("hello world", encoding="utf-8")
print(str_bytearray)  # bytearray(b'hello world')

# 通过字节串创建 bytearray 对象
bytes_bytearray = bytearray(b'\x01\x02\x03\x04')
print(bytes_bytearray)  # bytearray(b'\x01\x02\x03\x04')

# 通过整数列表创建 bytearray 对象
int_list_bytearray = bytearray([65, 66, 67])
print(int_list_bytearray)  # bytearray(b'ABC')
```

上面的例子可以看到其实两个在使用上其实区别不大，除了可变性以外，还需要注意的是由于 `bytes` 对象是不可变的，因此在内存中只需要存储一份数据，多个 `bytes` 对象可以共享同一份数据。而 `bytearray` 对象是可变的，必须在内存中存储整个数据的副本，因此在内存占用方面可能会更高。

```py
# 可变与不可变性的例子
# 创建一个 bytes 对象
b = b'hello'

# 创建一个 bytearray 对象
ba = bytearray(b'hello')

# bytes 对象是不可变的，无法修改
# b[0] = 72  # TypeError: 'bytes' object does not support item assignment

# bytearray 对象是可变的，可以修改
ba[0] = 72
print(ba)  # bytearray(b'Hello')
```

所以在选择的时候可以考虑这个数据是不是真的需要进行频繁的修改，如果需要进行频繁的修改操作，或者需要支持原地修改，那么应该选择 `bytearray` 对象；如果数据不需要修改，或者需要共享数据，那么应该选择 `bytes` 对象。

#### 通过串口发送二进制数据

在知道了上面的两个对象以后，我们就可以创建他们来发送了，下面是一个例子：

```py
        if ser.isOpen():
            send_data = 'something to send'.encode('utf-8') #传输字符串
            send_data = bytearray([0x01]) #传输一个十六进制的字节
            ser.write(send_data)
```

最后是传输过去了一个十六进制的字节。

这边遇到了一个坑，发送字符串或者bytes对象到单片机上的时候发现经常出错，也会有收不到信息的情况出现，但是bytearray就没遇到，比较稳定，如果在使用

### 读取数据

通过read()方法可以读取数据，也可以用readline()，read()默认是每次读取一个字节，可以通过传入参数来改变每次读取的数量，所以写读取代码的时候可以和负责写单片机的同学协定下每次传多少。

```py
# 读取数据
while True:
    try:
        data = ser.readline()
        if data:
            print(data)
    except serial.SerialTimeoutException:
        # 没有数据可读，继续执行其他操作
        pass
```

上面的例子使用了readline函数完成读取，需要需要注意的是,由于 `readline()` 方法会在读取到一行完整的数据时才返回，因此需要在串口数据流中确保每行数据都以回车符或换行符结尾。

```py
# 读取数据
while True:
    data = ser.read(8)
    if data:
        print(data)
    else:
        # 没有数据可读，继续执行其他操作
        pass
```

上面的例子一次读取了8个字节，可以和发送方协商一个，自由调整。如果读取到数据，则打印数据；如果没有数据可读，则继续执行其他操作。

## 更多探讨

一个应用肯定不只有串口通讯一个功能，由于串口通讯经常会有阻塞情况出现，所以的话也可以使用python多线程来处理通讯问题，把主线程用来处理主要的任务。如果是用的opencv的话记得如果使用了imshow的话不要把cv任务放在子线程处理，会出现卡住的情况……原因未知。另外还需要处理树莓派开机串口的权限问题，查了很多的资料，目前还没得到解决，如果有解决方案请一定要告诉我?

## 参考

> [pySerial API — pySerial 3.0 documentation (pythonhosted.org)](https://pythonhosted.org/pyserial/pyserial_api.html)
>
> [串口通信-1:RS232、RS485通信和python实现 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/603408910)
>
> [看完这篇，不要说不懂串口通信！-面包板社区 (eet-china.com)](https://www.eet-china.com/mp/a69082.html)
>
> [5.20 与串行端口的数据通信 — python3-cookbook 3.0.0 文档](https://python3-cookbook.readthedocs.io/zh_CN/latest/c05/p20_communicating_with_serial_ports.html)
>
> [用 Python 玩转串口（基于 pySerial）\_python 打开串口\_程序员仓库的博客-CSDN博客](https://blog.csdn.net/bryanwang_3099/article/details/120493736)
>
> [python - serial communication（串口通信） - 简书 (jianshu.com)](https://www.jianshu.com/p/add989eb6849)
