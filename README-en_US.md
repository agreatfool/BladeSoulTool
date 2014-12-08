# BladeSoulTool
One click costume replacement mod tool

## 1. Effect
* Sample 1：
    * Note what's the items in the equipment columns:
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set1-01.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set1-02-en_US.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set-03.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set1-04-en_US.png)

---

* Sample 2：
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set2-01.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set2-02-en_US.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set-03.png)
    * ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/effect-set2-04-en_US.png)

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

### 4.0 Preview
* Since some items in the list is not possible to be owned by player, there is no official icon for those items. Software will display default icon for those items: ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/resources/others/no_icon_64x64.png)
* And every item icon & 2d preview images are all downloaded from network, if download failed, error icon will be displayed: ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/resources/others/error_icon_64x64.png)

### 4.1 Replace
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/ui-replace-en_US.png)
* Select an item in the items table, click the `Select as origin model` button
* Select another item in the items table, click the `Select as target model` button
* Click `Replace from LEFT to RIGHT` button
* Confirm the dialogue
* Wait till `Specified grunt task done` dialogue pop up
* Enter game to see your avatar change
* EDIT：
* Version 2.0, now origin model is no longer limited to "col1"
* Version 2.0, attachment replacement functionality done

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

### 4.5 Race Lyn
* Lots of Lyn costumes are under the race of LynM, since a lot of costumes of Lyn share the same skeleton of male & female
* before version 2.0, you found there is only a little choices under race of LynF
* after version 2.0, I combined those two races into on big "Lyn", you would no longer have the problem of finding LynF models
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-race-lyn-en_US.png)

### 4.6 Model Search
* Version 2.0, use code to find target model:
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-search-en_US.png)
* Search action will only search from the line selected to bottom, it's better to select the first line before your search

### 4.7 mod files generated
* Version 2.0 mod files generated are all put under sub dir "mod" in tencent dir:
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-mod-files-dir.png)
* If restore action failed, you can delete this dir to restore all models modified

### 4.8 Download all resource images
* All icons & screenshot images are all downloaded from web when you click the model, sometimes it's annoying since download action took a lot of time
* Version 2.0, download all images functionality added:
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-download-all-en_US.png)
* I added a serial of zip archives: BladeSoulTool_ImageResources_vx.x.x.zip
* Naming rule is the same as software itself
* Download this zip archive, unzip to `BladeSoulTool/VS_GUI/BladeSoulTool/tmp`

### 4.9 upk conflict
* Sometimes, when you start the game, client will pop up:
* ![](https://raw.githubusercontent.com/agreatfool/BladeSoulTool/master/documents/images/v2/ui-notify-conflict.png)
* Version 2.0, all mod files will be put under sub dir "mod", there is no longer any overwrite of upk files, this means there will be several upk have the same name
* Client will notify that there is some upk have the same name
* Click the "确定" button, you can play with this notification, no worry

### 4.10 Report issue
* "Report Issue" button added on replacement UI
* Please finish the replace action, and click this button, software will make a report to server
* Replace action: select the origin model, select target model, click the replace button

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

## 6. FAQ & Tips
* Don't use those model has col20

## 7. TODO List
* Add favorite list

## 8. Change Log
* 2014-06-06: v1.0.0 release
* 2014-06-06: v1.0.1: Fix 3D view log not zipped
* 2014-06-11: v1.0.2: Add new version notification functionality, fix scroll bar issue
* 2014-06-11: v1.0.3: Add I18N
* 2014-06-21: v1.0.4: Fix database built algorithm, enhance the database. Fix UI of undefined icons & download failed icons.
* 2014-07-03: v2.0.1:
    * Add costume colX to colX functionality
    * Add attachment replacement functionality
    * Add download all images functionality
    * Add model search functionality
    * Add report issue functionality
    * Combine LynM with LynF to Lyn
* 2014-12-08: v2.0.2: Update database, contains the latest "枫情万种", no functionality update