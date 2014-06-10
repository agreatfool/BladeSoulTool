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
        private BstI18NLoader _i18n;

        public GuiUtil()
        {
            InitializeComponent();
            this.InitI18N();
            this.Init();
        }

        private void InitI18N()
        {
            this._i18n = BstI18NLoader.Instance;
            this.labelSelectGameDir.Text = this._i18n.LoadI18NValue("GuiUtil", "labelSelectGameDir");
            this.btnSelectGameDir.Text = this._i18n.LoadI18NValue("GuiUtil", "btnSelectGameDir");
            this.labelSelectLang.Text = this._i18n.LoadI18NValue("GuiUtil", "labelSelectLang");
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
            this.textBoxLicense.Text = string.Format(this._i18n.LoadI18NValue("GuiUtil", "license"), BstManager.ReleaseSiteUrl);

            // 选择游戏安装路径
            this.btnSelectGameDir.Click += new EventHandler(btnSelectGameDir_Click);
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
                    BstManager.DisplayErrorMessageBox(
                        this._i18n.LoadI18NValue("GuiUtil", "boxTitle"),
                        this._i18n.LoadI18NValue("GuiUtil", "boxMessage")
                    );
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
            // 这一段因为关系到语言的设定，使用双语显示，不作为配置设定
            BstManager.DisplayInfoMessageBox(
                "重启以生效改动 / Restart to activate the setting change", 
                "你需要手动重启应用程序，来应用当前改动的语言配置！\r\n" +
                "You have to restart the application manually, to activate the language setting change!"
            );
        }
        
    }
}
