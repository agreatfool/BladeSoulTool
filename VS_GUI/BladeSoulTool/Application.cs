using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool
{

    public partial class Application : Form
    {
        private const int FORM_TYPE_COSTUME = 0;
        private const int FORM_TYPE_ATTACH = 1;
        private const int FORM_TYPE_WEAPON = 2;
        private const int FORM_TYPE_UTIL = 3;

        private Form formCostume;
        private Form formAttach;
        private Form formWeapon;
        private Form formUtil;

        public JObject costumeData {  get; set;  }
        public JObject attachData { get; set; }
        public JObject weaponData { get; set; }

        public Application()
        {
            InitializeComponent();
            init();

            this.costumeData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/costume/data/data.json")));
            this.attachData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/attach/data/data.json")));
            this.weaponData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/weapon/data/data.json")));
        }

        private void init()
        {
            // 初始化第一个tab，costume
            this.formCostume = this.createItemsForm();
            this.tabCostume.Controls.Add(this.formCostume);
        }

        private Form createItemsForm()
        {
            Form form = new GUI_Items();
            form.TopLevel = false;
            form.BackColor = Color.Green; // for test, remove later
            form.Visible = true;
            form.FormBorderStyle = FormBorderStyle.None;
            form.WindowState = FormWindowState.Maximized;

            return form;
        }
    }
}
