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
            // 点击事件
            this.gridItems.CellClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.gridItems_CellClick);

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
        }

        private void gridItems_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            this.gridItems.Rows[e.RowIndex].Selected = true;
            this.gridItems.Refresh();
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
