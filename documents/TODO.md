# 后续工作列表
============

## 爬虫分支：
开启一个新分支`crawler`：

* 爬取17173服装数据库所有服装信息，制作自己的数据库文件
* 整理所有数据文件文件夹位置，现在database文件夹下只有一层结构，都是服装，接下来还要添加饰品之类的，都需要分开
* 制作脚本过滤charactertoolappearance_mesh.xml，将有用的信息取出来，制作成脚本需要的配置文件格式，并附加上从17173爬取过来的图片链接、中文名字等信息

## 新思路：
* 之前收到的mesh.xml还是有问题，有很多衣服只有skeleton的upk id，而没有关联的UPK id
* 网上有一个dropbox仓库里有公开页，里面有两个页面，一个是服装的一个是武器的具体upk列表和模型截图
* 既然别人能做，肯定就有方法能解决这个upk关联id查找的问题
* 一个方法是不自己解析客户端，直接使用别人的dropbox数据，可以解决燃眉之急，不过不长久，客户端更新之后就会需要新数据
* 另一个方法是自己用umodel.exe进行客户端upk解析，然后使用hex文件编辑的方式真正找出upk的id关联模式
* 还可以尝试拆解客户端，查找是不是有更具体的类似于mesh.xml这样的有描述upk关联的文件
* TODO：
    * 学习使用umodel.exe
    * 仔细观察、解析umodel.exe解析出来的资源，查找upk关联id
    * 编写一个grunt task来处理这种umodel的解析
    * 尝试拆解数据库查找mesh.xml

## 关于模型截图：
我现在猜测dropbox上分享的这个模型截图库里的截图，是作者在修改upk：
将默认的materialInstance改成col2、3的配色之后，重新另存为skeleton_material.upk这样的文件
然后再进行umodel的图像输出和截图
http://dl.dropboxusercontent.com/u/18196592/plaync/bns/dobok.htm
工作流程：
    * 在解析mesh.xml的时候，遇到有异色的mesh
    * 将skeleton拷贝到working下，将其内所有的col1的material的upk，替换成col2...的material的upk id
    * 查看效果，如果正常显示col2的衣服，则完美解决，可以直接截图制作，否则需要制作dropbox的爬虫
尝试：
    * 修改Skeleton文件里的material upk文件id到col2的文件id
    * Loading package: 00019614.upk Ver: 573/1 Engine: 4205 Names: 94 Exports: 2 Imports: 22 Game: 801A
      WARNING: Import(col1) was not found in package 00019614
    * 尝试结束，成功。以 60077_JinF 人女青狼为例，将 00015491 skeleton，00015486 texture，
      00019613 col1，00019614 col2，00019615 col3 复制到 resources/umodel 下，
      将00015491 skeleton的内容进行修改：
        * 将默认的 material 值 从 col1 的 00019613 替换成 00019614
        * 将默认的 material 选项 col1 替换成成 col3
        * 完成

思路：
 * 截图解决思路：
 * 1. 使用umodel.exe -view功能，启动展示窗，sleep 1秒，将UE Viewer窗口缩小，移动到屏幕0,0点，使用第三方软件截屏
 * http://www.nirsoft.net/utils/nircmd.html
 * http://stackoverflow.com/questions/10392620/how-can-a-batch-file-run-a-program-and-set-the-position-and-size-of-the-window
 * 2. 使用剑灵模型识别器，来批量导出图片，时候取用

## dropbox爬虫：
针对dropbox的数据，制作一个专门的爬虫

## 找到客户端内对于所有服装的命名的xml
找得到的话，就可以不用再去爬17173的数据库了

## 头饰修改：
* 搞清楚头部两个栏位的差别，头发、头饰、眼镜
* 选择一项容易入手的头饰作为基础头饰，类似于洪门道服的作用
* 因为头饰修改的不是洪门道服，所以需要单独的逻辑进行处理
* 在default task里添加头饰相关的工作逻辑（或者可以开一个单独的task）
* 且在default task里要有手段进行辨别是否是头饰修改，还是服装修改，maybe在database配置中添加新项？

## GUI：
* 学习使用node-webkit
* 制作GUI界面
* 浏览所有可替换的服装列表
* 点击可以进行替换

## 文档：
* 在README的使用阶段，需要说明下config的setting.json下的path设置，否则一开始就跑不起来
