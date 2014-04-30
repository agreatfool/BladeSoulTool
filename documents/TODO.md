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

## 数据配置结构：
    "60076_KunN_col1": {
        "Texture": "00018544",
        "Material": "00018543",
        "Skeleton": "00018542",
        "Model": "60076_KunN",
        "Name": "红狼",
        "Class": "costume",
        "Col": "col1",
        "Pic": "costume_60076_KunN_col1.png",
        "Link": "http://cha.17173.com/bns/fashion/910192.html"
    },
    "60076_KunN_col2": {
        "Texture": "00018544",
        "Material": "00019612",
        "Skeleton": "00018542",
        "Model": "60076_KunN",
        "Name": "诱惑红狼",
        "Class": "costume",
        "Col": "col2",
        "Pic": "costume_60076_KunN_col2.png",
        "Link": "http://cha.17173.com/bns/fashion/910227.html"
    }

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
