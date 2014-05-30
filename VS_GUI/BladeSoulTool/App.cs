using System;
using System.Windows.Forms;

namespace BladeSoulTool
{
    public partial class App : Form
    {

        public const int FormTypeCostume = 0;
        public const int FormTypeAttach = 1;
        public const int FormTypeWeapon = 2;
        public const int FormTypeUtil = 3;

        private Form _formCostume;
        private Form _formAttach;
        private Form _formWeapon;
        private Form formUtil;

        public App()
        {
            InitializeComponent();
            this.init();
        }

        private void init()
        {
            BstLogger.Instance.Log("[App] BladeSoulTool App start ...");
            // 初始化数据
            var dataManager = BstManager.Instance;
            // 启动一个新线程来处理任务来运行icon图片加载器
            var loader = BstPicLoader.Instance;
            // 初始化第一个tab，costume
            this._formCostume = createItemsForm(App.FormTypeCostume);
            this.tabCostume.Controls.Add(this._formCostume);
            // 注册tab切换事件
            this.tabControl.SelectedIndexChanged += new EventHandler(tabControl_SelectedIndexChanged);
        }

        private void tabControl_SelectedIndexChanged(Object sender, EventArgs e)
        {
            BstLogger.Instance.Log("[App] Switch to tab: " + this.tabControl.SelectedIndex);
            switch (this.tabControl.SelectedIndex)
            {
                case App.FormTypeCostume:
                    if (this._formCostume == null) 
                    {
                        this._formCostume = App.createItemsForm(App.FormTypeCostume);
                        this.tabCostume.Controls.Add(this._formCostume);
                    }
                    break;
                case App.FormTypeAttach:
                    if (this._formAttach == null)
                    {
                        this._formAttach = App.createItemsForm(App.FormTypeAttach);
                        this.tabAttach.Controls.Add(this._formAttach);
                    }
                    break;
                case App.FormTypeWeapon:
                    if (this._formWeapon == null)
                    {
                        this._formWeapon = App.createItemsForm(App.FormTypeWeapon);
                        this.tabWeapon.Controls.Add(this._formWeapon);
                    }
                    break;
                case App.FormTypeUtil:
                    // TODO 制作util面板form
                    break;
                default:
                    break;
            }
        }

        private static Form createItemsForm(int formType)
        {
            Form form = new GUI_Items(formType);
            form.TopLevel = false;
            form.Visible = true;
            form.FormBorderStyle = FormBorderStyle.None;
            form.WindowState = FormWindowState.Maximized;

            return form;
        }
    }
}
