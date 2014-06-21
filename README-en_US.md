# BladeSoulTool
One click costume replacement mod tool

## 1. Effect
* Sample 1：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-1.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-2.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-3-en_US.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-4.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set1-5.png)

---

* Sample 2：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-1.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-2.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-3-en_US.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-4.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/effect-set2-5.png)

## 2. Download
* Download Dir: [Baidu Pan](http://pan.baidu.com/s/1dD7slaD), find archives named BladeSoulTool_vx.x.x.zip, the bigger later numbers are the newer version is, all archives share the same password

## 3. Install
* Unzip the archive
* Install .net2.0：
    * It's not necessary for win7 users to install it, since system already contains it
    * If anyone already installed it manually, just skip this step
    * If 32 bit system, execute `resources/dotnet/dotnetfx20.exe`
    * If 64 bit system, please go to this link to download and install the .net2.0: [Microsoft .NET Framework Version 2.0 Redistributable Package (x64)](http://www.microsoft.com/en-us/download/details.aspx?id=6523)
* Install nodejs: execute `resources/nodejs/node-v0.10.26-x*.msi`, if 32 bit system, execute `x86`, otherwise `x64`
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-1.png)
* Execute the install script: `resources/nodejs/install.bat`
    * If the output fonts on the top is:
        * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-2.png)
        * That means nodejs installation succeeded
    * If the output fonts on the top is: `Command node not found, please install it first.`
        * That means nodejs installation failed or not activated, you have to restart your pc to activate it
        * Normally it's not necessary to restart pc after nodejs installation
* When the console displays things like image below, that means install script finished it's work:
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-3.png)
* Execute the bat file at the root dir `BladeSoulTool.bat`, open the software
* Switch to the `工具` panel, to change the language of UI:
* Find the `选择语言：` block, and set the language to which you want
* Restart the software after you set the language config
* Switch to the `Utility` panel, click `Select` button to select the game installation dir
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-4-en_US.png)
* Please select this layer: ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/install-5.png)
* Please backup your client resources, just copy and paste the `contents` dir

## 4. Usage
Execute the bat file at the root dir `BladeSoulTool.bat` to open the software

### 4.0 预览
* 物品列表中的部分物品，因为不是玩家可用的模型，所以是没有官方icon的，这种物品，软件会给与默认的icon：![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/resources/others/no_icon_64x64.png)
* 此外，所有的icon及物品2D截图都是从网络下载的，如果下载失败，会显示失败的icon：![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/resources/others/error_icon_64x64.png)

### 4.1 Replace
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-replace-en_US.png)
* Select an item in the items table, click the `Select as origin model` button
* Select another item in the items table, click the `Select as target model` button
* Click `Replace from LEFT to RIGHT` button
* Confirm the dialogue
* Wait till `Specified grunt task done` dialogue pop up
* Enter game to see your avatar change

### 4.2 Restore
* Click `Restore` button
* Wait till `Specified grunt task done` dialogue pop up
* Enter game to see your avatar change

### 4.3 View 2D model screen shot
* Click `View 2D model` button
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-2d-btn-en_US.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-2d-effect-1-en_US.png)

### 4.4 View 3D model
* Click `View 3D model` button
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-3d-btn-en_US.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-3d-effect-1-en_US.png)
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-3d-effect-2-en_US.png)

## 5. Announcement
Publish Announcement: <br/>
Author: Jonathan, forum id: xenojoshua, support team: 17173 bns mod group<br/>
I will only release on forum 17173, any others are all repost!<br/>
17173 bns mod forum: [http://bbs.17173.com/forum-9665-1.html](http://bbs.17173.com/forum-9665-1.html)<br/>
Release topic: [http://bbs.17173.com/thread-8018028-1-1.html](http://bbs.17173.com/thread-8018028-1-1.html)<br/>
I will release later updates on this topic too.<br/>

Repost Announcement: <br/>
This software is made by Jonathan for the love of bns, the purpose is to make more players experience the joy of modding.<br/>
Thus I would not restrict the spread of this software. Please show the respect for the author.<br/>
Contact me if you want to spread to some place.<br/>

License: <br/>
GPLv2

## 6. Known Issues
* Attach & Weapon replacement functionality not done
* Origin model cannot use models whose col is not col1

## 7. TODO List
* Add attach & weapon replacement functionality

## 8. Change Log
* 2014-06-06: v1.0.0 release
* 2014-06-06: v1.0.1: Fix 3D view log not zipped
* 2014-06-11: v1.0.2: Add new version notification functionality, fix scroll bar issue
* 2014-06-11: v1.0.3: Add I18N
* 2014-06-21: v1.0.4: Fix database built algorithm, enhance the database. Fix UI of undefined icons & download failed icons.