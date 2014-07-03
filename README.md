# BladeSoulTool
【17173模型组】一键换装还原工具，再也不用担心没衣服穿了

## 1. 效果
* 效果1：
    * 效果展示，注意看装备栏内已装备的道具及服装：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set1-01.png)
    * 万魂换白鸟，暗蓝换白口罩：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set1-02.png)
    * 人女默认36号头发换47号头发：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set-03.png)
    * 冲角团换纯白青狼：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set1-04.png)

---

* 效果2：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set2-01.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set2-02.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set-03.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set2-04.png)

## 2. 下载
* 分流文件夹：[百度网盘](http://pan.baidu.com/s/1dD7slaD)，下面找BladeSoulTool_vx.x.x.zip，后面序列数字越大版本越新，压缩包都有加密

## 3. 安装
* 解压缩下载的压缩包
* 安装.net2.0：
    * win7用户不需要安装，系统自带的
    * 已经安装过的用户直接跳过这步
    * 32位操作系统的请执行`resources/dotnet/dotnetfx20.exe`，一路默认
    * 64位操作系统的请下载安装：[Microsoft .NET Framework 2.0 版可再发行组件包 (x64)](http://www.microsoft.com/zh-cn/download/details.aspx?id=6523)
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
* 选这层文件夹：![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-5.png)
* 安装完请务必备份下原始的客户端资源，如上图，contents文件夹复制下就OK

## 4. 使用
执行根目录下的`BladeSoulTool.bat`，打开软件界面

### 4.0 预览
* 物品列表中的部分物品，因为不是玩家可用的模型，所以是没有官方icon的，这种物品，软件会给与默认的icon：![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/resources/others/no_icon_64x64.png)
* 此外，所有的icon及物品2D截图都是从网络下载的，如果下载失败，会显示失败的icon：![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/resources/others/error_icon_64x64.png)

### 4.1 替换
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-replace.png)
* 在物品列表中选中一项物品，点击中间下方的`选为原始模型`按钮，设定原始模型
* 在物品列表中选中一项不同的物品，点击中间下方的`选为目标模型`按钮，设定目标模型
* 点击中间上方的`将左边的替换为右边的`按钮
* 确认弹出的对话框
* 等待`操作执行完成`对话框弹出
* 进游戏看效果
* EDIT：
* 2.0版本之后，服装替换功能添加了多换多功能，原始模型不再局限于col1的模型
* 2.0版本之后，饰品也能替换了，记住一点，带发型的饰品不能同时有多个，否则会破相

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

### 4.5 关于灵族
* 灵族的服装中，大量衣服都男女使用一个相同的骨骼
* 在2.0版本之前（男女分开），你会发现很多衣服在灵女的分类内是找不到的
* 2.0版本之后，我把这两个种族分类合并成了一个大的“灵族”，方便模型查找及替换
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-race-lyn.png)

### 4.6 模型搜索
* 2.0版本之后添加模型搜索功能，只要你知道模型的短码，就能直接找到模型
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-search.png)
* 模型搜索功能只会从当前选中的模型，或者当前所在的模型行开始向下搜索，所以最好在搜索开始之前选中第一行模型

### 4.7 mod文件位置
* 2.0版本之后，模型补丁文件统一放在tencent文件夹下的mod子文件夹内：
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-mod-files-dir.png)
* 在某些情况下，全部恢复失败的时候，可以直接删除该文件夹来恢复所有的mod修改

### 4.8 图片资源下载
* 所有的icon及模型截图的图片都是从网络下载的，软件包内并未包含，在预览的时候下载有的时候会影响用户体验
* 2.0版本之后添加了一个下载所有图片的功能：
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-download-all.png)
* 此外，在我的百度盘分享文件夹内，现在添加一个系列的zip包：BladeSoulTool_ImageResources_vx.x.x.zip
* 同软件版本命名规则，后续数字越大说明版本越新
* 下载该zip包，解压到`BladeSoulTool/VS_GUI/BladeSoulTool/tmp`

### 4.9 模型冲突
* 在某些时候，游戏客户端会提示：
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-notify-conflict.png)
* 这是因为2.0版本之后的mod文件都放在子文件夹内，不会覆盖原来的客户端upk文件了，那么就有可能出现多个同名upk同时存在在客户端内
* 进入游戏的时候客户端会报告有重名文件
* 这里不影响正常游戏，点击确定即可

### 4.10 报告改模错误
* 在模型修改界面的最右上角现在添加了“报告错误”按钮
* 请在正常的改模步骤之后点击该按钮，软件将会向服务器发送一条错误报告
* 正常的改模步骤：选择原始模型，选择目标模型，点击替换按钮，等待成功提示框弹出

## 5. 申明
发布申明：<br/>
作者：Jonathan，论坛id：xenojoshua，支持团队：17173剑灵模型组<br />
我只会在17173发布，其他任何地方提供的下载皆为转载！<br />
17173剑灵模型替换讨论版地址：[http://bbs.17173.com/forum-9665-1.html](http://bbs.17173.com/forum-9665-1.html)<br />
17173发布帖地址：[http://bbs.17173.com/thread-8018028-1-1.html](http://bbs.17173.com/thread-8018028-1-1.html)<br />
后续的更新我也会持续发布在这个帖子里。<br />

转载申明：<br />
该软件是我秉着对剑灵这款游戏的爱而制作的，初衷是为了让更多玩家能体验剑灵装扮的玩法。因此我不会禁止软件的转载，但是请尊重作者的劳动，需要转载的请到17173私信我，谢谢。<br />
此外，因为我的初衷是为了帮助玩家，任何转载或是使用我的脚本、数据的二次开发者，不得使用以虚拟币、论坛币等方式限制玩家的下载、传播的做法。最多允许回复可见。<br />

License：<br />
该软件以GPLv2许可发布分享，他人修改代码后不得闭源，且新增代码必须使用相同的许可证。

## 6. FAQ & Tips
* 不要使用那些col为col20的模型

## 7. 后续工作
* 添加收藏列表，方便快速查找自己需要、常用的模型

## 8. 更新列表
* 2014-06-06：发布版本v1.0.0
* 2014-06-06：更新版本v1.0.1：修复3D模型预览的log文件未打包问题
* 2014-06-11：更新版本v1.0.2：添加新版本通知功能，修正滚动条问题
* 2014-06-11：更新版本v1.0.3：添加国际化
* 2014-06-21：更新版本v1.0.4：修正数据库分类算法，完善数据库。这一版的数据库是从客户端的upk分析出来的。修正icon不存在以及下载失败的提示。
* 2014-07-03：更新版本v2.0.1：
    * 添加服装多色换多色功能
    * 添加饰品换装功能
    * 添加下载所有图片资源功能
    * 添加模型查找功能
    * 添加报告改模错误功能
    * 灵男灵女分类合一
    * 换装算法更新，更少的更改，更少的文件，不动贴图文件
    * 所有换装mod文件都放在tencent下的mod文件夹内
    * 所有提示窗和弹出窗都做成模态，不会被忽略
    * 修正备份恢复功能，备份文件会一并删除，不再留下垃圾