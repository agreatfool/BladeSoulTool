# BladeSoulTool
## 1. 写在最前面
### 1.1 申明
* 该程序完全基于兴趣，资源全部来源于互联网，严禁将该程序用于商业用途
* 下面的教程及说明中涉及到系列特殊名词，这里不会一一解释，情参阅外部教程链接里的教程

### 1.2 下载包
* 最新的发布版本（这个版本永远是最新的）：[下载链接](https://github.com/agreatfool/BladeSoulTool/archive/master.zip)
* 分流版本（可能滞后）：[百度网盘](http://pan.baidu.com/s/1hq63NzY)

### 1.3 效果图
* 搞定配置：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x1.png)
* 现在还没有local的洪门道服upk文件：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x2.png)
* 运行脚本：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x3.1.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x3.2.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x3.3.png)
* 生成local的upk文件：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x4.png)
* 进游戏看效果：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-x5.png)

### 1.3 功能
执行脚本自动化：

* 将固定服装（洪门道服）替换成任何其他服装（完成）
* 将固定脸饰（待定）替换成任何其他脸饰（待制作）
* 将固定头饰（待定）替换成任何其他头饰（待制作）
* 备份替换前的资源，并能够进行恢复

## 2. 工作流程及外部教程
### 2.1 替换步骤
* 将目标资源upk拷贝到暂存目录，重命名成洪门道服等固定衣装的upk名字
* 修改目标资源upk中的贴图、模型等字段信息，修改成洪门道服等固定衣装的id
* 将修改完成的目标资源upk拷贝到剑灵客户端的local目录下
* 将有冲突的upk和目标资源upk进行备份
* 完成

### 2.2 还原步骤
* 针对服装，目前替换过去的都是洪门道服，且洪门道服在local目录下本来不存在，所以只需要删除之就行了
* 针对脸饰、头饰，暂时未制作

### 2.3 外部相关教程及资源
* 启蒙教程：[\[模型讨论\] 【教程】一步一步教你怎么改模型](http://bbs.17173.com/thread-7827655-1-1.html)
* 多玩的教程索引贴：[\[教程\] 学改模型的点进来!学学学学学学!](http://bbs.duowan.com/thread-36684134-1-1.html)
* 通用基础的时装修改：[\[教程\] 大型通用【时装修改】过程解析,解决出现黑白炫彩,变炎煌等问题\[多玩出品\]](http://bbs.duowan.com/thread-36725383-1-1.html)
* 多色时装修改：
    * [\[教程\] 【多玩剑灵时装修改教程】★★★【多色时装替换篇】★★★\[多玩出品\]](http://bbs.duowan.com/thread-36857279-1-1.html)
    * [\[教程\] 时装COL系列查找.多色修改需要,嗯...需要的来下载](http://bbs.duowan.com/forum.php?mod=viewthread&tid=37781051&fromuid=4870675)
* 灵族时装修改：[\[教程\] 正太?萝莉?不,,灵族才不分性别呢\ww/.灵族时装修改,打破性别的墙\[多玩出品\]](http://bbs.duowan.com/thread-36712163-1-1.html)
* 头饰修改：[\[教程\] 头饰替换教程之带【特效】篇\[多玩出品\]](http://bbs.duowan.com/thread-36705100-1-1.html)
* 武器修改：[\[教程\] ★★★你们想要的【武器修改】教程 ★★★极限恶女剑(灵剑通用)to无上剑](http://bbs.duowan.com/thread-37490178-1-1.html)

## 3. 使用教程
### 3.1 安装
* 第一次使用之前务必先安装下nodejs
    * 32位操作系统请安装：`resources\node-v0.10.26-x86.msi`
    * 64位操作系统请安装：`resources\node-v0.10.26-x64.msi`
    * 如果要删除的话，同样执行该文件，有remove选项
    * 这东西比`.net`轻量级多了，放心安装
    * 关于什么是nodejs，有兴趣的可以看：[百度百科](http://baike.baidu.com/view/3974030.htm)
* 然后执行一次 `run.bat`，脚本会去下载依赖库，只有一个，很快就好了，等显示滚动停止之后，按任何键退出
* 安装就结束了

### 3.2 配置
* 打开database文件夹，你会看到body.json文件和7个以种族性别为名的json文件
* body.json里是7个以种族性别为键的洪门道服配置，这是基础配置文件
    * 如果你不准备将工具的行为从 `洪门道服 换 其他任何服装` 换成 `你指定的服装 换 其他任何服装的话` 你就不需要编辑这个文件
    * 如果你希望不是洪门道服，而是其他你指定的服装的话，可以编辑body.json配置文件下的某一个种族性别配置项，来指定你的初始服装，但是，有两点条件：
        * 1. 指定对象不允许是多色服装
        * 2. 该服装的资源文件必须在 `bns` 文件夹下，并且在 `local` 文件夹下没有对应的文件存在
* 其他以种族性别命名的配置文件，里面每一项都是一件可替换的衣服，其格式都是一致的：
    * 键值：是`模型短码_种族性别`这样的格式，e.g 60076_JinF
    * Texture：2D贴图upk文件编号
    * Material：分为col1-3子项，每一项是当前颜色所需要的upk文件编号，一般来说，单色服装只会有col1一项是有值的，其他留空
    * Skeleton：骨骼upk文件编号
    * Model：模型编号，和键值相同
    * Name：服装名称，无实际作用，仅供查询使用，多色服装请使用如下格式：黑仙子-col1,白仙子-col2

### 3.3 使用
* 如果在你想要换装的种族性别对应的配置文件里已经有你要的服装的配置的话，下面几部就不需要做了
* 如果没有的话，你需要自己添加配置：
    * 找到自己想要的服装的短码：
        * 使用模型截图库：[下载](http://pan.baidu.com/s/1o6Ddlkm)
        * 或 使用第三方数据库：[时装资料列表](http://cha.17173.com/bns/fashions.html)，看到想要的衣服，下载该衣服的icon，上面就有短码了：Costume_60094_GonF_col1.png
    * 根据短码拼凑自己想要的衣服的模型名：`模型短码_种族性别`，e.g 60076_JinF
    * 使用这个字符串，到`resources\解包文件列表_2014-03-11.txt`里，查找骨骼upk文件名：`00019907`\SkeletalMesh3\60093_JinF.psk，这里的`00019907`就是upk文件名，记下这个文件名
    * 打开`resources\剑灵模型识别器 V1.0.13.1226 by 纯粹之伤\umodelGUI.exe`
    * 在umodelGUI的upk列表中选择刚才找出来的骨骼upk文件
    * 导出该服装相关upk资料，一个个打开看，文件夹里有`MaterialInstanceConstant`子文件夹的，说明就是Material颜色upk，记下这个upk的文件名
    * 同理，文件夹里有`Texture2D`子文件夹的，就是Texture贴图upk，记下这个upk的文件名
    * 使用刚才收集到的信息，添加到种族性别对应的配置文件里
* 然后运行`run.bat`，会提示你输入2个数据：
    * model info：就是刚才的 `模型短码_种族性别`
    * material col info：填写 col1 到 col3，具体是几取决于你要换的颜色是几，不输入直接回车，则是 col1，大部分情况下都是col1
* 结束了，等画面闪动结束，按任意键退出
* 进游戏，看服装

### 3.4 恢复
运行`restore.bat`脚本，所有的改动将会被恢复

### 3.5 捷径
如果你不喜欢`run.bat`脚本的问答模式，你可以修改`shortcut.bat`脚本里的选项，第一项是模型名，第二项是色指定col1-3，然后运行该脚本，效果和`run.bat`一致

## 4. 贡献配置
* 暂时可以直接选用的配置项还比较少，因为是我一个人填写测试的，希望使用过该工具的玩家能贡献自己的配置，我会纳入版本库中，方便后续的玩家（越多玩家贡献配置，越多后续玩家就不用自己编写配置项了）
* 如何贡献：
    * 有github账号的，给我发pull request那是最好了
    * 没有的话，在[工具首页](https://github.com/agreatfool/BladeSoulTool)右上角，找
        * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/issues-01.png)
    * 然后点击进入issues列表，点击
        * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/issues-02.png)
    * 按图片格式填写配置标题：
        * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/issues-03.png)
    * 及内容：
        * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/issues-04.png)

## 4. 附带工具及资源介绍
* `resources\剑灵UPK文件解包工具 V2.0_2013新年版`：解包工具，一般用来查色指定upk名
    * 仅从这个功能点上来说，它没有`resources\剑灵模型识别器 V1.0.13.1226 by 纯粹之伤\umodelGUI.exe`好用
* `resources\剑灵模型识别器 V1.0.13.1226 by 纯粹之伤`：客户端更新后，找不到最新的模型截图库的话，可以使用这个工具自行导出
* `resources\解包_BiG_mat_2014-01-25-用来查多色.txt`：主要用来查多色upk名，我的青狼红狼异色配置就是这里找到的
* `resources\mesh目录-用来查多色material的upk号.xml`：也是一个查异色upk名的文件
* `resources\解包文件列表_2014-03-11.txt`：主力资源查询文件
* 2个nodejs安装文件

## 5. 后续功能制作列表
关于这部分，可以查看文档：[TODO.md](https://github.com/agreatfool/BladeSoulTool/blob/master/documents/TODO.md)

## 6. 未解决问题列表
关于一些已知的，但未解决的问题，可以查看文档：[UNSOLVED.md](https://github.com/agreatfool/BladeSoulTool/blob/master/documents/UNSOLVED.md)
来了解情况
