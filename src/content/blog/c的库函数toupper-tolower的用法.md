---
title: "C++的库函数(toupper/tolower)的用法"
pubDatetime: 2021-09-10
categories:
  - "clang"
  - "study"
tags:
  - "c"
description: "toupper/tolower函数的原型如下, 是的，它可以自由变换大小写，十分方便 :-) ,那么它用起来是这样的"
---

toupper/tolower函数的原型如下

```cpp
int tolower(int c)
{
	if ((c >= 'A') && (c <= 'Z'))
		return c + ('a' - 'A');
	return c;
}

int toupper(int c)
{
	if ((c >= 'a') && (c <= 'z'))
		return c + ('A' - 'a');
	return c;
}
```

是的，它可以自由变换大小写，十分方便 :-)

那么它用起来是这样的：

```cpp
#include <iostream>
#include <string>
#include <ctype.h>
using namespace std;
int main()
{
    string str="Here is Maxtune :-)";
    // for (int i=0;str[i]!='\0';i++){
    for (int i=0;i<str.size();i++){
        str[i] = toupper(str[i]);
    }
    cout<<str<<endl;
    return 0;
}
```

最后就是输出了

[![](@assets/images/1631289919-image.png)](https://mxte.cc/?attachment_id=132)
