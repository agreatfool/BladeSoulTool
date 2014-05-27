using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool
{
    public partial class GUI_Items : Form
    {
        private DataTable dataTable;

        public GUI_Items(int formType)
        {
            InitializeComponent();
            this.init(formType);
        }

        private void init(int formType)
        {
            // 数据列表
            this.dataTable = new DataTable();
            // icon列
            DataColumn columnIcon = new DataColumn("Icon");
            columnIcon.DataType = System.Type.GetType("System.Byte[]");
            columnIcon.AllowDBNull = true;
            columnIcon.ColumnName = "缩略图";
            columnIcon.ReadOnly = true;
            this.dataTable.Columns.Add(columnIcon);
            // code列
            DataColumn columnCode = new DataColumn("Code");
            columnCode.ColumnName = "编号";
            columnCode.ReadOnly = true;
            this.dataTable.Columns.Add(columnCode);

            // 数据展示列表
            this.gridItems.DataSource = this.dataTable;
            this.gridItems.RowTemplate.Height = 64;
            // icon列
            DataGridViewColumn gridColumnIcon = this.gridItems.Columns[0];
            gridColumnIcon.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
            gridColumnIcon.Width = 64;
            // 操作按钮列
            DataGridViewButtonColumn gridColumnAction = new DataGridViewButtonColumn();
            gridColumnAction.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
            gridColumnAction.Width = 100;
            gridColumnAction.UseColumnTextForButtonValue = true;
            gridColumnAction.Text = "查看模型信息";
            gridColumnAction.Name = "操作";
            this.gridItems.Columns.Add(gridColumnAction);

            this.comboBoxRace.Items.AddRange(DataManager.Instance.raceNames.ToArray());
            this.comboBoxRace.SelectedIndex = 0;

            switch (formType) 
            {
                case App.FORM_TYPE_COSTUME:
                    this.initCostumeForm();
                    break;
                case App.FORM_TYPE_ATTACH:
                    this.initAttachForm();
                    break;
                case App.FORM_TYPE_WEAPON:
                    this.initWeaponForm();
                    break;
                default:
                    break;
            }

            this.gridItems.Show();
        }

        void gridItems_EditingControlShowing(object sender, DataGridViewEditingControlShowingEventArgs e)
        {
            if (e.Control is Button)
            {
                Button btn = e.Control as Button;
                btn.Click -= new EventHandler(btn_Click);
                btn.Click += new EventHandler(btn_Click);
            }
        }

        void btn_Click(object sender, EventArgs e)
        {
            int col = this.gridItems.CurrentCell.ColumnIndex;
            int row = this.gridItems.CurrentCell.RowIndex;
            MessageBox.Show("Button in Cell[" +
                col.ToString() + "," +
                row.ToString() + "] has been clicked");
        }

        private void initCostumeForm()
        {
            JObject data = DataManager.Instance.getCostumeDataByRace(DataManager.RACE_ID_KUNN);

            foreach (JProperty element in data.Properties())
            {
                // 读取数据
                string elementId = element.Name;
                JObject elementData = (JObject)element.Value;
                // 填充数据
                this.dataTable.Rows.Add(new object[] {
                    DataManager.getBytesFromFile(DataManager.PATH_DATABASE + "icon/png-cps/" + (string)elementData["pic"]), 
                    elementId
                });
            }
        }

        private void initAttachForm()
        {

        }

        private void initWeaponForm()
        {

        }
    }
}
