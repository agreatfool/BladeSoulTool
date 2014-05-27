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
            this.itemsGrid.DataSource = this.dataTable;
            this.itemsGrid.Show();

            this.comboBoxRace.Items.AddRange(DataManager.Instance.raceNames.ToArray());
            this.comboBoxRace.SelectedIndex = 0;

            DataManager.Instance.getCostumeDataByRace(0);

            //Console.WriteLine((string)App.Instance.costumeData["60054_LynM_col3"]["skeleton"]);
            //this.dataTable.Rows.Add((string)App.Instance.costumeData["60054_LynM_col3"]["skeleton"]);
        }
    }
}
