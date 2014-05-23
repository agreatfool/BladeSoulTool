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
        private DataTable dataTable1;

        public GUI_Items()
        {
            InitializeComponent();

            this.dataTable1 = new DataTable();
            this.dataTable1.Columns.Add("key");
            this.dataTable1.Rows.Add("Line1");
            this.dataTable1.Rows.Add("Line1");
            this.dataTable1.Rows.Add("Line1");
            this.dataGridView1.DataSource = this.dataTable1;
            this.dataGridView1.Show();

            //Console.WriteLine((string)App.Instance.costumeData["60054_LynM_col3"]["skeleton"]);
            //this.dataTable1.Rows.Add((string)App.Instance.costumeData["60054_LynM_col3"]["skeleton"]);
        }
    }
}
