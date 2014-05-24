# 后续工作列表
============
## 头发数据
现在的数据库中缺少头发的数据，因为icon中没有普通头发，需要额外制作

## 编写.net c\#的界面
功能：

* 能修改配置文件，游戏安装路径
* 展示服装、饰品、头发、武器
* 选择被替换的目标，并写入配置文件
* 选择替换的目标，并写入配置文件
* 替换
* 打开UE Viewer，查看模型

## 流程：
* 更新客户端
* 备份
* 反和谐
* 备份
* parser_prepare 将tencent内容放入bns，写入backup.json（将这个脚本改名
* icon_dumper 解包icon，将解包的tga文件过滤、拷贝到指定位置，转化png，并压缩
    * 现在tga转png转化的成功率有问题，需要有重试机制，转化失败的计数，并再次尝试
* png_optimizer 压缩png
* upk_scanner 输出所有upk的
* upk_parser 解析并生成数据库
* shooter 输出模型截图
* png_optimizer 压缩png

## 数据解析中的问题：
* attact/data.json 里有一个数据是武器：010002_Autoscale_col1，而且在武器的数据里json里这个数据不存在，走错地方了
* weapon里有部分数据没有pic字段，或者很多pic里是null，这不正常：110001_Autoscale_col2，110001_Autoscale_col3

## 韩服的dedat
韩服的dedat工具是另外的，需要单独下载韩服客户端，并进行测试

## 最新的数据库已知问题
* 50002 GonF的几个upk用umodel解出来的信息都有问题，需要使用mesh xml补全

## zip
使用grunt进行zip，可跨平台

## 截图
仍旧有一部分的upk使用UE Viewer截图之后是有贴图错误的，需要找原因

## 优化
* 删除crawler脚本和crawler爬取的数据文件
* mesh paser 结束后output文件夹的善后
* parser prepare要在backup.json里存储拷贝过来的文件列表，后续恢复的时候有用，删除拷贝过来的local文件
* shot的备份文件也要处理，*.bst_bak都要删掉，此外，图片要压缩

## 测试
* 全面测试