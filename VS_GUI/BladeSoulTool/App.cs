using System;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;
using BladeSoulTool.lib;
using BladeSoulTool.ui;

namespace BladeSoulTool
{
    public partial class App : Form
    {
        private Form _formCostume;
        private Form _formAttach;
        private Form _formWeapon;
        private Form _formUtil;

        public App()
        {
            InitializeComponent();
            this.Init();
        }

        private void Init()
        {
            BstLogger.Instance.Log("[App] BladeSoulTool App start ...");
            // 初始化数据
            var dataManager = BstManager.Instance;
            // 初始化icon图片加载器
            var loader = BstIconLoader.Instance;
            // 初始化第一个tab，costume
            this._formCostume = CreateItemsForm(BstManager.TypeCostume);
            this.tabCostume.Controls.Add(this._formCostume);
            // 注册tab切换事件
            this.tabControl.SelectedIndexChanged += new EventHandler(tabControl_SelectedIndexChanged);
            // 检查新版本
            this.CheckNewVersion();
        }

        private void CheckNewVersion()
        {
            var currentVer = (string)BstManager.Instance.SystemSettings["version"];
            new Thread(() =>
            {
                var releasedVer = BstManager.GetStringFromWeb(BstManager.GithubVersionTxt);
                if (currentVer != releasedVer)
                {
                    var result = BstManager.DisplayConfirmMessageBox(
                        "发现新版本",
                        "新版本发现，当前版本为：" + currentVer + "，最新版本为：" + releasedVer + "\r\n" +
                        "请去 " + BstManager.ReleaseUrl + " 检阅最新版本信息。"
                    );
                    if (result == DialogResult.OK)
                    {
                        Process.Start(BstManager.ReleaseUrl);
                    }
                }
            }).Start();
        }

        private void tabControl_SelectedIndexChanged(Object sender, EventArgs e)
        {
            BstLogger.Instance.Log("[App] Switch to tab: " + this.tabControl.SelectedIndex);
            switch (this.tabControl.SelectedIndex)
            {
                case BstManager.TypeCostume:
                    if (this._formCostume == null) 
                    {
                        this._formCostume = App.CreateItemsForm(BstManager.TypeCostume);
                        this.tabCostume.Controls.Add(this._formCostume);
                    }
                    break;
                case BstManager.TypeAttach:
                    if (this._formAttach == null)
                    {
                        this._formAttach = App.CreateItemsForm(BstManager.TypeAttach);
                        this.tabAttach.Controls.Add(this._formAttach);
                    }
                    break;
                case BstManager.TypeWeapon:
                    if (this._formWeapon == null)
                    {
                        this._formWeapon = App.CreateItemsForm(BstManager.TypeWeapon);
                        this.tabWeapon.Controls.Add(this._formWeapon);
                    }
                    break;
                case BstManager.TypeUtil:
                    if (this._formUtil == null)
                    {
                        this._formUtil = App.CreateUtilForm();
                        this.tabUtil.Controls.Add(this._formUtil);
                    }
                    break;
                default:
                    break;
            }
        }

        private static Form CreateItemsForm(int type)
        {
            Form form = new GuiItems(type);
            form.TopLevel = false;
            form.Visible = true;
            form.FormBorderStyle = FormBorderStyle.None;
            form.WindowState = FormWindowState.Maximized;

            return form;
        }

        private static Form CreateUtilForm()
        {
            Form form = new GuiUtil();
            form.TopLevel = false;
            form.Visible = true;
            form.FormBorderStyle = FormBorderStyle.None;
            form.WindowState = FormWindowState.Maximized;

            return form;
        }
    }
}
