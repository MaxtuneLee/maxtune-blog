---
title: "OpenCV实现答题卡检测"
pubDatetime: 2022-03-03
categories:
  - "study"
  - "机器视觉"
tags:
  - "opencv"
  - "机器视觉"
description: "识别出答题卡上的答案，计算正确和错误部分并给出得分

## 实现步骤

1. 图像预处理：转换灰度图、高斯模糊、边缘检测
2. 仿射变化：透视变化把图片摆正
3. 对答题卡圆形轮廓检测按列排序
4. 按行排序，对圆形区域的像素值检测
5. 计算答案是否正确"
---

识别出答题卡上的答案，计算正确和错误部分并给出得分

## 实现步骤

1. 图像预处理：转换灰度图、高斯模糊、边缘检测
2. 仿射变化：透视变化把图片摆正
3. 对答题卡圆形轮廓检测按列排序
4. 按行排序，对圆形区域的像素值检测
5. 计算答案是否正确

```py
import cv2
import numpy as np
from imutils.perspective import four_point_transform
from imutils import contours
import imutils

ANSWER_KEY = {0: 0, 1: 4, 2: 0, 3: 3, 4: 1}
```

## 图像预处理

像识别中，图像质量的好坏直接影响识别算法的设计与效果精度，那么除了能在算法上的优化外，预处理技术在整个项目中占有很重要的因素，然而人们往往忽略这一点。  
图像预处理，将每一个文字图像分检出来交给识别模块识别，这一过程称为图像预处理。  
图像预处理的主要目的是消除图像中无关的信息恢复有用的真实信息增强有关信息的可检测性和最大限度地简化数据从而改进特征抽取、图像分割、匹配和识别的可靠性。

## 基本函数用法

### 转换色彩空间

```py
cv2.cvtColor(src, code[, dst[, dstCn]])
```

**参数：**  
src: 它是要更改其色彩空间的图像。  
code: 它是色彩空间转换代码。  
dst: 它是与src图像大小和深度相同的输出图像。它是一个可选参数。  
dstCn: 它是目标图像中的频道数。如果参数为0，则通道数自动从src和代码得出。它是一个可选参数。

### 高斯滤波（高斯模糊）

```py
cv2.GaussianBlur(src, ksize, sigmaX, sigmaY, borderType) -->dst
```

**参数：**  
src：输入图像。  
dst：输出图像的大小和类型与src相同。  
ksize：高斯内核大小。 ksize.width和ksize.height可以不同，但它们都必须为正数和奇数，也可以为零，然后根据sigmaX和sigmaY计算得出。  
sigmaX： X方向上的高斯核标准偏差。  
sigmaY： Y方向上的高斯核标准差；如果sigmaY为零，则将其设置为等于sigmaX；如果两个sigmas为零，则分别从ksize.width和ksize.height计算得出；为了完全控制结果，而不管将来可能对所有这些语义进行的修改，建议指定所有ksize，sigmaX和sigmaY。

在这个项目中

```py
image = cv2.imread('answers.png')  #导入图片
contours_img = image.copy()  #复制一份图片
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  #转换RGB图像空间到灰度空间
blurred = cv2.GaussianBlur(gray, (5, 5), 0)  #高斯滤波
edged = cv2.Canny(blurred,75,200)  #边缘检测函数
cv2.imshow('edged',edged)  #展示图片
cv2.waitKey(0)
```

经过处理后展示图像得

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311202-D__study_com_Opencv_Document_opencv_Pasted-image-20220204170547.png)](https://mxte.cc/?attachment_id=223)

## 提取图片轮廓

边缘检测后得图片提取轮廓,轮廓绘制出来效果

```python
cnts = cv2.findContours(edged.copy(),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)[0]  #寻找轮廓
cv2.drawContours(contours_img,cnts,-1,(0,0,255),3)  #画出轮廓
cv2.imshow('contours_img',contours_img)
cv2.waitKey(0)
```

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311211-D__study_com_Opencv_Document_opencv_Pasted-image-20220206104558.png)](https://mxte.cc/?attachment_id=224)

对边缘检测后的图片提取轮廓，按面积从大到小排序，对提取的轮廓使用多边形近似，如果多边形近似为四边形，说明是答题卡

```python
if len(cnts) > 0:
    # 对轮廓大小进行排序，reverse=true表示降序，key表示通过轮廓的大小来排序
 cnts = sorted(cnts,key=cv2.contourArea,reverse=True)
    for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c,0.02*peri,True)
        if len(approx) == 4:
            docCnt = approx
            break
```

## 仿射变化

```py
paper = four_point_transform(image, docCnt.reshape(4, 2))
warped = four_point_transform(gray, docCnt.reshape(4, 2))
cv2.imshow("papaer",paper)
cv2.waitKey(0)
```

图片摆正得

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311216-D__study_com_Opencv_Document_opencv_Pasted-image-20220206113500.png)](https://mxte.cc/?attachment_id=225)

## 答题卡圆形轮廓检测并排序

```py
#Otsu's 阈值处理
thresh = cv2.threshold(warped,0,255,cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
# cv2.imshow('thresh',thresh)
# cv2.waitKey(0)
thresh_Contours = thresh.copy()
#找出每一个轮廓
cnts = cv2.findContours(thresh.copy(),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
cnts = imutils.grab_contours(cnts)
#给轮廓描个边测试一下
# test = paper.copy()
# cv2.drawContours(test,cnts,-1,(0,0,255),3)
# cv2.imshow('contours',test)
# cv2.waitKey(0)
```

### otsu's 阈值处理

Ostu是一种阈值选择的算法，在面对色彩分布不均匀的图像时，阈值的选择就会变得很复杂。这时我们就不需要凭借经验去认为设定，而是根据Otsu算法来计算出最合适的阈值。  
Ostu的思想很简单，属于暴力寻优的一种，分别计算选用不同灰度级作为阈值时的前景、背景、整体方差。当方差最大时，此时的阈值最好。  
处理后得到图片如

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311223-D__study_com_Opencv_Document_opencv_Pasted-image-20220206143055.png)](https://mxte.cc/?attachment_id=226)

画出每一个轮廓后得

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311227-D__study_com_Opencv_Document_opencv_Pasted-image-20220206143118.png)](https://mxte.cc/?attachment_id=227)

这时候我们需要筛选掉我们不要得轮廓，然后得出答题卡上圆形得答题区

```py
#遍历轮廓
for c in cnts:
    (x,y,w,h) = cv2.boundingRect(c)
    ar = w/float(h)
    if w >= 20 and h >= 20 and ar >= 0.9 and ar <= 1.1:
        questionCnt.append(c)
#画出筛选后轮廓展示测试
# test = paper.copy()
# cv2.drawContours(test,questionCnt,-1,(0,0,255),3)
# cv2.imshow('contours',test)
# cv2.waitKey(0)
```

遍历所有的轮廓，选出符合条件的圆形轮廓，放入questionCnt列表  
画出来得到如图

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311233-D__study_com_Opencv_Document_opencv_Pasted-image-20220206143305.png)](https://mxte.cc/?attachment_id=228)

## 检测每题标记涂黑的答案

```py
questionCnt = contours.sort_contours(questionCnt,method="top-to-bottom")[0]
corect = 0  #初始化变量记录正确答案个数
# np.arange(起点,终点,步长)
# enumerate(列表,起点) -> 有下标的列表
for (q, i) in enumerate(np.arange(0, len(questionCnt), 5)):
	#从左到右对每一行的答案进行排序
    cnts = contours.sort_contours(questionCnt[i:i + 5])[0]
    bubbled = None
```

首先将questionCnts按照top-to-bottom的顺序排序，然后用for循环遍历所有答题区  
每一个问题都有五个答案，所以要判断每个问题是否回答正确就要五个五个地遍历所有圆圈

```py
for (j, c) in enumerate(cnts):
    mask = np.zeros(thresh.shape, dtype="uint8")
    cv2.drawContours(mask, [c], -1, 255, -1)
    # cv2.imshow('mask',mask)
	 # cv2.waitKey(0)
	mask = cv2.bitwise_and(thresh, thresh, mask=mask)
    total = cv2.countNonZero(mask)
    if bubbled is None or total > bubbled[0]:
        bubbled = (total, j)
```

遍历每行答案，提取掩膜选定区域的图像（也就是每个答题区）数里面不是0的像素的个数，得出非零像素最多的那个圆圈就是填涂的地方，把他放在bubbled里  
第一行前两个圆圈的示意图

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311259-D__study_com_Opencv_Document_opencv_Pasted-image-20220207103227.png)](https://mxte.cc/?attachment_id=230)

[![](https://maxtuneblog.oss-cn-shenzhen.aliyuncs.com/old/assets/images/1646311263-D__study_com_Opencv_Document_opencv_Pasted-image-20220207103235.png)](https://mxte.cc/?attachment_id=231)

```py
    color = (0, 0, 255)
    k = ANSWER_KEY[q]

    if k == bubbled[1]:
        color = (0, 255, 0)
        correct += 1

 cv2.drawContours(paper, [cnts[k]], -1, color, 3)

score = (correct / 5.0) * 100
print("[INFO] score: {:.2f}%".format(score))
cv2.putText(paper, "{:.2f}%".format(score), (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
cv2.imshow("Original", image)
cv2.imshow("Exam", paper)
cv2.waitKey(0)
```

从一开始设定好的答案那提取出当前选项的答案是第一个和bubbled的下标比较，如果相同就说明答案正确，否则错误。用绿色画出正确答案，用红色画出错误答案。最后计算分数，并将其显示在结果页。

## 将结果保存到excel

```py
def writeDataIntoExcel(xlsPath: str, data: dict):
    writer = pd.ExcelWriter(xlsPath)
    sheetNames = data.keys()  # 获取所有sheet的名称
 # sheets是要写入的excel工作簿名称列表
 data = pd.DataFrame(data)
    for sheetName in sheetNames:
        data.to_excel(writer, sheet_name=sheetName)
        # 保存writer中的数据至excel
 writer.save()

data = {"corrects": [correct], "score": ["{:.2f}%".format(score)]}
xlsPath = "score.xlsx"
writeDataIntoExcel(xlsPath, data)
print("[INFO] Score already saved in excel file")
```

用pandas库，打开excel文件，将获取到的数据写入到score.xlsx文件中，关闭并保存文件
