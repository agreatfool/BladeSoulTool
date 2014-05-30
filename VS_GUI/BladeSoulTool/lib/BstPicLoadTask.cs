using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.Windows.Forms;

namespace BladeSoulTool
{
    class BstPicLoadTask
    {
        public string url { get; set; } // url to load the pic
        public DataGridView grid; // DataGridView contains the DataTable
        public DataTable table; // DataTable contains the pic
        public int rowId { get; set; } // only work for DataGridView
        public int colId { get; set; } // only work for DataGridView

        public BstPicLoadTask(string url, DataGridView grid, DataTable table, int rowId = 0, int colId = 0)
        {
            this.url = url;
            this.grid = grid;
            this.table = table;
            this.rowId = rowId;
            this.colId = colId;
        }
    }
}
