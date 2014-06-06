# BladeSoulTool
## 1. 效果
* 冲角团军官改情人节服装：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-1.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-2.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-3.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-4.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-5.png)

---

* 白鬼改贵族：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-1.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-2.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-3.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-4.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-5.png)

## 2. 下载
* 分流文件夹：[百度网盘](http://pan.baidu.com/s/1dD7slaD)，下面找BladeSoulTool_vx.x.x.zip，后面序列数字越大版本越新

## 3. 安装
* 解压缩下载的压缩包
* 安装.net2.0：如果已经安装过的直接忽略，没有安装过的执行`resources/dotnet/dotnetfx20.exe`，一路默认
* 安装nodejs：执行`resources/nodejs/node-v0.10.26-x*.msi`，如果你是32位操作系统，就执行`x86`，如果是64位就执行`x64`，一路默认
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-1.png)
* 执行安装脚本：执行`resources/nodejs/install.bat`
    * 如果脚本最上面显示的是：
        * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-2.png)
        * 说明之前安装的nodejs成功了
    * 如果显示的文本是：`Command node not found, please install it first.`
        * 说明nodejs安装未成功，或者需要重启来生效
        * 一般来说安装完nodejs是不需要重启的，偶尔有例外会没有即时生效
* 当屏幕上显示的如下图内容的时候，说明install脚本运行结束了：
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-3.png)
* 执行根目录下的`BladeSoulTool.bat`，切换到`工具`页面，点击`选择`按钮，选择游戏安装目录
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-4.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-5.png)

## 4. 使用
执行根目录下的`BladeSoulTool.bat`，打开软件界面

### 4.1 替换
* 在物品列表中选中一项物品，点击中间下方的`选为原始模型`按钮，设定原始模型
* 在物品列表中选中一项不同的物品，点击中间下方的`选为目标模型`按钮，设定目标模型
* 点击中间上方的`将左边左边的替换为右边的`按钮
* 确认弹出的对话框
* 等待`操作执行完成`对话框弹出
* 进游戏看效果

### 4.2 还原
* 点击面板顶端种族选择框旁边的`全部还原`按钮
* 等待`操作执行完成`对话框弹出
* 进游戏看效果

### 4.3 预览2D截图
* 点击顶部两个`预览模型截图`按钮
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-2d-btn.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-2d-effect-1.png)

### 4.4 预览3D模型
* 点击顶部两个及中间下部的`预览3D模型`按钮
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-3d-btn.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-3d-effect-1.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-3d-effect-2.png)

## 5. 程序结构及细节
有兴趣了解下工具是如何工作的可以看下，见文档：[PROGRAM.md](https://github.com/agreatfool/BladeSoulTool/blob/master/documents/PROGRAM.md)

## 6. 问题及后续工作
见文档：[TODO.md](https://github.com/agreatfool/BladeSoulTool/blob/master/documents/TODO.md)

## 7. 更新列表
2014-06-06：发布版本v1.0.0