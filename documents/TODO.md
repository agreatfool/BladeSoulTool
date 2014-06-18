# 后续工作列表
============
## UI
* icon加载失败pic
* icon不存在pic

## 多线/进程
很多任务的child process的数量到底对不对，upk_scanner任务从头到尾只有一个umodel在运行

## 备份
* 替换的备份是否做对了，检查
* 在原有的修改上再次修改的行为是如何处理的？

## 00002数据错误
00013149 - 00013151系列upk数据还是有问题，用umodel直接检查客户端输出的内容

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
* png_optimizer 压缩png图片
* 需要做一个单独的grunt task来跑完整个流程

## 数据解析中的问题：
* 尝试寻找不依赖icon来解析数据的方法
* 首先要解决所有的*_invalid.json里的数据
* 思路：body的skeleton的log里，都有material的名字为body或者部分为body的upk，而weapon则一般带weapon字符，只有attach啥都不带，可以测试这个规则是否精准
* 洪门道服的数据在costume数据库中不存在，因为洪门道服的icon不是正常的命名，需要单独处理
* attach/data.json 里有一个数据是武器：010002_Autoscale_col1，而且在武器的数据里json里这个数据不存在，走错地方了
* attach/data.json 开始的一段有好几件是衣服，而不是饰品
* weapon里有部分数据没有pic字段，或者很多pic里是null，这不正常：110001_Autoscale_col2，110001_Autoscale_col3
* 现在最大的问题是很多模型的信息在分类上跑错了位置，最关键的原因是在用icon进行索引配对的时候，有重复的code，一个icon的code在衣服、配饰、武器中重复了，要想个办法区分开
* 错误数据还是有很大影响，截图说明问题了，举例code 70002，衣服只有2个种族截出来了，其他的5个都是在解析material信息的时候被污染了，参考raw_material_invalid.json里的70002群
* 找时间一个个验证错误数据里的模型信息，是哪个模型，到底有没有办法更正或者做特殊处理，要么就会漏衣服
* 一部分衣服的upk在icon里是不存在的，必须到mesh.xml里查找，这里要思考下怎么结合这两者
        "00024241": {
            "upkId": "00024241",
            "code": "60004",
            "core": "60004_KunN",
            "race": "KunN",
            "col1Material": "00024240",
            "texture": "00024239",
            "textureObjs": [
                "60004_KunN_col1_S",
                "60004_KunN_col1_N",
                "60004_KunN_col1_M",
                "60004_KunN_col1_D"
            ]
        },
        <record alias="60004_JinF" data-version="2" description="" id="76" name="60004-일반의상 39" race="진" resource-name="00007617
* 50002 GonF的几个upk用umodel解出来的信息都有问题，需要使用mesh xml补全

## 截图：
截图错误的信息要记录并写成json文件，酌情重试，database/costume/data/shot_error.json

## dedat
* 韩服的dedat工具是另外的，需要单独下载韩服客户端，并进行测试
* dedat的datafile.bin需要单独想办法解包

## 截图
仍旧有一部分的upk使用UE Viewer截图之后是有贴图错误的，需要找原因

## 优化
* 删除crawler脚本和crawler爬取的数据文件
* mesh paser 结束后output文件夹的善后
* parser prepare要在backup.json里存储拷贝过来的文件列表，后续恢复的时候有用，删除拷贝过来的local文件
* shot的备份文件也要处理，*.bst_bak都要删掉，此外，图片要压缩

## 测试
* 全面测试