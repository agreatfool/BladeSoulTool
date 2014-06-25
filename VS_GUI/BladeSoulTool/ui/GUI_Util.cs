using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using BladeSoulTool.lib;
using Newtonsoft.Json.Linq;
using Timer = System.Timers.Timer;

namespace BladeSoulTool.ui
{
    public partial class GuiUtil : Form
    {
        private BstI18NLoader _i18N;

        private Thread _loadingThread;

        public GuiUtil()
        {
            InitializeComponent();
            this.InitI18N();
            this.Init();
        }

        private void InitI18N()
        {
            this._i18N = BstI18NLoader.Instance;
            this.labelSelectGameDir.Text = this._i18N.LoadI18NValue("GuiUtil", "labelSelectGameDir");
            this.btnSelectGameDir.Text = this._i18N.LoadI18NValue("GuiUtil", "btnSelectGameDir");
            this.labelSelectLang.Text = this._i18N.LoadI18NValue("GuiUtil", "labelSelectLang");
            this.labelDownloadAll.Text = this._i18N.LoadI18NValue("GuiUtil", "labelDownloadAll");
            this.btnDownloadAll.Text = this._i18N.LoadI18NValue("GuiUtil", "btnDownloadAll");
            this.btnStopDownload.Text = this._i18N.LoadI18NValue("GuiUtil", "btnStopDownload");
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
            this.textBoxLicense.Text = string.Format(this._i18N.LoadI18NValue("GuiUtil", "license"), BstManager.ReleaseUrl17173);

            // 选择游戏安装路径控件
            this.btnSelectGameDir.Click += new EventHandler(this.btnSelectGameDir_Click);

            // 下载所有图片资源控件
            this.btnDownloadAll.Click += new EventHandler(this.btnDownloadAll_Click);
            this.btnStopDownload.Click += new EventHandler(this.btnStopDownload_Click);

            // 进度条
            this.progBarDownloadAll.Maximum = (BstManager.Instance.DataAttach.Count + BstManager.Instance.DataCostume.Count + BstManager.Instance.DataWeapon.Count) * 2;
            this.progBarDownloadAll.Value = 0;
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
                        this._i18N.LoadI18NValue("GuiUtil", "boxTitle"),
                        this._i18N.LoadI18NValue("GuiUtil", "boxMessage")
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

        private void btnDownloadAll_Click(Object sender, EventArgs e)
        {
            if (this._loadingThread != null && this._loadingThread.IsAlive)
            {
                return; // 之前启动的加载线程还活着
            }
            this._loadingThread = new Thread(this.DownloadAllImageResources) { IsBackground = true };
            this._loadingThread.Start();
        }

        private void btnStopDownload_Click(Object sender, EventArgs e)
        {
            if (this._loadingThread != null && this._loadingThread.IsAlive)
            {
                try
                {
                    this._loadingThread.Abort();
                }
                catch (Exception ex)
                {
                    BstLogger.Instance.Log(ex.ToString());
                }
                this._loadingThread = null;
                BstManager.ShowMsgInTextBox(this.textBoxOut, this._i18N.LoadI18NValue("GuiUtil", "downloadStopped"));
            }
            this.UpdateDownloadProgressBar(0); // 更新进度条为0
        }

        private void DownloadAllImageResources()
        {
            var finishedCount = 0;
            var types = BstManager.Instance.Types;

            foreach (var type in types)
            {
                JObject data = null;
                switch (Array.IndexOf(types, type))
                {
                    case BstManager.TypeAttach:
                        data = BstManager.Instance.DataAttach;
                        break;
                    case BstManager.TypeCostume:
                        data = BstManager.Instance.DataCostume;
                        break;
                    case BstManager.TypeWeapon:
                        data = BstManager.Instance.DataWeapon;
                        break;
                }

                foreach (var element in data.Properties())
                {
                    var elementData = (JObject) element.Value;
                    var iconUrl = BstManager.GetIconPicUrl(elementData);
                    var iconTmpPath = BstManager.GetIconPicTmpPath(elementData);
                    var itemPicUrl = BstManager.GetItemPicUrl(Array.IndexOf(types, type), elementData);
                    var itemPicTmpPath = BstManager.GetItemPicTmpPath(Array.IndexOf(types, type), elementData);

                    if (File.Exists(iconTmpPath))
                    {
                        // 无需下载
                        BstManager.ShowMsgInTextBox(this.textBoxOut, string.Format(this._i18N.LoadI18NValue("BstIconLoader", "iconDownloadSucceed"), iconUrl));
                    }
                    else
                    {
                        var icon = BstManager.DownloadImageFile(iconUrl, iconTmpPath);
                        if (icon == null)
                        {
                            // 下载失败
                            BstManager.ShowMsgInTextBox(this.textBoxOut, string.Format(this._i18N.LoadI18NValue("BstIconLoader", "iconDownloadFailed"), iconUrl));
                        }
                        else
                        {
                            // 下载成功
                            BstManager.ShowMsgInTextBox(this.textBoxOut, string.Format(this._i18N.LoadI18NValue("BstIconLoader", "iconDownloadSucceed"), iconUrl));
                        }
                    }

                    if (File.Exists(itemPicTmpPath))
                    {
                        // 无需下载
                        BstManager.ShowMsgInTextBox(this.textBoxOut, string.Format(this._i18N.LoadI18NValue("BstPicLoader", "picDownloadSucceed"), itemPicUrl));
                    }
                    else
                    {
                        var pic = BstManager.DownloadImageFile(itemPicUrl, itemPicTmpPath);
                        if (pic == null)
                        {
                            // 下载失败
                            BstManager.ShowMsgInTextBox(this.textBoxOut, string.Format(this._i18N.LoadI18NValue("BstPicLoader", "picDownloadFailed"), itemPicUrl));
                        }
                        else
                        {
                            // 下载成功
                            BstManager.ShowMsgInTextBox(this.textBoxOut, string.Format(this._i18N.LoadI18NValue("BstPicLoader", "picDownloadSucceed"), itemPicUrl));
                        }
                    }

                    finishedCount += 2;
                    if (finishedCount >= this.progBarDownloadAll.Maximum)
                    {
                        this.UpdateDownloadProgressBar(0);
                        BstManager.ShowMsgInTextBox(this.textBoxOut, this._i18N.LoadI18NValue("GuiUtil", "downloadAllDone"));
                    }
                    else
                    {
                        this.UpdateDownloadProgressBar(finishedCount);
                    }
                }
            }
        }

        delegate void SetValueCallback(int value);
        private void UpdateDownloadProgressBar(int value)
        {
            if (this.progBarDownloadAll.InvokeRequired)
            {
                var d = new SetValueCallback(UpdateDownloadProgressBar);
                this.Invoke(d, new object[] { value });
            }
            else
            {
                this.progBarDownloadAll.Value = value;
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
