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

        public GUI_Items()
        {
            InitializeComponent();

            this.dataTable = new DataTable();
            this.dataTable.Columns.Add("key");
            this.dataTable.Rows.Add("Line1");
            this.dataTable.Rows.Add("Line1");
            this.dataTable.Rows.Add("Line1");
            this.itemsGrid.DataSource = this.dataTable;
            this.itemsGrid.Show();

            this.comboBoxRace.Items.AddRange(new object[] {
                "天女", "人女", "人男", "龙女", "龙男", "灵女", "灵男"
            });
            this.comboBoxRace.SelectedIndex = 0;

            //Console.WriteLine((string)App.Instance.costumeData["60054_LynM_col3"]["skeleton"]);
            //this.dataTable.Rows.Add((string)App.Instance.costumeData["60054_LynM_col3"]["skeleton"]);
        }
    }
}
