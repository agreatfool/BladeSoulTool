using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;
using BladeSoulTool.lib;

namespace BladeSoulTool.ui
{
    public partial class GuiUtil : Form
    {
        public GuiUtil()
        {
            InitializeComponent();
            this.Init();
        }

        private void Init()
        {
            // 读取已配置的游戏地址配置
            var gamePath = (string) BstManager.Instance.SystemSettings["path"]["game"];
            this.textBoxGameDir.Text = gamePath;

            // 语言选项
            this.comboBoxSelectLang.Items.AddRange(BstManager.Instance.LanguageNames.ToArray());
            var lang = (string) BstManager.Instance.SystemSettings["lang"];
            this.comboBoxSelectLang.SelectedIndex = BstManager.Instance.LanguageTypes.IndexOf(lang);
            this.comboBoxSelectLang.SelectedIndexChanged += new EventHandler(comboBoxSelectLang_SelectedIndexChanged);

            // license文字内容
            this.textBoxLicense.Text =
                "发布申明：\r\n" +
                "作者：Jonathan，论坛id：xenojoshua，支持团队：17173剑灵模型组\r\n" +
                "我只会在17173发布，其他任何地方提供的下载皆为转载！\r\n" +
                "17173剑灵模型替换讨论版地址：http://bbs.17173.com/forum-9665-1.html \r\n" +
                "17173发布帖地址：" + BstManager.ReleaseUrl + " \r\n" +
                "后续的更新我也会持续发布在这个帖子里。\r\n\r\n" +
                "转载申明：\r\n" +
                "该软件是我秉着对剑灵这款游戏的爱而制作的，初衷是为了让更多玩家能体验剑灵装扮的玩法。" +
                "因此我不会禁止软件的转载，但是请尊重作者的劳动，需要转载的请到17173私信我，谢谢。\r\n" +
                "此外，因为我的初衷是为了帮助玩家，任何转载或是使用我的脚本、数据的二次开发者，" +
                "不得使用以虚拟币、论坛币等方式限制玩家的下载、传播的做法。最多允许回复可见。\r\n\r\n" +
                "License：\r\n" +
                "该软件以GPLv2许可发布分享，他人修改代码后不得闭源，且新增代码必须使用相同的许可证。";

            this.btnSelectGameDir.Click += new EventHandler(btnSelectGameDir_Click); // 选择游戏安装路径
        }

        private void btnSelectGameDir_Click(Object sender, EventArgs e)
        {
            string path = "";

            var browser = new FolderBrowserDialog();
            var result = browser.ShowDialog();

            if (result == DialogResult.OK)
            {
                path = browser.SelectedPath;
                if (!File.Exists(path + "/bin/Client.exe"))
                {
                    BstManager.DisplayErrorMessageBox("选择错误", "选择的文件夹不是正确的游戏文件夹！");
                }
                else
                {
                    this.textBoxGameDir.Text = path;
                    BstManager.Instance.SystemSettings["path"]["game"] = path;
                    BstManager.WriteJsonFile(BstManager.PathJsonSettings, BstManager.Instance.SystemSettings);
                }
            }
        }

        private void comboBoxSelectLang_SelectedIndexChanged(Object sender, EventArgs e)
        {
            // 重新记录语言信息，并写入配置文件
            var lang = BstManager.Instance.LanguageTypes[this.comboBoxSelectLang.SelectedIndex];
            BstManager.Instance.SystemSettings["lang"] = lang;
            BstManager.WriteJsonFile(BstManager.PathJsonSettings, BstManager.Instance.SystemSettings);

            // 显示重启程序提示信息
            BstManager.DisplayInfoMessageBox(
                "重启以生效改动 / Restart to activate the setting change", 
                "你需要手动重启应用程序，来应用当前改动的语言配置！\r\n" +
                "You have to restart the application manually, to activate the language setting change!"
            );
        }
        
    }
}
