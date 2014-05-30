using System.Data;
using System.Windows.Forms;

namespace BladeSoulTool
{
    class BstIconLoadTask
    {
        public string url { get; set; } // url to load the pic
        public string name { get; set; } // image file name
        public DataGridView grid; // DataGridView contains the DataTable
        public DataTable table; // DataTable contains the pic
        public int rowId { get; set; } // DataTable line to be updated
        public TextBox box { get; set; } // TextBox to write message
        public int colId { get; set; } // DataTable column to be updated

        public BstIconLoadTask(string url, string name, DataGridView grid, DataTable table, int rowId = 0, TextBox box = null, int colId = 0)
        {
            this.url = url;
            this.name = name;
            this.grid = grid;
            this.table = table;
            this.rowId = rowId;
            this.box = box;
            this.colId = colId;
        }
    }
}
