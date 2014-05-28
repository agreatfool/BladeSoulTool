using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool
{

    public partial class App : Form
    {

        public const int FORM_TYPE_COSTUME = 0;
        public const int FORM_TYPE_ATTACH = 1;
        public const int FORM_TYPE_WEAPON = 2;
        public const int FORM_TYPE_UTIL = 3;

        private Form formCostume;
        private Form formAttach;
        private Form formWeapon;
        private Form formUtil;

        public App()
        {
            InitializeComponent();
            init();
        }

        private void init()
        {
            // 初始化数据
            DataManager dataManager = DataManager.Instance;
            // 初始化第一个tab，costume
            this.formCostume = this.createItemsForm(App.FORM_TYPE_COSTUME);
            this.tabCostume.Controls.Add(this.formCostume);
        }

        private Form createItemsForm(int formType)
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
