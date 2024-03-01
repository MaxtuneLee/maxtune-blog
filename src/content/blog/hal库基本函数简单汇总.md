---
title: "HAL库基本函数简单汇总"
pubDatetime: 2021-10-26
categories:
  - "单片机"
tags:
  - "stm32"
  - "函数"
  - "单片机"
coverImage: "1635315359-image.png"
description: "1.调整PIN电平高低HAL_GPIO_WritePin(GPIOC,GPIO_PIN_*,GPIO_PIN_SET);//将PC*置高
HAL_GPIO_WritePin(GPIOC,GPIO_PIN_*,GPIO_PIN_RESET);//将PC*置低
//*是一个数字"
---

1.调整PIN电平高低

```c
HAL_GPIO_WritePin(GPIOC,GPIO_PIN_*,GPIO_PIN_SET);//将PC*置高
HAL_GPIO_WritePin(GPIOC,GPIO_PIN_*,GPIO_PIN_RESET);//将PC*置低
//*是一个数字
```

2.读PIN的电平

```c
HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_*);//读PC*的电平，常用于判断条件目前
```

3.反转PIN的电平

```c
HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_*);//反转PC*的电平
```

4.中断回调函数

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_PIN){
    //中断的时候要执行的函数放这里
}
```

提取转自哲哲的博客[HAL库基本函数（上） | ZheWana](https://zhewana.cn/2021/8e2b5d35a586/)，尚在学习更新中
