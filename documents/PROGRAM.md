## 1. 脚本技术选择
[nodejs](http://www.infoq.com/cn/articles/what-is-nodejs)，学习简便、功能强大，且跨平台

## 2. 现有的grunt功能列表
* crawler：爬取17173的剑灵数据库，抓取短码、名字、缩略图、缩略图链接、数据库页链接
* crawler_check：检查`database/crawler/[part]/`下的list.json和data.json两个文件，里面的条目数量是否匹配，不匹配的话，少了哪几项，一般来说是list.json比data.json要多
* parser_prepare：将国服`contents\Local\TENCENT\CHINESES\CookedPC`下的UPK，全部拷贝到`contents\bns\CookedPC`下，如果有重复的文件，则忽略不覆盖
* parser：解析客户端，分析模型数据
    * 解包`contents\Local\TENCENT\CHINESES\data\xml.dat`，如果已经解包的内容存在，则跳过这步
    * 读取`resources/dedat/output/engine/charactertoolappearance_mesh.xml`这个解包解出来的mesh配置文件
    * 生成`database/costume/[part]/data.json`数据文件
* parser_check：检查上面一步中生成出来的数据文件结构是不是预期的，是否有缺损的键
* shooter：在parser的数据准备完成之后，可以执行，用来截图每个衣服的UE Viewer预览
* shooter_check：检查shooter执行的时候的日志，是否有出错信息（这里需要手动修改Gruntfile.js里的日志文件位置）
* replace：换装功能
* restore：恢复换装

## 3. 附带工具及资源介绍
* `resources\剑灵UPK文件解包工具 V2.0_2013新年版`：解包工具，一般用来查色指定upk名
    * 仅从这个功能点上来说，它没有`resources\剑灵模型识别器 V1.0.13.1226 by 纯粹之伤\umodelGUI.exe`好用
* `resources\剑灵模型识别器 V1.0.13.1226 by 纯粹之伤`：客户端更新后，找不到最新的模型截图库的话，可以使用这个工具自行导出
* `resources\解包_BiG_mat_2014-01-25-用来查多色.txt`：主要用来查多色upk名，我的青狼红狼异色配置就是这里找到的
* `resources\mesh.xml`：也是一个查异色upk名的文件
* `resources\解包文件列表_2014-03-11.txt`：主力资源查询文件

## 4. 第三方组件包
* 在npm下管理的node_modules：
    * cheerio：node端，的html解析工具
    * express：node端，的http服务器
    * grunt：node端，命令行工具
    * isnumeric：全端，判断数字是否是数字型
    * logfile-grunt：node端，grunt日志输出工具
    * moment：全端，时间组件
    * request：node端，请求发送组件
    * serve-favicon：node端，favicon组件
    * stack-trace：node端，错误stack输出组件
    * underscore：全端，utility工具包
    * xml2js：node端，xml解析工具
* 在bower下管理的bower_components：
    * angular：angular框架
    * angular-bootstrap：angular的bootstrap显示组件
    * angular-route：angular的route组件
    * angular-route-segment：angular的route增强组件
    * bootstrap：twitter出品的UI组件
    * jquery：html的js基础工具集合
    * jquery.cookie：基于jquery的cookie组件
    * moment：时间组件
    * spin.js：页面等待转圈组件
    * underscore：utility工具包